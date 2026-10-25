/**
 * HLA · Modul Al-Quran · Orkestrasi RAG
 * ---------------------------------------------------------------
 * Aliran: soalan → retrieval dari Supabase → Gemini (context sahaja)
 *          → guardrail → log audit → paparan.
 *
 * Kunci API Gemini TIDAK BOLEH berada di sini jika fail ini dibundle ke
 * pelayar. Jalankan `askQuranTutor` di Supabase Edge Function atau
 * route pelayan. Sisi klien hanya panggil endpoint tersebut.
 *
 * Status semasa (Fasa 3 — belum aktif): fail ini bukan sumber untuk
 * mana-mana Edge Function dalam repo ini (bandingkan dengan ai-proxy
 * yang dipanggil melalui services/aiProxyService.ts). Tiada komponen
 * klien mengimport askQuranTutor/createGeminiCaller pada masa ini.
 * Untuk aktifkan: deploy fail ini (atau logiknya) sebagai Edge Function
 * `quran-tutor`, sediakan GEMINI_API_KEY sebagai secret pelayan, dan
 * jalankan red-teaming guardrail dahulu (lihat README pelan berfasa).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildSystemPrompt,
  validateModelOutput,
  FALLBACK_MESSAGE,
  type VerifiedAyah,
  type PromptOptions,
  type Violation,
} from './guardrails';

export interface AyahRef { surah: number; from: number; to?: number }

export interface TutorRequest {
  question: string;
  /** Rujukan eksplisit jika pelajar sedang membuka ayat tertentu. */
  focus?: AyahRef;
  ageTier: PromptOptions['ageTier'];
  userId?: string;
}

export interface TutorResponse {
  answer: string;
  refs: string[];
  guardrailPass: boolean;
  violations: Violation[];
}

// ── 1. Retrieval ──────────────────────────────────────────────

export async function retrieveByRef(
  db: SupabaseClient,
  ref: AyahRef
): Promise<VerifiedAyah[]> {
  const { data, error } = await db.schema('quran').rpc('get_range', {
    p_surah: ref.surah,
    p_from: ref.from,
    p_to: ref.to ?? ref.from,
  });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function retrieveByTopic(
  db: SupabaseClient,
  query: string,
  limit = 4
): Promise<VerifiedAyah[]> {
  const { data, error } = await db.schema('quran').rpc('search_translation', {
    p_query: query,
    p_limit: limit,
  });
  if (error) throw error;
  if (!data?.length) return [];

  // Ambil teks penuh (termasuk Arab) bagi setiap hasil carian.
  const out: VerifiedAyah[] = [];
  for (const row of data) {
    const [s, a] = String(row.ref).split(':').map(Number);
    out.push(...(await retrieveByRef(db, { surah: s, from: a })));
  }
  return out;
}

function mapRow(r: Record<string, unknown>): VerifiedAyah {
  return {
    ref: String(r.ref),
    textUthmani: (r.text_uthmani as string) ?? null,
    translationMs: (r.translation_ms as string) ?? null,
    translationEn: (r.translation_en as string) ?? null,
  };
}

// ── 2. Panggilan model (sisi pelayan sahaja) ──────────────────

export interface ModelCaller {
  (systemPrompt: string, userQuestion: string): Promise<string>;
}

/** Adapter Gemini. Simpan GEMINI_API_KEY sebagai secret pelayan. */
export function createGeminiCaller(
  apiKey: string,
  model = 'gemini-2.0-flash'
): ModelCaller {
  return async (systemPrompt, userQuestion) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userQuestion }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  };
}

// ── 3. Orkestrasi penuh ───────────────────────────────────────

export async function askQuranTutor(
  db: SupabaseClient,
  callModel: ModelCaller,
  req: TutorRequest
): Promise<TutorResponse> {
  const context = req.focus
    ? await retrieveByRef(db, req.focus)
    : await retrieveByTopic(db, req.question);

  const refs = context.map((c) => c.ref);

  // Tiada rujukan disahkan → jangan panggil model sama sekali.
  if (context.length === 0) {
    const answer =
      'Saya tidak menemui ayat yang disahkan untuk soalan itu dalam simpanan kita. ' +
      'Boleh nyatakan surah dan nombor ayat, atau tanya dengan kata kunci lain?';
    await logAudit(db, req, refs, answer, true, []);
    return { answer, refs, guardrailPass: true, violations: [] };
  }

  const systemPrompt = buildSystemPrompt(context, { ageTier: req.ageTier });
  const raw = await callModel(systemPrompt, req.question);
  const check = validateModelOutput(raw, context);

  const answer = check.ok ? raw : FALLBACK_MESSAGE;
  await logAudit(db, req, refs, raw, check.ok, check.violations);

  return {
    answer,
    refs,
    guardrailPass: check.ok,
    violations: check.violations,
  };
}

async function logAudit(
  db: SupabaseClient,
  req: TutorRequest,
  refs: string[],
  answer: string,
  pass: boolean,
  violations: Violation[]
) {
  // Guna klien service_role di edge function supaya insert dibenarkan.
  const { error } = await db.schema('quran').from('ai_audit').insert({
    user_id: req.userId ?? null,
    question: req.question,
    retrieved_refs: refs,
    model: 'gemini',
    answer,
    guardrail_pass: pass,
    violations,
  });
  if (error) console.error('[quran/ai_audit] gagal log:', error.message);
}
