import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SunnahItem } from '../../../../constants/sunnahData';
import {
  getSunnahByTimeOfDay,
  getSunnahCategories,
  getSunnahProgress,
  markSunnahComplete,
  markQuizPassed,
  getReflectionText,
  saveReflectionText,
  type TimePeriod,
  type SunnahProgress,
} from '../../../../services/sunnahService';
import { useGamification } from '../../../../contexts/GamificationContext';
import { useToast } from '../../../../contexts/ToastContext';

// ─── Constants ───────────────────────────────────────────────────────────────

const TIME_TABS: { key: TimePeriod; label: string; emoji: string; arabic: string; range: string }[] = [
  { key: 'morning',   label: 'Pagi',      emoji: '🌅', arabic: 'الصباح',  range: '#1–118'   },
  { key: 'afternoon', label: 'Tengahari', emoji: '☀️', arabic: 'الظهر',   range: '#119–236' },
  { key: 'evening',   label: 'Petang',    emoji: '🌆', arabic: 'المساء',  range: '#237–278' },
  { key: 'night',     label: 'Malam',     emoji: '🌙', arabic: 'الليل',   range: '#279–354' },
];

type TabKey = 'learn' | 'quiz' | 'reflect';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bento-card animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[var(--muted)]/20 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[var(--muted)]/20 rounded w-2/5" />
        <div className="h-3 bg-[var(--muted)]/10 rounded w-3/5" />
        <div className="h-3 bg-[var(--muted)]/10 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SunnahModulePage: React.FC = () => {
  const { addPoints } = useGamification();
  const { addToast } = useToast();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [activeTime, setActiveTime]       = useState<TimePeriod>('morning');
  const [items, setItems]                 = useState<SunnahItem[]>([]);
  const [categories, setCategories]       = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [retryKey, setRetryKey]           = useState(0);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [expandedId, setExpandedId]       = useState<number | null>(null);
  const [tabMap, setTabMap]               = useState<Record<number, TabKey>>({});
  const [quizMap, setQuizMap]             = useState<Record<number, { selected: number | null; submitted: boolean }>>({});
  const [reflections, setReflections]     = useState<Record<number, string>>({});
  const [progress, setProgress]           = useState<SunnahProgress>(getSunnahProgress());

  // ── Load data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      setExpandedId(null);
      setActiveCategory('all');
      setSearchQuery('');
      try {
        const [fetched, cats] = await Promise.all([
          getSunnahByTimeOfDay(activeTime),
          getSunnahCategories(activeTime),
        ]);
        if (!cancelled) {
          setItems(fetched);
          setCategories(cats);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Gagal memuatkan data sunnah dari Supabase.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeTime, retryKey]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== 'all') result = result.filter(i => i.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.translation.toLowerCase().includes(q) ||
        i.topic.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeCategory, searchQuery]);

  const completedInPeriod = useMemo(
    () => items.filter(i => progress.completedIds.includes(i.id)).length,
    [items, progress]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleExpand = useCallback((id: number) => {
    setExpandedId(prev => {
      if (prev === id) return null;
      // Initialise tab if not set
      setTabMap(t => ({ ...t, [id]: t[id] ?? 'learn' }));
      // Load saved reflection
      setReflections(r => {
        if (r[id] !== undefined) return r;
        const saved = getReflectionText(id);
        return { ...r, [id]: saved };
      });
      return id;
    });
  }, []);

  const handleComplete = useCallback((item: SunnahItem) => {
    const updated = markSunnahComplete(item.id);
    setProgress(updated);
    addPoints(item.xpReward, `Sunnah: ${item.title}`);
  }, [addPoints]);

  const handleQuizSelect = useCallback((itemId: number, idx: number) => {
    setQuizMap(prev => {
      if (prev[itemId]?.submitted) return prev;
      return { ...prev, [itemId]: { selected: idx, submitted: false } };
    });
  }, []);

  const handleQuizSubmit = useCallback((item: SunnahItem) => {
    const state = quizMap[item.id];
    if (!state || state.selected === null) return;
    setQuizMap(prev => ({ ...prev, [item.id]: { ...state, submitted: true } }));
    if (state.selected === item.quiz.correctIndex) {
      const updated = markQuizPassed(item.id);
      setProgress(updated);
      addPoints(20, `Kuiz Sunnah: ${item.title}`);
      addToast('Jawapan betul! +20 XP 🎉', 'success');
    } else {
      addToast('Jawapan salah. Cuba lagi!', 'error');
    }
  }, [quizMap, addPoints, addToast]);

  const handleRetryQuiz = useCallback((itemId: number) => {
    setQuizMap(prev => ({ ...prev, [itemId]: { selected: null, submitted: false } }));
  }, []);

  const handleSaveReflection = useCallback((itemId: number) => {
    saveReflectionText(itemId, reflections[itemId] ?? '');
    addToast('Renungan disimpan ✓', 'success');
  }, [reflections, addToast]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* ── Header ── */}
      <div className="bento-card text-center bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-600/20">
        <div className="text-5xl mb-3">📿</div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] font-playfair">
          Modul Sunnah Harian
        </h2>
        <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
          Pelajari 354 amalan sunnah Rasulullah ﷺ — tersusun mengikut waktu hari.
          Setiap amalan dilengkapi dalil, cara amal, kuiz, dan ruang renungan.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm flex-wrap">
          <span className="text-[var(--muted)]">
            ✅ <strong className="text-[var(--foreground)]">{progress.completedIds.length}</strong>
            {' '}/ 354 selesai
          </span>
          <span className="text-[var(--muted)]">
            🏆 <strong className="text-[var(--foreground)]">{progress.quizPassedIds.length}</strong>
            {' '}kuiz lulus
          </span>
        </div>
      </div>

      {/* ── Time Period Tabs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIME_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTime(tab.key)}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTime === tab.key
                ? 'bg-[var(--primary)] text-white shadow-lg shadow-yellow-600/20'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]'
            }`}
          >
            <span className="text-xl">{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className="text-xs opacity-60">{tab.range}</span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari sunnah mengikut tajuk, kategori, atau terjemahan…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* ── Category Pills ── */}
      {categories.length > 0 && !isLoading && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--foreground)]'
            }`}
          >
            Semua ({items.length})
          </button>
          {categories.map(cat => {
            const total = items.filter(i => i.category === cat).length;
            const done  = items.filter(i => i.category === cat && progress.completedIds.includes(i.id)).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--foreground)]'
                }`}
              >
                {cat}
                {done > 0 && (
                  <span className="ml-1 opacity-70">({done}/{total})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Progress summary ── */}
      {!isLoading && !error && items.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            Menunjukkan <strong className="text-[var(--foreground)]">{filtered.length}</strong> sunnah
          </span>
          <span>
            <strong className="text-[var(--foreground)]">{completedInPeriod}</strong>
            {' '}/ {items.length} selesai dalam waktu ini
          </span>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Error state ── */}
      {!isLoading && error && (
        <div className="bento-card border border-red-500/30 bg-red-500/10 text-center py-10">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-red-400 font-semibold">{error}</p>
          <p className="text-[var(--muted)] text-sm mt-2">
            Pastikan jadual{' '}
            <code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">sunnah_items</code>
            {' '}telah dibuat dan diisi di Supabase.
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">
            Jalankan fail{' '}
            <code className="text-blue-400">supabase/sunnah_schema.sql</code>{' '}
            dalam SQL Editor Supabase.
          </p>
          <button
            onClick={() => setRetryKey(k => k + 1)}
            className="mt-4 px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90"
          >
            Cuba Semula
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="bento-card text-center py-14">
          <p className="text-4xl mb-3">📭</p>
          {items.length === 0 ? (
            <>
              <p className="text-[var(--foreground)] font-semibold">Tiada data sunnah lagi</p>
              <p className="text-[var(--muted)] text-sm mt-1">
                Masukkan data ke jadual{' '}
                <code className="text-yellow-400">sunnah_items</code>{' '}
                di Supabase untuk mula.
              </p>
            </>
          ) : (
            <p className="text-[var(--muted)]">
              Tiada sunnah dijumpai. Cuba ubah carian atau pilih kategori lain.
            </p>
          )}
        </div>
      )}

      {/* ── Sunnah Cards ── */}
      <div className="space-y-3">
        {filtered.map(item => {
          const isExpanded   = expandedId === item.id;
          const isCompleted  = progress.completedIds.includes(item.id);
          const isQuizPassed = progress.quizPassedIds.includes(item.id);
          const tab          = tabMap[item.id] ?? 'learn';
          const quiz         = quizMap[item.id];
          const reflectText  = reflections[item.id] ?? '';

          return (
            <div
              key={item.id}
              className={`bento-card transition-all duration-200 ${
                isCompleted
                  ? 'border border-green-500/30 bg-green-500/5'
                  : 'border border-[var(--border)]'
              }`}
            >
              {/* ── Card header (always visible) ── */}
              <button
                className="w-full flex items-start gap-3 text-left"
                onClick={() => toggleExpand(item.id)}
                aria-expanded={isExpanded}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {isCompleted ? '✅' : item.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[var(--muted)] font-mono">#{item.id}</span>
                    <span className="font-semibold text-[var(--foreground)]">{item.title}</span>
                    {isQuizPassed && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                        Kuiz ✓
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm text-[var(--muted)] mt-0.5 truncate leading-relaxed"
                    dir="rtl"
                    lang="ar"
                  >
                    {item.arabic.length > 70 ? item.arabic.substring(0, 70) + '…' : item.arabic}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-[var(--muted)]">{item.category}</span>
                    <span className="text-xs font-medium text-yellow-500">+{item.xpReward} XP</span>
                  </div>
                </div>
                <span
                  className={`text-[var(--muted)] flex-shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* ── Expanded content ── */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">

                  {/* Tab navigation */}
                  <div className="flex gap-1 mb-5">
                    {(['learn', 'quiz', 'reflect'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTabMap(prev => ({ ...prev, [item.id]: t }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          tab === t
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)]'
                        }`}
                      >
                        {t === 'learn'   ? '📖 Belajar'   :
                         t === 'quiz'    ? '🧠 Kuiz'      :
                                           '✍️ Renungan'}
                      </button>
                    ))}
                  </div>

                  {/* ──────────────── LEARN TAB ──────────────── */}
                  {tab === 'learn' && (
                    <div className="space-y-4">

                      {/* Arabic + transliteration block */}
                      <div className="text-center p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                        <p
                          className="text-xl leading-loose text-[var(--foreground)] mb-3"
                          dir="rtl"
                          lang="ar"
                        >
                          {item.arabic}
                        </p>
                        <p className="text-sm text-yellow-400/90 italic">{item.transliteration}</p>
                      </div>

                      {/* Malay translation */}
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-xs font-semibold text-green-400 mb-1">🌿 Terjemahan</p>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed">{item.translation}</p>
                      </div>

                      {/* Source + narrator */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] text-xs">
                          <p className="font-semibold text-[var(--foreground)] mb-1">📚 Sumber</p>
                          <p className="text-[var(--muted)]">{item.source}</p>
                        </div>
                        <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] text-xs">
                          <p className="font-semibold text-[var(--foreground)] mb-1">👤 Perawi</p>
                          <p className="text-[var(--muted)]">{item.narrator}</p>
                        </div>
                      </div>

                      {/* Benefit */}
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-xs font-semibold text-amber-400 mb-1">💛 Manfaat</p>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed">{item.benefit}</p>
                      </div>

                      {/* How-to */}
                      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                        <p className="text-xs font-semibold text-[var(--foreground)] mb-2">📋 Cara Amal</p>
                        <p className="text-sm text-[var(--muted)] whitespace-pre-line leading-relaxed">
                          {item.howTo}
                        </p>
                      </div>

                      {/* Complete button */}
                      {isCompleted ? (
                        <div className="w-full py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-sm text-center font-semibold">
                          ✅ Telah diamalkan hari ini
                        </div>
                      ) : (
                        <button
                          onClick={() => handleComplete(item)}
                          className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
                        >
                          ✅ Tandai Selesai (+{item.xpReward} XP)
                        </button>
                      )}
                    </div>
                  )}

                  {/* ──────────────── QUIZ TAB ──────────────── */}
                  {tab === 'quiz' && (
                    <div className="space-y-4">
                      <p className="font-semibold text-[var(--foreground)] text-sm leading-relaxed">
                        {item.quiz.question}
                      </p>
                      <div className="space-y-2">
                        {item.quiz.options.map((opt, idx) => {
                          let cls = 'border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/60';
                          if (quiz?.submitted) {
                            if (idx === item.quiz.correctIndex)
                              cls = 'border-green-500 bg-green-500/20 text-green-300';
                            else if (idx === quiz.selected)
                              cls = 'border-red-500 bg-red-500/20 text-red-300';
                            else
                              cls = 'border-[var(--border)] text-[var(--muted)] opacity-50';
                          } else if (quiz?.selected === idx) {
                            cls = 'border-yellow-500 bg-yellow-500/10 text-[var(--foreground)]';
                          }
                          return (
                            <button
                              key={idx}
                              disabled={quiz?.submitted}
                              onClick={() => handleQuizSelect(item.id, idx)}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all bg-[var(--card)] ${cls} disabled:cursor-default`}
                            >
                              <span className="font-mono mr-2 text-[var(--muted)]">
                                {['A', 'B', 'C', 'D'][idx]}.
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {!quiz?.submitted && (
                        <button
                          disabled={quiz?.selected === null || quiz?.selected === undefined}
                          onClick={() => handleQuizSubmit(item)}
                          className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm disabled:opacity-40 transition-opacity"
                        >
                          Hantar Jawapan
                        </button>
                      )}

                      {quiz?.submitted && (
                        <div
                          className={`p-4 rounded-xl text-sm ${
                            quiz.selected === item.quiz.correctIndex
                              ? 'bg-green-500/10 border border-green-500/30'
                              : 'bg-red-500/10 border border-red-500/30'
                          }`}
                        >
                          <p className={`font-semibold mb-2 ${
                            quiz.selected === item.quiz.correctIndex
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}>
                            {quiz.selected === item.quiz.correctIndex ? '✅ Betul!' : '❌ Salah'}
                          </p>
                          <p className="text-[var(--muted)] leading-relaxed">
                            {item.quiz.explanation}
                          </p>
                          {quiz.selected !== item.quiz.correctIndex && (
                            <button
                              onClick={() => handleRetryQuiz(item.id)}
                              className="mt-3 text-xs text-yellow-400 underline hover:no-underline"
                            >
                              Cuba sekali lagi ↩
                            </button>
                          )}
                        </div>
                      )}

                      {isQuizPassed && (
                        <p className="text-xs text-center text-green-400 opacity-75">
                          🏆 Kuiz ini telah dilulus — +20 XP diberikan
                        </p>
                      )}
                    </div>
                  )}

                  {/* ──────────────── REFLECT TAB ──────────────── */}
                  {tab === 'reflect' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <p className="text-xs font-semibold text-purple-400 mb-1">💭 Soalan Renungan</p>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed">{item.reflection}</p>
                      </div>
                      <textarea
                        value={reflectText}
                        onChange={e =>
                          setReflections(prev => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Tulis jawapan dan renungan kamu di sini…"
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] text-sm resize-none focus:outline-none focus:border-[var(--primary)] transition-colors leading-relaxed"
                      />
                      <button
                        onClick={() => handleSaveReflection(item.id)}
                        className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        💾 Simpan Renungan
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom tip ── */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center text-xs text-[var(--muted)] py-4">
          <p>
            💡 Data dimuatkan dari Supabase secara langsung — tiada had saiz fail.
            Tambah kesemua 354 sunnah melalui SQL Editor atau Supabase Table Editor.
          </p>
        </div>
      )}
    </div>
  );
};

export default SunnahModulePage;
