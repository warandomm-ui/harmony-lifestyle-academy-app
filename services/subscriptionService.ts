// ═══════════════════════════════════════════════
// FILE: services/subscriptionService.ts
// Frontend service — premium check, quota, checkout
// ═══════════════════════════════════════════════

import { supabase } from './supabaseClient';

export interface LessonQuota {
  remaining: number; // -1 = unlimited (premium)
  premium: boolean;
}

export interface UsageResult {
  allowed: boolean;
  remaining: number;
  premium: boolean;
}

export type PlanType = 'premium' | 'founding';

export const subscriptionService = {
  /** Check status premium user semasa */
  async isPremium(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_premium', { p_user_id: userId });
    if (error) {
      console.error('isPremium error:', error);
      return false;
    }
    return data === true;
  },

  /** Dapatkan baki lesson hari ini (untuk display UI, tak increment) */
  async getQuota(userId: string): Promise<LessonQuota> {
    const { data, error } = await supabase.rpc('get_lesson_quota', { p_user_id: userId });
    if (error) {
      console.error('getQuota error:', error);
      return { remaining: 0, premium: false };
    }
    return data as LessonQuota;
  },

  /**
   * Panggil SEBELUM generate AI lesson.
   * Increment counter + return sama ada dibenarkan.
   * Kalau allowed=false → tunjuk UpgradeModal.
   */
  async useLesson(userId: string): Promise<UsageResult> {
    const { data, error } = await supabase.rpc('use_ai_lesson', { p_user_id: userId });
    if (error) {
      console.error('useLesson error:', error);
      return { allowed: false, remaining: 0, premium: false };
    }
    return data as UsageResult;
  },

  /** Mula checkout ToyyibPay — redirect ke payment page */
  async startCheckout(opts: {
    userId: string;
    email: string;
    name?: string;
    phone?: string;
    plan?: PlanType;
  }): Promise<void> {
    const res = await fetch('/api/toyyibpay/create-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });

    const data = await res.json();

    if (!res.ok || !data.paymentUrl) {
      throw new Error(data.error || 'Gagal mula pembayaran. Cuba lagi.');
    }

    // Redirect ke ToyyibPay payment page
    window.location.href = data.paymentUrl;
  },

  /** Dapatkan subscription aktif user (untuk papar expiry date) */
  async getActiveSubscription(userId: string) {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, status, starts_at, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data; // null jika tiada
  },
};
