import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import HabitTracker from '../../shared/HabitTracker';
import AIContentGenerator from '../../shared/AIContentGenerator';
import { BarbellIcon } from '../../Icons';

const HABITS = [
    { id: 'water',    icon: '💧', label: 'Drink 8 glasses of water' },
    { id: 'exercise', icon: '🏃', label: '30+ minutes of movement' },
    { id: 'sleep',    icon: '😴', label: 'In bed by 11 PM' },
    { id: 'veggies',  icon: '🥦', label: 'Ate vegetables today' },
    { id: 'nojunk',   icon: '🚭', label: 'No processed or junk food' },
];

const physicalTopics = [
    {
        icon: '🍎', title: 'Nutrition & Diet',
        description: 'Learn about balanced meals, macronutrients, and healthy eating habits tailored for youth.',
        tips: [
            'Track what you eat for 3 days to spot patterns.',
            'Replace one snack with fruit or vegetables this week.',
            'Drink a glass of water before each meal.',
        ],
    },
    {
        icon: '💪', title: 'Exercise & Fitness',
        description: 'Explore various workout routines including cardio, strength training, and flexibility to stay active.',
        tips: [
            'Start with just 10 minutes of movement per day and build up.',
            'Try a new physical activity this month — dancing, swimming, or cycling.',
            'Do 20 jumping jacks right now to get started!',
        ],
    },
    {
        icon: '😴', title: 'Sleep Hygiene',
        description: 'Understand the importance of sleep and develop routines for better rest and recovery.',
        tips: [
            'Set a consistent bedtime and wake time, even on weekends.',
            'Put your phone away 30 minutes before bed.',
            'Keep your bedroom cool, dark, and quiet for deeper sleep.',
        ],
    },
    {
        icon: '🩺', title: 'Medical Health',
        description: 'Guidance on regular check-ups, understanding your body, and when to seek medical advice.',
        tips: [
            'Schedule a check-up if you haven\'t had one this year.',
            'Learn your family\'s medical history — it matters for your health.',
            'Know which 5 symptoms always need a doctor immediately.',
        ],
    },
    {
        icon: '🛡️', title: 'Personal Safety',
        description: 'Develop situational awareness and learn basic self-defense techniques for confidence and safety.',
        tips: [
            'Trust your instincts — if something feels wrong, leave.',
            'Share your location with a trusted person when going out alone.',
            'Learn basic first aid: CPR and how to treat a wound.',
        ],
    },
];

const PhysicalPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bento-card text-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50">
                <BarbellIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Physical Wellness</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                    Caring for your body is the foundation of a healthy life. This dimension focuses on nutrition, physical activity, sleep, and overall health to keep you energized and strong.
                </p>
            </div>

            <HabitTracker
                title="Daily Health Habits"
                habits={HABITS}
                storageKey="physical_habits"
                accentColor="red"
                completionLabel="Excellent! You've completed all health habits today! 💪"
            />

            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Explore Physical Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {physicalTopics.map(topic => (
                        <DimensionCard key={topic.title} {...topic} />
                    ))}
                </div>
            </section>

            <AIContentGenerator
                moduleId="physical"
                moduleName="Physical Wellness"
                topics={physicalTopics.map(t => ({ icon: t.icon, title: t.title }))}
            />
        </div>
    );
};

export default PhysicalPage;
