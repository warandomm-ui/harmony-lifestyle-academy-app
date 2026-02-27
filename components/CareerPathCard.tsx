
import React, { useState, useEffect } from 'react';
import type { CareerRecommendation, GroundedCareerDetail } from '../types';
import { getCareerIcon } from '../constants';
import { getGroundedCareerInfo } from '../services/geminiService';
import { SpinnerIcon, XCircleIcon } from './dashboard/Icons';

interface CareerPathCardProps {
  career: CareerRecommendation;
  isSelected: boolean;
  onSelect: (careerName: string) => void;
  isTopPick: boolean;
  // personalityType is required for grounding, it comes from the parent (CareerPathSelectionStep)
  personalityType: string; 
}

const CareerPathCard: React.FC<CareerPathCardProps> = ({ career, isSelected, onSelect, isTopPick, personalityType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [groundedDetails, setGroundedDetails] = useState<GroundedCareerDetail | null>(null);
  const [isGroundedLoading, setIsGroundedLoading] = useState(false);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  const icon = getCareerIcon(career.name);

  useEffect(() => {
    if (isExpanded && !groundedDetails && !isGroundedLoading) {
      const fetchGroundedInfo = async () => {
        setIsGroundedLoading(true);
        setGroundingError(null);
        try {
          const info = await getGroundedCareerInfo(career.name, personalityType, 'Malaysia');
          setGroundedDetails(info);
        } catch (err: any) {
          console.error("Error fetching grounded career info:", err);
          setGroundingError(err.message || "Could not fetch up-to-date information.");
        } finally {
          setIsGroundedLoading(false);
        }
      };
      fetchGroundedInfo();
    }
  }, [isExpanded, career.name, personalityType, groundedDetails]); // isGroundedLoading intentionally excluded to prevent re-fetch loop

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }

  return (
    <div
      onClick={() => onSelect(career.name)}
      className={`relative p-4 border-2 rounded-xl text-left cursor-pointer transition-all duration-200 h-full flex flex-col justify-between
        ${isSelected
          ? 'border-green-500 ring-2 ring-green-500 bg-green-50 dark:bg-green-500/10'
          : `bg-white dark:bg-gray-700 ${isTopPick ? 'border-green-300 dark:border-green-800' : 'border-gray-200 dark:border-gray-600'} hover:border-green-400 dark:hover:border-green-500`
        }
      `}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <div className="text-3xl">{icon}</div>
                <div>
                    <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 leading-tight">{career.name}</h4>
                    {career.match && <span className={`text-xs font-semibold ${isTopPick ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{career.match}% Match</span>}
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-green-600 border-green-600' : 'bg-transparent border-gray-400'}`}>
                {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
        </div>

        {isExpanded && (
          <div className="animate-fade-in-fast mt-3 space-y-2 text-sm pl-1">
            {isGroundedLoading ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <SpinnerIcon className="h-4 w-4" />
                    <span>Fetching latest insights...</span>
                </div>
            ) : groundingError ? (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircleIcon className="h-4 w-4" />
                    <p>{groundingError}</p>
                </div>
            ) : groundedDetails ? (
              <>
                {groundedDetails.groundedExplanation && (
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-700 dark:text-gray-200">Why it's a great match:</strong> {groundedDetails.groundedExplanation}
                    </p>
                )}
                {groundedDetails.groundedSalaryRange && (
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-700 dark:text-gray-200">Salary:</strong> {groundedDetails.groundedSalaryRange}
                    </p>
                )}
                {career.skills && career.skills.length > 0 && (
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-700 dark:text-gray-200">Skills:</strong> {career.skills.join(', ')}
                    </p>
                )}
                {groundedDetails.jobMarketTrends && (
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-700 dark:text-gray-200">Job Market Trends:</strong> {groundedDetails.jobMarketTrends}
                    </p>
                )}
                {groundedDetails.groundingLinks && groundedDetails.groundingLinks.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        <p className="font-semibold">Sources:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {groundedDetails.groundingLinks.map((link, linkIndex) => (
                                <li key={linkIndex} className="truncate">
                                    <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline dark:text-blue-400">
                                        {link.title || (() => { try { return new URL(link.uri).hostname; } catch { return link.uri; } })()}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </>
            ) : (
                // Fallback to initial data if no grounded details are available yet
                <>
                    {career.why && <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Why it's a great match:</strong> {career.why}</p>}
                    <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Skills:</strong> {career.skills.join(', ')}</p>
                    <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Salary:</strong> {career.salary}</p>
                </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end items-end">
        <button
          onClick={toggleExpand}
          className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline focus:outline-none"
        >
          {isExpanded ? 'Show Less' : 'Learn More'}
        </button>
      </div>
    </div>
  );
};

export default CareerPathCard;