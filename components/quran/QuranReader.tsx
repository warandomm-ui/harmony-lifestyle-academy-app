/**
 * HLA · Modul Al-Quran · QuranReader
 * ---------------------------------------------------------------
 * Memaparkan ayat DARIPADA pangkalan data sahaja. Komponen ini tidak
 * pernah menerima teks Arab daripada output AI.
 *
 * Tiga keadaan paparan, dikawal oleh quran.compliance.display_mode:
 *   locked         — belum ada Perakuan KDN: tunjuk kurikulum + pautan app berperakuan
 *   reference_only — nama surah, terjemahan berlesen, audio berlesen
 *   full           — mushaf penuh
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export type DisplayMode = 'locked' | 'reference_only' | 'full';

export interface Ayah {
  ref: string;
  surahName: string;
  ayahNumber: number;
  textUthmani: string | null;
  translationMs: string | null;
  audioUrl: string | null;
}

interface Props {
  surah: number;
  from?: number;
  to?: number;
  /** Dipanggil bila pelajar tekan "Tanya" pada satu ayat. */
  onAskTutor?: (ref: string) => void;
  onMarkForHafazan?: (ref: string) => void;
}

export function QuranReader({
  surah,
  from = 1,
  to,
  onAskTutor,
  onMarkForHafazan,
}: Props) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [mode, setMode] = useState<DisplayMode>('locked');
  const [deeplink, setDeeplink] = useState<string>('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState('loading');
      const quranDb = supabase.schema('quran');
      const [{ data: cfg }, { data: rows, error }] = await Promise.all([
        quranDb.from('compliance').select('display_mode, certified_app_deeplink').single(),
        quranDb.rpc('get_range', { p_surah: surah, p_from: from, p_to: to ?? 300 }),
      ]);

      if (cancelled) return;
      if (error) return setState('error');

      setMode((cfg?.display_mode as DisplayMode) ?? 'locked');
      setDeeplink(cfg?.certified_app_deeplink ?? '');
      setAyahs(
        (rows ?? []).map((r: Record<string, unknown>) => ({
          ref: String(r.ref),
          surahName: String(r.surah_name),
          ayahNumber: Number(r.ayah_number),
          textUthmani: (r.text_uthmani as string) ?? null,
          translationMs: (r.translation_ms as string) ?? null,
          audioUrl: (r.audio_url as string) ?? null,
        }))
      );
      setState('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [surah, from, to]);

  const surahName = useMemo(() => ayahs[0]?.surahName ?? '', [ayahs]);

  if (state === 'loading') {
    return (
      <div className="animate-pulse space-y-4 py-8" aria-busy="true">
        <div className="h-4 w-32 rounded bg-emerald-100" />
        <div className="h-24 rounded-xl bg-emerald-50" />
        <div className="h-24 rounded-xl bg-emerald-50" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Teks tidak dapat dimuatkan sekarang. Muat semula halaman untuk cuba lagi.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-6 border-b border-emerald-100 pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700/70">
          Dimensi Ruh · Tilawah
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">
          Surah {surahName}
        </h2>
      </header>

      {mode === 'locked' && <LockedNotice deeplink={deeplink} />}

      <ol className="space-y-5">
        {ayahs.map((a) => (
          <li
            key={a.ref}
            className="rounded-2xl border border-emerald-100 bg-white/70 p-5 transition hover:border-emerald-200"
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className="mt-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-emerald-50 px-2 text-xs font-semibold text-emerald-800"
                aria-label={`Ayat ${a.ayahNumber}`}
              >
                {a.ayahNumber}
              </span>

              <div className="flex-1">
                {mode === 'full' && a.textUthmani && (
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mb-4 font-quran text-[1.75rem] leading-[2.6] text-slate-900"
                  >
                    {a.textUthmani}
                  </p>
                )}

                {a.translationMs ? (
                  <p className="text-[0.95rem] leading-relaxed text-slate-600">
                    {a.translationMs}
                  </p>
                ) : (
                  mode !== 'full' && (
                    <p className="text-sm italic text-slate-400">
                      Terjemahan belum tersedia untuk ayat ini.
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {a.audioUrl && (
                <button
                  type="button"
                  onClick={() => setPlaying(playing === a.ref ? null : a.ref)}
                  className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  {playing === a.ref ? 'Hentikan bacaan' : 'Dengar bacaan'}
                </button>
              )}
              {onMarkForHafazan && (
                <button
                  type="button"
                  onClick={() => onMarkForHafazan(a.ref)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  Tambah ke hafazan
                </button>
              )}
              {onAskTutor && (
                <button
                  type="button"
                  onClick={() => onAskTutor(a.ref)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  Tanya tentang ayat ini
                </button>
              )}
            </div>

            {playing === a.ref && a.audioUrl && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio
                className="mt-3 w-full"
                src={a.audioUrl}
                autoPlay
                controls
                onEnded={() => setPlaying(null)}
              />
            )}
          </li>
        ))}
      </ol>

      <p className="mt-8 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        Bacaan perlu ditasmik kepada guru atau ibu bapa. Pembantu AI di sini
        membantu memahami maksud sahaja — ia bukan pengganti talaqqi dan tidak
        mengeluarkan hukum.
      </p>
    </section>
  );
}

function LockedNotice({ deeplink }: { deeplink: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <h3 className="text-sm font-semibold text-emerald-900">
        Mushaf penuh belum dibuka di sini
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-emerald-800/90">
        Paparan teks Al-Quran secara digital di Malaysia memerlukan Perakuan
        Betul Pruf Akhir daripada KDN. Sementara itu, gunakan modul kurikulum
        dan penjejak hafazan di sini, dan buka mushaf melalui aplikasi yang
        telah diperakukan.
      </p>
      {deeplink && (
        <a
          href={deeplink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-full bg-emerald-700 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Buka aplikasi berperakuan
        </a>
      )}
    </div>
  );
}
