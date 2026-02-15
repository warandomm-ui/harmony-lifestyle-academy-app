import React from 'react';
import { MOCK_LEADERBOARD } from '../../../constants';
import { TrophyIcon } from '../Icons';

const LeaderboardSection: React.FC = () => {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[var(--background)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center gap-3">
                <TrophyIcon className="h-10 w-10" />
                Leaderboard
            </h1>
            <p className="text-lg text-[var(--muted)] mt-2">
                See who's at the top of their game this week!
            </p>
        </header>

        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
            <ul className="divide-y divide-[var(--border)]">
                {MOCK_LEADERBOARD.map(entry => (
                    <li key={entry.rank} className={`flex items-center p-4 transition-colors ${entry.isCurrentUser ? 'bg-[var(--primary)]/10' : 'hover:bg-[var(--secondary)]/50'}`}>
                        <div className="flex items-center gap-4 w-1/2">
                            <span className="font-bold text-lg w-8 text-center text-[var(--muted)]">{entry.rank}</span>
                            <span className="text-4xl">{entry.avatar}</span>
                            <span className={`font-bold ${entry.isCurrentUser ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{entry.userName}</span>
                        </div>
                        <div className="w-1/2 text-right">
                            <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                {entry.points.toLocaleString()} pts
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </main>
  );
};

export default LeaderboardSection;
