






import React, { useState } from 'react';
import type { AnalysisResult, StartupIdea, SurveyAnswers, UserProfile } from '../types';
import { ProgressBar } from './dashboard/shared/ProgressBar';
import HarmonyProfileSection from './dashboard/sections/HarmonyProfileSection';
import {
  DISC_COLORS,
  MBTI_COLORS,
  ENNEAGRAM_COLORS,
  TEMPERAMENT_COLORS,
  SOCIAL_STYLES_COLORS,
  getPersonalityColor
} from '../constants';

interface ResultsStepProps {
  results: AnalysisResult;
  onRestart: () => void;
  onNext: () => void;
  /** Raw survey answers, used for the SQ/IQ/EQ analysis. */
  surveyAnswers?: SurveyAnswers | null;
  userProfile?: UserProfile | null;
}

type Tab = 'summary' | 'harmony' | 'disc' | 'mbti' | 'enneagram' | 'bigFive' | 'hexaco' | 'temperament' | 'socialStyles' | 'intelligences' | 'careers' | 'lifePath';

const ResultsStep: React.FC<ResultsStepProps> = ({ results, onRestart, onNext, surveyAnswers, userProfile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab results={results} />;
      case 'harmony':
        return (
          <HarmonyProfileSection
            bare
            userResults={results}
            surveyAnswers={surveyAnswers}
            userProfile={userProfile}
          />
        );
      case 'disc':
        return <FrameworkTab title="DISC - Behavior Style" data={results.studentProfile.disc} colorMapping={DISC_COLORS} />;
      case 'mbti':
        return <FrameworkTab title="MBTI - Mindset & Motivation" data={results.studentProfile.mbti} colorMapping={MBTI_COLORS} />;
      case 'enneagram':
        return <FrameworkTab title="Enneagram - Core Motivation" data={results.studentProfile.enneagram} colorMapping={ENNEAGRAM_COLORS} />;
      case 'bigFive':
        return <BigFiveTab data={results.studentProfile.bigFive} />;
      case 'hexaco':
        return <HexacoTab data={results.studentProfile.hexaco} />;
      case 'temperament':
        return <FrameworkTab title="Temperament" data={results.studentProfile.temperament} colorMapping={TEMPERAMENT_COLORS} />;
      case 'socialStyles':
        return <FrameworkTab title="Social Styles" data={results.studentProfile.socialStyles} colorMapping={SOCIAL_STYLES_COLORS} />;
      case 'intelligences':
         return <ListTab title="Multiple Intelligences - Learning Strengths" subtitle="Your top learning strengths are:" items={results.studentProfile.multipleIntelligences.topIntelligences} summary={results.studentProfile.multipleIntelligences.summary} />;
      case 'careers':
        return <CareersTab results={results} />;
      case 'lifePath':
        return <LifePathTab results={results} />;
      default:
        return null;
    }
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
          <div className="text-6xl mb-2">{results.emoji}</div>
          <p className="text-lg text-gray-500 dark:text-gray-400">Your Harmony Profile</p>
          <h2 className="text-4xl font-extrabold text-green-700 dark:text-green-500 uppercase tracking-wider">{results.personalityType}</h2>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
          <TabButton name="Summary" tab="summary" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="SQ · IQ · EQ" tab="harmony" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Life Path" tab="lifePath" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Careers" tab="careers" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="DISC" tab="disc" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="MBTI" tab="mbti" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Enneagram" tab="enneagram" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Big Five" tab="bigFive" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="HEXACO" tab="hexaco" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Social Styles" tab="socialStyles" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Intelligences" tab="intelligences" activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 min-h-[200px]">
        {renderTabContent()}
      </div>

      <div className="text-center pt-6 border-t dark:border-gray-700">
        <button
            onClick={onRestart}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium mr-4"
        >
            Retake Survey
        </button>
        <button
          onClick={onNext}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
          Next Step
        </button>
      </div>
    </div>
  );
};

// --- Tab Components ---

const TabButton = ({ name, tab, activeTab, setActiveTab }: { name: string, tab: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`${
        activeTab === tab
            ? 'border-green-500 text-green-600 dark:text-green-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:px-3`}
    >
        {name}
    </button>
);

const SummaryTab: React.FC<{ results: AnalysisResult }> = ({ results }) => (
    <div className="space-y-4">
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Overall Summary</h3>
            <p className="text-gray-600 dark:text-gray-300">{results.overallSummary}</p>
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Recommended Study Techniques</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-2">
                {results.recommendedStudyTechniques.map(tech => <li key={tech}>{tech}</li>)}
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Core Strengths</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                {results.summary.coreStrengths.map((item, i) => (
                    <span key={i} className="bg-white border border-gray-300 text-gray-700 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{item}</span>
                ))}
            </div>
        </div>
    </div>
);

