import type { GeneratedModuleContent } from '../types';
import { generateWithClaude } from './aiProxyService';
import { ingestLessonContent } from './lessonLibraryService';

// ─────────────────────────────────────────────────────────────
// Lesson content generation via Claude.
//
// SECURITY: this no longer uses the Anthropic browser SDK. All calls go
// through the `ai-proxy` Supabase Edge Function, so the Anthropic API key
// stays in server-side secrets and is never shipped to the client.
// ─────────────────────────────────────────────────────────────

const safeParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const getCacheKey = (module: string, topic: string) =>
  `harmony_ai_${module}_${topic.toLowerCase().replace(/\s+/g, '_')}`;

const SYSTEM_PROMPT =
  'You are an expert wellness educator writing for young adult learners (16-25). Create engaging, evidence-based content. Return only valid JSON, no prose outside it.';

export const generateModuleContent = async (
  module: string,
  topic: string,
  context?: string,
): Promise<GeneratedModuleContent> => {
  const cacheKey = getCacheKey(module, topic);

  // Check localStorage cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed: GeneratedModuleContent = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.generatedAt).getTime();
      if (age < CACHE_TTL_MS) {
        return parsed;
      }
    } catch {
      // stale / corrupt — fall through to API
    }
  }

  const userPrompt =
    `Generate a complete learning unit for the topic '${topic}' within '${module} Wellness'. ` +
    (context ? context + ' ' : '') +
    `Return JSON matching exactly: { "lesson": { "title": "", "explanation": "", "keyPoints": [], "practicalTip": "", "deeperInsight": "" }, "quiz": { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "explanation": "" }, "reflection": { "prompt": "", "guidingQuestions": ["", "", ""] } }`;

  const text = await generateWithClaude({
    model: 'claude-haiku-4-5-20251001',
    system: SYSTEM_PROMPT,
    cacheSystem: true,
    maxTokens: 1500,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const parsed = safeParseJSON(text);
  if (!parsed?.lesson || !parsed?.quiz || !parsed?.reflection) {
    throw new Error('Invalid response structure from Claude');
  }

  const content: GeneratedModuleContent = {
    ...parsed,
    module,
    topic,
    generatedAt: new Date().toISOString(),
  };

  localStorage.setItem(cacheKey, JSON.stringify(content));

  // Best-effort: embed this freshly generated lesson into the pgvector library
  // so the interactive tutor can retrieve it later. Never blocks generation.
  void ingestLessonContent(content).catch((e) =>
    console.warn('[claudeService] lesson ingestion skipped:', e?.message ?? e),
  );

  return content;
};

export const clearModuleContentCache = (module: string, topic: string) => {
  localStorage.removeItem(getCacheKey(module, topic));
};
