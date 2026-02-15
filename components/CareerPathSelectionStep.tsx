import React, { useState, useMemo } from 'react';
import type { AnalysisResult, CareerRecommendation } from '../types';
import CareerPathCard from './CareerPathCard';

interface CareerPathSelectionStepProps {
  results: AnalysisResult;
  onComplete: (careers: string[]) => void;
}

const CareerPathSelectionStep: React.FC<CareerPathSelectionStepProps> = ({ results, onComplete }) => {
  const [selectedCareers, setSelectedCareers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectCareer = (careerName: string) => {
    setSelectedCareers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(careerName)) {
        newSet.delete(careerName);
      } else {
        newSet.add(careerName);
      }
      return newSet;
    });
  };

  const filteredOtherOptions = useMemo(() => {
    if (!searchTerm) return results.otherCareerOptions;
    return results.otherCareerOptions.filter(career =>
      career.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, results.otherCareerOptions]);
  
  const filteredTopOptions = useMemo(() => {
    if (!searchTerm) return results.careerRecommendations;
    return results.careerRecommendations.filter(career =>
        career.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, results.careerRecommendations]);


  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Which career paths interest you?</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Based on your <span className="font-bold text-green-600 dark:text-green-500">{results.personalityType}</span> personality, here are some paths that suit you.
          </p>
      </div>

      <div className="mb-8 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="🔎 Find a career path..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
        />
      </div>

      {filteredTopOptions.length > 0 && (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-yellow-400">⭐</span> Top Recommended
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopOptions.map(career => (
                <CareerPathCard
                key={career.name}
                career={career}
                isSelected={selectedCareers.has(career.name)}
                onSelect={handleSelectCareer}
                isTopPick={true}
                personalityType={results.personalityType} // Pass personalityType
                />
            ))}
            </div>
        </div>
      )}

      {filteredOtherOptions.length > 0 && (
         <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Other Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOtherOptions.map(career => (
                <CareerPathCard
                key={career.name}
                career={career}
                isSelected={selectedCareers.has(career.name)}
                onSelect={handleSelectCareer}
                isTopPick={false}
                personalityType={results.personalityType} // Pass personalityType
                />
            ))}
            </div>
        </div>
      )}


      <div className="text-center mt-10 pt-6 border-t dark:border-gray-700">
        <button
          onClick={() => onComplete(Array.from(selectedCareers))}
          disabled={selectedCareers.size === 0}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {selectedCareers.size === 0 ? 'Select a path to continue' : `Continue with ${selectedCareers.size} path(s)`}
        </button>
      </div>
    </div>
  );
};

export default CareerPathSelectionStep;