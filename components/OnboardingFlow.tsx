import React, { useState, useCallback, useEffect } from 'react';
import type { SurveyAnswers, AnalysisResult, UserStatus, UserProfile, LifeVision, Goal } from '../types';
import { getPersonalityAnalysis } from '../services/geminiService';
import { DEFAULT_ANALYSIS_RESULT } from '../constants';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import WelcomeStep from './WelcomeStep';
import PersonalInfoStep from './PersonalInfoStep';
import AssessmentStep from './AssessmentStep';
import ResultsStep from './ResultsStep';
import UserStatusStep from './UserStatusStep';
import GeneratingDashboardStep from './GeneratingDashboardStep';
import GoalSelectionStep from './GoalSelectionStep';
import CareerPathSelectionStep from './CareerPathSelectionStep';
import SkillSelectionStep from './SkillSelectionStep';
import LifeGoalsStep from './LifeGoalsStep';

type OnboardingStep = 'welcome' | 'personalInfo' | 'assessment' | 'loading' | 'results' | 'lifeGoals' | 'goalSelection' | 'careerPathSelection' | 'skillSelection' | 'userStatus' | 'generating';

interface OnboardingFlowProps {
  onOnboardingComplete: (profile: UserProfile, results: AnalysisResult, userStatus: UserStatus, lifeVision: LifeVision, skills: string[]) => void;
}

const OnboardingFlow = ({ onOnboardingComplete }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lifeVision, setLifeVision] = useState<LifeVision | null>(null);
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  const handlePersonalInfoComplete = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    setStep('assessment');
  }, []);

  const handlePersonalInfoSkip = useCallback(() => {
    setUserProfile({
      name: user?.email?.split('@')[0] || 'Member',
      age: null,
      gender: 'Prefer not to say',
      race: 'Prefer not to say',
      religion: 'Prefer not to say',
      schoolName: 'N/A',
      state: 'N/A',
      country: 'Malaysia'
    });
    setStep('assessment');
  }, [user]);

  const handleAssessmentComplete = useCallback(async (finalAnswers: SurveyAnswers) => {
    setAnswers(finalAnswers);
    setStep('loading');
    setError(null);
    try {
      const analysisResults = await getPersonalityAnalysis(finalAnswers);
      setResults(analysisResults);
      setStep('results');
    } catch (err) {
      setError('Sorry, we couldn\'t analyze your results. Please try again.');
      setStep('assessment'); 
    }
  }, []);
  
  const handleSkipAssessment = useCallback(() => {
    setResults(DEFAULT_ANALYSIS_RESULT);
    setStep('results');
  }, []);

  const handleLifeGoalsComplete = useCallback((vision: LifeVision) => {
    setLifeVision(vision);
    setStep('goalSelection');
  }, []);

  const handleGoalSelectionComplete = useCallback((selectedGoal: Goal) => {
    setGoal(selectedGoal);
    if (['career', 'university', 'freelance', 'business'].includes(selectedGoal)) {
      setStep('careerPathSelection');
    } else {
      setStep('skillSelection');
    }
  }, []);

  const handleCareerPathComplete = useCallback((careers: string[]) => {
    setSelectedCareers(careers);
    setStep('skillSelection');
  }, []);

  const handleSkillSelectionComplete = useCallback((skills: string[]) => {
    setUserSkills(skills);
    setStep('userStatus');
  }, []);

  const handleUserStatusComplete = useCallback((status: UserStatus) => {
      setUserStatus(status);
      setStep('generating');
  }, []);

  useEffect(() => {
    const persistData = async () => {
        if (step === 'generating' && userProfile && results && userStatus && lifeVision && user) {
            try {
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: userProfile.name,
                        profile_data: { profile: userProfile, results, status: userStatus, vision: lifeVision, skills: userSkills },
                        updated_at: new Date().toISOString()
                    });
                
                if (upsertError) throw upsertError;

                setTimeout(() => {
                    onOnboardingComplete(userProfile, results, userStatus, lifeVision, userSkills);
                }, 3000);
            } catch (err: any) {
                console.error("Persistence failed:", err);
                addToast("Database sync failed. Using safe local storage instead.", "info");
                // Fallback to callback if DB fails, App.tsx handles localStorage
                onOnboardingComplete(userProfile, results, userStatus, lifeVision, userSkills);
            }
        }
    };
    persistData();
  }, [step, userProfile, results, userStatus, lifeVision, onOnboardingComplete, userSkills, user, addToast]);

  const renderStep = () => {
    switch (step) {
      case 'welcome': return <WelcomeStep onStart={() => setStep('personalInfo')} />;
      case 'personalInfo': return <PersonalInfoStep onComplete={handlePersonalInfoComplete} onSkip={handlePersonalInfoSkip} />;
      case 'assessment': return <AssessmentStep onComplete={handleAssessmentComplete} onSkip={handleSkipAssessment} />;
      case 'loading': return <LoadingComponent />;
      case 'results': return results ? <ResultsStep results={results} onRestart={() => setStep('welcome')} onNext={() => setStep('lifeGoals')} /> : <LoadingComponent />;
      case 'lifeGoals': return <LifeGoalsStep onComplete={handleLifeGoalsComplete} onSkip={() => handleLifeGoalsComplete({ vision: '', mission: '', wisdomGoal: '', knowledgeGoal: '', careerFinanceGoal: '', healthFitnessGoal: '', socialCommGoal: '' })} />;
      case 'goalSelection': return <GoalSelectionStep onComplete={handleGoalSelectionComplete} />;
      case 'careerPathSelection': return results ? <CareerPathSelectionStep results={results} onComplete={handleCareerPathComplete} /> : <LoadingComponent />;
      case 'skillSelection': return (results && goal) ? <SkillSelectionStep onComplete={handleSkillSelectionComplete} personalityType={results.personalityType} goal={goal} selectedCareers={selectedCareers} /> : <LoadingComponent />;
      case 'userStatus': return <UserStatusStep onComplete={handleUserStatusComplete} />;
      case 'generating': return <GeneratingDashboardStep />;
      default: return <WelcomeStep onStart={() => setStep('personalInfo')} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--card)] rounded-3xl shadow-lg p-6 md:p-10 border border-[var(--border)]">
      {error && <div className="bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
      {renderStep()}
    </div>
  );
};

const LoadingComponent: React.FC = () => (
    <div className="text-center py-20 flex flex-col items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-[var(--primary)] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Harmony Analysis in Progress...</h2>
    </div>
);

export default OnboardingFlow;