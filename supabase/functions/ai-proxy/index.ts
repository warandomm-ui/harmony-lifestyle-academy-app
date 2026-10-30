import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

// ─────────────────────────────────────────────────────────────
// ai-proxy — single secure gateway for all model providers.
// API keys live ONLY in Supabase Edge secrets, never in the browser.
//
// Supported actions:
//   - generateContent / chat / tts  → Gemini
//   - anthropic                      → Claude Messages API
//   - liveToken                      → short-lived Gemini Live API token
//
// Required secrets: GEMINI_API_KEY, ANTHROPIC_API_KEY
// (SUPABASE_URL and SUPABASE_ANON_KEY are injected by Supabase.)
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const GEMINI_ROOT = 'https://generativelanguage.googleapis.com';
const GEMINI_BASE = `${GEMINI_ROOT}/v1beta/models`;
const MAX_ANTHROPIC_TOKENS = 4000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Only signed-in users may spend the AI quota.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing authorization header' }, 401);
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { action, payload = {} } = await req.json();

    // ─── Anthropic (Claude) ───────────────────────────────────
    if (action === 'anthropic') {
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      if (!ANTHROPIC_API_KEY) {
        return json({ error: 'ANTHROPIC_API_KEY not configured in Supabase secrets' }, 500);
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
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
      });

      if (!res.ok) {
        console.error('Anthropic API error:', await res.text());
        return json({ error: 'AI service error' }, res.status);
      }

      const data = await res.json();
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
      const res = await fetch(`${GEMINI_ROOT}/v1alpha/auth_tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({
          uses: 1,
          expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
          newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        }),
      });

      if (!res.ok) {
        console.error('Gemini token error:', await res.text());
        return json({ error: 'Could not create live session token' }, res.status);
      }

      const data = await res.json();
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

    const geminiResponse = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      return json({ error: 'AI service error' }, geminiResponse.status);
    }

    const data = await geminiResponse.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p: any) => p.text || '').join('');
    const inlineData = parts.find((p: any) => p.inlineData)?.inlineData || null;
    return json({ text, inlineData });
  } catch (error) {
    console.error('Edge function error:', error);
    return json({ error: (error as Error).message || 'Internal server error' }, 500);
  }
});
