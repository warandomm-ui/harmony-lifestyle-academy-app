import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  CircuitBreaker,
  CircuitOpenError,
  Deadline,
  HttpError,
  TimeoutError,
  isNetworkError,
  isTransientError,
  requestJson,
  retryWithBackoff,
} from '../supabase/functions/_shared/resilience';

/**
 * Secure AI Proxy Service
 * Routes all AI calls through Supabase Edge Function
 * API keys stay on the server - never exposed to browser
 *
 * Resilience (see supabase/functions/_shared/resilience.ts):
 *  - every logical call has a Deadline (total budget across retries)
 *  - every attempt has a timeout = min(per-action cap, time left)
 *  - the remaining budget is sent to the edge function (meta.deadlineMs)
 *    so it stops waiting on Gemini/Claude before the browser gives up
 *  - transient failures (timeout, network, 408/429/5xx) are retried with
 *    jittered backoff, honouring Retry-After
 *  - a circuit breaker fails fast while the proxy is clearly down
 *
 * Failure reporting (contract in supabase/functions/_shared/errors.ts):
 *  - one requestId per logical call, sent as meta.requestId and shared by
 *    every retry, so the proxy's log lines for it group together
 *  - the proxy's `retryable` verdict decides retries (a misconfigured key
 *    is not retried; an overloaded provider is)
 *  - failures reach the UI as AIServiceError { message, code, status,
 *    requestId, retryable }; server-side failures (5xx) end with a short
 *    reference the user can quote when reporting the problem
 */

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;

type AIAction = 'generateContent' | 'chat' | 'tts' | 'anthropic' | 'liveToken';

interface AIProxyRequest {
  action: AIAction;
  payload: {
    contents?: any;
    model?: string;
    config?: Record<string, any>;
    history?: any[];
    systemInstruction?: string;
    system?: string;
    messages?: { role: 'user' | 'assistant'; content: string }[];
    max_tokens?: number;
  };
}

interface AIProxyResponse {
  text: string;
  inlineData?: { data: string; mimeType: string } | null;
  token?: string;
  error?: string;
}

export interface CallOptions {
  /** Overall budget shared by all attempts. Defaults per action. */
  deadline?: Deadline;
  /** Cancel from the caller, e.g. when a component unmounts. */
  signal?: AbortSignal;
}

/** Longest a single attempt may take. */
const ATTEMPT_TIMEOUT_MS: Record<AIAction, number> = {
  generateContent: 60_000, // PDF/image extraction can be slow
  chat: 45_000,
  tts: 45_000,
  anthropic: 60_000,
  liveToken: 10_000,
};

/** Total budget for one logical call, retries included. */
const OPERATION_BUDGET_MS: Record<AIAction, number> = {
  generateContent: 100_000,
  chat: 60_000,
  tts: 75_000,
  anthropic: 90_000,
  liveToken: 20_000,
};

/** Don't start an attempt with less time than this left. */
const MIN_ATTEMPT_MS = 5_000;

/** Shared by every AI call in this tab. */
const aiProxyBreaker = new CircuitBreaker('AI service', {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
});

/**
 * Error surfaced to the UI after the transport layer has finished
 * retrying. Outer retry() wrappers must not retry it again.
 */
export class AIServiceError extends Error {
  readonly name = 'AIServiceError';
  constructor(
    message: string,
    readonly status?: number,
    readonly cause?: unknown,
    /** Catalogued server code (e.g. UPSTREAM_TIMEOUT) or a client code (NETWORK_ERROR, TIMEOUT, …). */
    readonly code: string = 'UNKNOWN',
    readonly requestId?: string,
    /** Whether trying again later can help. */
    readonly retryable = false,
  ) {
    super(message);
  }
}

/** Short form of a request id for messages, e.g. "Ref: 3f9a1c2b". */
const shortRef = (requestId?: string) => (requestId ? requestId.replace(/-/g, '').slice(0, 8) : '');

const newRequestId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new AIServiceError('User not authenticated. Please sign in.', 401, undefined, 'UNAUTHENTICATED');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
}

function httpErrorMessage(status: number, body: any): string {
  // The proxy's messages come from its error catalogue and are user-safe.
  if (typeof body?.error === 'string' && body.error) return body.error;
  if (status === 404) {
    return 'AI proxy edge function not found. Please deploy the ai-proxy edge function to your Supabase project.';
  }
  if (status === 504) return 'The AI service took too long to respond. Please try again.';
  if (status >= 500) return 'The AI server encountered an error. Please try again in a moment.';
  return `AI service error: ${status}`;
}

