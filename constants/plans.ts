// ═══════════════════════════════════════════════
// FILE: constants/plans.ts
// Single source of truth untuk plan & free-tier limits
// (dipakai oleh frontend UI dan api/toyyibpay/* functions)
// NOTE: free-tier limit juga wujud dalam supabase/payment_stage1.sql
// (v_limit) — kalau tukar di sini, tukar juga dalam SQL.
// ═══════════════════════════════════════════════

export type PlanType = 'premium' | 'founding';

export interface PlanInfo {
  /** dalam sen (2500 = RM25) */
  amount: number;
  /** nama bill di ToyyibPay */
  name: string;
  /** label harga untuk UI */
  priceLabel: string;
  /** tempoh akses dalam hari */
  durationDays: number;
}

export const PLANS: Record<PlanType, PlanInfo> = {
  premium: {
    amount: 2500,
    name: 'HLA Premium — 30 Hari',
    priceLabel: 'RM25',
    durationDays: 30,
  },
  founding: {
    amount: 1500,
    name: 'HLA Founding Member — 30 Hari',
    priceLabel: 'RM15',
    durationDays: 30,
  },
};

/** Free tier: bilangan AI lesson percuma sehari (selari dengan v_limit dalam SQL) */
export const FREE_LESSONS_PER_DAY = 3;
