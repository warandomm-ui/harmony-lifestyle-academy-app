/**
 * Claude Module Content Service
 * Routes AI calls through Supabase Edge Function proxy.
 * API keys are stored server-side — never exposed to the browser.
 */
import { callAI, retry } from './aiProxyService';
import type { GeneratedModuleContent } from '../types';

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

  const systemPrompt =
    'You are an expert wellness educator writing for young adult learners (16-25). Create engaging, evidence-based content. Return only valid JSON, no prose outside it.';

  const userPrompt =
    `Generate a complete learning unit for the topic '${topic}' within '${module} Wellness'. ` +
    (context ? context + ' ' : '') +
    `Return JSON matching exactly: { "lesson": { "title": "", "explanation": "", "keyPoints": [], "practicalTip": "", "deeperInsight": "" }, "quiz": { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "explanation": "" }, "reflection": { "prompt": "", "guidingQuestions": ["", "", ""] } }`;

  const result = await retry(async () => {
    const response = await callAI({
      action: 'generateContent',
      payload: {
        contents: userPrompt,
        model: 'claude-haiku-4-5-20251001',
        config: {
          system: systemPrompt,
          maxTokens: 1500,
          responseMimeType: 'application/json',
        },
      },
    });

    const parsed = safeParseJSON(response.text);
    if (!parsed?.lesson || !parsed?.quiz || !parsed?.reflection) {
      throw new Error('Invalid response structure from AI');
    }
    return parsed;
  });

  const content: GeneratedModuleContent = {
    ...result,
    module,
    topic,
    generatedAt: new Date().toISOString(),
  };

  localStorage.setItem(cacheKey, JSON.stringify(content));
  return content;
};

export const clearModuleContentCache = (module: string, topic: string) => {
  localStorage.removeItem(getCacheKey(module, topic));
};
