import React from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { FilmIcon, CheckBadgeIcon, DocumentTextIcon, UsersIcon } from '../Icons';

const materials = [
  {
    icon: <FilmIcon className="h-8 w-8 text-indigo-500" />,
    title: 'Video Lectures',
    description: 'Watch expert-led videos on a variety of subjects.',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: <CheckBadgeIcon className="h-8 w-8 text-teal-500" />,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge and track your progress.',
    bgColor: 'bg-teal-500/10',
  },
  {
    icon: <DocumentTextIcon className="h-8 w-8 text-sky-500" />,
    title: 'Reading Materials',
    description: 'Read in-depth articles, guides, and e-books.',
    bgColor: 'bg-sky-500/10',
  },
  {
    icon: <UsersIcon className="h-8 w-8 text-rose-500" />,
    title: 'Community Workshops',
    description: 'Join live workshops hosted by peers and mentors.',
    bgColor: 'bg-rose-500/10',
  },
];

const LearningMaterialsSection: React.FC = () => {
  const { addToast } = useToast();

  const handleExplore = (title: string) => {
    addToast(`Exploring "${title}" is coming soon!`, 'info');
  };

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Explore Learning Materials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {materials.map((material) => (
          <div
            key={material.title}
            className="bg-[var(--background)] rounded-2xl p-6 flex flex-col items-start text-left border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors"
          >
            <div className={`p-3 rounded-full ${material.bgColor} mb-4`}>
                {material.icon}
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">{material.title}</h3>
            <p className="text-sm text-[var(--muted)] mt-1 flex-grow">{material.description}</p>
            <button
              onClick={() => handleExplore(material.title)}
              className="mt-4 font-semibold text-[var(--primary)] hover:underline"
            >
              Explore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningMaterialsSection;