// ─────────────────────────────────────────────────────────────
// Network resilience primitives shared by the browser app and the
// Supabase edge functions. Plain TypeScript only (fetch,
// AbortController, setTimeout), so it runs in both Vite and Deno.
//
//   Deadline         – one time budget for a whole logical operation,
//                      carried across retries and across the network hop
//   fetchWithTimeout – fetch that is aborted when its time is up
//   requestJson      – fetch + status check + JSON body, all inside the timeout
//   CircuitBreaker   – stops calling a dependency that keeps failing
//   retryWithBackoff – bounded retries, full jitter, deadline-aware
// ─────────────────────────────────────────────────────────────

// ─── Errors ──────────────────────────────────────────────────

export class TimeoutError extends Error {
  readonly name = 'TimeoutError';
  constructor(message = 'Request timed out') {
    super(message);
  }
}

export class CircuitOpenError extends Error {
  readonly name = 'CircuitOpenError';
  constructor(readonly breaker: string, readonly retryAfterMs: number) {
    super(`${breaker} is temporarily unavailable. Please try again shortly.`);
  }
}

export class HttpError extends Error {
  readonly name = 'HttpError';
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterMs?: number,
  ) {
    super(message);
  }
}

/** Transient failures worth retrying (and worth counting against a breaker). */
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export const isNetworkError = (err: unknown): boolean =>
  err instanceof TypeError; // fetch rejects with TypeError on DNS / connection failure

export function isTransientError(err: unknown): boolean {
  if (err instanceof TimeoutError || isNetworkError(err)) return true;
  if (err instanceof HttpError) return RETRYABLE_STATUS.has(err.status);
  return false;
}

/** Parse a Retry-After header (seconds or HTTP date) into milliseconds. */
export function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

// ─── Deadline ────────────────────────────────────────────────

/**
 * An absolute point in time by which an operation must finish.
 * Pass it down instead of a fresh timeout per call, so retries and
 * downstream hops share one budget and never outlive the caller.
 * Across the network it travels as *remaining milliseconds* (not a
 * timestamp), so client/server clock skew does not matter.
 */
export class Deadline {
  private constructor(private readonly at: number) {}

  static after(ms: number): Deadline {
    return new Deadline(Date.now() + Math.max(0, ms));
  }

  /** Build from a remaining-ms value sent by a caller, clamped to [minMs, maxMs]. */
  static fromRemaining(value: unknown, fallbackMs: number, minMs: number, maxMs: number): Deadline {
    const n = typeof value === 'number' && Number.isFinite(value) ? value : fallbackMs;
    return Deadline.after(Math.min(maxMs, Math.max(minMs, n)));
  }

  remaining(): number {
    return Math.max(0, this.at - Date.now());
  }

  get expired(): boolean {
    return this.remaining() <= 0;
  }

  /** Timeout for one attempt: the per-attempt cap or what is left, whichever is smaller. */
  timeoutFor(perAttemptMaxMs: number, reserveMs = 0): number {
    return Math.max(0, Math.min(perAttemptMaxMs, this.remaining() - reserveMs));
  }
}

// ─── Timeouts ────────────────────────────────────────────────

export interface TimeoutOptions {
  timeoutMs: number;
  /** Caller's own cancellation signal (e.g. component unmount). */
  signal?: AbortSignal | null;
}

/** Abort when either the timer fires or the caller's signal aborts. */
function linkedController(opts: TimeoutOptions) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs);

  const onCallerAbort = () => controller.abort(opts.signal?.reason);
  if (opts.signal) {
    if (opts.signal.aborted) onCallerAbort();
    else opts.signal.addEventListener('abort', onCallerAbort, { once: true });
  }

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    dispose: () => {
      clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onCallerAbort);
    },
  };
}

/**
 * fetch() bounded by a timeout. Resolves once the headers arrive;
 * use requestJson() when the body must also be read within the budget.
 */
export async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit,
  opts: TimeoutOptions,
): Promise<Response> {
  if (opts.timeoutMs <= 0) throw new TimeoutError('No time left in the request deadline');
  const link = linkedController({ ...opts, signal: opts.signal ?? init.signal });
  try {
    return await fetch(input, { ...init, signal: link.signal });
  } catch (err) {
    if (link.timedOut()) throw new TimeoutError(`Request timed out after ${opts.timeoutMs}ms`);
    throw err;
  } finally {
    link.dispose();
  }
}

export interface RequestJsonOptions extends TimeoutOptions {
  /** Turn a non-2xx response into an error message (body already parsed if JSON). */
  errorMessage?: (status: number, body: any) => string;
}

