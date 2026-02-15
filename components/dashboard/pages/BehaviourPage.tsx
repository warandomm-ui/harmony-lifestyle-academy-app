import React from 'react';
import type { AnalysisResult } from '../../../types';
import { FaceSmileIcon } from '../Icons';

interface BehaviourPageProps {
  userResults: AnalysisResult;
}

const BehaviourPage: React.FC<BehaviourPageProps> = ({ userResults }) => {
  const { personalityType, emoji, overallSummary, summary, recommendedStudyTechniques } = userResults;

  return (
    <div className="space-y-6">
      <div className="bento-card">
        <div className="text-center">
            <div className="text-6xl mb-2">{emoji}</div>
            <p className="text-lg text-[var(--muted)]">Your Harmony Profile</p>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] uppercase tracking-wider">{personalityType}</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Overall Summary</h3>
            <p className="text-[var(--muted)]">{overallSummary}</p>
        </div>
        <div className="bento-card">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Core Strengths</h3>
             <div className="flex flex-wrap gap-2">
                {summary.coreStrengths.map((item, i) => (
                    <span key={i} className="bg-[var(--secondary)] text-[var(--foreground)] text-sm font-medium px-3 py-1 rounded-full">{item}</span>
                ))}
            </div>
        </div>
      </div>

       <div className="bento-card">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Your Unique Traits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold">Natural Talents</p>
                    <p className="text-sm text-[var(--muted)]">{summary.naturalTalents.join(', ')}</p>
                </div>
                 <div>
                    <p className="font-semibold">Learning Style</p>
                    <p className="text-sm text-[var(--muted)]">{summary.learningStyle}</p>
                </div>
                 <div>
                    <p className="font-semibold">Work Environment Fit</p>
                    <p className="text-sm text-[var(--muted)]">{summary.workEnvironmentFit}</p>
                </div>
                <div>
                    <p className="font-semibold">Recommended Study Techniques</p>
                    <ul className="list-disc list-inside text-sm text-[var(--muted)]">
                        {recommendedStudyTechniques.map(tech => <li key={tech}>{tech}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BehaviourPage;
