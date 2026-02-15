import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import { GlobeAltIcon } from '../../Icons';

const environmentalTopics = [
  { icon: '♻️', title: 'Sustainable Living', description: 'Learn practical ways to reduce, reuse, and recycle to minimize your environmental impact.' },
  { icon: '🌳', title: 'Conservation Efforts', description: 'Discover how you can contribute to protecting our planet’s natural resources and biodiversity.' },
  { icon: '🏞️', title: 'Appreciation of Nature', description: 'Find ways to connect with the natural world through activities like hiking, gardening, and more.' },
  { icon: '🏠', title: 'Healthy Personal Space', description: 'Create a living environment that is organized, clean, and promotes your well-being.' },
  { icon: '🤝', title: 'Community Green Initiatives', description: 'Join or start local projects that make your community a greener, healthier place to live.' },
];

const EnvironmentalPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bento-card text-center bg-gradient-to-br from-lime-50 to-emerald-100 dark:from-lime-900/50 dark:to-emerald-900/50">
        <GlobeAltIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Environmental Wellness</h2>
        <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
          Your well-being is connected to the health of your surroundings. This dimension is about fostering a positive relationship with the Earth and your personal environment.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {environmentalTopics.map(topic => (
          <DimensionCard key={topic.title} {...topic} />
        ))}
      </div>
    </div>
  );
};

export default EnvironmentalPage;
