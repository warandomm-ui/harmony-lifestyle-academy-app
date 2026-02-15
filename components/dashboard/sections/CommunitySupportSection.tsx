import React from 'react';
import { GiftIcon } from '../Icons';
import { ProgressBar } from '../shared/ProgressBar';

interface CommunitySupportSectionProps {
  onRequestHelp: () => void;
  onDonate: () => void;
}

const CommunitySupportSection: React.FC<CommunitySupportSectionProps> = ({ onRequestHelp, onDonate }) => {
  // Mock data
  const currentFund = 5432.10;
  const monthlyGoal = 10000;
  const progress = (currentFund / monthlyGoal) * 100;

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <GiftIcon className="h-7 w-7 text-[var(--primary)]" />
        Community Support Fund
      </h2>
      <p className="text-sm text-[var(--muted)] mb-4 flex-grow">
        A fund by students, for students. Get confidential support in an emergency, or give back to help a fellow member in need.
      </p>
      
      <div className="mb-6">
        <div className="text-center mb-2">
            <p className="text-sm text-[var(--muted)]">Current Fund</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
                RM {currentFund.toFixed(2)}
            </p>
        </div>
        <ProgressBar label={`Monthly Goal: RM ${monthlyGoal}`} percentage={progress} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
        <button
          onClick={onRequestHelp}
          className="bg-orange-500/20 text-orange-700 dark:text-orange-300 font-bold py-3 px-4 rounded-full hover:bg-orange-500/30 transition transform hover:scale-105"
        >
          Request Emergency Help
        </button>
        <button
          onClick={onDonate}
          className="bg-[var(--primary)] text-white font-bold py-3 px-4 rounded-full hover:opacity-90 transition transform hover:scale-105"
        >
          Donate Now
        </button>
      </div>
    </div>
  );
};

export default CommunitySupportSection;
