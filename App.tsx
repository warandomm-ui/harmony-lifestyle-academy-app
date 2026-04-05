import React, { useState, useEffect } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import { isMuslimStudent } from './components/OnboardingFlow';
import ThemeToggle from './components/ThemeToggle';
import MainDashboard from './components/dashboard/MainDashboard';
import AuthScreen from './components/AuthScreen';
import type { AnalysisResult, UserStatus, UserProfile, LifeVision, DashboardMode } from './types';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';
import ToastContainer from './components/ToastContainer';
import { GamificationProvider } from './contexts/GamificationContext';
import { StudyBuddyProvider } from './contexts/StudyBuddyContext';
import { HarmonyConnectorProvider } from './contexts/HarmonyConnectorContext';
import { LinkedInIcon, SpinnerIcon } from './components/dashboard/Icons';
import { storage } from './utils/storageUtils';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userResults, setUserResults] = useState<AnalysisResult | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lifeVision, setLifeVision] = useState<LifeVision | null>(null);
  
  // ═══ NEW: Dashboard mode — 'muslim' or 'universal' ═══
  // Determined by religion selection during registration
  // Stored in localStorage and Supabase for persistence
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('universal');

  // Load existing data for the authenticated user
  useEffect(() => {
    if (user) {
      const savedData = storage.get(`user_data_${user.id}`);
      if (savedData) {
        setUserProfile(savedData.profile);
        setUserResults(savedData.results);
        setUserStatus(savedData.status);
        setLifeVision(savedData.vision);
        setUserSkills(savedData.skills);
        // ═══ Load saved dashboard mode, or derive from religion ═══
        setDashboardMode(
          savedData.dashboardMode || 
          (savedData.profile?.religion ? (isMuslimStudent(savedData.profile.religion) ? 'muslim' : 'universal') : 'universal')
        );
        setIsOnboardingComplete(true);
      } else {
        setIsOnboardingComplete(false);
      }
    }
  }, [user]);

  const handleOnboardingComplete = (
    profile: UserProfile,
    results: AnalysisResult,
    status: UserStatus,
    vision: LifeVision,
    skills: string[]
  ) => {
    // ═══ Determine dashboard mode from religion ═══
    const mode: DashboardMode = isMuslimStudent(profile.religion) ? 'muslim' : 'universal';
    
    if (user) {
        const data = { profile, results, status, vision, skills, dashboardMode: mode };
        storage.set(`user_data_${user.id}`, data);
    }
    setUserProfile(profile);
    setUserResults(results);
    setUserStatus(status);
    setLifeVision(vision);
    setUserSkills(skills);
    setDashboardMode(mode);
    setIsOnboardingComplete(true);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    if (user) {
        const currentData = storage.get(`user_data_${user.id}`);
        storage.set(`user_data_${user.id}`, { ...currentData, profile: updatedProfile });
    }
  };

  if (loading) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--background)]">
            <SpinnerIcon className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="font-black text-xl text-[var(--foreground)] animate-pulse">Syncing Academy Records...</h2>
        </div>
    );
  }

  if (!user) {
    return (
        <>
            <ToastContainer />
            <AuthScreen />
        </>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] transition-colors duration-300">
      <ToastContainer />
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {isOnboardingComplete && userProfile && userResults && userStatus && lifeVision ? (
        <HarmonyConnectorProvider>
        <ChatProvider>
          <GamificationProvider>
            <StudyBuddyProvider>
              {/* ═══ PASS dashboardMode to MainDashboard ═══ */}
              <MainDashboard 
                userProfile={userProfile}
                userResults={userResults} 
                selectedSkills={userSkills}
                userStatus={userStatus}
                lifeVision={lifeVision}
                onProfileUpdate={handleProfileUpdate}
                dashboardMode={dashboardMode}
              />
            </StudyBuddyProvider>
          </GamificationProvider>
        </ChatProvider>
        </HarmonyConnectorProvider>
      ) : (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <header className="w-full max-w-4xl mx-auto mb-8 text-center">
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">Harmony Lifestyle Academy</h1>
                  <p className="text-lg text-[var(--muted)] mt-2">authenticated and ready for your glow up.</p>
              </header>
              <main className="w-full">
                  <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
              </main>
            </div>
            <footer className="flex-shrink-0 w-full py-6 border-t border-[var(--border)]">
              <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
                <div className="flex justify-center items-center space-x-4">
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                        <LinkedInIcon className="h-6 w-6" />
                    </a>
                </div>
                <p className="text-sm text-[var(--muted)] mt-4">&copy; {new Date().getFullYear()} Harmony Lifestyle Academy. All rights reserved.</p>
              </div>
            </footer>
        </div>
      )}
    </div>
  );
};

export default App;
