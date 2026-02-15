import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import { AcademicCapIcon } from '../../Icons';

const intellectualTopics = [
  { icon: '📚', title: 'Lifelong Learning', description: 'Cultivate a love for learning through reading, online courses, and exploring new subjects.' },
  { icon: '🤔', title: 'Critical Thinking', description: 'Develop your ability to analyze information, solve problems, and make well-reasoned decisions.' },
  { icon: '💡', title: 'Creativity & Innovation', description: 'Engage in creative activities and learn techniques for brainstorming and generating new ideas.' },
  { icon: '🧠', title: 'Cognitive Skills', description: 'Enhance your memory, focus, and mental agility through brain-training exercises and techniques.' },
  { icon: '🌍', title: 'Cultural Awareness', description: 'Expand your worldview by learning about different cultures, perspectives, and languages.' },
];

const IntellectualPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bento-card text-center bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/50 dark:to-sky-900/50">
        <AcademicCapIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Intellectual Wellness</h2>
        <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
          Keeping your mind sharp and curious opens up new worlds. This dimension is about expanding your knowledge, skills, and creativity throughout your life.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {intellectualTopics.map(topic => (
          <DimensionCard key={topic.title} {...topic} />
        ))}
      </div>
    </div>
  );
};

export default IntellectualPage;