const LifePathTab: React.FC<{ results: AnalysisResult }> = ({ results }) => (
    <div className="space-y-8">
        {/* Life Skills */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">🧘 Essential Life Skills</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Soft skills to help you balance and thrive.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.lifeSkills && results.lifeSkills.map((skill, i) => (
                    <div key={i} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                        <span className="text-blue-500">🌱</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{skill}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Special Skills */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">⚡ Special Skills</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Niche hard skills that align with your talents.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.specialSkills && results.specialSkills.map((skill, i) => (
                    <div key={i} className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 flex items-center gap-2">
                        <span className="text-purple-500">🚀</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{skill}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Sports */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">🏃 Recommended Sports</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Physical activities that match your energy.</p>
            <div className="flex flex-wrap gap-2">
                {results.recommendedSports && results.recommendedSports.map((sport, i) => (
                    <span key={i} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-4 py-2 rounded-full font-semibold text-sm">
                        {sport}
                    </span>
                ))}
            </div>
        </div>

        {/* Startup Ideas */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">💡 Startup Business Ideas</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ventures you could launch based on your strengths.</p>
            <div className="grid grid-cols-1 gap-6">
                {results.startupIdeas && results.startupIdeas.map((idea, i) => (
                    <div key={i} className="bg-white dark:bg-gray-700 p-5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-2">{idea.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{idea.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                                <p className="text-xs font-bold uppercase text-indigo-500 mb-1">🇲🇾 Target Market</p>
                                <p className="text-sm text-gray-700 dark:text-gray-200">{idea.targetMarket}</p>
                            </div>
                            
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                <p className="text-xs font-bold uppercase text-green-600 mb-1">✅ Validation Steps</p>
                                <ul className="text-sm text-gray-700 dark:text-gray-200 list-disc list-inside space-y-1">
                                    {idea.validationSteps && idea.validationSteps.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg md:col-span-2">
                                <p className="text-xs font-bold uppercase text-red-500 mb-1">⚠️ Key Challenges</p>
                                <div className="flex flex-wrap gap-2">
                                    {idea.challenges && idea.challenges.map((challenge, idx) => (
                                        <span key={idx} className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                            {challenge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

interface FrameworkTabProps {
    title: string;
    data: { style?: string, type?: string, summary: string };
    colorMapping: { [key: string]: string };
}

const FrameworkTab: React.FC<FrameworkTabProps> = ({ title, data, colorMapping }) => {
    const typeOrStyle = data.style || data.type || '';
    const colorClass = getPersonalityColor(typeOrStyle, colorMapping);

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className={`text-2xl font-bold mt-2 ${colorClass}`}>{typeOrStyle}</p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{data.summary}</p>
        </div>
    );
};

const ListTab: React.FC<{title: string, subtitle: string, items: string[], summary: string}> = ({ title, subtitle, items, summary }) => (
    <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{subtitle}</p>
        <div className="flex flex-wrap gap-2 mt-2">
            {items.map(item => (
                <span key={item} className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 font-semibold px-3 py-1 rounded-full">{item}</span>
            ))}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-3">{summary}</p>
    </div>
);

const BigFiveTab: React.FC<{data: AnalysisResult['studentProfile']['bigFive']}> = ({ data }) => (
    <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Big Five - Scientific Traits</h3>
        <div className="space-y-3 mt-3">
            {data.traits.map(trait => (
                <ProgressBar
                    key={trait.name}
                    label={trait.name}
                    percentage={(trait.score / 5) * 100}
                    value={`${trait.score}/5`}
                />
            ))}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-4">{data.summary}</p>
    </div>
);

const HexacoTab: React.FC<{data: AnalysisResult['studentProfile']['hexaco']}> = ({ data }) => (
    <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">HEXACO - Personality Traits</h3>
        <div className="space-y-3 mt-3">
            {data.traits.map(trait => (
                <ProgressBar
                    key={trait.name}
                    label={trait.name}
                    percentage={(trait.score / 5) * 100}
                    value={`${trait.score}/5`}
                />
            ))}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-4">{data.summary}</p>
    </div>
);

const CareersTab: React.FC<{ results: AnalysisResult }> = ({ results }) => (
     <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Top Career Recommendations</h3>
        <div className="space-y-4">
          {results.careerRecommendations.map((career, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg text-green-800 dark:text-green-400">{career.name}</h4>
                <div className="flex items-center gap-2"> {/* Container for match score and bar */}
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{career.match}%</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${career.match}%` }}
                        ></div>
                    </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2"><span className="font-semibold text-gray-700 dark:text-gray-200">Why it's a great match:</span> {career.why}</p>
            </div>
          ))}
        </div>
      </div>
);

export default ResultsStep;
