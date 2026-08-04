/**
 * HLA · Modul Al-Quran · Enjin Hafazan
 * ---------------------------------------------------------------
 * SM-2 (spaced repetition) dipetakan ke lapisan hafazan tradisi:
 *   sabaq  — pelajaran baharu (selang 0–3 hari)
 *   sabqi  — semakan terkini  (selang 4–14 hari)
 *   manzil — semakan lama     (selang > 14 hari)
 *
 * Tiada kebergantungan luar: boleh diuji secara unit.
 */

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export const QUALITY_LABELS: Record<Quality, string> = {
  0: 'Lupa sepenuhnya',
  1: 'Ingat sedikit, banyak silap',
  2: 'Tersekat beberapa kali',
  3: 'Boleh, tapi perlu bantuan sekali',
  4: 'Lancar, silap kecil',
  5: 'Lancar sepenuhnya',
};

export type Status = 'new' | 'learning' | 'memorised' | 'mastered' | 'lapsed';
export type Tier = 'sabaq' | 'sabqi' | 'manzil';

export interface ProgressState {
  status: Status;
  tier: Tier;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  nextReviewAt: Date;
}

export const INITIAL_STATE: Omit<ProgressState, 'nextReviewAt'> = {
  status: 'new',
  tier: 'sabaq',
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

const MIN_EASE = 1.3;
const MAX_INTERVAL = 180; // hadkan supaya hafazan lama tetap disemak dua kali setahun

/** Kira keadaan seterusnya selepas satu sesi semakan. */
export function review(
  prev: Partial<ProgressState> = {},
  quality: Quality,
  now: Date = new Date()
): ProgressState {
  let ease = prev.easeFactor ?? INITIAL_STATE.easeFactor;
  let interval = prev.intervalDays ?? INITIAL_STATE.intervalDays;
  let reps = prev.repetitions ?? INITIAL_STATE.repetitions;
  let lapses = prev.lapses ?? INITIAL_STATE.lapses;

  if (quality < 3) {
    // Gagal: mula semula, tetapi kekalkan ease supaya tidak dihukum berlebihan.
    reps = 0;
    interval = 1;
    lapses += 1;
    ease = Math.max(MIN_EASE, ease - 0.2);
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ease);

    // Pelarasan ease standard SM-2
    ease = Math.max(
      MIN_EASE,
      ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  }

  interval = Math.min(Math.max(interval, 1), MAX_INTERVAL);

  const next = new Date(now);
  next.setDate(next.getDate() + interval);
  next.setHours(5, 30, 0, 0); // sauh selepas Subuh — waktu hafazan terbaik

  return {
    status: deriveStatus(reps, interval, lapses, quality),
    tier: deriveTier(interval),
    easeFactor: Number(ease.toFixed(2)),
    intervalDays: interval,
    repetitions: reps,
    lapses,
    nextReviewAt: next,
  };
}

export function deriveTier(intervalDays: number): Tier {
  if (intervalDays <= 3) return 'sabaq';
  if (intervalDays <= 14) return 'sabqi';
  return 'manzil';
}

function deriveStatus(
  reps: number,
  interval: number,
  lapses: number,
  quality: Quality
): Status {
  if (quality < 3) return lapses > 0 && reps === 0 ? 'lapsed' : 'learning';
  if (interval >= 60 && reps >= 5) return 'mastered';
  if (reps >= 3) return 'memorised';
  return 'learning';
}

// ── Ringkasan untuk paparan ───────────────────────────────────

export interface HafazanSummary {
  totalTracked: number;
  memorised: number;
  mastered: number;
  dueToday: number;
  streakDays: number;
  /** Peratus khatam bagi sasaran semasa (cth Juz 30 = 564 ayat). */
  targetPercent: number;
}

export function summarise(
  rows: Array<Pick<ProgressState, 'status' | 'nextReviewAt'>>,
  targetAyahCount: number,
  streakDays: number,
  now: Date = new Date()
): HafazanSummary {
  const done = rows.filter(
    (r) => r.status === 'memorised' || r.status === 'mastered'
  ).length;

  return {
    totalTracked: rows.length,
    memorised: rows.filter((r) => r.status === 'memorised').length,
    mastered: rows.filter((r) => r.status === 'mastered').length,
    dueToday: rows.filter((r) => r.nextReviewAt <= now).length,
    streakDays,
    targetPercent:
      targetAyahCount > 0
        ? Math.round((done / targetAyahCount) * 100)
        : 0,
  };
}

/**
 * Beban harian yang wajar — elak pelajar dibebani.
 * Kekalkan sabaq kecil; utamakan semakan yang tertunggak.
 */
export function planToday<T extends { ayahId: number; tier: Tier; daysOverdue: number }>(
  due: T[],
  opts: { maxNewAyahs?: number; maxReviewAyahs?: number } = {}
) {
  const maxNew = opts.maxNewAyahs ?? 3;
  const maxReview = opts.maxReviewAyahs ?? 15;

  const sorted = [...due].sort((a, b) => b.daysOverdue - a.daysOverdue);
  return {
    sabaq: sorted.filter((d) => d.tier === 'sabaq').slice(0, maxNew),
    review: sorted.filter((d) => d.tier !== 'sabaq').slice(0, maxReview),
  };
}
