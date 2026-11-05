// ─────────────────────────────────────────────────────────────
// Error contract shared by the ai-proxy edge function and the browser.
// One catalogue decides, for every failure the proxy can report:
//   status     – the HTTP status (gateway semantics, see below)
//   retryable  – whether trying again can help; the client's retry and
//                circuit-breaker logic read this, so a misconfigured key
//                is not retried three times
//   message    – what the user is told (no internals, no secrets)
//
// Status rules:
//   4xx  the request itself is wrong; the user or app must change it
//   500  our own bug or missing configuration
//   502  the AI provider failed or answered with something unusable
//   503  temporarily unavailable (our breaker, provider overload, auth service)
//   504  the provider did not answer inside the caller's deadline
//
// Error body (backward compatible: `error` stays a string):
//   { error: string, code: ErrorCode, retryable: boolean, requestId: string }
// ─────────────────────────────────────────────────────────────

export interface ErrorSpec {
  status: number;
  retryable: boolean;
  message: string;
}

export const ERRORS = {
  // ── request problems (4xx) ──
  BAD_REQUEST: { status: 400, retryable: false, message: 'The request was not valid.' },
  UNKNOWN_ACTION: { status: 400, retryable: false, message: 'Unknown AI action requested.' },
  UNAUTHENTICATED: { status: 401, retryable: false, message: 'Your session has expired. Please sign in again.' },
  METHOD_NOT_ALLOWED: { status: 405, retryable: false, message: 'Method not allowed.' },
  UPSTREAM_INVALID_REQUEST: {
    status: 422, retryable: false,
    message: 'The AI provider could not process this request. Try shorter text or a different file.',
  },
  CONTENT_BLOCKED: {
    status: 422, retryable: false,
    message: 'The AI declined to answer this request for safety reasons. Please rephrase it.',
  },
  RATE_LIMITED: { status: 429, retryable: true, message: 'Too many AI requests right now. Please wait a moment and try again.' },

  // ── our side (500) ──
  INTERNAL: { status: 500, retryable: false, message: 'Something went wrong on our side. Please try again later.' },
  CONFIG_MISSING: { status: 500, retryable: false, message: 'The AI service is not set up yet. Please contact the administrator.' },

  // ── provider side (502) ──
  UPSTREAM_ERROR: { status: 502, retryable: true, message: 'The AI provider had an error. Please try again.' },
  UPSTREAM_BAD_RESPONSE: { status: 502, retryable: true, message: 'The AI provider sent an unreadable answer. Please try again.' },
  UPSTREAM_EMPTY_RESPONSE: { status: 502, retryable: true, message: 'The AI provider returned an empty answer. Please try again.' },
  UPSTREAM_UNREACHABLE: { status: 502, retryable: true, message: 'Could not reach the AI provider. Please try again.' },
  UPSTREAM_REJECTED: {
    // Provider refused *our* credentials or endpoint (401/403/404): an
    // operator must fix it, so retrying only wastes the user's time.
    status: 502, retryable: false,
    message: 'The AI service is misconfigured. The administrator has been notified in the logs.',
  },

  // ── temporarily unavailable (503) ──
  UPSTREAM_OVERLOADED: { status: 503, retryable: true, message: 'The AI provider is overloaded. Please try again shortly.' },
  CIRCUIT_OPEN: { status: 503, retryable: true, message: 'The AI service is temporarily unavailable. Please try again shortly.' },
  AUTH_UNAVAILABLE: { status: 503, retryable: true, message: 'Could not verify your session. Please try again.' },

  // ── deadline (504) ──
  UPSTREAM_TIMEOUT: { status: 504, retryable: true, message: 'The AI service took too long to respond. Please try again.' },
} as const satisfies Record<string, ErrorSpec>;

export type ErrorCode = keyof typeof ERRORS;

export interface ErrorBody {
  error: string;
  code: ErrorCode;
  retryable: boolean;
  requestId: string;
}

export const isErrorCode = (value: unknown): value is ErrorCode =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(ERRORS, value);

export function errorBody(code: ErrorCode, requestId: string): ErrorBody {
  const spec = ERRORS[code];
  return { error: spec.message, code, retryable: spec.retryable, requestId };
}

/**
 * Gateway mapping for a provider's non-2xx status. The provider's status
 * is never forwarded as-is: a provider 401 means *our* key is wrong, not
 * the user's session, and must not reach the browser as a 401.
 */
export function codeForUpstreamStatus(status: number): ErrorCode {
  if (status === 429) return 'RATE_LIMITED';
  if (status === 503 || status === 529) return 'UPSTREAM_OVERLOADED'; // 529 = Anthropic "overloaded"
  if (status === 408 || status === 504) return 'UPSTREAM_TIMEOUT';
  if (status === 401 || status === 403 || status === 404) return 'UPSTREAM_REJECTED';
  if (status === 400 || status === 413 || status === 422) return 'UPSTREAM_INVALID_REQUEST';
  if (status >= 500) return 'UPSTREAM_ERROR';
  return 'UPSTREAM_REJECTED'; // any other 4xx: something about our call is wrong
}