function toUserFacingError(err: unknown, requestId: string): Error {
  if (err instanceof AIServiceError) return err;
  if (err instanceof TimeoutError) {
    return new AIServiceError(
      `The AI service took too long to respond. Please try again. (Ref: ${shortRef(requestId)})`,
      504, err, 'TIMEOUT', requestId, true,
    );
  }
  if (err instanceof CircuitOpenError) {
    const seconds = Math.max(1, Math.ceil(err.retryAfterMs / 1000));
    return new AIServiceError(
      `The AI service is temporarily unavailable. Please try again in about ${seconds} seconds.`,
      503, err, 'CIRCUIT_OPEN', requestId, true,
    );
  }
  if (err instanceof HttpError) {
    const ref = err.details.requestId ?? requestId;
    const code = err.details.code ?? (err.status === 404 ? 'NOT_DEPLOYED' : `HTTP_${err.status}`);
    // 5xx = our side or the provider's: give the user something to quote.
    const message = err.status >= 500 ? `${err.message} (Ref: ${shortRef(ref)})` : err.message;
    return new AIServiceError(message, err.status, err, code, ref, isTransientError(err));
  }
  if (isNetworkError(err)) {
    return new AIServiceError(
      'Could not reach the server. Please check your internet connection and verify the server URL is correct.',
      undefined, err, 'NETWORK_ERROR', requestId, true,
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

export async function callAI(
  request: AIProxyRequest,
  options: CallOptions = {},
): Promise<AIProxyResponse> {
  if (!isSupabaseConfigured()) {
    throw new AIServiceError(
      'Server not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
      undefined, undefined, 'NOT_CONFIGURED',
    );
  }

  const deadline = options.deadline ?? Deadline.after(OPERATION_BUDGET_MS[request.action]);
  const attemptCap = ATTEMPT_TIMEOUT_MS[request.action];
  const requestId = newRequestId();
  let attempts = 0;

  try {
    return await retryWithBackoff(
      async (attempt) => {
        attempts = attempt + 1;
        const headers = await getAuthHeaders();
        const timeoutMs = deadline.timeoutFor(attemptCap);
        return aiProxyBreaker.execute(() =>
          requestJson<AIProxyResponse>(
            EDGE_FUNCTION_URL,
            {
              method: 'POST',
              headers,
              // Deadline propagation: the proxy must answer before this attempt times out.
              body: JSON.stringify({ ...request, meta: { deadlineMs: timeoutMs, requestId, attempt } }),
            },
            { timeoutMs, signal: options.signal, errorMessage: httpErrorMessage },
          ),
        );
      },
      {
        retries: 2,
        baseDelayMs: 1_000,
        maxDelayMs: 10_000,
        deadline,
        minAttemptMs: MIN_ATTEMPT_MS,
        shouldRetry: (err) => !options.signal?.aborted && isTransientError(err),
      },
    );
  } catch (err) {
    const userError = toUserFacingError(err, requestId);
    if (userError instanceof AIServiceError) {
      // Developer-facing trail; matches the proxy's log lines by requestId.
      console.warn(JSON.stringify({
        event: 'ai_call_failed', action: request.action, requestId: userError.requestId ?? requestId,
        code: userError.code, status: userError.status, retryable: userError.retryable, attempts,
      }));
    }
    throw userError;
  }
}

/**
 * Retry for failures *above* the transport layer, e.g. the model
 * returned JSON with the wrong shape. Transport failures are already
 * retried inside callAI(), so AIServiceErrors are not retried again
 * (that used to multiply into up to 9 attempts).
 */
async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  return retryWithBackoff(fn, {
    retries,
    baseDelayMs: delay,
    maxDelayMs: delay * 4,
    shouldRetry: (err) => {
      if (err instanceof AIServiceError || err instanceof CircuitOpenError) return false;
      if ((err as any)?.name === 'AbortError') return false;
      if (err instanceof HttpError) return isTransientError(err);
      return true;
    },
  });
}

/**
 * Generate content using Gemini AI (through secure proxy)
 */
export async function generateContent(
  prompt: string,
  options?: { model?: string; jsonMode?: boolean } & CallOptions
): Promise<string> {
  const result = await callAI({
    action: 'generateContent',
    payload: {
      contents: prompt,
      model: options?.model || 'gemini-2.5-flash-lite',
      config: options?.jsonMode ? { responseMimeType: 'application/json' } : {},
    },
  }, options);
  return result.text;
}
/**
 * Generate content with image input
 */
export async function generateContentWithImage(
  imageData: string,
  mimeType: string,
  prompt: string,
  options?: CallOptions
): Promise<string> {
  const result = await callAI({
    action: 'generateContent',
    payload: {
      contents: [
        { parts: [{ inlineData: { data: imageData, mimeType } }, { text: prompt }] }
      ],
      model: 'gemini-2.5-flash-lite',
    },
  }, options);
  return result.text;
}

/**
 * Generate TTS audio
 */
export async function generateTTS(text: string, options?: CallOptions): Promise<string> {
  const result = await callAI({
    action: 'tts',
    payload: {
      contents: [{ parts: [{ text }] }],
      model: 'gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
        },
      },
    },
  }, options);
  return result.inlineData?.data || '';
}

/**
 * Multi-turn Gemini chat
 */
export async function chatWithAI(
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction?: string,
  model = 'gemini-2.5-flash',
  options?: CallOptions
): Promise<string> {
  const result = await callAI({
    action: 'chat',
    payload: {
      history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      systemInstruction,
      model,
    },
  }, options);
  return result.text;
}

/**
 * Claude Messages API (through secure proxy)
 */
export async function callClaude(options: {
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
  max_tokens?: number;
}, callOptions?: CallOptions): Promise<string> {
  const result = await callAI({ action: 'anthropic', payload: options }, callOptions);
  return result.text;
}

/**
 * Single-use token for opening a Gemini Live API session from the browser
 */
export async function getLiveToken(options?: CallOptions): Promise<string> {
  const result = await callAI({ action: 'liveToken', payload: {} }, options);
  if (!result.token) throw new Error('No live session token returned');
  return result.token;
}

export { retry };
