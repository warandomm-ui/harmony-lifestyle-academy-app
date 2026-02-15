import React from 'react';

interface SkillPillProps {
  skillName: string;
  isSelected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
  recommendationReason?: string;
}

const SkillPill: React.FC<SkillPillProps> = ({ skillName, isSelected, onSelect, isRecommended, recommendationReason }) => {
  const baseClasses = 'flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 text-sm font-medium';

  let stateClasses = '';
  if (isSelected) {
    // A selected skill, recommended or not, is green. The star indicates recommendation.
    stateClasses = 'bg-green-600 border-green-600 text-white';
  } else if (isRecommended) {
    // A recommended, non-selected skill gets a distinct yellow highlight.
    stateClasses = 'bg-yellow-50 text-yellow-800 border-yellow-400 hover:border-yellow-500 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700 dark:hover:border-yellow-500';
  } else {
    // A standard non-selected skill.
    stateClasses = 'bg-white text-gray-700 border-gray-300 hover:border-green-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-green-500';
  }

  return (
    // The relative group wrapper is for the tooltip positioning
    <div className="relative group">
      <button
        onClick={onSelect}
        className={`${baseClasses} ${stateClasses}`}
        title={isRecommended ? `Recommended: ${recommendationReason}` : ''}
      >
        {skillName}
        {isRecommended && (
          // Use different star color based on selection for better contrast
          <span className={isSelected ? 'text-yellow-300' : 'text-yellow-500'}>⭐</span>
        )}
      </button>
      {isRecommended && recommendationReason && (
        // Tooltip is always present for recommended skills, shown on hover of the parent div
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <p><strong className="font-bold text-yellow-300">Recommended for you:</strong> {recommendationReason}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default SkillPill;
