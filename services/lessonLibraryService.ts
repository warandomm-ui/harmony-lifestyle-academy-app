import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { GeneratedModuleContent } from '../types';

// ─────────────────────────────────────────────────────────────
// Lesson library — feeds the pgvector store that powers tutor retrieval.
// Ingestion runs server-side (ai-tutor edge function, service role) so the
// browser never needs write access to lesson_chunks.
// ─────────────────────────────────────────────────────────────

/** Split a generated lesson into a handful of retrievable chunks. */
const toChunks = (c: GeneratedModuleContent): string[] => {
  const prefix = `${c.module} — ${c.topic}`;
  const chunks: string[] = [];
  if (c.lesson?.explanation) chunks.push(`${prefix}: ${c.lesson.explanation}`);
  if (c.lesson?.keyPoints?.length) chunks.push(`${prefix} — key points: ${c.lesson.keyPoints.join('; ')}`);
  if (c.lesson?.practicalTip) chunks.push(`${prefix} — practical tip: ${c.lesson.practicalTip}`);
  if (c.lesson?.deeperInsight) chunks.push(`${prefix} — deeper insight: ${c.lesson.deeperInsight}`);
  return chunks.filter((t) => t.trim().length > 0);
};

/** Embed + store a freshly generated lesson. Best-effort; safe to call repeatedly. */
export async function ingestLessonContent(content: GeneratedModuleContent): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const chunks = toChunks(content);
  if (chunks.length === 0) return;

  const lessonId = `${content.module}__${content.topic}`.toLowerCase().replace(/\s+/g, '_');
  const { error } = await supabase.functions.invoke('ai-tutor', {
    body: {
      mode: 'ingest',
      lesson_id: lessonId,
      module: content.module,
      topic: content.topic,
      chunks,
    },
  });
  if (error) throw error;
}
