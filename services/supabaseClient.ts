import { createClient } from '@supabase/supabase-js';
import { TimeoutError } from '../supabase/functions/_shared/resilience';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example to .env.local and fill in your Supabase project credentials.\n' +
    'Authentication and AI services will not work without these.'
  );
}

/**
 * Default timeouts for requests made by the Supabase client. Without
 * these a stalled connection leaves the UI spinning forever.
 * Realtime uses websockets and is not affected.
 */
const timeoutForUrl = (url: string): number => {
  if (url.includes('/storage/v1/')) return 120_000; // file uploads/downloads
  if (url.includes('/functions/v1/')) return 60_000; // edge functions (e.g. ai-tutor)
  return 20_000; // PostgREST queries and auth
};

/**
 * fetch with a default timeout. The timer keeps running until it fires,
 * so a server that sends headers and then stalls on the body is caught
 * too; aborting a request that already finished does nothing.
 */
const fetchWithDefaultTimeout: typeof fetch = (input, init: RequestInit = {}) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const timeoutMs = timeoutForUrl(url);
  const controller = new AbortController();
  const callerSignal = init.signal;
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort(callerSignal.reason);
    else callerSignal.addEventListener('abort', () => controller.abort(callerSignal.reason), { once: true });
  }

  return fetch(input, { ...init, signal: controller.signal }).catch((err) => {
    clearTimeout(timer);
    if (timedOut) throw new TimeoutError(`Supabase request timed out after ${timeoutMs}ms`);
    throw err;
  });
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  { global: { fetch: fetchWithDefaultTimeout } }
);

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey) && !supabaseUrl.includes('placeholder');
