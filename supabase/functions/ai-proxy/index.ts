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
import { ERRORS, type ErrorCode, codeForUpstreamStatus, errorBody } from '../_shared/errors.ts';

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
// Failure reporting (see _shared/errors.ts for the full catalogue):
//   - every failure is a catalogued code with a fixed status, a
//     `retryable` verdict and a user-safe message; provider statuses are
//     mapped, never forwarded (a provider 401 is our key, not the user)
//   - a 200 is only returned when there is a usable answer; empty or
//     safety-blocked provider answers are reported, not passed on as ''
//   - every response carries X-Request-Id (and requestId in error bodies);
//     the browser sends one per logical call so retries share it
//   - one structured JSON log line per request, plus one per provider
//     error; prompts, answers and secrets are never logged
//
// Required secrets: GEMINI_API_KEY, ANTHROPIC_API_KEY
// (SUPABASE_URL and SUPABASE_ANON_KEY are injected by Supabase.)
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  // Lets the browser honour Retry-After and show the request reference.
  'Access-Control-Expose-Headers': 'Retry-After, X-Request-Id',
};

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

// Gemini finish reasons that mean "refused", not "nothing to say".
const GEMINI_BLOCKED = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION', 'IMAGE_SAFETY']);

// ─── Request context, logging, responses ─────────────────────

interface RequestContext {
  requestId: string;
  startedAt: number;
  action?: string;
  attempt?: number;
  userId?: string;
  provider?: 'anthropic' | 'gemini';
  upstreamStatus?: number;
}

const REQUEST_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/** One JSON line per event, so logs can be filtered by requestId, code or provider. */
function log(level: 'info' | 'warn' | 'error', event: string, ctx: RequestContext, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    level,
    event,
    requestId: ctx.requestId,
    action: ctx.action,
    attempt: ctx.attempt,
    provider: ctx.provider,
    userId: ctx.userId,
    upstreamStatus: ctx.upstreamStatus,
    durationMs: Date.now() - ctx.startedAt,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function respond(ctx: RequestContext, body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': ctx.requestId, ...headers },
  });
}

function succeed(ctx: RequestContext, body: unknown) {
  log('info', 'request_completed', ctx, { status: 200 });
  return respond(ctx, body, 200);
}

/** The only way this function reports a failure. `detail` goes to logs, never to the browser. */
function fail(ctx: RequestContext, code: ErrorCode, opts: { retryAfterSec?: number; detail?: string } = {}) {
  const { status } = ERRORS[code];
  log(status >= 500 ? 'error' : 'warn', 'request_failed', ctx, { status, code, detail: opts.detail });
  const headers: Record<string, string> = opts.retryAfterSec !== undefined
    ? { 'Retry-After': String(Math.max(1, Math.ceil(opts.retryAfterSec))) }
    : {};
  return respond(ctx, errorBody(code, ctx.requestId), status, headers);
}

/** Map anything a provider call can throw to a catalogued failure. */
function failFromUpstream(ctx: RequestContext, err: unknown): Response {
  if (err instanceof CircuitOpenError) {
    return fail(ctx, 'CIRCUIT_OPEN', { retryAfterSec: err.retryAfterMs / 1000, detail: `${err.breaker} breaker open` });
  }
  if (err instanceof TimeoutError) {
    return fail(ctx, 'UPSTREAM_TIMEOUT', { detail: err.message });
  }
  if (err instanceof HttpError) {
    ctx.upstreamStatus = err.status;
    const code = codeForUpstreamStatus(err.status);
    const retryAfterSec = err.retryAfterMs !== undefined && ERRORS[code].retryable
      ? err.retryAfterMs / 1000
      : undefined;
    return fail(ctx, code, { retryAfterSec, detail: err.message });
  }
  if (err instanceof SyntaxError) {
    return fail(ctx, 'UPSTREAM_BAD_RESPONSE', { detail: `invalid JSON from provider: ${err.message}` });
  }
  if (err instanceof TypeError) {
    return fail(ctx, 'UPSTREAM_UNREACHABLE', { detail: err.message });
  }
  return fail(ctx, 'INTERNAL', { detail: err instanceof Error ? err.message : String(err) });
}

/**
 * Call a provider through its breaker. The timeout covers headers *and*
 * body, and is the per-provider cap or what is left of the caller's
 * deadline, whichever is smaller. Non-2xx throws HttpError.
 */
function callUpstream(
  ctx: RequestContext,
  breaker: CircuitBreaker,
  url: string,
  init: RequestInit,
  deadline: Deadline,
  capMs: number,
): Promise<any> {
  return breaker.execute(() =>
    requestJson(url, init, {
      timeoutMs: deadline.timeoutFor(capMs, RESPONSE_MARGIN_MS),
      errorMessage: (status, body) => {
        // Provider error bodies explain *why* (bad key, quota, bad input); keep them for operators.
        log('warn', 'upstream_error', { ...ctx, upstreamStatus: status }, {
          upstreamBody: JSON.stringify(body)?.slice(0, 500),
        });
        return `${breaker.name} HTTP ${status}`;
      },
    })
  );
}