/**
 * fetch + status check + JSON parse, all inside one timeout, so a
 * server that sends headers and then stalls on the body is also caught.
 * Non-2xx responses throw HttpError (with Retry-After when present).
 */
export async function requestJson<T = any>(
  input: string | URL,
  init: RequestInit,
  opts: RequestJsonOptions,
): Promise<T> {
  if (opts.timeoutMs <= 0) throw new TimeoutError('No time left in the request deadline');
  const link = linkedController({ ...opts, signal: opts.signal ?? init.signal });
  try {
    const res = await fetch(input, { ...init, signal: link.signal });
    if (!res.ok) {
      // Error bodies are best-effort; a timeout while reading one still counts as a timeout.
      const body = await res.json().catch(() => null);
      if (link.timedOut()) throw new TimeoutError(`Request timed out after ${opts.timeoutMs}ms`);
      const message = opts.errorMessage?.(res.status, body) ?? `HTTP ${res.status}`;
      throw new HttpError(message, res.status, parseRetryAfter(res.headers.get('retry-after')));
    }
    return (await res.json()) as T; // aborts mid-body surface via the catch below
  } catch (err) {
    if (link.timedOut()) throw new TimeoutError(`Request timed out after ${opts.timeoutMs}ms`);
    throw err;
  } finally {
    link.dispose();
  }
}

// ─── Circuit breaker ─────────────────────────────────────────

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Consecutive failures that open the circuit. */
  failureThreshold?: number;
  /** How long to stay open before letting one probe through. */
  resetTimeoutMs?: number;
  /** Which errors count as dependency failures. Defaults to transient errors only. */
  isFailure?: (err: unknown) => boolean;
}

/**
 * closed    → calls flow; consecutive transient failures are counted.
 * open      → calls fail fast with CircuitOpenError until resetTimeoutMs passes.
 * half-open → exactly one probe call is allowed; success closes, failure re-opens.
 *
 * Client errors (400, 401, …) do not trip the breaker: the dependency
 * is healthy, the request was wrong.
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private openedAt = 0;
  private probeInFlight = false;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly isFailure: (err: unknown) => boolean;

  constructor(readonly name: string, opts: CircuitBreakerOptions = {}) {
    this.failureThreshold = opts.failureThreshold ?? 5;
    this.resetTimeoutMs = opts.resetTimeoutMs ?? 30_000;
    this.isFailure = opts.isFailure ?? isTransientError;
  }

  get currentState(): CircuitState {
    if (this.state === 'open' && Date.now() - this.openedAt >= this.resetTimeoutMs) {
      return 'half-open';
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.currentState;
    if (state === 'open' || (state === 'half-open' && this.probeInFlight)) {
      const retryAfterMs = Math.max(0, this.resetTimeoutMs - (Date.now() - this.openedAt));
      throw new CircuitOpenError(this.name, retryAfterMs);
    }

    const isProbe = state === 'half-open';
    if (isProbe) this.probeInFlight = true;
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      if (this.isFailure(err)) this.onFailure(isProbe);
      else if (isProbe) this.onSuccess(); // dependency answered; the request itself was bad
      throw err;
    } finally {
      if (isProbe) this.probeInFlight = false;
    }
  }

  private onSuccess() {
    this.state = 'closed';
    this.failures = 0;
  }

  private onFailure(wasProbe: boolean) {
    this.failures += 1;
    if (wasProbe || this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }
}

// ─── Retry ───────────────────────────────────────────────────

export interface RetryOptions {
  /** Retries after the first attempt. */
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Shared budget: no retry starts if it could not finish in time. */
  deadline?: Deadline;
  /** Minimum time an attempt needs to be worth starting. */
  minAttemptMs?: number;
  shouldRetry?: (err: unknown, attempt: number) => boolean;
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Retries with exponential backoff and full jitter
 * (delay = random(0, min(max, base·2^attempt))), so many clients
 * recovering together do not stampede the dependency. A server
 * Retry-After takes precedence. Stops early when the deadline
 * cannot fit another attempt.
 */
export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    retries = 2,
    baseDelayMs = 500,
    maxDelayMs = 8_000,
    deadline,
    minAttemptMs = 1_000,
    shouldRetry = isTransientError,
  } = opts;

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries || !shouldRetry(err, attempt)) throw err;

      const backoff = Math.random() * Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const hinted = err instanceof HttpError ? err.retryAfterMs : undefined;
      const delay = hinted !== undefined ? Math.min(hinted, maxDelayMs) : backoff;

      if (deadline && deadline.remaining() < delay + minAttemptMs) throw err;
      await sleep(delay);
    }
  }
}
