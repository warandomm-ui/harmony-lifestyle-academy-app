import React from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { MOCK_BADGES } from '../../../constants';
import { BadgeCheckIcon } from '../Icons';

const BadgeCard: React.FC<{ name: string; description: string; icon: string; isEarned: boolean }> = ({ name, description, icon, isEarned }) => (
  <div className={`p-6 border rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${isEarned ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[var(--background)] border-[var(--border)]'}`}>
    <div className={`text-6xl transition-transform duration-300 ${isEarned ? 'transform scale-110' : 'grayscale'}`}>
      {icon}
    </div>
    <h3 className={`mt-4 font-bold text-lg ${isEarned ? 'text-yellow-700 dark:text-yellow-300' : 'text-[var(--foreground)]'}`}>{name}</h3>
    <p className={`mt-1 text-sm ${isEarned ? 'text-yellow-600 dark:text-yellow-400' : 'text-[var(--muted)]'}`}>{description}</p>
  </div>
);


const BadgesSection: React.FC = () => {
  const { profile } = useGamification();
  const earnedBadgeIds = new Set(profile.badges);

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
                <BadgeCheckIcon className="h-8 w-8 text-[var(--primary)]" />
                Your Badges
            </h1>
            <p className="text-lg text-[var(--muted)] mt-1">
                Collect all the badges by completing challenges and learning activities!
            </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {MOCK_BADGES.map(badge => (
                <BadgeCard
                    key={badge.id}
                    {...badge}
                    isEarned={earnedBadgeIds.has(badge.id)}
                />
            ))}
        </div>
      </div>
    </main>
  );
};

export default BadgesSection;
