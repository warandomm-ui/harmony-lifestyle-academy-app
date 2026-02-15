
import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import { FaceSmileIcon } from '../../Icons';
import EmotionTrackerSection from '../../sections/EmotionTrackerSection';

const emotionalTopics = [
  { icon: '😊', title: 'Emotional Intelligence', description: 'Understand and manage your own emotions, and recognize and influence the emotions of others.' },
  { icon: '🧘', title: 'Stress Management', description: 'Learn techniques like mindfulness, meditation, and deep breathing to handle stress effectively.' },
  { icon: '❤️', title: 'Coping Mechanisms', description: 'Develop healthy strategies to deal with difficult situations, setbacks, and intense feelings.' },
  { icon: '🧠', title: 'Building Resilience', description: 'Cultivate the mental toughness to bounce back from adversity and challenges.' },
  { icon: '✨', title: 'Positive Psychology', description: 'Explore the science of happiness and well-being to foster a more optimistic outlook on life.' },
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

      <h3 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-4">Explore Emotional Topics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emotionalTopics.map(topic => (
          <DimensionCard key={topic.title} {...topic} />
        ))}
      </div>
    </div>
  );
};

export default EmotionalPage;
