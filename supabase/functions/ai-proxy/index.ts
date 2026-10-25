import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ─────────────────────────────────────────────────────────────
// ai-proxy — single secure gateway for all model providers.
// API keys live ONLY in Supabase Edge secrets, never in the browser.
//
// Supported actions:
//   - generateContent / chat / tts  → Gemini (existing behaviour)
//   - anthropic                      → Claude Messages API (Haiku/Sonnet)
//   - embed                          → Gemini text-embedding-004 (768-dim)
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

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload = {} } = await req.json();

    // ─── Anthropic (Claude) ───────────────────────────────────
    if (action === 'anthropic') {
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      if (!ANTHROPIC_API_KEY) {
        return json({ error: 'ANTHROPIC_API_KEY not configured in Supabase secrets' }, 500);
      }

      // Support prompt caching: a cached system block lets repeat reads bill at the
      // 90% cache-read discount. Pass cacheSystem:true for stable system prompts.
      const system = payload.cacheSystem && payload.system
        ? [{ type: 'text', text: payload.system, cache_control: { type: 'ephemeral' } }]
        : payload.system;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: payload.model || 'claude-haiku-4-5-20251001',
          max_tokens: payload.max_tokens || 1500,
          ...(system ? { system } : {}),
          messages: payload.messages || [],
          ...(payload.temperature !== undefined ? { temperature: payload.temperature } : {}),
        }),
      });

      if (!res.ok) {
        const details = await res.text();
        console.error('Anthropic API error:', details);
        return json({ error: 'AI service error', details }, res.status);
      }

      const data = await res.json();
      const text = Array.isArray(data.content)
        ? data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
        : '';
      return json({ text, usage: data.usage ?? null, raw: data });
    }

    // ─── Embeddings (Gemini text-embedding-004, 768-dim) ──────
    if (action === 'embed') {
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
      if (!GEMINI_API_KEY) {
        return json({ error: 'GEMINI_API_KEY not configured in Supabase secrets' }, 500);
      }
      const model = payload.model || 'text-embedding-004';
      const texts: string[] = Array.isArray(payload.texts)
        ? payload.texts
        : [payload.text ?? ''];

      const res = await fetch(`${GEMINI_BASE}/${model}:batchEmbedContents?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: texts.map((t) => ({
            model: `models/${model}`,
            content: { parts: [{ text: t }] },
          })),
        }),
      });

      if (!res.ok) {
        const details = await res.text();
        console.error('Gemini embed error:', details);
        return json({ error: 'Embedding service error', details }, res.status);
      }

      const data = await res.json();
      const embeddings: number[][] = (data.embeddings || []).map((e: any) => e.values);
      // Convenience: single-input callers get `embedding`, batch callers get `embeddings`.
      return json({ embedding: embeddings[0] ?? null, embeddings });
    }

    // ─── Gemini text / chat / tts (unchanged behaviour) ───────
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return json({ error: 'GEMINI_API_KEY not configured in Supabase secrets' }, 500);
    }

    const model = payload.model || 'gemini-2.5-flash-lite';
    let geminiEndpoint: string;
    let requestBody: any;

    switch (action) {
      case 'generateContent': {
        geminiEndpoint = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
        requestBody = {
          contents: Array.isArray(payload.contents)
            ? payload.contents
            : [{ parts: [{ text: payload.contents }] }],
          generationConfig: payload.config || {},
        };
        if (payload.config?.responseMimeType) {
          requestBody.generationConfig.responseMimeType = payload.config.responseMimeType;
        }
        break;
      }
      case 'chat': {
        geminiEndpoint = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
        requestBody = {
          contents: payload.history || [],
          generationConfig: payload.config || {},
        };
        break;
      }
      case 'tts': {
        const ttsModel = payload.model || 'gemini-2.5-flash-preview-tts';
        geminiEndpoint = `${GEMINI_BASE}/${ttsModel}:generateContent?key=${GEMINI_API_KEY}`;
        requestBody = {
          contents: payload.contents,
          generationConfig: payload.config || {},
        };
        break;
      }
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      console.error('Gemini API error:', details);
      return json({ error: 'AI service error', details }, geminiResponse.status);
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData || null;
    return json({ text, inlineData, raw: data });
  } catch (error) {
    console.error('Edge function error:', error);
    return json({ error: (error as Error).message || 'Internal server error' }, 500);
  }
});
