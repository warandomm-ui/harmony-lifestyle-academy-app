import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────
// ai-tutor — retrieval-augmented interactive tutor.
//
// mode: 'ask'    → embed the student question, retrieve the 2-3 most relevant
//                  lesson chunks via pgvector, then answer with Haiku 4.5
//                  (stable persona cached for the 90% cache-read discount).
// mode: 'ingest' → embed lesson chunks and store them for later retrieval.
//
// This replaces the previous "stuff the whole lesson into every prompt"
// approach: input drops from ~3,000 tokens to ~300 tokens per message.
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const EMBED_MODEL = 'text-embedding-004';

async function embed(texts: string[]): Promise<number[][]> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY not configured');
  const res = await fetch(`${GEMINI_BASE}/${EMBED_MODEL}:batchEmbedContents?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: texts.map((t) => ({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text: t }] },
      })),
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${await res.text()}`);
  const data = await res.json();
  return (data.embeddings || []).map((e: any) => e.values);
}

function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode = body.mode || 'ask';

    // ─── Ingest lesson chunks into the vector library ────────
    if (mode === 'ingest') {
      const { lesson_id, module, topic, chunks } = body as {
        lesson_id?: string; module?: string; topic?: string; chunks: string[];
      };
      if (!Array.isArray(chunks) || chunks.length === 0) {
        return json({ error: 'chunks[] required' }, 400);
      }
      const vectors = await embed(chunks);
      const rows = chunks.map((content, i) => ({
        lesson_id: lesson_id ?? null,
        module: module ?? null,
        topic: topic ?? null,
        content,
        embedding: vectors[i],
      }));
      // onConflict matches the (lesson_id, md5(content)) unique index → idempotent.
      const { error } = await adminClient()
        .from('lesson_chunks')
        .upsert(rows, { onConflict: 'lesson_id,content', ignoreDuplicates: true });
      if (error) {
        // Unique-index conflicts are expected on re-ingest; surface anything else.
        if (!/duplicate key|already exists/i.test(error.message)) {
          return json({ error: error.message }, 500);
        }
      }
      return json({ ok: true, ingested: rows.length });
    }

    // ─── Ask: retrieve relevant context, then answer with Haiku ──
    const {
      message,
      module = null,
      lessonTitle = '',
      ageGroup = '13-17',
      personality = 'curious',
      history = [],
    } = body;

    if (!message) return json({ error: 'message required' }, 400);

    // 1) Embed the question and pull the closest lesson chunks.
    let context = '';
    let sources: { topic: string; similarity: number }[] = [];
    try {
      const [queryVec] = await embed([message]);
      const { data: matches } = await adminClient().rpc('match_lesson_chunks', {
        query_embedding: queryVec,
        match_count: 3,
        filter_module: module,
      });
      if (Array.isArray(matches) && matches.length) {
        context = matches.map((m: any) => `- ${m.content}`).join('\n');
        sources = matches.map((m: any) => ({ topic: m.topic, similarity: m.similarity }));
      }
    } catch (e) {
      console.warn('Retrieval skipped:', (e as Error).message);
    }

    const isYoung = ageGroup === '7-12';
    const personalityDesc = ({
      aktif: 'energetic and action-oriented',
      tenang: 'calm and thoughtful',
      curious: 'curious and loves exploring',
      social: 'social and collaborative',
    } as Record<string, string>)[personality] || 'curious and eager to learn';

    // Stable persona → cached. Retrieved context changes per question → not cached.
    const persona = `You are HLA Tutor AI — a friendly, encouraging AI tutor for Harmony Lifestyle Academy, a life skills school for Malaysian students.

RULES:
1. ALWAYS respond in Bahasa Malaysia (Malay language)
2. Keep responses SHORT (2-4 sentences max)
3. Be warm, encouraging, and kid-friendly
4. Use emojis sparingly (1-2 per message)
5. If they're stuck, give hints not answers
6. Relate to Malaysian culture and daily life
7. ${isYoung ? 'Use very simple words suitable for 7-12 year olds. Be extra gentle.' : 'Use casual teen-friendly language, like a cool older sibling.'}
8. Answer using ONLY the lesson context provided. If the context does not cover it, gently steer back to the lesson.
9. Never give harmful, inappropriate, or non-educational content`;

    const contextBlock = `STUDENT PROFILE: age ${ageGroup}, personality: ${personalityDesc}, current lesson: "${lessonTitle}".

RELEVANT LESSON CONTEXT:
${context || '(no specific lesson context retrieved — answer generally but stay on the lesson topic)'}`;

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: body.model || 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          temperature: 0.7,
          system: [
            { type: 'text', text: persona, cache_control: { type: 'ephemeral' } },
            { type: 'text', text: contextBlock },
          ],
          messages: [
            ...(history || []).map((h: any) => ({
              role: h.role === 'model' ? 'assistant' : h.role,
              content: h.content ?? h.text ?? '',
            })),
            { role: 'user', content: message },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = Array.isArray(data.content)
          ? data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
          : '';
        return json({ reply: reply || getSmartFallback(message, lessonTitle, isYoung), sources, usage: data.usage ?? null });
      }
      console.error('Anthropic error:', await res.text());
    }

    // Graceful fallback when no key is configured or the API errors.
    return json({ reply: getSmartFallback(message, lessonTitle, isYoung), sources });
  } catch (error) {
    return json(
      { reply: 'Maaf, ada masalah teknikal. Cuba lagi ya! 😊', error: String(error) },
      200,
    );
  }
});

function getSmartFallback(message: string, lessonTitle: string, isYoung: boolean): string {
  const msg = message.toLowerCase();
  const greeting = isYoung ? 'Hai! 😊' : 'Hey! 👋';
  if (msg.includes('tak faham') || msg.includes('susah') || msg.includes('confused')) {
    return `${greeting} Tak apa, pelajaran "${lessonTitle}" memang perlukan masa. Cuba baca semula perlahan-lahan. Yang mana kamu tak faham? 💪`;
  }
  if (msg.includes('contoh') || msg.includes('example')) {
    return `${greeting} Cuba fikir tentang kehidupan harian kamu — ada tak situasi berkaitan dengan "${lessonTitle}"? Pengalaman sendiri contoh terbaik! ✨`;
  }
  if (msg.includes('terima kasih') || msg.includes('thanks')) {
    return `Sama-sama! Saya bangga dengan usaha kamu. Teruskan belajar ya! ${isYoung ? '🌟' : '🔥'}`;
  }
  if (msg.includes('hello') || msg.includes('hai') || msg.includes('hi')) {
    return `${greeting} Selamat datang! Saya tutor AI kamu untuk "${lessonTitle}". Ada apa saya boleh bantu? 😊`;
  }
  return `${greeting} Soalan bagus! Untuk "${lessonTitle}", ingat — belajar itu proses. Ada apa lagi kamu nak tanya? 😊`;
}
