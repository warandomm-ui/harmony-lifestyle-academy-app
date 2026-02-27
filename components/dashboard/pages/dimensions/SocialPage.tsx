import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import HabitTracker from '../../shared/HabitTracker';
import { UsersIcon } from '../../Icons';

const HABITS = [
    { id: 'convo',     icon: '👋', label: 'Started a conversation with someone new' },
    { id: 'compliment',icon: '❤️', label: 'Gave a genuine compliment today' },
    { id: 'helped',    icon: '🤝', label: 'Helped someone without being asked' },
    { id: 'reach',     icon: '📞', label: 'Reached out to a friend or family member' },
    { id: 'kind',      icon: '🌟', label: 'Did something kind for a stranger' },
];

const socialTopics = [
    {
        icon: '💬', title: 'Communication Skills',
        description: 'Master active listening, public speaking, and expressing your thoughts clearly and confidently.',
        tips: [
            'Practice active listening — repeat back what you heard to confirm understanding.',
            'Join a debate club, Toastmasters, or public speaking group.',
            'Record yourself for 1 minute and review your tone and pace.',
        ],
    },
    {
        icon: '🤝', title: 'Relationship Building',
        description: 'Learn to build and maintain healthy relationships with family, friends, and romantic partners.',
        tips: [
            'Schedule regular check-ins with close friends and family.',
            'Give specific compliments, not generic ones — "Your presentation was clear" beats "Good job."',
            'Repair one strained relationship this week with a sincere message.',
        ],
    },
    {
        icon: '🤗', title: 'Community Involvement',
        description: 'Discover the benefits of volunteering and contributing to your local community.',
        tips: [
            'Find one volunteer opportunity in your area this month.',
            'Donate items you no longer use to those in need.',
            'Attend a local community event or neighbourhood meeting.',
        ],
    },
    {
        icon: '🌐', title: 'Networking & Etiquette',
        description: 'Develop skills for making professional connections and navigating different social situations.',
        tips: [
            'Always follow up within 24 hours of meeting someone new.',
            'Perfect your handshake and 30-second self-introduction.',
            'Learn the etiquette for professional emails and LinkedIn messages.',
        ],
    },
    {
        icon: '⚖️', title: 'Conflict Resolution',
        description: 'Acquire strategies to handle disagreements constructively and find mutually agreeable solutions.',
        tips: [
            'Use "I feel..." statements instead of "You always..." to avoid defensiveness.',
            'Take a 10-minute break before responding when you\'re angry.',
            'Find the one thing you both agree on and start the conversation from there.',
        ],
    },
];

const SocialDimensionPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bento-card text-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/50 dark:to-teal-900/50">
                <UsersIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Social Wellness</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                    Connecting with others and building a strong support system is vital. This dimension explores communication, relationships, and your role within the community.
                </p>
            </div>

            <HabitTracker
                title="Today's Social Challenges"
                habits={HABITS}
                storageKey="social_habits"
                accentColor="green"
                completionLabel="Incredible! You've completed all social challenges today! 🤝"
            />

            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Explore Social Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {socialTopics.map(topic => (
                        <DimensionCard key={topic.title} {...topic} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SocialDimensionPage;
