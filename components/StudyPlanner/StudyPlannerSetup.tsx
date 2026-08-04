import React, { useState } from 'react';
import type { DashboardMode } from '../../types';
import {
  generateStudyPlan,
  saveStudyProfile,
  saveStudyPlan,
  type StudyProfile,
  type WeeklyPlan,
} from '../../services/studyPlannerAgent';

// ═══════════════════════════════════════════════════════════
// STUDY PLANNER SETUP — Onboarding form for study profile
// Dual-language: BM (muslim) / EN (universal)
// ═══════════════════════════════════════════════════════════

interface Props {
  dashboardMode: DashboardMode;
  onComplete: (plan: WeeklyPlan, profileId: string, planId: string) => void;
}

// KSSM subject list
const KSSM_SUBJECTS = [
  { id: 'matematik', nameBM: 'Matematik', nameEN: 'Mathematics' },
  { id: 'sains', nameBM: 'Sains', nameEN: 'Science' },
  { id: 'bm', nameBM: 'Bahasa Melayu', nameEN: 'Bahasa Melayu' },
  { id: 'english', nameBM: 'Bahasa Inggeris', nameEN: 'English' },
  { id: 'sejarah', nameBM: 'Sejarah', nameEN: 'History' },
  { id: 'geo', nameBM: 'Geografi', nameEN: 'Geography' },
  { id: 'addmath', nameBM: 'Matematik Tambahan', nameEN: 'Additional Mathematics' },
  { id: 'physics', nameBM: 'Fizik', nameEN: 'Physics' },
  { id: 'chemistry', nameBM: 'Kimia', nameEN: 'Chemistry' },
  { id: 'biology', nameBM: 'Biologi', nameEN: 'Biology' },
  { id: 'ekonomi', nameBM: 'Ekonomi', nameEN: 'Economics' },
  { id: 'pi', nameBM: 'Pendidikan Islam', nameEN: 'Islamic Education', forMode: 'muslim' as const },
  { id: 'pm', nameBM: 'Pendidikan Moral', nameEN: 'Moral Education', forMode: 'universal' as const },
];

const StudyPlannerSetup: React.FC<Props> = ({ dashboardMode, onComplete }) => {
  const isMuslim = dashboardMode === 'muslim';
  const t = (bm: string, en: string) => (isMuslim ? bm : en);

  const [tingkatan, setTingkatan] = useState(3);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<Record<string, number>>({});
  const [dailyHours, setDailyHours] = useState(2.0);
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableSubjects = KSSM_SUBJECTS.filter(
    (s) => !s.forMode || s.forMode === dashboardMode
  );

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((s) => s !== id);
        // Remove from weak subjects too
        const ws = { ...weakSubjects };
        delete ws[id];
        setWeakSubjects(ws);
        return next;
      }
      return [...prev, id];
    });
  };

  const handleWeaknessChange = (subjectId: string, value: number) => {
    setWeakSubjects((prev) => ({ ...prev, [subjectId]: value }));
  };

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0) {
      setError(t('Sila pilih sekurang-kurangnya satu subjek', 'Please select at least one subject'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const subjectNames = selectedSubjects.map((id) => {
        const s = KSSM_SUBJECTS.find((sub) => sub.id === id);
        return isMuslim ? (s?.nameBM || id) : (s?.nameEN || id);
      });

      const weakSubjectNames: Record<string, number> = {};
      for (const [id, rating] of Object.entries(weakSubjects)) {
        const s = KSSM_SUBJECTS.find((sub) => sub.id === id);
        const name = isMuslim ? (s?.nameBM || id) : (s?.nameEN || id);
        weakSubjectNames[name] = rating;
      }

      const profile: StudyProfile = {
        tingkatan,
        subjects: subjectNames,
        weak_subjects: weakSubjectNames,
        daily_hours: dailyHours,
        exam_date: examDate || null,
        dashboard_mode: dashboardMode,
      };

      // Save profile
      const profileId = await saveStudyProfile(profile);

      // Generate plan via Gemini
      const plan = await generateStudyPlan(profile);

      // Save plan
      const planId = await saveStudyPlan(profileId, plan, 1);

      onComplete(plan, profileId, planId);
    } catch (err: any) {
      setError(err.message || t('Ralat menjana jadual', 'Error generating plan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          {t('Rancang Jadual Ulangkaji', 'Study Planner Setup')}
        </h2>
        <p className="text-sm text-[var(--muted)]">
          {t(
            'AI akan menjana jadual ulangkaji mingguan berdasarkan maklumat kamu.',
            'AI will generate a weekly study schedule based on your info.'
          )}
        </p>
      </div>

      {/* Tingkatan */}
      <div className="bento-card p-5 space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t('Tingkatan', 'Form Level')}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setTingkatan(n)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tingkatan === n
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--secondary)] text-[var(--muted)] hover:bg-[var(--border)]'
              }`}
            >
              {t(`T${n}`, `Form ${n}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="bento-card p-5 space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t('Subjek Kamu', 'Your Subjects')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableSubjects.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleSubject(s.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                selectedSubjects.includes(s.id)
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--secondary)] text-[var(--muted)] hover:bg-[var(--border)]'
              }`}
            >
              {isMuslim ? s.nameBM : s.nameEN}
            </button>
          ))}
        </div>
      </div>

      {/* Weak Subjects Rating */}
      {selectedSubjects.length > 0 && (
        <div className="bento-card p-5 space-y-3">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {t('Tahap Kelemahan Subjek', 'Subject Weakness Rating')}
            <span className="block text-xs text-[var(--muted)] mt-1">
              {t('1 = Kuat, 5 = Sangat Lemah', '1 = Strong, 5 = Very Weak')}
            </span>
          </label>
          <div className="space-y-3">
            {selectedSubjects.map((id) => {
              const s = availableSubjects.find((sub) => sub.id === id);
              if (!s) return null;
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--foreground)] w-32 truncate">
                    {isMuslim ? s.nameBM : s.nameEN}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={weakSubjects[id] || 1}
                    onChange={(e) => handleWeaknessChange(id, parseInt(e.target.value))}
                    className="flex-1 accent-[var(--primary)]"
                  />
                  <span className="text-xs text-[var(--muted)] w-6 text-center">
                    {weakSubjects[id] || 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Hours */}
      <div className="bento-card p-5 space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t('Jam Belajar Sehari', 'Daily Study Hours')}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.5}
            max={6}
            step={0.5}
            value={dailyHours}
            onChange={(e) => setDailyHours(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--primary)]"
          />
          <span className="text-sm font-medium text-[var(--foreground)] w-16 text-center">
            {dailyHours} {t('jam', 'hrs')}
          </span>
        </div>
      </div>

      {/* Exam Date */}
      <div className="bento-card p-5 space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t('Tarikh Peperiksaan', 'Exam Date')}
          <span className="text-xs text-[var(--muted)] ml-2">
            {t('(pilihan)', '(optional)')}
          </span>
        </label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl font-medium text-sm transition-all bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? t('AI sedang menjana jadual...', 'AI is generating your plan...')
          : t('Jana Jadual Ulangkaji', 'Generate Study Plan')
        }
      </button>
    </div>
  );
};

export default StudyPlannerSetup;
