import React from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { MOCK_BADGES } from '../../../constants';
import { TrophyIcon } from '../Icons';
import { ProgressBar } from '../shared/ProgressBar';

const GamificationWidget: React.FC = () => {
  const { profile } = useGamification();
  const { level, points, xpInLevel, xpForNextLevel, badges: earnedBadgeIds } = profile;

  const progressPercentage = (xpInLevel / xpForNextLevel) * 100;

  const recentBadges = MOCK_BADGES
    .filter(badge => earnedBadgeIds.includes(badge.id))
    .slice(0, 3);

  return (
    <div className="bento-card h-full">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <TrophyIcon className="h-7 w-7 text-yellow-500" />
        Your Progress
      </h2>
      <div className="space-y-4">
        <div className="bg-[var(--secondary)] rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-[var(--muted)]">LEVEL</p>
            <p className="text-4xl font-extrabold text-[var(--primary)]">{level}</p>
            <p className="font-bold text-lg text-[var(--foreground)]">{points.toLocaleString()} pts</p>
        </div>

        <div>
            <ProgressBar 
                label={`Level Progress`}
                percentage={progressPercentage}
                value={`${xpInLevel} / ${xpForNextLevel} XP`}
            />
        </div>

        <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Recent Badges</h3>
            <div className="flex items-center gap-4">
                {recentBadges.length > 0 ? (
                    recentBadges.map(badge => (
                        <div key={badge.id} className="text-center group relative">
                            <div className="text-4xl bg-[var(--background)] p-2 rounded-full transition-transform group-hover:scale-110">{badge.icon}</div>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                <p className="font-bold">{badge.name}</p>
                                <p>{badge.description}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-[var(--muted)]">Start learning to earn badges!</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationWidget;
