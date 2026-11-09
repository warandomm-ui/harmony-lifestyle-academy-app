/**
 * Human-in-the-loop review queue for AI outputs held by the compliance agent.
 * Access is enforced by RLS in supabase/ai_compliance_schema.sql — this file
 * only calls what the database already allows for the signed-in user.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { ComplianceFinding } from '../supabase/functions/_shared/contentCompliance';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface ComplianceReviewItem {
  id: string;
  user_id: string;
  action: string;
  model: string;
  verdict: 'hold' | 'block';
  status: ReviewStatus;
  findings: ComplianceFinding[];
  held_content: string;
  released_content: string | null;
  reviewer_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface MyComplianceReview {
  id: string;
  status: ReviewStatus;
  verdict: 'hold' | 'block';
  codes: string[];
  created_at: string;
  reviewed_at: string | null;
  reviewer_note: string | null;
  released_content: string | null;
}

export async function isComplianceReviewer(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { data, error } = await supabase.rpc('is_compliance_reviewer');
  return !error && data === true;
}

export async function listReviews(status: ReviewStatus = 'pending', limit = 50): Promise<ComplianceReviewItem[]> {
  const { data, error } = await supabase
    .from('ai_compliance_reviews')
    .select('id,user_id,action,model,verdict,status,findings,held_content,released_content,reviewer_note,created_at,reviewed_at')
    .eq('status', status)
    .order('created_at', { ascending: status !== 'pending' ? false : true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ComplianceReviewItem[];
}

export async function decideReview(
  id: string,
  decision: 'approved' | 'rejected',
  opts: { note: string; releasedContent?: string },
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sila log masuk.');
  if (!opts.note.trim()) throw new Error('Catatan penyemak wajib diisi (akauntabiliti).');
  const { error } = await supabase
    .from('ai_compliance_reviews')
    .update({
      status: decision,
      reviewer_id: user.id,
      reviewer_note: opts.note.trim(),
      released_content: decision === 'approved' ? (opts.releasedContent ?? '').trim() : null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending');
  if (error) throw new Error(error.message);
}

export async function myComplianceReviews(): Promise<MyComplianceReview[]> {
  const { data, error } = await supabase.rpc('my_compliance_reviews');
  if (error) throw new Error(error.message);
  return (data ?? []) as MyComplianceReview[];
}
