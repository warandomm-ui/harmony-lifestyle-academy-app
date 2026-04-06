import React, { useState, useEffect } from 'react';
import type { DashboardMode } from '../../types';
import {
  getTodayTasks,
  getActivePlan,
  markTaskComplete,
  getMotivationalMessage,
  type StudySlot,
} from '../../services/studyPlannerAgent';

// ═══════════════════════════════════════════════════════════
// TODAY TASKS WIDGET — Small widget for main dashboard
// Shows 3-5 tasks for today + progress bar
// ═══════════════════════════════════════════════════════════

interface Props {
  dashboardMode: DashboardMode;
  onOpenPlanner: () => void;
}

const TodayTasksWidget: React.FC<Props> = ({ dashboardMode, onOpenPlanner }) => {
  const isMuslim = dashboardMode === 'muslim';
  const t = (bm: string, en: string) => (isMuslim ? bm : en);

  const [tasks, setTasks] = useState<StudySlot[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [motivMsg, setMotivMsg] = useState('');
  const [showScoreModal, setShowScoreModal] = useState<{ subject: string; chapter: string } | null>(null);
  const [scoreInput, setScoreInput] = useState(70);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const [todayTasks, activePlan] = await Promise.all([
        getTodayTasks(),
        getActivePlan(),
      ]);
      setTasks(todayTasks);
      if (activePlan) setPlanId(activePlan.id);
    } catch {
      // Silently fail — widget is supplementary
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (subject: string, chapter: string) => {
    setShowScoreModal({ subject, chapter });
    setScoreInput(70);
  };

  const confirmComplete = async () => {
    if (!showScoreModal || !planId) return;
    const { subject, chapter } = showScoreModal;
    const key = `${subject}::${chapter}`;

    try {
      await markTaskComplete(planId, subject, chapter, scoreInput);
      const next = new Set(completed);
      next.add(key);
      setCompleted(next);

      // Check if all done
      if (next.size === tasks.length && tasks.length > 0) {
        const msg = await getMotivationalMessage(isMuslim);
        setMotivMsg(msg);
      }
    } catch {
      // Ignore errors in widget
    }

    setShowScoreModal(null);
  };

  const completedCount = completed.size;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="bento-card p-4 animate-pulse">
        <div className="h-4 w-32 bg-[var(--secondary)] rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-[var(--secondary)] rounded" />
          <div className="h-3 w-3/4 bg-[var(--secondary)] rounded" />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bento-card p-4 space-y-3">
        <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <span>📚</span>
          {t('Perancang Ulangkaji', 'Study Planner')}
        </h4>
        <p className="text-xs text-[var(--muted)]">
          {t('Tiada jadual hari ini. Sila setup perancang.', 'No tasks today. Set up your planner.')}
        </p>
        <button
          onClick={onOpenPlanner}
          className="text-xs text-[var(--primary)] hover:underline font-medium"
        >
          {t('Setup Sekarang →', 'Setup Now →')}
        </button>
      </div>
    );
  }

  return (
    <div className="bento-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <span>📚</span>
          {t('Tugasan Hari Ini', "Today's Tasks")}
        </h4>
        <button
          onClick={onOpenPlanner}
          className="text-[10px] text-[var(--primary)] hover:underline"
        >
          {t('Lihat jadual →', 'View plan →')}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-[var(--muted)]">
          <span>{completedCount}/{totalCount} {t('selesai', 'completed')}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="w-full h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-1.5">
        {tasks.slice(0, 5).map((task, idx) => {
          const key = `${task.subject}::${task.chapter}`;
          const isDone = completed.has(key);

          return (
            <div key={idx} className="flex items-center gap-2">
              <button
                onClick={() => !isDone && handleComplete(task.subject, task.chapter)}
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-green-500 border-green-500'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                {isDone && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${isDone ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>
                  {task.subject}
                </span>
                <span className="text-[10px] text-[var(--muted)] ml-1 truncate">
                  — {task.chapter}
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted)]">{task.time}</span>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      {motivMsg && (
        <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-400 text-center">{motivMsg}</p>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bento-card p-5 w-80 space-y-4">
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              {t('Nilaikan Pencapaian Kamu', 'Rate Your Performance')}
            </h4>
            <p className="text-xs text-[var(--muted)]">
              {showScoreModal.subject} — {showScoreModal.chapter}
            </p>
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={100}
                value={scoreInput}
                onChange={(e) => setScoreInput(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <p className="text-center text-lg font-bold text-[var(--foreground)]">{scoreInput}%</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowScoreModal(null)}
                className="flex-1 py-2 rounded-lg text-xs bg-[var(--secondary)] text-[var(--muted)]"
              >
                {t('Batal', 'Cancel')}
              </button>
              <button
                onClick={confirmComplete}
                className="flex-1 py-2 rounded-lg text-xs bg-[var(--primary)] text-white"
              >
                {t('Simpan', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayTasksWidget;
