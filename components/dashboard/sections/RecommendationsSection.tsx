import React from 'react';
import type { AnalysisResult } from '../../../types';

interface RecommendationsSectionProps {
    userResults: AnalysisResult;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ userResults }) => {
    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Personalized Recommendations</h2>
            <div className="space-y-6">
                {/* Personality-based Recommendations */}
                <div>
                    <h3 className="text-lg font-semibold text-[var(--muted)] mb-3">
                        Based on your <span className="font-bold text-[var(--primary)]">{userResults.personalityType}</span> personality:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <RecommendationCard
                            icon="📚"
                            title="Advanced Python: Building Real Apps"
                            description="Take your building skills to the next level."
                            actionText="View Course"
                        />
                        <RecommendationCard
                            icon="🎮"
                            title="Game Development with Unity"
                            description="A perfect blend of creativity and technical challenge."
                            actionText="Explore Path"
                        />
                         <RecommendationCard
                            icon="🤝"
                            title="Connect with Amir"
                            description="Senior Developer at Grab. Great for career advice."
                            actionText="Request Call"
                        />
                    </div>
                </div>

                {/* Activity-based Recommendations */}
                <div>
                    <h3 className="text-lg font-semibold text-[var(--muted)] mb-3">
                        Based on your recent activity:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <RecommendationCard
                            icon="📐"
                            title="Matematik Tambahan for Form 4"
                            description="You're doing great in Matematik, try a new challenge!"
                            actionText="View Subject"
                        />
                        <RecommendationCard
                            icon="💪"
                            title="30-Day Fitness Challenge"
                            description="Let's get moving! You haven't logged a workout in 3 days."
                            actionText="Join Challenge"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RecommendationCardProps {
    icon: string;
    title: string;
    description: string;
    actionText: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ icon, title, description, actionText }) => (
    <div className="bg-[var(--secondary)] rounded-2xl p-4 flex items-start gap-4 hover:border-[var(--primary)]/50 border border-transparent transition-colors">
        <div className="text-3xl mt-1">{icon}</div>
        <div className="flex-1">
            <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
            <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
        </div>
        <button className="self-end text-sm font-bold text-[var(--primary)] hover:underline whitespace-nowrap">
            {actionText}
        </button>
    </div>
);


export default RecommendationsSection;