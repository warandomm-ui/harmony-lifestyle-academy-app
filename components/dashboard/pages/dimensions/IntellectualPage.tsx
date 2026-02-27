import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import HabitTracker from '../../shared/HabitTracker';
import { AcademicCapIcon } from '../../Icons';

const HABITS = [
    { id: 'read',      icon: '📚', label: 'Read at least 10 pages today' },
    { id: 'learn',     icon: '💡', label: 'Learned something new (video, article, podcast)' },
    { id: 'journal',   icon: '✍️', label: 'Reflected or journaled for 5+ minutes' },
    { id: 'practice',  icon: '🎯', label: 'Practised a skill for 20+ minutes' },
    { id: 'puzzle',    icon: '🧩', label: 'Solved a puzzle, quiz, or brain teaser' },
];

const intellectualTopics = [
    {
        icon: '📚', title: 'Lifelong Learning',
        description: 'Cultivate a love for learning through reading, online courses, and exploring new subjects.',
        tips: [
            'Read at least 10 pages every day — that\'s one book per month.',
            'Take a free online course on a topic that excites you this week.',
            'Keep a "What I Learned Today" journal to reinforce new knowledge.',
        ],
    },
    {
        icon: '🤔', title: 'Critical Thinking',
        description: 'Develop your ability to analyze information, solve problems, and make well-reasoned decisions.',
        tips: [
            'Always ask: "Who wrote this, why, and what do they gain from it?"',
            'Identify one assumption in a belief you hold and challenge it.',
            'Debate both sides of a topic before forming your final opinion.',
        ],
    },
    {
        icon: '💡', title: 'Creativity & Innovation',
        description: 'Engage in creative activities and learn techniques for brainstorming and generating new ideas.',
        tips: [
            'Set a 15-minute timer and brainstorm ideas without judging any of them.',
            'Try a creative hobby you\'ve never done — drawing, writing, or music.',
            'Combine two unrelated ideas and describe the product or service they could become.',
        ],
    },
    {
        icon: '🧠', title: 'Cognitive Skills',
        description: 'Enhance your memory, focus, and mental agility through brain-training exercises and techniques.',
        tips: [
            'Play a memory or strategy game for 15 minutes daily.',
            'Learn 5 new vocabulary words each week and use them in sentences.',
            'Meditate for 5 minutes to sharpen focus before studying.',
        ],
    },
    {
        icon: '🌍', title: 'Cultural Awareness',
        description: 'Expand your worldview by learning about different cultures, perspectives, and languages.',
        tips: [
            'Learn 10 words in a new language this week using Duolingo or YouTube.',
            'Cook or try a dish from a different culture this weekend.',
            'Read a book or watch a film from a country you\'ve never visited.',
        ],
    },
];

const IntellectualPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bento-card text-center bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/50 dark:to-sky-900/50">
                <AcademicCapIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Intellectual Wellness</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                    Keeping your mind sharp and curious opens up new worlds. This dimension is about expanding your knowledge, skills, and creativity throughout your life.
                </p>
            </div>

            <HabitTracker
                title="Daily Learning Habits"
                habits={HABITS}
                storageKey="intellectual_habits"
                accentColor="blue"
                completionLabel="Brilliant! Your mind is growing every day! 🧠"
            />

            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Explore Intellectual Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {intellectualTopics.map(topic => (
                        <DimensionCard key={topic.title} {...topic} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default IntellectualPage;
