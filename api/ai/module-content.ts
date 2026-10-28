// ═══════════════════════════════════════════════
// FILE: api/ai/module-content.ts
// Vercel Serverless Function — jana AI lesson (Claude) di server
// ═══════════════════════════════════════════════
// API key Anthropic MESTI kekal di server. Jangan sekali-kali guna
// VITE_ANTHROPIC_API_KEY: semua VITE_* dibundle ke dalam JS awam.
//
// ENV VARS (Vercel):
//   ANTHROPIC_API_KEY         = key dari console.anthropic.com
//   SUPABASE_URL              = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = service_role key
//
// Quota free tier dikuatkuasa DI SINI (bukan di browser) melalui
// RPC use_ai_lesson, supaya tak boleh di-bypass.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_FIELD_LEN = 200;
const MAX_CONTEXT_LEN = 1000;

const SYSTEM_PROMPT =
  'You are an expert wellness educator writing for young adult learners (16-25). Create engaging, evidence-based content. Return only valid JSON, no prose outside it.';

const safeParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { module, topic, context } = req.body || {};
    if (
      typeof module !== 'string' || typeof topic !== 'string' ||
      !module.trim() || !topic.trim() ||
      module.length > MAX_FIELD_LEN || topic.length > MAX_FIELD_LEN ||
      (context !== undefined && (typeof context !== 'string' || context.length > MAX_CONTEXT_LEN))
    ) {
      return res.status(400).json({ error: 'module/topic tidak sah' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Sahkan caller melalui JWT
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ error: 'Sila log masuk dahulu' });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'User tidak sah' });
    }

    // 2. Quota (atomic). Service role: auth.uid() null dalam RPC, jadi
    //    p_user_id yang disahkan di atas digunakan terus.
    const { data: usage, error: usageErr } = await supabase.rpc('use_ai_lesson', {
      p_user_id: userData.user.id,
    });
    if (usageErr) {
      console.error('use_ai_lesson error:', usageErr);
      return res.status(500).json({ error: 'Gagal semak quota' });
    }
    if (!usage?.allowed) {
      return res.status(429).json({
        error: 'Quota harian habis. Upgrade ke Premium untuk akses tanpa had.',
        quotaExceeded: true,
      });
    }

    // 3. Jana kandungan
    const userPrompt =
      `Generate a complete learning unit for the topic '${topic}' within '${module} Wellness'. ` +
      (context ? context + ' ' : '') +
      `Return JSON matching exactly: { "lesson": { "title": "", "explanation": "", "keyPoints": [], "practicalTip": "", "deeperInsight": "" }, "quiz": { "question": "", "options": ["", "", "", ""], "correctIndex": 0, "explanation": "" }, "reflection": { "prompt": "", "guidingQuestions": ["", "", ""] } }`;

    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let parsed: any = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      const response = await claude.messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
      try {
        const candidate = safeParseJSON(text);
        if (candidate?.lesson && candidate?.quiz && candidate?.reflection) parsed = candidate;
      } catch {
        // JSON rosak — cuba sekali lagi
      }
    }

    if (!parsed) {
      return res.status(502).json({ error: 'AI memulangkan format yang tidak sah. Cuba lagi.' });
    }

    return res.status(200).json({
      lesson: parsed.lesson,
      quiz: parsed.quiz,
      reflection: parsed.reflection,
      remaining: usage.remaining,
    });
  } catch (err) {
    console.error('module-content error:', err);
    return res.status(500).json({ error: 'Ralat server' });
  }
}
