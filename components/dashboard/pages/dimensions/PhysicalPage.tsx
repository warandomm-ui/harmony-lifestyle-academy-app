import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import { BarbellIcon } from '../../Icons';

const physicalTopics = [
  { icon: '🍎', title: 'Nutrition & Diet', description: 'Learn about balanced meals, macronutrients, and healthy eating habits tailored for youth.' },
  { icon: '💪', title: 'Exercise & Fitness', description: 'Explore various workout routines including cardio, strength training, and flexibility to stay active.' },
  { icon: '😴', title: 'Sleep Hygiene', description: 'Understand the importance of sleep and develop routines for better rest and recovery.' },
  { icon: '🩺', title: 'Medical Health', description: 'Guidance on regular check-ups, understanding your body, and when to seek medical advice.' },
  { icon: '🛡️', title: 'Personal Safety', description: 'Develop situational awareness and learn basic self-defense techniques for confidence and safety.' },
];

const PhysicalPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bento-card text-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50">
        <BarbellIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Physical Wellness</h2>
        <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
          Caring for your body is the foundation of a healthy life. This dimension focuses on nutrition, physical activity, sleep, and overall health to keep you energized and strong.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {physicalTopics.map(topic => (
          <DimensionCard key={topic.title} {...topic} />
        ))}
      </div>
    </div>
  );
};

export default PhysicalPage;
