// Supabase Edge Function: Claude AI Proxy
// Routes all Claude API calls through the server so API keys are never exposed to the browser.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClaudeProxyRequest {
  action: 'chat' | 'generateContent' | 'analyze' | 'studyBuddy' | 'spiritualGuidance';
  payload: {
    messages?: { role: 'user' | 'assistant'; content: string }[];
    system?: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
    prompt?: string;
    context?: Record<string, unknown>;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, payload } = (await req.json()) as ClaudeProxyRequest;

    // Build the Claude API request
    const model = payload.model || 'claude-haiku-4-5-20251001';
    const maxTokens = payload.max_tokens || 1500;
    const temperature = payload.temperature ?? 0.7;

    let messages = payload.messages || [];
    let systemPrompt = payload.system || '';

    // Action-specific system prompt enrichment
    switch (action) {
      case 'chat':
        if (!systemPrompt) {
          systemPrompt = 'You are Harmony AI, a friendly and knowledgeable wellness educator for the Harmony Lifestyle Academy. You help young adults (16-25) with personal development, study techniques, career guidance, and holistic wellness. Be encouraging, practical, and culturally sensitive.';
        }
        break;

      case 'generateContent':
        systemPrompt = payload.system || 'You are an expert wellness educator writing for young adult learners (16-25). Create engaging, evidence-based content. Return only valid JSON, no prose outside it.';
        if (payload.prompt) {
          messages = [{ role: 'user', content: payload.prompt }];
        }
        break;

      case 'analyze':
        systemPrompt = 'You are an expert personality and skills analyst for the Harmony Lifestyle Academy. Provide insightful, actionable analysis. Return only valid JSON.';
        if (payload.prompt) {
          messages = [{ role: 'user', content: payload.prompt }];
        }
        break;

      case 'studyBuddy':
        systemPrompt = 'You are a friendly AI study buddy for the Harmony Lifestyle Academy. Help students learn through quizzes, explanations, and encouragement. Keep responses concise and engaging for young learners.';
        break;

      case 'spiritualGuidance':
        systemPrompt = 'You are a knowledgeable spiritual wellness guide. Provide respectful, inclusive guidance drawing from diverse wisdom traditions. Be supportive and non-judgmental. Return only valid JSON when requested.';
        if (payload.prompt) {
          messages = [{ role: 'user', content: payload.prompt }];
        }
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages,
      }),
    });

    if (!claudeResponse.ok) {
      const errBody = await claudeResponse.text();
      console.error('[claude-proxy] Anthropic API error:', claudeResponse.status, errBody);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeResponse.status}`, details: errBody }),
        { status: claudeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const result = await claudeResponse.json();

    // Extract text from response
    const text = result.content
      ?.filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('') ?? '';

    return new Response(
      JSON.stringify({
        text,
        model: result.model,
        usage: result.usage,
        stop_reason: result.stop_reason,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[claude-proxy] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
