import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  CircuitBreaker,
  CircuitOpenError,
  Deadline,
  HttpError,
  TimeoutError,
  fetchWithTimeout,
  requestJson,
} from '../_shared/resilience.ts';

// ─────────────────────────────────────────────────────────────
// ai-proxy — single secure gateway for all model providers.
// API keys live ONLY in Supabase Edge secrets, never in the browser.
//
// Supported actions:
//   - generateContent / chat / tts  → Gemini
//   - anthropic                      → Claude Messages API
//   - liveToken                      → short-lived Gemini Live API token
//
// Timeouts & deadline propagation:
//   The browser sends meta.deadlineMs = how long it will wait for this
//   attempt. Every upstream call here is bounded by that budget (minus a
//   margin to send the reply), capped per provider, and by the platform's
//   own wall-clock limit. Upstream timeouts become a clean 504.
//   No retries here: the browser retries, so retrying at both layers
//   would multiply load on a struggling provider.
//
// Circuit breakers (one per provider, per warm isolate):
//   After repeated timeouts / 5xx / 429 the provider is skipped for a
//   short while and callers get 503 + Retry-After at once.
//
// Required secrets: GEMINI_API_KEY, ANTHROPIC_API_KEY
// (SUPABASE_URL and SUPABASE_ANON_KEY are injected by Supabase.)
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  // Lets the browser honour Retry-After on 429/503 responses.
  'Access-Control-Expose-Headers': 'Retry-After',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const GEMINI_ROOT = 'https://generativelanguage.googleapis.com';
const GEMINI_BASE = `${GEMINI_ROOT}/v1beta/models`;
const MAX_ANTHROPIC_TOKENS = 4000;

// Budget limits (ms)
const DEFAULT_BUDGET_MS = 55_000;   // when an older client sends no deadline
const MAX_BUDGET_MS = 140_000;      // stay under the platform's 150s request limit
const MIN_BUDGET_MS = 1_000;
const RESPONSE_MARGIN_MS = 750;     // time kept back to serialise and send the reply
const AUTH_TIMEOUT_MS = 5_000;
const UPSTREAM_TIMEOUT_MS = {
  anthropic: 60_000,
  gemini: 55_000,
  liveToken: 10_000,
};

// Default classifier: only provider-side trouble (timeout, network,
// 408/429/5xx) trips a breaker; a 400 for a bad request does not.
const breakers = {
  anthropic: new CircuitBreaker('Anthropic', { failureThreshold: 5, resetTimeoutMs: 30_000 }),
  gemini: new CircuitBreaker('Gemini', { failureThreshold: 5, resetTimeoutMs: 30_000 }),
};

/**
 * Call a provider through its breaker. The timeout covers headers *and*
 * body, and is the per-provider cap or what is left of the caller's
 * deadline, whichever is smaller. Non-2xx throws HttpError.
 */
function callUpstream(
  breaker: CircuitBreaker,
  label: string,
  url: string,
  init: RequestInit,
  deadline: Deadline,
  capMs: number,
): Promise<any> {
  return breaker.execute(() =>
    requestJson(url, init, {
      timeoutMs: deadline.timeoutFor(capMs, RESPONSE_MARGIN_MS),
      errorMessage: (status, body) => {
        console.error(`${label} error:`, status, JSON.stringify(body));
        return `${label} HTTP ${status}`;
      },
    })
  );
}

/** Turn transport / upstream failures into a response for the browser. */
function upstreamErrorResponse(err: unknown, fallbackMessage: string): Response {
  if (err instanceof CircuitOpenError) {
    const retryAfter = String(Math.max(1, Math.ceil(err.retryAfterMs / 1000)));
    return withHeaders(
      json({ error: `${err.breaker} is temporarily unavailable. Please try again shortly.`, code: 'CIRCUIT_OPEN' }, 503),
      { 'Retry-After': retryAfter },
    );
  }
  if (err instanceof TimeoutError) {
    console.error('Upstream timeout:', err.message);
    return json({ error: 'The AI service took too long to respond. Please try again.', code: 'UPSTREAM_TIMEOUT' }, 504);
  }
  if (err instanceof HttpError) {
    // An upstream 404 (e.g. unknown model) is a server-side problem; passing
    // it through would look like "edge function not deployed" to the browser.
    const status = err.status === 404 ? 502 : err.status;
    const res = json({ error: fallbackMessage }, status);
    return err.retryAfterMs !== undefined
      ? withHeaders(res, { 'Retry-After': String(Math.ceil(err.retryAfterMs / 1000)) })
      : res;
  }
  if (err instanceof TypeError) {
    console.error('Upstream network error:', err);
    return json({ error: 'Could not reach the AI provider. Please try again.', code: 'UPSTREAM_UNREACHABLE' }, 502);
  }
  throw err;
}

