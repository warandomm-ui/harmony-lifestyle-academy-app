import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import AIContentGenerator from '../../shared/AIContentGenerator';
import { FaceSmileIcon } from '../../Icons';
import EmotionTrackerSection from '../../sections/EmotionTrackerSection';

const emotionalTopics = [
    {
        icon: '😊', title: 'Emotional Intelligence',
        description: 'Understand and manage your own emotions, and recognize and influence the emotions of others.',
        tips: [
            'Name the emotion you\'re feeling — labelling reduces its intensity.',
            'Keep an emotion diary for one week to spot your patterns.',
            'Practice reading emotions by paying attention to tone and body language.',
        ],
    },
    {
        icon: '🧘', title: 'Stress Management',
        description: 'Learn techniques like mindfulness, meditation, and deep breathing to handle stress effectively.',
        tips: [
            'Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.',
            'Schedule a 5-minute tech-free break every 2 hours.',
            'Write down 3 things stressing you, then write one small action for each.',
        ],
    },
    {
        icon: '❤️', title: 'Coping Mechanisms',
        description: 'Develop healthy strategies to deal with difficult situations, setbacks, and intense feelings.',
        tips: [
            'Create a personal "coping menu" — a list of activities that help you reset.',
            'Replace "I can\'t handle this" with "This is hard, but I\'ve handled hard things before."',
            'Talk to someone you trust within 24 hours of feeling overwhelmed.',
        ],
    },
    {
        icon: '🧠', title: 'Building Resilience',
        description: 'Cultivate the mental toughness to bounce back from adversity and challenges.',
        tips: [
            'After a setback, write down what you learned and what you\'d do differently.',
            'Celebrate small wins — they build momentum and confidence.',
            'Build a support network of at least 3 people you can call when things are tough.',
        ],
    },
    {
        icon: '✨', title: 'Positive Psychology',
        description: 'Explore the science of happiness and well-being to foster a more optimistic outlook on life.',
        tips: [
            'Write 3 specific things you\'re grateful for every morning.',
            'Do one act of kindness each day — it boosts your mood as much as the recipient\'s.',
            'Spend time on activities that put you in "flow" — where time disappears.',
        ],
    },
];

const EmotionalPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bento-card text-center bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50">
                <FaceSmileIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Emotional Wellness</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                    Understanding and managing your feelings is key to navigating life. This dimension helps you build emotional intelligence, resilience, and effective coping strategies.
                </p>
            </div>

            {/* Integrated Emotion Tracker */}
            <EmotionTrackerSection />

            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mt-4 mb-4">Explore Emotional Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emotionalTopics.map(topic => (
                        <DimensionCard key={topic.title} {...topic} />
                    ))}
                </div>
            </section>

            <AIContentGenerator
                moduleId="emotional"
                moduleName="Emotional Wellness"
                topics={emotionalTopics.map(t => ({ icon: t.icon, title: t.title }))}
            />
        </div>
    );
};

export default EmotionalPage;
