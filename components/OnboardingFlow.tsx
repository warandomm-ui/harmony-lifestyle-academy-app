import React, { useState, useCallback, useEffect, useRef } from 'react';
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

// ═══════════════════════════════════════════════════════════
// DUAL-PATH ONBOARDING FLOW
// 
// Architecture:
// Welcome → PersonalInfo (student selects religion here)
//   ├── Muslim → Islamic assessment flow → Muslim Dashboard
//   └── Non-Muslim → Universal assessment flow → Universal Dashboard
//
// The religion field in UserProfile determines EVERYTHING:
// - Which dashboard loads
// - Which content appears
// - Which language/cultural context is used
// - Which spiritual sources are referenced
//
// Muslim parents see: Quran, Sunnah, Doa, Arabic, Hadith
// Non-Muslim parents see: Science, Philosophy, Meditation, Wisdom
// ZERO overlap. ZERO toggle. Completely separate experiences.
// ═══════════════════════════════════════════════════════════

type OnboardingStep = 
  | 'welcome' 
  | 'personalInfo' 
  | 'assessment' 
  | 'loading' 
  | 'results' 
  | 'lifeGoals' 
  | 'goalSelection' 
  | 'careerPathSelection' 
  | 'skillSelection' 
  | 'userStatus' 
  | 'generating';

// Goals that lead to the career-path step.
const CAREER_GOALS: Goal[] = ['career', 'university', 'freelance', 'business'];

// Helper: Determine if student is Muslim based on religion field
// This is the SINGLE source of truth for the entire app's routing
const isMuslimStudent = (religion: string | null | undefined): boolean => {
  const muslimValues = ['islam', 'muslim', 'sunni', 'shia', 'sufi'];
  return muslimValues.includes((religion ?? '').toLowerCase().trim());
};

// Export this so other components can use the same logic
export { isMuslimStudent };

interface OnboardingFlowProps {
  onOnboardingComplete: (
    profile: UserProfile, 
    results: AnalysisResult, 
    userStatus: UserStatus, 
    lifeVision: LifeVision, 
    skills: string[]
  ) => void;
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

  // Name the user typed at registration (Supabase user metadata), used to prefill.
  const registeredName: string =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    user?.email?.split('@')[0] ||
    '';

  // Keep the latest completion callback in a ref so the persistence effect does
  // not re-run (and double-submit) whenever the parent re-renders.
  const onCompleteRef = useRef(onOnboardingComplete);
  useEffect(() => { onCompleteRef.current = onOnboardingComplete; }, [onOnboardingComplete]);
  const persistStartedRef = useRef(false);

  // Scroll to the top whenever the step changes so long steps don't open mid-page.
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ─── Derived state: is this a Muslim student? ───
  // Available after PersonalInfoStep completes
  const isMuslim = userProfile ? isMuslimStudent(userProfile.religion) : null;

  // ─── STEP HANDLERS ───

  const handlePersonalInfoComplete = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    
    // ═══ THIS IS WHERE THE PATH SPLITS ═══
    // After saving the profile, we proceed to assessment
    // The assessment, results, and ALL subsequent content
    // will check `isMuslimStudent(profile.religion)` to determine
    // which version of content to show.
    //
    // The dashboard component (loaded after onboarding) will also
    // check this same field to load Muslim or Universal dashboard.
    
