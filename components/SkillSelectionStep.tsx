import React, { useState, useEffect, useMemo } from 'react';
import type { AnalysisResult, Goal, SkillSuggestion, SurveyAnswers, UserProfile } from '../types';
import { getSkillRecommendations } from '../services/geminiService';
import { SKILLS } from '../constants';
import { analyzeHarmonyProfile, getDimensionMeta } from '../utils/harmonyProfile';
import { isMuslim } from '../utils/religionUtils';
import SkillPill from './SkillPill';
import { useToast } from '../contexts/ToastContext';

interface SkillSelectionStepProps {
  onComplete: (skills: string[]) => void;
  personalityType: string;
  goal: Goal;
  selectedCareers: string[];
  /** Survey output — drives the SQ/IQ/EQ/kinetic/akhlak recommendations. */
  results?: AnalysisResult | null;
  surveyAnswers?: SurveyAnswers | null;
  userProfile?: UserProfile | null;
}

const SkillSelectionStep: React.FC<SkillSelectionStepProps> = ({
  onComplete,
  personalityType,
  goal,
  selectedCareers,
  results,
  surveyAnswers,
  userProfile,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<SkillSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  // Deterministic recommendations from the survey. These are available
  // immediately and stand on their own if the AI call fails.
  const analysis = useMemo(
    () => analyzeHarmonyProfile({ results, answers: surveyAnswers, profile: userProfile, perCategory: 3 }),
    [results, surveyAnswers, userProfile],
  );
  const muslimFraming = isMuslim(userProfile?.religion || '');

  const harmonyReasons = useMemo(() => {
    const map = new Map<string, string>();
    (Object.values(analysis.skillsByCategory) as { skill: string; reason: string }[][]).forEach(list => {
      list.forEach(item => map.set(item.skill.toLowerCase(), item.reason));
    });
    return map;
  }, [analysis]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const recs = await getSkillRecommendations(personalityType, goal, selectedCareers);
        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to fetch skill recommendations:", err);
        setRecommendations({
          recommendedSkills: [],
          smartSuggestions: []
        });
      }
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
      } else {
        addToast("You can only select up to 10 skills.", "info");
      }
      return newSet;
    });
  };

  const isRecommended = (skill: string) => {
    if (harmonyReasons.has(skill.toLowerCase())) return true;
    return recommendations?.recommendedSkills?.some(rec => rec.skill?.toLowerCase() === skill.toLowerCase()) ?? false;
  };

  const getRecommendationReason = (skill: string) => {
    return (
      harmonyReasons.get(skill.toLowerCase()) ??
      recommendations?.recommendedSkills?.find(rec => rec.skill?.toLowerCase() === skill.toLowerCase())?.reason
    );
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

  const progressPercentage = (selectedSkills.size / 10) * 100;
  let progressText = 'Choose 3 to 10 skills.';
  let progressColor = "text-gray-500 dark:text-gray-400";

  if (selectedSkills.size < 3) {
    progressText = `Select at least ${3 - selectedSkills.size} more skill(s).`;
    progressColor = "text-orange-600 dark:text-orange-400";
  } else if (selectedSkills.size < 10) {
    progressText = `You can select up to ${10 - selectedSkills.size} more skill(s).`;
    progressColor = "text-blue-600 dark:text-blue-400";
  } else if (selectedSkills.size === 10) {
    progressText = `Maximum skills selected!`;
    progressColor = "text-green-600 dark:text-green-400 font-bold";
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Select Skills to Develop</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">These skills will help you reach your goals.</p>
        <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-semibold ${selectedSkills.size === 10 ? 'text-green-600' : 'text-green-700 dark:text-green-400'}`}>
                    {selectedSkills.size} / 10 Skills Selected
                </span>
                <span className={`text-sm font-medium ${progressColor}`}>
                    {progressText}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ${selectedSkills.size === 10 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-green-600 dark:bg-green-500'}`} 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* Survey-driven guidance: which dimensions are strong, which need work,
          and the single best pick from each of the four catalogues. */}
      <div className="mb-6 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">🧭 Cadangan Berdasarkan Profil Anda</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {analysis.dimensions.map(dimension => {
            const meta = getDimensionMeta(dimension.id, muslimFraming);
            const isStrength = analysis.strengths.includes(dimension.id);
            const isGrowth = analysis.growthAreas.includes(dimension.id);
            return (
              <span
                key={dimension.id}
                title={`${meta.label} — ${dimension.band}`}
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isStrength
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : isGrowth
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-white/70 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {meta.icon} {meta.code} {dimension.score}
              </span>
            );
          })}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{analysis.summary}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {analysis.topSkills.slice(0, 4).map(skill => (
            <SkillPill
              key={`top-${skill.skill}`}
              skillName={skill.skill}
              isSelected={selectedSkills.has(skill.skill)}
              onSelect={() => handleSelectSkill(skill.skill)}
              isRecommended
              recommendationReason={skill.reason}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔎 Search for a skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
          aria-label="Search skills"
        />
      </div>

      {isLoading && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Memuatkan cadangan tambahan AI...
        </p>
      )}

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

      <div className="text-center mt-10 pt-6 border-t dark:border-gray-700">
        <button
          onClick={() => onComplete(Array.from(selectedSkills))}
          disabled={!canContinue}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] dark:focus:ring-offset-[var(--card)]"
        >
          {`Continue (${selectedSkills.size}/10)`}
        </button>
      </div>
    </div>
  );
};

export default SkillSelectionStep;
