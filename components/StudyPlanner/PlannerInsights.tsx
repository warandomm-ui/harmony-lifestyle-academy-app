import React, { useState, useEffect } from 'react';
import type { DashboardMode } from '../../types';
import { getActivePlan, getWeeklyInsights } from '../../services/studyPlannerAgent';

// ═══════════════════════════════════════════════════════════
// PLANNER INSIGHTS — Mini analytics for study planner
// Weakest subject, study streak, hours this week, AI recommendation
// ═══════════════════════════════════════════════════════════

interface Props {
  dashboardMode: DashboardMode;
}

const PlannerInsights: React.FC<Props> = ({ dashboardMode }) => {
  const isMuslim = dashboardMode === 'muslim';
  const t = (bm: string, en: string) => (isMuslim ? bm : en);

  const [insights, setInsights] = useState<{
    weakestSubject: string | null;
    studyStreak: number;
    totalMinutesThisWeek: number;
    recommendation: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const plan = await getActivePlan();
      if (plan) {
        const data = await getWeeklyInsights(plan.id);
        setInsights(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bento-card p-4 animate-pulse">
        <div className="h-4 w-24 bg-[var(--secondary)] rounded mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--secondary)] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const hours = Math.floor(insights.totalMinutesThisWeek / 60);
  const mins = insights.totalMinutesThisWeek % 60;

  return (
    <div className="bento-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
        <span>📊</span>
        {t('Analisis Ulangkaji', 'Study Insights')}
      </h4>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Weakest Subject */}
        <div className="bg-[var(--secondary)] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[var(--muted)] mb-1">
            {t('Subjek Lemah', 'Weakest')}
          </p>
          <p className="text-xs font-semibold text-red-400 truncate">
            {insights.weakestSubject || t('Tiada', 'None')}
          </p>
        </div>

        {/* Streak */}
        <div className="bg-[var(--secondary)] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[var(--muted)] mb-1">
            {t('Tugasan Selesai', 'Tasks Done')}
          </p>
          <p className="text-xs font-semibold text-[var(--primary)]">
            {insights.studyStreak}
          </p>
        </div>

        {/* Hours */}
        <div className="bg-[var(--secondary)] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[var(--muted)] mb-1">
            {t('Jam Minggu Ini', 'Hours This Week')}
          </p>
          <p className="text-xs font-semibold text-[var(--accent)]">
            {hours > 0 ? `${hours}h ` : ''}{mins}m
          </p>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg p-3">
        <p className="text-[10px] text-[var(--muted)] mb-1">
          {t('Cadangan Agent', 'Agent Suggestion')}
        </p>
        <p className="text-xs text-[var(--foreground)]">
          {insights.recommendation}
        </p>
      </div>
    </div>
  );
};

export default PlannerInsights;
