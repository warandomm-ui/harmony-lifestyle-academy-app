import React, { useState } from 'react';
import type { Goal } from '../types';

interface GoalSelectionStepProps {
  onComplete: (goal: Goal) => void;
}

const goals: { name: Goal; icon: string; label: string }[] = [
  { name: 'school', icon: '🎓', label: 'Excel in School' },
  { name: 'university', icon: '🏛️', label: 'Get into University' },
  { name: 'career', icon: '💼', label: 'Advance My Career' },
  { name: 'business', icon: '🚀', label: 'Start a Business' },
  { name: 'freelance', icon: '🧑‍💻', label: 'Start Freelancing' },
  { name: 'skills', icon: '🛠️', label: 'Learn New Skills' },
  { name: 'knowledge', icon: '🧠', label: 'Expand Knowledge' },
  { name: 'communication', icon: '💬', label: 'Enhance Communication' },
  { name: 'behaviour', icon: '👤', label: 'Understand Myself Better' },
  { name: 'wisdom', icon: '🧘', label: 'Cultivate Wisdom' },
  { name: 'fitness', icon: '💪', label: 'Improve Fitness' },
  { name: 'health', icon: '❤️‍🩹', label: 'Improve Emotional Health' },
  { name: 'financial', icon: '💰', label: 'Master Personal Finance' },
  { name: 'social', icon: '🧑‍🤝‍🧑', label: 'Build Social Connections' },
  { name: 'community', icon: '🤝', label: 'Contribute to Community' },
  { name: 'hobby', icon: '🎨', label: 'Develop a Hobby' },
  { name: 'life', icon: '❤️', label: 'Improve My Life' },
];

const GoalSelectionStep: React.FC<GoalSelectionStepProps> = ({ onComplete }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Now that we know your personality, what's your main goal?</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Select one primary goal to focus on for now. You can always change this later.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.name}
            onClick={() => setSelectedGoal(goal.name)}
            className={`flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 h-full
              ${selectedGoal === goal.name
                ? 'border-green-500 ring-2 ring-green-500 bg-green-50 dark:bg-green-500/10'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'}
            `}
          >
            <div className="text-4xl mb-2">{goal.icon}</div>
            <h4 className="font-bold text-sm sm:text-md text-gray-800 dark:text-gray-100">{goal.label}</h4>
          </button>
        ))}
      </div>

      <div className="text-center mt-10 pt-6 border-t dark:border-gray-700">
        <button
          onClick={() => selectedGoal && onComplete(selectedGoal)}
          disabled={!selectedGoal}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default GoalSelectionStep;