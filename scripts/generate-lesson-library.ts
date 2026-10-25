#!/usr/bin/env npx tsx
/**
 * KSSM Lesson Library Generator
 *
 * Run ONCE to pre-generate all KSSM lessons and store them in Supabase.
 * After this, every student gets instant lesson loads at zero marginal AI cost.
 *
 * Prerequisites:
 *   npm install -D tsx @anthropic-ai/sdk @supabase/supabase-js dotenv
 *
 * Usage:
 *   # Dry run — counts lessons without calling the API:
 *   npx tsx scripts/generate-lesson-library.ts --dry-run
 *
 *   # Generate ONE subject only (for testing):
 *   npx tsx scripts/generate-lesson-library.ts --subject=matematik
 *
 *   # Generate everything (resumable — skips already-stored lessons):
 *   npx tsx scripts/generate-lesson-library.ts
 *
 * Required env vars (create .env.local or set in shell):
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   SUPABASE_URL=https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJh...  ← service role key, NOT anon key
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { KSSM_SUBJECTS, countAllChapters } from '../constants/kssm';

// Load env vars from project root .env or .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// ── Config ────────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const MODEL = 'claude-haiku-4-5-20251001';
const DIFFICULTY = 'medium';
const DELAY_MS = 400; // ~2.5 req/s — well under the 50 req/min Haiku limit

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const subjectFilter = args.find(a => a.startsWith('--subject='))?.split('=')[1] ?? null;

// ── Validate environment ──────────────────────────────────────────────────────

if (!isDryRun) {
  if (!ANTHROPIC_API_KEY) {
    console.error('❌  ANTHROPIC_API_KEY is not set.');
    process.exit(1);
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    process.exit(1);
  }
}

// ── Clients ───────────────────────────────────────────────────────────────────

const anthropic = isDryRun ? null : new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = isDryRun
  ? null
  : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

// ── Types ─────────────────────────────────────────────────────────────────────

interface LessonRow {
  chapter_id: string;
  subject_id: string;
  tingkatan: string;
  chapter_title: string;
  mode: string;
  difficulty: string;
  title: string;
  explanation: string;
  key_points: string[];
  example: string;
  practice_question: string;
  practice_answer: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function safeParseJSON(text: string): any {
  let s = text.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(s);
}

async function generateLesson(
  subjectName: string,
  chapterTitle: string,
  tingkatan: string,
  lang: 'en' | 'bm',
): Promise<Omit<LessonRow, 'chapter_id' | 'subject_id' | 'tingkatan' | 'chapter_title' | 'mode' | 'difficulty'>> {
  if (!anthropic) throw new Error('No anthropic client in dry-run mode');

  const langLabel = lang === 'bm' ? 'Bahasa Malaysia' : 'English';
  const tingkatanLabel = `Tingkatan ${tingkatan.replace('T', '')}`;
  const systemPrompt =
    'You are an expert Malaysian school tutor. Return ONLY valid JSON, no prose outside it.';

  const userPrompt =
    `Subject: ${subjectName}\n` +
    `Topic: ${chapterTitle}\n` +
    `Level: ${tingkatanLabel}\n` +
    `Curriculum: KSSM Malaysia\n` +
    `Language: ${langLabel}\n` +
    `Difficulty: ${DIFFICULTY}\n\n` +
    `Generate a lesson in this EXACT JSON format:\n` +
    `{\n` +
    `  "title": "${chapterTitle}",\n` +
    `  "explanation": "Clear explanation in 3-4 paragraphs",\n` +
    `  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],\n` +
    `  "example": "One worked example with step-by-step solution",\n` +
    `  "practice_question": "One practice question for the student",\n` +
    `  "practice_answer": "The answer with explanation"\n` +
    `}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
  const parsed = safeParseJSON(text);

  return {
    title: parsed.title ?? chapterTitle,
    explanation: parsed.explanation ?? '',
    key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
    example: parsed.example ?? '',
    practice_question: parsed.practice_question ?? '',
    practice_answer: parsed.practice_answer ?? '',
  };
}

async function isAlreadyGenerated(chapterId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from('lesson_library')
    .select('chapter_id')
    .eq('chapter_id', chapterId)
    .eq('difficulty', DIFFICULTY)
    .maybeSingle();
  return data !== null;
}

async function insertLesson(row: LessonRow): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('lesson_library').upsert(row, {
    onConflict: 'chapter_id,mode,difficulty',
  });
  if (error) throw new Error(`Supabase insert error: ${error.message}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const subjects = subjectFilter
    ? KSSM_SUBJECTS.filter(s => s.id === subjectFilter)
    : KSSM_SUBJECTS;

  if (subjectFilter && subjects.length === 0) {
    console.error(`❌  Unknown subject id: ${subjectFilter}`);
    console.error(`   Available: ${KSSM_SUBJECTS.map(s => s.id).join(', ')}`);
    process.exit(1);
  }

  const totalChapters = subjects.reduce(
    (t, s) => t + Object.values(s.chapters).reduce((u, chs) => u + chs.length, 0),
    0,
  );

  console.log('\n🎓  KSSM Lesson Library Generator');
  console.log(`   Model   : ${MODEL}`);
  console.log(`   Subjects: ${subjects.length} (${subjectFilter ?? 'all'})`);
  console.log(`   Chapters: ${totalChapters}`);
  console.log(`   Mode    : ${isDryRun ? 'DRY RUN (no API calls)' : 'LIVE'}\n`);

  if (isDryRun) {
    console.log('Total chapters across ALL subjects:', countAllChapters());
    for (const subj of subjects) {
      const n = Object.values(subj.chapters).reduce((t, chs) => t + chs.length, 0);
      console.log(`  ${subj.id.padEnd(18)} ${n} chapters`);
    }
    console.log('\nDry run complete. No API calls made.');
    return;
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const subject of subjects) {
    for (const [tingkatan, chapters] of Object.entries(subject.chapters)) {
      if (chapters.length === 0) continue;

      for (const chapter of chapters) {
        const label = `[${subject.id}/${tingkatan}/${chapter.id}]`;

        // Check if already generated — resumable
        const exists = await isAlreadyGenerated(chapter.id);
        if (exists) {
          process.stdout.write(`  ⏭  ${label} already exists, skipping\n`);
          skipped++;
          continue;
        }

        process.stdout.write(`  ⏳  ${label} generating...`);

        try {
          const lesson = await generateLesson(
            subject.nameBM,   // generate in BM — works for both muslim and universal students
            chapter.titleBM,
            tingkatan,
            'bm',
          );

          const row: LessonRow = {
            chapter_id: chapter.id,
            subject_id: subject.id,
            tingkatan,
            chapter_title: chapter.titleBM,
            mode: 'both',  // serve to all students; app handles BM/English display
            difficulty: DIFFICULTY,
            ...lesson,
          };

          await insertLesson(row);
          generated++;
          process.stdout.write(' ✅\n');
        } catch (err: any) {
          failed++;
          process.stdout.write(` ❌  ${err.message}\n`);
        }

        // Rate limit: ~2.5 req/s
        await sleep(DELAY_MS);
      }
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`  Generated : ${generated}`);
  console.log(`  Skipped   : ${skipped} (already existed)`);
  console.log(`  Failed    : ${failed}`);
  console.log('─────────────────────────────────────');
  if (failed > 0) {
    console.log('\n⚠️  Some lessons failed. Re-run the script to retry — it will skip successful ones.');
    process.exit(1);
  } else {
    console.log('\n✅  All done! Students will now get instant lesson loads from Supabase.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
