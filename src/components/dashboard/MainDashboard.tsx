import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import StudyPlanner from './StudyPlanner';
import ProfilePage from './ProfilePage';
import AIChatModal from './AIChatModal';
import AnimatedBackground from '../AnimatedBackground';
import { INTELLIGENCE_TYPES } from '../../constants/intelligenceData';
import type { UserProfile, AnalysisResult, UserStatus, LifeVision, IntelligenceResult } from '../../types';

interface MainDashboardProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  selectedSkills: string[];
  userStatus: UserStatus;
  lifeVision: LifeVision;
  intelligenceResult: IntelligenceResult | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  userProfile,
  userResults,
  selectedSkills,
  userStatus,
  lifeVision,
  intelligenceResult,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const intelligenceTypeName = intelligenceResult
    ? INTELLIGENCE_TYPES[intelligenceResult.dominantType]?.name
    : undefined;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome
            userProfile={userProfile}
            userResults={userResults}
            userStatus={userStatus}
            lifeVision={lifeVision}
            intelligenceResult={intelligenceResult}
          />
        );
      case 'planner':
        return <StudyPlanner />;
      case 'goals':
        return (
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Goals</h2>
            <p className="text-muted-foreground">Set and track your life goals here. Coming soon!</p>
          </div>
        );
      case 'progress':
        return (
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Progress Tracking</h2>
            <p className="text-muted-foreground">View detailed analytics of your journey. Coming soon!</p>
          </div>
        );
      case 'learn':
        return (
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Learning Hub</h2>
            <p className="text-muted-foreground">Access courses and resources. Coming soon!</p>
          </div>
        );
      case 'achievements':
        return (
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Achievements</h2>
            <p className="text-muted-foreground">View your badges and milestones. Coming soon!</p>
          </div>
        );
      case 'profile':
        return (
          <ProfilePage
            userProfile={userProfile}
            selectedSkills={selectedSkills}
            intelligenceResult={intelligenceResult}
          />
        );
      case 'settings':
        return (
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">Customize your experience. Coming soon!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AnimatedBackground />
      <Sidebar
        userProfile={userProfile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <AIChatModal userName={userProfile.name} intelligenceType={intelligenceTypeName} />
    </div>
  );
};

export default MainDashboard;
