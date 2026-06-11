// ═══════════════════════════════════════════════
// FILE: hooks/usePremium.ts
// React hook — premium status + quota untuk components
// ═══════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { subscriptionService, LessonQuota } from '../services/subscriptionService';

export function usePremium(userId: string | undefined) {
  const [premium, setPremium] = useState(false);
  const [quota, setQuota] = useState<LessonQuota>({ remaining: 0, premium: false });
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [q, sub] = await Promise.all([
      subscriptionService.getQuota(userId),
      subscriptionService.getActiveSubscription(userId),
    ]);
    setQuota(q);
    setPremium(q.premium);
    setExpiresAt(sub?.expires_at ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * GUNA INI sebelum panggil Gemini/AI lesson generation:
   *
   * const ok = await checkAndUseLesson();
   * if (!ok) return; // UpgradeModal akan muncul automatik
   * // ...proceed generate lesson
   */
  const checkAndUseLesson = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    const result = await subscriptionService.useLesson(userId);
    if (!result.allowed) {
      setShowUpgrade(true);
      return false;
    }
    setQuota({ remaining: result.remaining, premium: result.premium });
    return true;
  }, [userId]);

  return {
    premium,
    quota,           // quota.remaining: -1 = unlimited
    expiresAt,
    loading,
    showUpgrade,
    setShowUpgrade,
    checkAndUseLesson,
    refresh,
  };
}
