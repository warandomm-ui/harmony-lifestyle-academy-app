import React from 'react';
import { ProgressBar } from '../shared/ProgressBar';
import { useToast } from '../../../contexts/ToastContext';

const ProjectsSection: React.FC = () => {
    const { addToast } = useToast();

    const handleJoinChallenge = () => {
        addToast('You have joined the "Build a Weather App" challenge!', 'info');
        // In a real app, you'd also update the state here
    };

    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Your Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Projects Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ProjectCard
                        icon="🎮"
                        title="Platformer Game"
                        startDate="Started 3 days ago"
                        progress={25}
                    />
                    <ProjectCard
                        icon="📱"
                        title="Expense Tracker"
                        startDate="Started 1 week ago"
                        progress={60}
                    />
                </div>
                {/* Project Challenges Card */}
                <div className="bg-[var(--secondary)] rounded-2xl p-6 flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">🏆 Project Challenges</h3>
                    <p className="flex-grow text-[var(--muted)] my-2">Join: Build a Weather App in 7 Days</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Prize: Certificate + Featured on homepage</p>
                    <p className="font-bold text-orange-500 my-3">Deadline: 5 days left</p>
                    <button
                        onClick={handleJoinChallenge}
                        className="w-full mt-auto bg-orange-500/20 text-orange-800 dark:text-orange-300 font-bold py-2 px-4 rounded-full hover:bg-orange-500/30 transition">Join Challenge</button>
                </div>
            </div>
        </div>
    );
};

const ProjectCard = ({ icon, title, startDate, progress }: { icon: string, title: string, startDate: string, progress: number }) => (
    <div className="bg-[var(--secondary)] rounded-2xl p-6 flex flex-col">
        <div className="flex items-start justify-between">
            <div>
                <div className="text-3xl mb-2">{icon}</div>
                <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
                <p className="text-sm text-[var(--muted)]">{startDate}</p>
            </div>
            <div className="text-sm font-semibold text-[var(--muted-foreground)]">{progress}%</div>
        </div>
        <div className="my-4">
           <ProgressBar label="Progress" percentage={progress} value={`${progress}%`} />
        </div>
        <button className="w-full mt-auto bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-2 px-4 rounded-full hover:opacity-90 transition">Continue Building</button>
    </div>
);

export default ProjectsSection;