// ─── Handler ─────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const ctx: RequestContext = { requestId: crypto.randomUUID(), startedAt: Date.now() };
  if (req.method !== 'POST') {
    return fail(ctx, 'METHOD_NOT_ALLOWED', { detail: req.method });
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
    if (typeof body.meta?.requestId === 'string' && REQUEST_ID_RE.test(body.meta.requestId)) {
      ctx.requestId = body.meta.requestId;
    }
    if (Number.isInteger(body.meta?.attempt)) ctx.attempt = body.meta.attempt;
    ctx.action = typeof action === 'string' ? action : undefined;
  } catch {
    return fail(ctx, 'BAD_REQUEST', { detail: 'invalid JSON body' });
  }

  // Only signed-in users may spend the AI quota.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return fail(ctx, 'UNAUTHENTICATED', { detail: 'missing authorization header' });
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
    return fail(ctx, 'AUTH_UNAVAILABLE', { retryAfterSec: 2, detail: authError.message });
  }
  if (authError || !user) {
    return fail(ctx, 'UNAUTHENTICATED', { detail: authError?.message ?? 'no user' });
  }
  ctx.userId = user.id;

  try {
    // ─── Anthropic (Claude) ───────────────────────────────────
    if (action === 'anthropic') {
      ctx.provider = 'anthropic';
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      if (!ANTHROPIC_API_KEY) {
        return fail(ctx, 'CONFIG_MISSING', { detail: 'ANTHROPIC_API_KEY not set in Supabase secrets' });
      }

      let data: any;
      try {
        data = await callUpstream(
          ctx,
          breakers.anthropic,
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
        return failFromUpstream(ctx, err);
      }

      if (!Array.isArray(data?.content)) {
        return fail(ctx, 'UPSTREAM_BAD_RESPONSE', { detail: 'Anthropic response has no content array' });
      }
      const text = data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
      if (data.stop_reason === 'refusal') {
        return fail(ctx, 'CONTENT_BLOCKED', { detail: 'Anthropic stop_reason=refusal' });
      }
      if (!text) {
        return fail(ctx, 'UPSTREAM_EMPTY_RESPONSE', { detail: `Anthropic stop_reason=${data.stop_reason}` });
      }
      return succeed(ctx, { text });
    }

    ctx.provider = 'gemini';
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return fail(ctx, 'CONFIG_MISSING', { detail: 'GEMINI_API_KEY not set in Supabase secrets' });
    }

    // ─── Gemini Live API ephemeral token ──────────────────────
    // The browser opens the Live websocket itself, so it gets a
    // single-use token that expires in minutes instead of the key.
    if (action === 'liveToken') {
      const now = Date.now();
      let data: any;
      try {
        data = await callUpstream(
          ctx,
          breakers.gemini,
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
        return failFromUpstream(ctx, err);
      }
      if (typeof data?.name !== 'string' || !data.name) {
        return fail(ctx, 'UPSTREAM_BAD_RESPONSE', { detail: 'Gemini token response has no name' });
      }
      return succeed(ctx, { text: '', token: data.name });
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
        ctx.provider = undefined;
        return fail(ctx, 'UNKNOWN_ACTION', { detail: `action=${String(action)}` });
    }

    let data: any;
    try {
      data = await callUpstream(
        ctx,
        breakers.gemini,
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
      return failFromUpstream(ctx, err);
    }

    // A 200 from Gemini can still carry no answer (safety block, empty
    // candidate). Report it instead of returning an empty string.
    const candidate = data?.candidates?.[0];
    const blockReason = data?.promptFeedback?.blockReason;
    if (!candidate) {
      return blockReason
        ? fail(ctx, 'CONTENT_BLOCKED', { detail: `Gemini promptFeedback.blockReason=${blockReason}` })
        : fail(ctx, 'UPSTREAM_EMPTY_RESPONSE', { detail: 'Gemini returned no candidates' });
    }
    const parts = candidate.content?.parts || [];
    const text = parts.map((p: any) => p.text || '').join('');
    const inlineData = parts.find((p: any) => p.inlineData)?.inlineData || null;
    if (!text && !inlineData) {
      return GEMINI_BLOCKED.has(candidate.finishReason)
        ? fail(ctx, 'CONTENT_BLOCKED', { detail: `Gemini finishReason=${candidate.finishReason}` })
        : fail(ctx, 'UPSTREAM_EMPTY_RESPONSE', { detail: `Gemini finishReason=${candidate.finishReason}` });
    }
    return succeed(ctx, { text, inlineData });
  } catch (error) {
    // Our own bug: log the detail, give the browser only the reference.
    return fail(ctx, 'INTERNAL', { detail: error instanceof Error ? `${error.name}: ${error.message}` : String(error) });
  }
});
