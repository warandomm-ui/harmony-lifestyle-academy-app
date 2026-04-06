import React, { useState } from 'react';
import type { DashboardMode } from '../../types';
import type { WeeklyPlan, StudySlot } from '../../services/studyPlannerAgent';

// ═══════════════════════════════════════════════════════════
// WEEKLY PLAN VIEW — Grid calendar of the AI-generated plan
// Priority badges: high=red, medium=yellow, low=green
// ═══════════════════════════════════════════════════════════

interface Props {
  plan: WeeklyPlan;
  planId: string;
  dashboardMode: DashboardMode;
  completedTasks: Set<string>;
  onMarkComplete: (subject: string, chapter: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const PRIORITY_LABELS: Record<string, Record<string, string>> = {
  muslim: { high: 'Tinggi', medium: 'Sederhana', low: 'Rendah' },
  universal: { high: 'High', medium: 'Medium', low: 'Low' },
};

const taskKey = (slot: StudySlot) => `${slot.subject}::${slot.chapter}`;

const WeeklyPlanView: React.FC<Props> = ({
  plan,
  dashboardMode,
  completedTasks,
  onMarkComplete,
}) => {
  const isMuslim = dashboardMode === 'muslim';
  const t = (bm: string, en: string) => (isMuslim ? bm : en);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!plan?.days?.length) {
    return (
      <div className="bento-card p-6 text-center text-[var(--muted)] text-sm">
        {t('Tiada jadual dijana lagi.', 'No plan generated yet.')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        {t('Jadual Mingguan', 'Weekly Schedule')}
      </h3>

      {plan.days.map((day) => {
        const isExpanded = expandedDay === day.day;
        const completedCount = day.slots.filter((s) => completedTasks.has(taskKey(s))).length;
        const totalSlots = day.slots.length;

        return (
          <div key={day.day} className="bento-card overflow-hidden">
            {/* Day Header */}
            <button
              onClick={() => setExpandedDay(isExpanded ? null : day.day)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--secondary)]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--foreground)]">{day.day}</span>
                <span className="text-xs text-[var(--muted)]">
                  {completedCount}/{totalSlots} {t('selesai', 'done')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Mini progress bar */}
                <div className="w-20 h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all"
                    style={{ width: totalSlots > 0 ? `${(completedCount / totalSlots) * 100}%` : '0%' }}
                  />
                </div>
                <svg
                  className={`w-4 h-4 text-[var(--muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Slots */}
            {isExpanded && (
              <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                {day.slots.map((slot, idx) => {
                  const key = taskKey(slot);
                  const isDone = completedTasks.has(key);
                  const priorityClass = PRIORITY_COLORS[slot.priority] || PRIORITY_COLORS.medium;
                  const priorityLabel = PRIORITY_LABELS[dashboardMode]?.[slot.priority] || slot.priority;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 px-4 transition-colors ${isDone ? 'opacity-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => !isDone && onMarkComplete(slot.subject, slot.chapter)}
                        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-green-500 border-green-500'
                            : 'border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {isDone && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Time */}
                      <span className="text-xs text-[var(--muted)] w-16 flex-shrink-0">{slot.time}</span>

                      {/* Subject & Chapter */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDone ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>
                          {slot.subject}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate">{slot.chapter}</p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs text-[var(--muted)] flex-shrink-0">
                        {slot.duration_minutes}{t('m', 'm')}
                      </span>

                      {/* Priority Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${priorityClass}`}>
                        {priorityLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyPlanView;
