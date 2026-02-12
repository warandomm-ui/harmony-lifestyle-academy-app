import React, { useState, useEffect } from 'react';
import OnboardingFlow from '../components/OnboardingFlow';
import ThemeToggle from '../components/ThemeToggle';
import MainDashboard from '../components/dashboard/MainDashboard';
import AnimatedBackground from '../components/AnimatedBackground';
import ToastContainer from '../components/ToastContainer';
import { LinkedInIcon } from '../components/dashboard/Icons';
import type { AnalysisResult, UserStatus, UserProfile, LifeVision, IntelligenceResult } from '../types';
import { DEFAULT_ANALYSIS_RESULT } from '../constants';

const STORAGE_KEY_PROFILE = 'hla_user_profile';
const STORAGE_KEY_RESULTS = 'hla_results';
const STORAGE_KEY_STATUS = 'hla_status';
const STORAGE_KEY_VISION = 'hla_vision';
const STORAGE_KEY_SKILLS = 'hla_skills';
const STORAGE_KEY_ONBOARDING = 'hla_onboarding_complete';
const STORAGE_KEY_INTELLIGENCE = 'hla_intelligence';

const Index: React.FC = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ONBOARDING) === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, createdAt: new Date(parsed.createdAt) };
    }
    return null;
  });

  const [userResults, setUserResults] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RESULTS);
    return saved ? JSON.parse(saved) : null;
  });

  const [userStatus, setUserStatus] = useState<UserStatus | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATUS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, lastActive: new Date(parsed.lastActive) };
    }
    return null;
  });

  const [lifeVision, setLifeVision] = useState<LifeVision | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VISION);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, createdAt: new Date(parsed.createdAt), updatedAt: new Date(parsed.updatedAt) };
    }
    return null;
  });

  const [userSkills, setUserSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SKILLS);
    return saved ? JSON.parse(saved) : [];
  });

  const [intelligenceResult, setIntelligenceResult] = useState<IntelligenceResult | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INTELLIGENCE);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userProfile) localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    if (userResults) localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(userResults));
    if (userStatus) localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(userStatus));
    if (lifeVision) localStorage.setItem(STORAGE_KEY_VISION, JSON.stringify(lifeVision));
    if (userSkills.length) localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(userSkills));
    if (intelligenceResult) localStorage.setItem(STORAGE_KEY_INTELLIGENCE, JSON.stringify(intelligenceResult));
    localStorage.setItem(STORAGE_KEY_ONBOARDING, String(isOnboardingComplete));
  }, [userProfile, userResults, userStatus, lifeVision, userSkills, intelligenceResult, isOnboardingComplete]);

  const handleOnboardingComplete = (
    profile: UserProfile,
    results: AnalysisResult,
    status: UserStatus,
    vision: LifeVision,
    skills: string[],
    intelligence: IntelligenceResult
  ) => {
    setUserProfile(profile);
    setUserResults(results);
    setUserStatus(status);
    setLifeVision(vision);
    setUserSkills(skills);
    setIntelligenceResult(intelligence);
    setIsOnboardingComplete(true);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleReset = () => {
    localStorage.clear();
    setIsOnboardingComplete(false);
    setUserProfile(null);
    setUserResults(null);
    setUserStatus(null);
    setLifeVision(null);
    setUserSkills([]);
    setIntelligenceResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      <ToastContainer />
      <AnimatedBackground />

      {!isOnboardingComplete && (
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}

      {isOnboardingComplete && userProfile && userResults && userStatus && lifeVision ? (
        <MainDashboard
          userProfile={userProfile}
          userResults={userResults}
          selectedSkills={userSkills}
          userStatus={userStatus}
          lifeVision={lifeVision}
          intelligenceResult={intelligenceResult}
          onProfileUpdate={handleProfileUpdate}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          <main className="w-full flex-grow flex flex-col justify-center">
            <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
          </main>
          <footer className="flex-shrink-0 w-full py-6 border-t border-border glass-card">
            <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
              <div className="flex justify-center items-center space-x-4">
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <LinkedInIcon className="h-6 w-6" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                &copy; {new Date().getFullYear()} Harmony Lifestyle Academy. All rights reserved.
              </p>
              <button onClick={handleReset} className="text-xs text-muted-foreground/50 mt-2 hover:text-destructive underline">
                Reset App Data
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Index;