const withHeaders = (res: Response, extra: Record<string, string>) => {
  for (const [k, v] of Object.entries(extra)) res.headers.set(k, v);
  return res;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Parse first so the time budget starts as soon as the request arrives.
  let action: string;
  let payload: any;
  let deadline: Deadline;
  try {
    const body = await req.json();
    action = body.action;
    payload = body.payload ?? {};
    deadline = Deadline.fromRemaining(body.meta?.deadlineMs, DEFAULT_BUDGET_MS, MIN_BUDGET_MS, MAX_BUDGET_MS);
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Only signed-in users may spend the AI quota.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing authorization header' }, 401);
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
        fetch: (input, init) =>
          fetchWithTimeout(input, init ?? {}, { timeoutMs: deadline.timeoutFor(AUTH_TIMEOUT_MS) }),
      },
    },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError?.name === 'AuthRetryableFetchError') {
    // Auth service slow/unreachable: a retryable 503, not a misleading 401.
    console.error('Auth check failed:', authError.message);
    return withHeaders(json({ error: 'Could not verify your session. Please try again.' }, 503), { 'Retry-After': '2' });
  }
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    // ─── Anthropic (Claude) ───────────────────────────────────
    if (action === 'anthropic') {
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      if (!ANTHROPIC_API_KEY) {
        return json({ error: 'ANTHROPIC_API_KEY not configured in Supabase secrets' }, 500);
      }

      let data: any;
      try {
        data = await callUpstream(
          breakers.anthropic,
          'Anthropic API',
          'https://api.anthropic.com/v1/messages',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: payload.model || 'claude-haiku-4-5-20251001',
              max_tokens: Math.min(payload.max_tokens || 1500, MAX_ANTHROPIC_TOKENS),
              ...(payload.system ? { system: payload.system } : {}),
              messages: payload.messages || [],
            }),
          },
          deadline,
          UPSTREAM_TIMEOUT_MS.anthropic,
        );
      } catch (err) {
        return upstreamErrorResponse(err, 'AI service error');
      }

      const text = Array.isArray(data.content)
        ? data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
        : '';
      return json({ text });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return json({ error: 'GEMINI_API_KEY not configured in Supabase secrets' }, 500);
    }

    // ─── Gemini Live API ephemeral token ──────────────────────
    // The browser opens the Live websocket itself, so it gets a
    // single-use token that expires in minutes instead of the key.
    if (action === 'liveToken') {
      const now = Date.now();
      let data: any;
      try {
        data = await callUpstream(
          breakers.gemini,
          'Gemini token',
          `${GEMINI_ROOT}/v1alpha/auth_tokens`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
            body: JSON.stringify({
              uses: 1,
              expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
              newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
            }),
          },
          deadline,
          UPSTREAM_TIMEOUT_MS.liveToken,
        );
      } catch (err) {
        return upstreamErrorResponse(err, 'Could not create live session token');
      }
      return json({ text: '', token: data.name });
    }

    // ─── Gemini text / chat / tts ─────────────────────────────
    const model = payload.model || 'gemini-2.5-flash-lite';
    let requestBody: any;

    switch (action) {
      case 'generateContent': {
        requestBody = {
          contents: Array.isArray(payload.contents)
            ? payload.contents
            : [{ parts: [{ text: payload.contents }] }],
          generationConfig: payload.config || {},
        };
        break;
      }
      case 'chat': {
        requestBody = {
          contents: payload.history || [],
          generationConfig: payload.config || {},
        };
        if (payload.systemInstruction) {
          requestBody.systemInstruction = { parts: [{ text: payload.systemInstruction }] };
        }
        break;
      }
      case 'tts': {
        requestBody = {
          contents: payload.contents,
          generationConfig: payload.config || {},
        };
        break;
      }
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }

    let data: any;
    try {
      data = await callUpstream(
        breakers.gemini,
        'Gemini API',
        `${GEMINI_BASE}/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
          body: JSON.stringify(requestBody),
        },
        deadline,
        UPSTREAM_TIMEOUT_MS.gemini,
      );
    } catch (err) {
      return upstreamErrorResponse(err, 'AI service error');
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p: any) => p.text || '').join('');
    const inlineData = parts.find((p: any) => p.inlineData)?.inlineData || null;
    return json({ text, inlineData });
  } catch (error) {
    console.error('Edge function error:', error);
    return json({ error: (error as Error).message || 'Internal server error' }, 500);
  }
});
