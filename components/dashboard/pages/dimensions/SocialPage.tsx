import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import { UsersIcon } from '../../Icons';

const socialTopics = [
  { icon: '💬', title: 'Communication Skills', description: 'Master active listening, public speaking, and expressing your thoughts clearly and confidently.' },
  { icon: '🤝', title: 'Relationship Building', description: 'Learn to build and maintain healthy relationships with family, friends, and romantic partners.' },
  { icon: '🤗', title: 'Community Involvement', description: 'Discover the benefits of volunteering and contributing to your local community.' },
  { icon: '🌐', title: 'Networking & Etiquette', description: 'Develop skills for making professional connections and navigating different social situations.' },
  { icon: '⚖️', title: 'Conflict Resolution', description: 'Acquire strategies to handle disagreements constructively and find mutually agreeable solutions.' },
];

const SocialDimensionPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bento-card text-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/50 dark:to-teal-900/50">
        <UsersIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Social Wellness</h2>
        <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
          Connecting with others and building a strong support system is vital. This dimension explores communication, relationships, and your role within the community.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialTopics.map(topic => (
          <DimensionCard key={topic.title} {...topic} />
        ))}
      </div>
    </div>
  );
};

export default SocialDimensionPage;
