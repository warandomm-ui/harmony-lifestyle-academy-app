/**
 * HLA · Modul Al-Quran · HafazanTracker
 * ---------------------------------------------------------------
 * Giliran semakan harian. Tiga lapisan: sabaq / sabqi / manzil.
 * Pelajar menilai sendiri, tetapi tasmik oleh guru direkod berasingan
 * (quran.sessions.verified_by) supaya skor sebenar kekal bermakna.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
  review,
  planToday,
  QUALITY_LABELS,
  type Quality,
  type Tier,
} from '../../services/quran/hafazan';

interface DueRow {
  ayahId: number;
  ref: string;
  surahName: string;
  tier: Tier;
  daysOverdue: number;
}

const TIER_LABEL: Record<Tier, string> = {
  sabaq: 'Baharu',
  sabqi: 'Semakan dekat',
  manzil: 'Semakan lama',
};

export function HafazanTracker() {
  const [due, setDue] = useState<DueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.schema('quran').rpc('due_reviews', { p_limit: 40 });
    if (!error) {
      setDue(
        (data ?? []).map((r: Record<string, unknown>) => ({
          ayahId: Number(r.ayah_id),
          ref: String(r.ref),
          surahName: String(r.surah_name),
          tier: r.tier as Tier,
          daysOverdue: Number(r.days_overdue),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const plan = planToday(due);
  const queue = [...plan.sabaq, ...plan.review];

  async function rate(row: DueRow, quality: Quality) {
    setSaving(row.ayahId);

    const { data: current } = await supabase
      .schema('quran')
      .from('progress')
      .select('ease_factor, interval_days, repetitions, lapses')
      .eq('ayah_id', row.ayahId)
      .maybeSingle();

    const next = review(
      {
        easeFactor: current?.ease_factor ?? undefined,
        intervalDays: current?.interval_days ?? undefined,
        repetitions: current?.repetitions ?? undefined,
        lapses: current?.lapses ?? undefined,
      },
      quality
    );

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) return setSaving(null);

    await supabase.schema('quran').from('progress').upsert(
      {
        user_id: userId,
        ayah_id: row.ayahId,
        status: next.status,
        tier: next.tier,
        ease_factor: next.easeFactor,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        lapses: next.lapses,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: next.nextReviewAt.toISOString(),
      },
      { onConflict: 'user_id,ayah_id' }
    );

    setDue((prev) => prev.filter((d) => d.ayahId !== row.ayahId));
    setSaving(null);
  }

  if (loading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-emerald-50" aria-busy="true" />;
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white/70 p-6 text-center">
        <p className="text-sm font-medium text-emerald-900">
          Semakan hari ini selesai.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Tambah ayat baharu dari mana-mana surah untuk teruskan.
        </p>
      </div>
    );
  }

  return (
    <section>
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Semakan hari ini</h2>
        <span className="text-xs text-slate-500">{queue.length} ayat</span>
      </header>

      <ul className="space-y-3">
        {queue.map((row) => (
          <li
            key={row.ayahId}
            className="rounded-2xl border border-emerald-100 bg-white/70 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {row.surahName} · {row.ref}
                </p>
                <p className="text-xs text-slate-500">
                  {TIER_LABEL[row.tier]}
                  {row.daysOverdue > 0 && ` · tertunggak ${row.daysOverdue} hari`}
                </p>
              </div>
            </div>

            <fieldset className="mt-3" disabled={saving === row.ayahId}>
              <legend className="mb-2 text-xs text-slate-500">
                Bagaimana bacaan tadi?
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {([0, 1, 2, 3, 4, 5] as Quality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    title={QUALITY_LABELS[q]}
                    onClick={() => void rate(row, q)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                      q < 3
                        ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    {QUALITY_LABELS[q]}
                  </button>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ul>
    </section>
  );
}
