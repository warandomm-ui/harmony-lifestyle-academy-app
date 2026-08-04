import { supabase, isSupabaseConfigured } from './supabaseClient';

// ─────────────────────────────────────────────────────────────
// Parent notification — the "Parent Win" of onboarding. Sends a WhatsApp
// summary so the buyer (parent) sees value on Day 1, the strongest lever
// against the 30-day churn cliff.
// ─────────────────────────────────────────────────────────────

export interface ParentNotifyParams {
  phone: string;        // parent WhatsApp number, e.g. +60123456789
  studentName: string;
  strongest: string;
  weakest: string;
}

/** Compose the Malay WhatsApp message shown to parents. */
export function buildParentMessage(p: Omit<ParentNotifyParams, 'phone'>): string {
  return (
    `${p.studentName} baru sahaja menyelesaikan ujian diagnostik pertamanya. ` +
    `Dia mahir dalam ${p.strongest} tetapi perlukan bantuan dalam ${p.weakest}. ` +
    `HLA telah melaraskan laluan pembelajarannya secara automatik.`
  );
}

export interface ParentNotifyResult {
  ok: boolean;
  simulated?: boolean;
}

export async function notifyParent(params: ParentNotifyParams): Promise<ParentNotifyResult> {
  if (!isSupabaseConfigured()) return { ok: false };
  const message = buildParentMessage(params);
  const { data, error } = await supabase.functions.invoke('whatsapp-notify', {
    body: { phone: params.phone, message },
  });
  if (error) throw error;
  return { ok: Boolean(data?.ok), simulated: data?.simulated };
}
