import React from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import type { StudentLearningPath, PathLevel, PathLesson } from '../../../types';

interface MyPathPageProps {
  learningPath: StudentLearningPath | null;
  onStartHere: () => void;
  onOpenLesson: (levelIndex: number, lessonIndex: number) => void;
}

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(138,138,154,0.15)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c97a)' }}
      />
    </div>
  );
};

const LessonCard: React.FC<{
  lesson: PathLesson;
  index: number;
  onClick: () => void;
}> = ({ lesson, index, onClick }) => {
  const statusStyles: Record<string, { bg: string; border: string; icon: string }> = {
    completed: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', icon: '✅' },
    'in-progress': { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.4)', icon: '📖' },
    available: { bg: 'rgba(138,138,154,0.06)', border: 'rgba(201,168,76,0.2)', icon: '▶️' },
    locked: { bg: 'rgba(138,138,154,0.04)', border: 'rgba(138,138,154,0.1)', icon: '🔒' },
  };
  const style = statusStyles[lesson.status];

  return (
    <button
      onClick={onClick}
      disabled={lesson.status === 'locked'}
      className="w-full p-4 rounded-xl text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(201,168,76,0.15)', color: '#e8c97a' }}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{style.icon}</span>
            <h4 className="font-bold text-sm text-[var(--foreground)] truncate">{lesson.title}</h4>
          </div>
          <p className="text-xs text-[var(--muted)] line-clamp-2">{lesson.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
              +{lesson.pointsReward} pts
            </span>
            {lesson.status === 'completed' && lesson.submission?.parentApproved && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                Parent ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const LevelSection: React.FC<{
  level: PathLevel;
  levelIndex: number;
  onOpenLesson: (lessonIndex: number) => void;
}> = ({ level, levelIndex, onOpenLesson }) => {
  const completedCount = level.lessons.filter(l => l.status === 'completed').length;
  const totalCount = level.lessons.length;
  const isLocked = level.status === 'locked';

  return (
    <div className={`bento-card ${isLocked ? 'opacity-60' : ''}`}>
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{
              background: level.status === 'completed'
                ? 'rgba(34,197,94,0.15)'
                : level.status === 'current'
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,201,122,0.2))'
                  : 'rgba(138,138,154,0.1)',
              color: level.status === 'completed' ? '#22c55e' : '#e8c97a',
            }}
          >
            {level.status === 'completed' ? '✅' : level.badge.icon}
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)]">
              Level {level.number}: {level.title}
            </h3>
            <p className="text-xs text-[var(--muted)]">{level.subtitle} · {level.durationWeeks}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: '#e8c97a' }}>{completedCount}/{totalCount}</p>
          <p className="text-xs text-[var(--muted)]">lessons</p>
        </div>
      </div>

      <ProgressBar value={completedCount} max={totalCount} />

      {/* Level Description */}
      <p className="text-sm text-[var(--muted)] mt-3 mb-4">{level.description}</p>

      {/* Lessons */}
      {!isLocked && (
        <div className="space-y-3">
          {level.lessons.map((lesson, i) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={i}
              onClick={() => onOpenLesson(i)}
            />
          ))}
        </div>
      )}

      {isLocked && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--muted)]">🔒 Complete Level {level.number - 1} to unlock</p>
        </div>
      )}

      {/* Badge reward */}
      {level.status === 'completed' && (
        <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="text-lg">{level.badge.icon}</span>
          <p className="text-sm font-bold text-green-400 mt-1">Badge Earned: {level.badge.name}</p>
        </div>
      )}
    </div>
  );
};

const MyPathPage: React.FC<MyPathPageProps> = ({ learningPath, onStartHere, onOpenLesson }) => {
  const { profile: gamProfile } = useGamification();

  if (!learningPath) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bento-card text-center py-16">
          <div className="text-5xl mb-4">🧭</div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">No Learning Path Yet</h2>
          <p className="text-[var(--muted)] mb-6">Complete the "Start Here" to get your personalized learning journey.</p>
          <button
            onClick={onStartHere}
            className="px-8 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
          >
            Start Here →
          </button>
        </div>
      </div>
    );
  }

  const overallCompleted = learningPath.levels.reduce(
    (sum, l) => sum + l.lessons.filter(le => le.status === 'completed').length, 0,
  );
  const overallTotal = learningPath.totalLessons;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Progress Card */}
      <div className="bento-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">My Learning Path</h2>
            <p className="text-sm text-[var(--muted)]">
              Age {learningPath.ageGroup} · {learningPath.personality} learner
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#e8c97a' }}>{gamProfile.points}</p>
              <p className="text-xs text-[var(--muted)]">Points</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#e8c97a' }}>{overallCompleted}/{overallTotal}</p>
              <p className="text-xs text-[var(--muted)]">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#e8c97a' }}>Lv {gamProfile.level}</p>
              <p className="text-xs text-[var(--muted)]">Level</p>
            </div>
          </div>
        </div>
        <ProgressBar value={overallCompleted} max={overallTotal} />
      </div>

      {/* Levels */}
      {learningPath.levels.map((level, levelIndex) => (
        <LevelSection
          key={level.id}
          level={level}
          levelIndex={levelIndex}
          onOpenLesson={(lessonIndex) => onOpenLesson(levelIndex, lessonIndex)}
        />
      ))}
    </div>
  );
};

export default MyPathPage;
