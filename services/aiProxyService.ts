import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Secure AI Proxy Service
 * Routes all AI calls through Supabase Edge Function
 * API keys stay on the server - never exposed to browser
 */

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;

interface AIProxyRequest {
  action: 'generateContent' | 'chat' | 'tts';
  payload: {
    contents?: any;
    model?: string;
    config?: Record<string, any>;
    history?: any[];
  };
}

interface AIProxyResponse {
  text: string;
  inlineData?: { data: string; mimeType: string } | null;
  raw?: any;
  error?: string;
}
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error('User not authenticated. Please sign in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
}

export async function callAI(request: AIProxyRequest): Promise<AIProxyResponse> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Server not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  const headers = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
  } catch (networkError: any) {
    if (networkError?.name === 'TypeError' || networkError?.message?.includes('fetch')) {
      throw new Error(
        'Could not reach the server. Please check your internet connection and verify the server URL is correct.'
      );
    }
    throw networkError;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 404) {
      throw new Error(
        'AI proxy edge function not found. Please deploy the ai-proxy edge function to your Supabase project.'
      );
    }
    if (response.status >= 500) {
      throw new Error(
        errorData.error || 'The AI server encountered an error. Please try again in a moment.'
      );
    }
    throw new Error(errorData.error || `AI service error: ${response.status}`);
  }

  return response.json();
}
// Retry helper with exponential backoff
async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries) throw err;
      const waitTime = err?.message?.includes('429') ? delay * (i + 2) : delay;
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  throw new Error('Retry failed');
}

/**
 * Generate content using Gemini AI (through secure proxy)
 */
export async function generateContent(
  prompt: string,
  options?: { model?: string; jsonMode?: boolean }
): Promise<string> {
  const result = await retry(() => callAI({
    action: 'generateContent',
    payload: {
      contents: prompt,
      model: options?.model || 'gemini-2.5-flash-lite',
      config: options?.jsonMode ? { responseMimeType: 'application/json' } : {},
    },
  }));
  return result.text;
}
/**
 * Generate content with image input
 */
export async function generateContentWithImage(
  imageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const result = await retry(() => callAI({
    action: 'generateContent',
    payload: {
      contents: [
        { parts: [{ inlineData: { data: imageData, mimeType } }, { text: prompt }] }
      ],
      model: 'gemini-2.5-flash-lite',
    },
  }));
  return result.text;
}

/**
 * Generate TTS audio
 */
export async function generateTTS(text: string): Promise<string> {
  const result = await retry(() => callAI({
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
  }));
  return result.inlineData?.data || '';
}

export { retry };