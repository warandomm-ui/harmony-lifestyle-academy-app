import { supabase } from './supabaseClient';
import type { GeneratedModuleContent } from '../types';

/** Dilempar bila server tolak kerana quota free tier harian dah habis. */
export class QuotaExceededError extends Error {}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const getCacheKey = (module: string, topic: string) =>
  `harmony_ai_${module}_${topic.toLowerCase().replace(/\s+/g, '_')}`;

export const generateModuleContent = async (
  module: string,
  topic: string,
  context?: string,
): Promise<GeneratedModuleContent> => {
  const cacheKey = getCacheKey(module, topic);

  // Check localStorage cache (cache hit tak guna quota)
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sila log masuk dahulu.');
  }

  // Claude dipanggil di server (api/ai/module-content) — API key tak pernah ke browser
  const res = await fetch('/api/ai/module-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ module, topic, context }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 429 && data.quotaExceeded) {
    throw new QuotaExceededError(data.error);
  }
  if (!res.ok) {
    throw new Error(data.error || 'Gagal jana lesson. Cuba lagi.');
  }

  const content: GeneratedModuleContent = {
    lesson: data.lesson,
    quiz: data.quiz,
    reflection: data.reflection,
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
