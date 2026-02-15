import React from 'react';
import { useToast } from '../../../contexts/ToastContext';

interface DimensionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DimensionCard: React.FC<DimensionCardProps> = ({ icon, title, description }) => {
  const { addToast } = useToast();

  const handleExplore = () => {
    addToast(`Exploring "${title}" is coming soon!`, 'info');
  };

  return (
    <div className="bento-card flex flex-col items-start text-left h-full">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg text-[var(--foreground)]">{title}</h3>
      <p className="text-sm text-[var(--muted)] mt-1 flex-grow">{description}</p>
      <button 
        onClick={handleExplore}
        className="mt-4 font-semibold text-[var(--primary)] hover:underline self-start"
      >
        Explore
      </button>
    </div>
  );
};

export default DimensionCard;
