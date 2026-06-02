import { supabase, isSupabaseConfigured } from './supabaseClient';

// ─────────────────────────────────────────────────────────────
// Interactive tutor client. Calls the retrieval-augmented `ai-tutor`
// edge function — no API keys in the browser, ~300-token prompts.
// ─────────────────────────────────────────────────────────────

export interface TutorTurn {
  role: 'user' | 'model';
  content: string;
}

export interface AskTutorParams {
  message: string;
  module?: string;
  lessonTitle?: string;
  ageGroup?: '7-12' | '13-17' | '18+';
  personality?: 'aktif' | 'tenang' | 'curious' | 'social';
  history?: TutorTurn[];
}

export interface TutorReply {
  reply: string;
  sources: { topic: string; similarity: number }[];
}

export async function askTutor(params: AskTutorParams): Promise<TutorReply> {
  if (!isSupabaseConfigured()) {
    throw new Error('Server not configured. Please set Supabase environment variables.');
  }
  const { data, error } = await supabase.functions.invoke('ai-tutor', {
    body: { mode: 'ask', ...params },
  });
  if (error) throw error;
  return { reply: data?.reply ?? '', sources: data?.sources ?? [] };
}
