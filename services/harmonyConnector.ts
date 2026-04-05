/**
 * Harmony Connector — Unified Claude AI Integration Service
 *
 * All Claude AI calls are routed through the Supabase Edge Function
 * (claude-proxy) so that API keys are never exposed to the browser.
 *
 * Capabilities:
 *  - chat          : conversational AI assistant
 *  - generateContent : structured lesson / module generation
 *  - analyze       : personality & skills analysis
 *  - studyBuddy    : interactive study companion
 *  - spiritualGuidance : faith-aware wellness guidance
 */

import { supabase } from './supabaseClient';
import type {
  HarmonyConnectorAction,
  HarmonyConnectorRequest,
  HarmonyConnectorResponse,
  HarmonyConnectorMessage,
  GeneratedModuleContent,
} from '../types';

// ── Config ────────────────────────────────────────────────────────────────────
const CLAUDE_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

// ── Auth helpers ──────────────────────────────────────────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('User not authenticated. Please sign in.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
}

// ── Retry with exponential back-off ──────────────────────────────────────────
async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries) throw err;
      const wait = err?.message?.includes('429') ? delay * (i + 2) : delay;
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw new Error('Retry failed');
}

// ── Core request ─────────────────────────────────────────────────────────────
export async function callClaude(request: HarmonyConnectorRequest): Promise<HarmonyConnectorResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(CLAUDE_PROXY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Claude proxy error: ${response.status}`);
  }

  return response.json();
}

// ── JSON parser (tolerates markdown fences) ──────────────────────────────────
function safeParseJSON(text: string | undefined): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send a free-form chat message (with optional history) to Harmony AI.
 */
export async function chat(
  messages: HarmonyConnectorMessage[],
  options?: { system?: string; model?: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const result = await retry(() =>
    callClaude({
      action: 'chat',
      payload: {
        messages,
        system: options?.system,
        model: options?.model,
        max_tokens: options?.maxTokens,
        temperature: options?.temperature,
      },
    }),
  );
  return result.text;
}

/**
 * Generate structured module content (lesson + quiz + reflection).
 * Results are cached in localStorage for 24 h.
 */
export async function generateModuleContent(
  moduleName: string,
  topic: string,
  context?: string,
): Promise<GeneratedModuleContent> {
  const cacheKey = `harmony_ai_${moduleName}_${topic.toLowerCase().replace(/\s+/g, '_')}`;

  // Check cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed: GeneratedModuleContent = JSON.parse(cached);
      if (Date.now() - new Date(parsed.generatedAt).getTime() < CACHE_TTL_MS) return parsed;
    } catch { /* stale / corrupt — fall through */ }
  }

  const prompt =
    `Generate a complete learning unit for the topic '${topic}' within '${moduleName} Wellness'. ` +
    (context ? context + ' ' : '') +
    `Return JSON matching exactly: { "lesson": { "title": "", "explanation": "", "keyPoints": [], "practicalTip": "", "deeperInsight": "" }, "quiz": { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "explanation": "" }, "reflection": { "prompt": "", "guidingQuestions": ["", "", ""] } }`;

  const result = await retry(() =>
    callClaude({
      action: 'generateContent',
      payload: { prompt, max_tokens: 1500 },
    }),
  );

  const parsed = safeParseJSON(result.text);
  if (!parsed?.lesson || !parsed?.quiz || !parsed?.reflection) {
    throw new Error('Invalid response structure from Claude');
  }

  const content: GeneratedModuleContent = {
    ...parsed,
    module: moduleName,
    topic,
    generatedAt: new Date().toISOString(),
  };

  localStorage.setItem(cacheKey, JSON.stringify(content));
  return content;
}

/**
 * Clear the cached content for a specific module + topic.
 */
export function clearModuleContentCache(moduleName: string, topic: string): void {
  localStorage.removeItem(`harmony_ai_${moduleName}_${topic.toLowerCase().replace(/\s+/g, '_')}`);
}

/**
 * Run a personality / skills analysis prompt and return parsed JSON.
 */
export async function analyze<T = any>(
  prompt: string,
  options?: { model?: string; maxTokens?: number },
): Promise<T> {
  const result = await retry(() =>
    callClaude({
      action: 'analyze',
      payload: {
        prompt,
        model: options?.model,
        max_tokens: options?.maxTokens || 2000,
      },
    }),
  );
  return safeParseJSON(result.text);
}

/**
 * Interactive study buddy — quiz, explain, encourage.
 */
export async function studyBuddy(
  messages: HarmonyConnectorMessage[],
  options?: { model?: string; maxTokens?: number },
): Promise<string> {
  const result = await retry(() =>
    callClaude({
      action: 'studyBuddy',
      payload: {
        messages,
        model: options?.model,
        max_tokens: options?.maxTokens || 1000,
      },
    }),
  );
  return result.text;
}

/**
 * Spiritual guidance — respectful, inclusive faith-aware support.
 */
export async function spiritualGuidance(
  prompt: string,
  options?: { model?: string; maxTokens?: number },
): Promise<any> {
  const result = await retry(() =>
    callClaude({
      action: 'spiritualGuidance',
      payload: {
        prompt,
        model: options?.model,
        max_tokens: options?.maxTokens || 1500,
      },
    }),
  );
  return safeParseJSON(result.text) ?? result.text;
}

/**
 * Check whether the connector can reach the Claude proxy.
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const res = await chat(
      [{ role: 'user', content: 'Respond with exactly: CONNECTED' }],
      { maxTokens: 20, temperature: 0 },
    );
    return res.toUpperCase().includes('CONNECTED');
  } catch {
    return false;
  }
}
