import React, { useState, useEffect } from 'react';
import { fetchSurahCourses, fetchSingleAyat } from '../../services/quranApiService';
import type { QuranAyat, QuranSurahDetail } from '../../services/quranApiService';
import { useGamification } from '../../contexts/GamificationContext';
import { useToast } from '../../contexts/ToastContext';

interface AyatCourseViewerProps {
  surahNumber: number;
  initialAyat?: number;
  onBack: () => void;
}

const AyatCourseViewer: React.FC<AyatCourseViewerProps> = ({ surahNumber, initialAyat = 1, onBack }) => {
  const [surahDetail, setSurahDetail] = useState<QuranSurahDetail | null>(null);
  const [currentAyat, setCurrentAyat] = useState(initialAyat);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addPoints } = useGamification();
  const { addToast } = useToast();

  useEffect(() => {
    const loadSurah = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSurahCourses(surahNumber);
        setSurahDetail(data);
      } catch (err) {
        setError('Gagal memuatkan data. Sila cuba lagi.');
      }
      setIsLoading(false);
    };
    loadSurah();
  }, [surahNumber]);

  useEffect(() => {
    const key = `ayat_completed_${surahNumber}_${currentAyat}`;
    setIsCompleted(localStorage.getItem(key) === 'true');
  }, [surahNumber, currentAyat]);

  const ayat = surahDetail?.ayat.find(a => a.number === currentAyat);
  const totalAyat = surahDetail?.totalAyat || 0;
  const progress = totalAyat > 0 ? (currentAyat / totalAyat) * 100 : 0;

  const handleComplete = () => {
    if (isCompleted) return;
    const key = `ayat_completed_${surahNumber}_${currentAyat}`;
    localStorage.setItem(key, 'true');
    setIsCompleted(true);
    addPoints(10, `completing Ayat ${currentAyat} of Surah ${surahDetail?.surahNameEnglish}`);
    addToast(`Alhamdulillah! Ayat ${currentAyat} selesai. +10 XP`, 'success');
  };

  const goNext = () => {
    if (currentAyat < totalAyat) {
      setCurrentAyat(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentAyat > 1) {
      setCurrentAyat(prev => prev - 1);
    }
  };

  // Count completed ayat for this surah
  const getCompletedCount = (): number => {
    let count = 0;
    for (let i = 1; i <= totalAyat; i++) {
      if (localStorage.getItem(`ayat_completed_${surahNumber}_${i}`) === 'true') {
        count++;
      }
    }
    return count;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="text-5xl mb-4">📖</div>
        <p className="text-[var(--muted)] font-bold">Memuatkan Surah...</p>
      </div>
    );
  }

  if (error || !surahDetail || !ayat) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-bold mb-4">{error || 'Ayat tidak dijumpai.'}</p>
        <button onClick={onBack} className="text-[var(--primary)] font-bold hover:underline">
          ← Kembali
        </button>
      </div>
    );
  }

  const completedCount = getCompletedCount();

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] font-bold transition-colors"
        >
          <span className="text-xl">←</span> Kembali
        </button>
        <div className="text-right">
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
            {surahDetail.revelationType === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {completedCount}/{totalAyat} selesai
          </p>
        </div>
      </div>

      {/* Surah Title */}
      <div className="text-center mb-8">
        <p className="text-4xl font-bold mb-1" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
          {surahDetail.surahNameArabic}
        </p>
        <h2 className="text-2xl font-black text-[var(--foreground)]">
          {surahDetail.surahNameEnglish}
        </h2>
        <p className="text-[var(--muted)] text-sm">
          {surahDetail.surahNameMalay} · {totalAyat} ayat
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-[var(--muted)] mb-1">
          <span>Ayat {currentAyat} / {totalAyat}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[var(--secondary)] rounded-full h-2">
          <div
            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Ayat Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 mb-6 shadow-sm">
        {/* Course ID Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Course {ayat.courseId}
          </span>
          {isCompleted && (
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              ✅ Selesai
            </span>
          )}
        </div>

        {/* Arabic Text */}
        <div className="text-center mb-8 p-6 bg-[var(--secondary)]/50 rounded-xl">
          <p
            className="text-3xl md:text-4xl leading-loose text-[var(--foreground)]"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif", lineHeight: '2.2' }}
          >
            {ayat.textArabic}
          </p>
          <p className="text-xs text-[var(--muted)] mt-3 font-bold">
            Surah {surahDetail.surahNameEnglish}, Ayat {ayat.number}
          </p>
        </div>

        {/* Malay Translation */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-[var(--muted)] uppercase tracking-widest mb-3">
            🇲🇾 Terjemahan Bahasa Melayu
          </h3>
          <p className="text-lg text-[var(--foreground)] leading-relaxed">
            {ayat.textMalay}
          </p>
        </div>

        {/* Reflection Prompt */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <h4 className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest mb-2">
            💭 Renungan
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Apa pengajaran utama dari ayat ini yang boleh kamu amalkan hari ini?
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={goPrev}
          disabled={currentAyat <= 1}
          className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Ayat {currentAyat - 1 > 0 ? currentAyat - 1 : ''}
        </button>

        {!isCompleted ? (
          <button
            onClick={handleComplete}
            className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
          >
            ✅ Tandakan Selesai
          </button>
        ) : (
          <button
            disabled
            className="flex-1 py-3 px-4 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-bold cursor-default"
          >
            ✅ Sudah Selesai
          </button>
        )}

        <button
          onClick={goNext}
          disabled={currentAyat >= totalAyat}
          className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Ayat {currentAyat + 1 <= totalAyat ? currentAyat + 1 : ''} →
        </button>
      </div>

      {/* Ayat Quick Jump */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <h4 className="text-xs font-black text-[var(--muted)] uppercase tracking-widest mb-3">
          Lompat ke Ayat
        </h4>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {Array.from({ length: totalAyat }, (_, i) => i + 1).map(num => {
            const done = localStorage.getItem(`ayat_completed_${surahNumber}_${num}`) === 'true';
            const isCurrent = num === currentAyat;
            return (
              <button
                key={num}
                onClick={() => setCurrentAyat(num)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-[var(--primary)] text-white scale-110 shadow-md'
                    : done
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-[var(--secondary)] text-[var(--muted)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AyatCourseViewer;
