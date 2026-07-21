import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getSessionMock = vi.fn();
const isSupabaseConfiguredMock = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: { auth: { getSession: getSessionMock } },
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

// aiProxyService reads env vars at module-load time, so import after mocks are set up.
const { callAI, generateContent } = await import('./aiProxyService');

const authedSession = {
  data: { session: { access_token: 'test-token' } },
};

describe('callAI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    isSupabaseConfiguredMock.mockReturnValue(true);
    getSessionMock.mockResolvedValue(authedSession);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('throws immediately when Supabase is not configured, without calling fetch', async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);
    await expect(
      callAI({ action: 'generateContent', payload: { contents: 'hi' } })
    ).rejects.toThrow(/server not configured/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws when there is no authenticated session', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    await expect(
      callAI({ action: 'generateContent', payload: { contents: 'hi' } })
    ).rejects.toThrow(/not authenticated/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends the bearer token and payload, and returns the parsed JSON on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'hello back' }),
    });

    const result = await callAI({
      action: 'generateContent',
      payload: { contents: 'hi' },
    });

    expect(result).toEqual({ text: 'hello back' });
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer test-token');
    expect(JSON.parse(init.body)).toEqual({
      action: 'generateContent',
      payload: { contents: 'hi' },
    });
  });

  it('maps a 404 response to a friendly "edge function not found" error', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    await expect(
      callAI({ action: 'generateContent', payload: {} })
    ).rejects.toThrow(/edge function not found/i);
  });

  it('surfaces the server error message on a 5xx response', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'boom' }),
    });
    await expect(
      callAI({ action: 'generateContent', payload: {} })
    ).rejects.toThrow('boom');
  });

  it('wraps network failures in a friendly connectivity error', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      callAI({ action: 'generateContent', payload: {} })
    ).rejects.toThrow(/could not reach the server/i);
  });
});

describe('generateContent', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    isSupabaseConfiguredMock.mockReturnValue(true);
    getSessionMock.mockResolvedValue(authedSession);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('retries transient failures and eventually returns the text result', async () => {
    vi.useFakeTimers();
    const fetchMock = fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'flaky' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ text: 'recovered' }) });

    const promise = generateContent('a prompt');
    // Let the first attempt's rejection propagate, then fast-forward the retry backoff.
    await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(result).toBe('recovered');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
