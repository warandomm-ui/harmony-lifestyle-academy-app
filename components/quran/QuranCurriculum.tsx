/**
 * HLA · Modul Al-Quran · QuranCurriculum
 * ---------------------------------------------------------------
 * Pelayar kurikulum bertingkat (quran.tracks + quran.modules). Ini
 * berfungsi walaupun gate pematuhan masih 'locked' dan teks ayah belum
 * diimport — modul hanya merujuk quran.surahs (metadata) dan
 * ayah_from/ayah_to sebagai nombor, bukan teks.
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface Track {
  key: string;
  ageFrom: number;
  ageTo: number;
  title: string;
  objective: string;
  sortOrder: number;
}

interface Module {
  key: string;
  trackKey: string;
  title: string;
  focus: 'iqra' | 'tajwid' | 'hafazan' | 'tadabbur' | 'tafsir';
  surahId: number | null;
  ayahFrom: number | null;
  ayahTo: number | null;
  outcome: string;
  estSessions: number;
  requiresTasmik: boolean;
  sortOrder: number;
}

const FOCUS_LABEL: Record<Module['focus'], string> = {
  iqra: 'Iqra',
  tajwid: 'Tajwid',
  hafazan: 'Hafazan',
  tadabbur: 'Tadabbur',
  tafsir: 'Tafsir',
};

interface Props {
  /** Buka QuranReader pada surah/ayah tertentu bila modul diklik. */
  onOpenModule?: (module: { surahId: number; ayahFrom: number; ayahTo: number }) => void;
}

export function QuranCurriculum({ onOpenModule }: Props) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState('loading');
      const quranDb = supabase.schema('quran');
      const [{ data: trackRows, error: trackErr }, { data: moduleRows, error: moduleErr }] =
        await Promise.all([
          quranDb.from('tracks').select('*').order('sort_order', { ascending: true }),
          quranDb.from('modules').select('*').order('sort_order', { ascending: true }),
        ]);

      if (cancelled) return;
      if (trackErr || moduleErr) return setState('error');

      setTracks(
        (trackRows ?? []).map((r: Record<string, unknown>) => ({
          key: String(r.key),
          ageFrom: Number(r.age_from),
          ageTo: Number(r.age_to),
          title: String(r.title),
          objective: String(r.objective),
          sortOrder: Number(r.sort_order),
        }))
      );
      setModules(
        (moduleRows ?? []).map((r: Record<string, unknown>) => ({
          key: String(r.key),
          trackKey: String(r.track_key),
          title: String(r.title),
          focus: r.focus as Module['focus'],
          surahId: r.surah_id === null ? null : Number(r.surah_id),
          ayahFrom: r.ayah_from === null ? null : Number(r.ayah_from),
          ayahTo: r.ayah_to === null ? null : Number(r.ayah_to),
          outcome: String(r.outcome),
          estSessions: Number(r.est_sessions),
          requiresTasmik: Boolean(r.requires_tasmik),
          sortOrder: Number(r.sort_order),
        }))
      );
      setExpanded((prev) => prev ?? (trackRows?.[0]?.key as string) ?? null);
      setState('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true">
        <div className="h-16 rounded-2xl bg-indigo-50" />
        <div className="h-16 rounded-2xl bg-indigo-50" />
      </div>
    );
  }

  if (state === 'error' || tracks.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Kurikulum belum tersedia. Pastikan migrasi 001–005 telah dijalankan di Supabase.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tracks.map((track) => {
        const trackModules = modules.filter((m) => m.trackKey === track.key);
        const isOpen = expanded === track.key;
        return (
          <div
            key={track.key}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : track.key)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[var(--secondary)]/40 transition-colors"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                  Umur {track.ageFrom}–{track.ageTo}
                </p>
                <h3 className="font-black text-lg text-[var(--foreground)]">{track.title}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{track.objective}</p>
              </div>
              <span className="text-xl text-[var(--muted)] flex-shrink-0">{isOpen ? '−' : '+'}</span>
            </button>

            {isOpen && (
              <ul className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                {trackModules.map((m) => (
                  <li
                    key={m.key}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-[var(--secondary)]/30"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                          {FOCUS_LABEL[m.focus]}
                        </span>
                        {m.requiresTasmik && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            perlu tasmik
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-[var(--foreground)]">{m.title}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">{m.outcome}</p>
                      <p className="text-[10px] text-[var(--muted)] mt-1">
                        Anggaran {m.estSessions} sesi
                      </p>
                    </div>
                    {m.surahId && m.ayahFrom && m.ayahTo && onOpenModule && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenModule({ surahId: m.surahId!, ayahFrom: m.ayahFrom!, ayahTo: m.ayahTo! })
                        }
                        className="flex-shrink-0 rounded-full border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        Buka
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
