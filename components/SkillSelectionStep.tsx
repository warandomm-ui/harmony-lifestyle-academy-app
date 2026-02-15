
import React, { useState, useEffect, useMemo } from 'react';
import type { Goal, SkillSuggestion } from '../types';
import { getSkillRecommendations } from '../services/geminiService';
import { SKILLS } from '../constants';
import SkillPill from './SkillPill';

interface SkillSelectionStepProps {
  onComplete: (skills: string[]) => void;
  personalityType: string;
  goal: Goal;
  selectedCareers: string[];
}

const SkillSelectionStep: React.FC<SkillSelectionStepProps> = ({ onComplete, personalityType, goal, selectedCareers }) => {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<SkillSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      const recs = await getSkillRecommendations(personalityType, goal, selectedCareers);
      setRecommendations(recs);
      setIsLoading(false);
    };
    fetchRecommendations();
  }, [personalityType, goal, selectedCareers]);

  const handleSelectSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
      } else if (newSet.size < 10) {
        newSet.add(skill);
      }
      return newSet;
    });
  };

  const isRecommended = (skill: string) => {
    return recommendations?.recommendedSkills.some(rec => rec.skill.toLowerCase() === skill.toLowerCase()) ?? false;
  };
  
  const getRecommendationReason = (skill: string) => {
    return recommendations?.recommendedSkills.find(rec => rec.skill.toLowerCase() === skill.toLowerCase())?.reason;
  };

  const skillCategoriesToDisplay = useMemo(() => {
    const categories: { title: string; skills: string[]; open?: boolean }[] = [
      { title: '📚 School Subjects', skills: SKILLS.school, open: true },
      { title: '💻 Technical Skills', skills: SKILLS.technical },
      { title: '👔 Professional Skills', skills: SKILLS.professional },
      { title: '💪 Life Management & Personal Development', skills: SKILLS.life },
      { title: '🎨 Creative Skills', skills: SKILLS.creative },
    ];
    return categories;
  }, []);

  const filteredSkillCategories = useMemo(() => {
    if (!searchTerm) {
        return skillCategoriesToDisplay;
    }
    return skillCategoriesToDisplay
        .map(category => ({
            ...category,
            skills: category.skills.filter(skill =>
                skill.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }))
        .filter(category => category.skills.length > 0);
    }, [searchTerm, skillCategoriesToDisplay]);

  const canContinue = selectedSkills.size >= 3 && selectedSkills.size <= 10;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Select Skills to Develop</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">These skills will help you reach your goals. Choose 3 to 10 skills.</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔎 Search for a skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
        />
      </div>


      {isLoading ? (
        <div className="text-center py-10">Loading recommendations...</div>
      ) : (
        <div className="space-y-6">
          {filteredSkillCategories.length > 0 ? (
            filteredSkillCategories.map(category => (
                <details key={category.title} open={category.open || searchTerm.length > 0}>
                <summary className="text-lg font-bold text-gray-700 dark:text-gray-200 cursor-pointer hover:text-green-600 dark:hover:text-green-500">{category.title}</summary>
                <div className="flex flex-wrap gap-2 mt-4">
                    {category.skills.map(skill => (
                    <SkillPill
                        key={skill}
                        skillName={skill}
                        isSelected={selectedSkills.has(skill)}
                        onSelect={() => handleSelectSkill(skill)}
                        isRecommended={isRecommended(skill)}
                        recommendationReason={getRecommendationReason(skill)}
                    />
                    ))}
                </div>
                </details>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>No skills found for "{searchTerm}".</p>
                <p className="text-sm">Try a different search term.</p>
            </div>
          )}
          
          {searchTerm.length === 0 && recommendations?.smartSuggestions && recommendations.smartSuggestions.length > 0 && (
            <div className="bg-green-50 dark:bg-gray-700/50 p-4 rounded-lg mt-6">
              <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Smart Suggestions</h4>
              {recommendations.smartSuggestions.map((suggestion, index) => (
                <div key={index}>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{suggestion.context}</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.skills.map(skill => (
                       <SkillPill
                         key={skill}
                         skillName={skill}
                         isSelected={selectedSkills.has(skill)}
                         onSelect={() => handleSelectSkill(skill)}
                       />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-10 pt-6 border-t dark:border-gray-700">
        <button
          onClick={() => onComplete(Array.from(selectedSkills))}
          disabled={!canContinue}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {`Continue (${selectedSkills.size}/10)`}
        </button>
      </div>
    </div>
  );
};

export default SkillSelectionStep;