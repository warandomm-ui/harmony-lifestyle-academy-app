import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import AnimatedBackground from '../AnimatedBackground';
import type { UserProfile, AnalysisResult, UserStatus, LifeVision } from '../../types';

interface MainDashboardProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  selectedSkills: string[];
  userStatus: UserStatus;
  lifeVision: LifeVision;
  onProfileUpdate: (profile: UserProfile) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  userProfile,
  userResults,
  selectedSkills,
  userStatus,
  lifeVision,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome
            userProfile={userProfile}
            userResults={userResults}
            userStatus={userStatus}
            lifeVision={lifeVision}
          />
        );
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
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">Selected Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default MainDashboard;
