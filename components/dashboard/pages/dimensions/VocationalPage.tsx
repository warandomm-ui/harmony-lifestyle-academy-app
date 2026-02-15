
import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import AffiliateSection from '../../sections/AffiliateSection';
import { BriefcaseIcon } from '../../Icons';

const vocationalTopics = [
  { icon: '🧭', title: 'Career Exploration', description: 'Discover career paths that align with your personality, interests, and skills.' },
  { icon: '🛠️', title: 'Skill Development', description: 'Identify and learn the skills you need for your desired career, from technical to soft skills.' },
  { icon: '⚖️', title: 'Work-Life Balance', description: 'Learn strategies to manage your time and energy between your studies, work, and personal life.' },
  { icon: '💰', title: 'Financial Literacy', description: 'Master the basics of budgeting, saving, and investing to build a secure financial future.' },
  { icon: '🚀', title: 'Entrepreneurship', description: 'Explore what it takes to start your own business or develop a side hustle for extra income.' },
];

const VocationalPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bento-card text-center bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50">
        <BriefcaseIcon className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Vocational Wellness</h2>
        <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
          Finding satisfaction and enrichment from your work and studies is crucial. This dimension focuses on your career path, skill development, and financial health.
        </p>
      </div>

      {/* Affiliate & Revenue Engine */}
      <AffiliateSection />

      <section>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Vocational Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocationalTopics.map(topic => (
            <DimensionCard key={topic.title} {...topic} />
            ))}
        </div>
      </section>
    </div>
  );
};

export default VocationalPage;
