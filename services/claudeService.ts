import Anthropic from '@anthropic-ai/sdk';
import type { GeneratedModuleContent } from '../types';

const getClaude = () => new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const retry = async <T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries) throw err;
      const waitTime = err?.status === 429 ? delay * (i + 2) : delay;
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  throw new Error('Retry failed');
};

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

  const claude = getClaude();

  const systemPrompt =
    'You are an expert wellness educator writing for young adult learners (16-25). Create engaging, evidence-based content. Return only valid JSON, no prose outside it. ' +
    'If the topic touches Islamic practice (e.g. dhikr, du\'a, tawakkul, salah), never invent, paraphrase, or quote specific Qur\'an ayat or hadith wording from memory — you may reference general themes and encourage the learner to consult the app\'s verified Qur\'an reader or a qualified teacher, but do not present generated text as scripture.';

  const userPrompt =
    `Generate a complete learning unit for the topic '${topic}' within '${module} Wellness'. ` +
    (context ? context + ' ' : '') +
    `Return JSON matching exactly: { "lesson": { "title": "", "explanation": "", "keyPoints": [], "practicalTip": "", "deeperInsight": "" }, "quiz": { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "explanation": "" }, "reflection": { "prompt": "", "guidingQuestions": ["", "", ""] } }`;

  const result = await retry(async () => {
    const response = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const parsed = safeParseJSON(text);
    if (!parsed?.lesson || !parsed?.quiz || !parsed?.reflection) {
      throw new Error('Invalid response structure from Claude');
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