    setStep('assessment');
  }, []);

  const handlePersonalInfoSkip = useCallback(() => {
    // If student skips, default to universal (non-Muslim) path
    // This is the safest default — no Islamic content shown without explicit choice
    setUserProfile({
      name: registeredName || 'Member',
      age: null,
      gender: 'Prefer not to say',
      race: 'Prefer not to say',
      religion: 'Prefer not to say', // This maps to Universal path
      schoolName: 'N/A',
      state: 'N/A',
      country: 'Malaysia'
    });
    setStep('assessment');
  }, [registeredName]);

  const handleAssessmentComplete = useCallback(async (finalAnswers: SurveyAnswers) => {
    setAnswers(finalAnswers);
    setStep('loading');
    setError(null);
    try {
      const analysisResults = await getPersonalityAnalysis(finalAnswers);
      setResults(analysisResults);
      setStep('results');
    } catch (err) {
      // Don't throw the student back to question 1 and lose their answers:
      // show a starter profile they can continue with (and retake later).
      console.error('Personality analysis failed:', err);
      setError(
        isMuslim
          ? 'Maaf, analisis penuh tidak berjaya. Kami paparkan profil permulaan — anda boleh ambil semula ujian kemudian.'
          : 'Sorry, we couldn\'t complete the full analysis. Showing a starter profile — you can retake the survey later.'
      );
      setResults(DEFAULT_ANALYSIS_RESULT);
      setStep('results');
    }
  }, [isMuslim]);
  
  const handleSkipAssessment = useCallback(() => {
    setError(null);
    setResults(DEFAULT_ANALYSIS_RESULT);
    setStep('results');
  }, []);

  const handleLifeGoalsComplete = useCallback((vision: LifeVision) => {
    setLifeVision(vision);
    setStep('goalSelection');
  }, []);

  const handleGoalSelectionComplete = useCallback((selectedGoal: Goal) => {
    setGoal(selectedGoal);
    if (CAREER_GOALS.includes(selectedGoal)) {
      setStep('careerPathSelection');
    } else {
      // Careers picked under a previous goal must not leak into skill recommendations.
      setSelectedCareers([]);
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

  // ─── PERSIST TO SUPABASE ───
  // Runs exactly once when the user reaches the final step.
  useEffect(() => {
    if (step !== 'generating') {
      persistStartedRef.current = false;
      return;
    }
    if (persistStartedRef.current) return;
    if (!(userProfile && results && userStatus && lifeVision && user)) return;
    persistStartedRef.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (!cancelled) onCompleteRef.current(userProfile, results, userStatus, lifeVision, userSkills);
    };

    const persistData = async () => {
      try {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: userProfile.name,
            // ═══ CRITICAL: dashboardMode is stored in the database ═══
            // This determines which dashboard loads on every future login
            // Muslim student → 'muslim' → loads Muslim dashboard components
            // Non-Muslim → 'universal' → loads Universal dashboard components
            profile_data: {
              profile: userProfile,
              results,
              status: userStatus,
              vision: lifeVision,
              skills: userSkills,
              dashboardMode: isMuslimStudent(userProfile.religion) ? 'muslim' : 'universal'
            },
            updated_at: new Date().toISOString()
          });

        if (upsertError) throw upsertError;
        // Let the "building your path" animation play briefly.
        timer = setTimeout(finish, 3000);
      } catch (err: any) {
        console.error("Persistence failed:", err);
        if (cancelled) return;
        addToast(
          isMuslimStudent(userProfile.religion)
            ? "Sinkronisasi gagal. Menggunakan storan tempatan."
            : "Database sync failed. Your progress is saved on this device.",
          "info"
        );
        finish();
      }
    };
    persistData();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      // Allow a retry if this run was interrupted (e.g. StrictMode remount).
      persistStartedRef.current = false;
    };
  }, [step, userProfile, results, userStatus, lifeVision, userSkills, user?.id, addToast]);

  // ─── BACK NAVIGATION ───
  const previousStep = (): OnboardingStep | null => {
    switch (step) {
      case 'personalInfo': return 'welcome';
      case 'lifeGoals': return 'results';
      case 'goalSelection': return 'lifeGoals';
      case 'careerPathSelection': return 'goalSelection';
      case 'skillSelection': return goal && CAREER_GOALS.includes(goal) ? 'careerPathSelection' : 'goalSelection';
      case 'userStatus': return 'skillSelection';
      default: return null;
    }
  };
  const backTarget = previousStep();

  // ─── RENDER ───
  const renderStep = () => {
    switch (step) {
      case 'welcome': 
        return <WelcomeStep onStart={() => setStep('personalInfo')} />;
      
      case 'personalInfo': 
        return (
          <PersonalInfoStep 
            onComplete={handlePersonalInfoComplete} 
            onSkip={handlePersonalInfoSkip} 
            initialValues={userProfile ?? (registeredName ? { name: registeredName } : undefined)}
          />
        );
      
      case 'assessment': 
        return (
          <AssessmentStep 
            onComplete={handleAssessmentComplete} 
            onSkip={handleSkipAssessment}
            // Pass mode so assessment can show culturally appropriate questions if needed
            // e.g. Muslim students might see questions framed with Islamic context
          />
        );
      
      case 'loading': 
        return <LoadingComponent isMuslim={isMuslim} />;
      
      case 'results': 
        return results ? (
          <ResultsStep 
            results={results} 
            onRestart={() => { setError(null); setStep('assessment'); }} 
            onNext={() => setStep('lifeGoals')} 
          />
        ) : (
          <LoadingComponent isMuslim={isMuslim} />
        );
      
      case 'lifeGoals': 
        return (
          <LifeGoalsStep 
            initialVision={lifeVision}
            onComplete={handleLifeGoalsComplete} 
            onSkip={() => handleLifeGoalsComplete({ 
              vision: '', mission: '', wisdomGoal: '', knowledgeGoal: '', 
              careerFinanceGoal: '', healthFitnessGoal: '', socialCommGoal: '' 
            })} 
          />
        );
      
      case 'goalSelection': 
        return <GoalSelectionStep initialGoal={goal} onComplete={handleGoalSelectionComplete} />;
      
      case 'careerPathSelection': 
        return results ? (
          <CareerPathSelectionStep results={results} initialSelected={selectedCareers} onComplete={handleCareerPathComplete} />
        ) : (
          <LoadingComponent isMuslim={isMuslim} />
        );
      
      case 'skillSelection': 
        return (results && goal) ? (
          <SkillSelectionStep 
            onComplete={handleSkillSelectionComplete} 
            personalityType={results.personalityType} 
            goal={goal} 
            selectedCareers={selectedCareers} 
            initialSelected={userSkills}
          />
        ) : (
          <LoadingComponent isMuslim={isMuslim} />
        );
      
      case 'userStatus': 
        return <UserStatusStep onComplete={handleUserStatusComplete} />;
      
      case 'generating': 
        return <GeneratingDashboardStep isMuslim={isMuslim} />;
      
      default: 
        return <WelcomeStep onStart={() => setStep('personalInfo')} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--card)] rounded-3xl shadow-lg p-6 md:p-10 border border-[var(--border)]">
      {backTarget && (
        <button
          type="button"
          onClick={() => { setError(null); setStep(backTarget); }}
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        >
          <span aria-hidden="true">←</span> Back
        </button>
      )}
      {error && (step === 'results' || step === 'assessment') && (
        <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:text-red-200 px-4 py-3 rounded-md mb-4" role="alert">
          {error}
        </div>
      )}
      {renderStep()}
    </div>
  );
};

// ─── LOADING COMPONENT (bilingual) ───
interface LoadingProps {
  isMuslim?: boolean | null;
}

const LoadingComponent: React.FC<LoadingProps> = ({ isMuslim }) => (
  <div className="text-center py-20 flex flex-col items-center justify-center">
    <svg className="animate-spin h-12 w-12 text-[var(--primary)] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <h2 className="text-2xl font-bold text-[var(--foreground)]">
      {isMuslim ? 'Analisis Harmony sedang berjalan...' : 'Harmony Analysis in Progress...'}
    </h2>
    {isMuslim && (
      <p className="text-sm text-[var(--muted)] mt-2 font-arabic">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </p>
    )}
  </div>
);

export default OnboardingFlow;
