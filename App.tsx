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
import { SpinnerIcon } from './components/dashboard/Icons';
import { storage } from './utils/storageUtils';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const { user, loading, isPasswordRecovery, signOut } = useAuth();
  const userId = user?.id ?? null;
  // True while we look up whether this user already finished onboarding
  // (prevents a flash of the onboarding wizard for returning users).
  const [profileLoading, setProfileLoading] = useState(true);
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

  const applySavedData = (savedData: any) => {
    setUserProfile(savedData.profile);
    setUserResults(savedData.results);
    setUserStatus(savedData.status);
    setLifeVision(savedData.vision);
    setUserSkills(Array.isArray(savedData.skills) ? savedData.skills : []);
    // ═══ Load saved dashboard mode, or derive from religion ═══
    setDashboardMode(
      savedData.dashboardMode ||
      (savedData.profile?.religion ? (isMuslimStudent(savedData.profile.religion) ? 'muslim' : 'universal') : 'universal')
    );
    setIsOnboardingComplete(true);
  };

  const isCompleteRecord = (d: any) =>
    Boolean(d && d.profile && d.results && d.status && d.vision);

  // Load existing data for the authenticated user: local cache first, then the
  // Supabase profile (so a returning user on a new device skips onboarding).
  useEffect(() => {
    if (!userId) {
      setIsOnboardingComplete(false);
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setProfileLoading(true);
      const savedData = storage.get(`user_data_${userId}`);
      if (isCompleteRecord(savedData)) {
        applySavedData(savedData);
        setProfileLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_data')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        const remote = data?.profile_data;
        if (isCompleteRecord(remote)) {
          storage.set(`user_data_${userId}`, remote);
          applySavedData(remote);
        } else {
          setIsOnboardingComplete(false);
        }
      } catch (err) {
        console.error('[App] Could not load profile from Supabase:', err);
        if (!cancelled) setIsOnboardingComplete(false);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

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
        const nextData = { ...currentData, profile: updatedProfile };
        storage.set(`user_data_${user.id}`, nextData);
        // Best-effort sync so the change follows the user to other devices.
        supabase
          .from('profiles')
          .upsert({ id: user.id, full_name: updatedProfile.name, profile_data: nextData, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[App] Profile sync failed:', error); });
    }
  };

  if (loading || (user && profileLoading)) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--background)]">
            <SpinnerIcon className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="font-black text-xl text-[var(--foreground)] animate-pulse">Syncing Academy Records...</h2>
        </div>
    );
  }

  if (!user || isPasswordRecovery) {
    return (
        <>
            <ToastContainer />
            {/* key forces a fresh form state when switching into/out of recovery */}
            <AuthScreen key={isPasswordRecovery ? 'recovery' : 'auth'} recoveryMode={isPasswordRecovery} />
        </>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] transition-colors duration-300">
      <ToastContainer />

      {isOnboardingComplete && userProfile && userResults && userStatus && lifeVision ? (
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
      ) : (
        <div className="flex flex-col min-h-screen">
            {/* Theme toggle only during onboarding: the dashboard uses its own fixed
                dark-gold palette and the floating button overlapped its header avatar. */}
            <div className="absolute top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <header className="w-full max-w-4xl mx-auto mb-8 text-center">
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">Harmony Lifestyle Academy</h1>
                  <p className="text-lg text-[var(--muted)] mt-2">You're signed in — let's set up your personal learning path.</p>
              </header>
              <main className="w-full">
                  <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
              </main>
            </div>
            <footer className="flex-shrink-0 w-full py-6 border-t border-[var(--border)]">
              <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
                <p className="text-sm text-[var(--muted)]">
                  Signed in as <span className="font-semibold text-[var(--foreground)]">{user.email}</span>
                  {' · '}
                  <button type="button" onClick={signOut} className="underline hover:text-[var(--primary)] transition-colors">
                    Not you? Sign out
                  </button>
                </p>
                <p className="text-sm text-[var(--muted)] mt-2">&copy; {new Date().getFullYear()} Harmony Lifestyle Academy. All rights reserved.</p>
              </div>
            </footer>
        </div>
      )}
    </div>
  );
};

export default App;
