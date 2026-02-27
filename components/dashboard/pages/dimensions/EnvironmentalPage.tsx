import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import HabitTracker from '../../shared/HabitTracker';
import { GlobeAltIcon } from '../../Icons';

const HABITS = [
    { id: 'recycle',  icon: '♻️', label: 'Recycled or sorted waste correctly' },
    { id: 'water',    icon: '💧', label: 'Saved water (shorter shower / turned off tap)' },
    { id: 'eco',      icon: '🌱', label: 'Made at least one eco-friendly choice' },
    { id: 'lights',   icon: '💡', label: 'Turned off unused lights or devices' },
    { id: 'walk',     icon: '🚶', label: 'Walked, cycled, or used public transport' },
];

const environmentalTopics = [
    {
        icon: '♻️', title: 'Sustainable Living',
        description: 'Learn practical ways to reduce, reuse, and recycle to minimize your environmental impact.',
        tips: [
            'Do a trash audit: count how much you throw away in one day.',
            'Switch to reusable bags, water bottles, and food containers.',
            'Choose products with less packaging when shopping.',
        ],
    },
    {
        icon: '🌳', title: 'Conservation Efforts',
        description: 'Discover how you can contribute to protecting our planet\'s natural resources and biodiversity.',
        tips: [
            'Turn off the tap while brushing your teeth — saves 8 litres per minute.',
            'Plant a tree, herb, or flower at home or in your garden.',
            'Learn about one endangered species in Malaysia this week.',
        ],
    },
    {
        icon: '🏞️', title: 'Appreciation of Nature',
        description: 'Find ways to connect with the natural world through activities like hiking, gardening, and more.',
        tips: [
            'Spend 30 minutes outside without your phone today.',
            'Take a photo of something beautiful in nature and share it.',
            'Start a nature journal to document what you observe each week.',
        ],
    },
    {
        icon: '🏠', title: 'Healthy Personal Space',
        description: 'Create a living environment that is organized, clean, and promotes your well-being.',
        tips: [
            'Spend 15 minutes decluttering one area of your room today.',
            'Open windows for fresh air for at least 30 minutes daily.',
            'Add a plant to your space — it improves air quality and mood.',
        ],
    },
    {
        icon: '🤝', title: 'Community Green Initiatives',
        description: 'Join or start local projects that make your community a greener, healthier place to live.',
        tips: [
            'Organise or join a local park or beach cleanup event.',
            'Propose a recycling program at your school or workplace.',
            'Share 3 eco-friendly tips with friends or family today.',
        ],
    },
];

const EnvironmentalPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bento-card text-center bg-gradient-to-br from-lime-50 to-emerald-100 dark:from-lime-900/50 dark:to-emerald-900/50">
                <GlobeAltIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Environmental Wellness</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                    Your well-being is connected to the health of your surroundings. This dimension is about fostering a positive relationship with the Earth and your personal environment.
                </p>
            </div>

            <HabitTracker
                title="Daily Eco Actions"
                habits={HABITS}
                storageKey="environmental_habits"
                accentColor="emerald"
                completionLabel="You're an eco hero today! 🌍 The planet thanks you!"
            />

            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Explore Environmental Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {environmentalTopics.map(topic => (
                        <DimensionCard key={topic.title} {...topic} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EnvironmentalPage;
