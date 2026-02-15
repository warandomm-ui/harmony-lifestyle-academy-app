import React from 'react';
import { ProgressBar } from '../shared/ProgressBar';
import { useToast } from '../../../contexts/ToastContext';
import { useGamification } from '../../../contexts/GamificationContext';

const HealthSnapshotSection: React.FC = () => {
    const { addToast } = useToast();
    const { addPoints } = useGamification();
    const waterGlasses = 8;
    const drunkGlasses = 4;

    const handleMarkComplete = () => {
        addToast("Today's challenge marked complete! You ate that! 💅", 'success');
        addPoints(25, 'completing a health challenge');
        // In a real app, you'd also update the state here
    };

    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Self-Care Check-in 🧘</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Activity Card */}
                <div className="bg-[var(--secondary)] rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">💪 Today's Activity</h3>
                    <div className="space-y-4">
                        <ProgressBar label="Steps" value="4,250 / 10,000" percentage={42.5} />
                        <ProgressBar label="Workout" value="0 / 30 min" percentage={0} />
                        <div>
                            <p className="text-sm font-medium text-[var(--foreground)] mb-2">Water: {drunkGlasses}/{waterGlasses} glasses</p>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: waterGlasses }).map((_, i) => (
                                    <span key={i} className={`text-2xl transition-colors ${i < drunkGlasses ? 'text-blue-400' : 'text-[var(--border)]'}`}>💧</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Health Cards */}
                <div className="space-y-6">
                    {/* Active Challenge Card */}
                    <div className="bg-[var(--secondary)] rounded-2xl p-4">
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Active Challenges</h3>
                        <p className="text-[var(--muted)] text-sm">30-Day Push-Up Challenge - Day 12</p>
                        <p className="font-bold text-[var(--foreground)] my-2">Today's goal: 25 push-ups</p>
                        <button
                            onClick={handleMarkComplete}
                            className="w-full mt-3 bg-orange-500/20 text-orange-500 font-bold py-2 px-4 rounded-full hover:bg-orange-500/30 transition">Mark Complete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HealthSnapshotSection;