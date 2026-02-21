
import React from 'react';
import HeroSection from './HeroSection';
import QuickActions from './QuickActions';
import CommunityHighlightsSection from './CommunityHighlightsSection';
import { AnalysisResult, Course, UserProfile } from '../../types';
import EmotionTrackerSection from './sections/EmotionTrackerSection'; 
import TodoListSection from './sections/TodoListSection'; 
import GamificationWidget from './gamification/GamificationWidget';
import LifeBalanceWheel from './widgets/LifeBalanceWheel';
import DailyCheckIn from './widgets/DailyCheckIn';
import HabitTrackerWidget from './widgets/HabitTrackerWidget';
import DailyRoutineTable from './widgets/DailyRoutineTable';

interface DashboardContentProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  selectedSkills: string[];
  onQuickAction: (action: string) => void;
  activeCourses: Course[];
}

const DashboardContent: React.FC<DashboardContentProps> = (props) => {
  const {
    userProfile,
    userResults,
    onQuickAction,
  } = props;

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[var(--background)]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Section: Hero */}
        <HeroSection userProfile={userProfile} userResults={userResults} />
        
        {/* Quick Actions + Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <QuickActions onActionClick={onQuickAction}/>
          </div>
          <div className="md:col-span-4">
            <GamificationWidget />
          </div>
        </div>

        {/* MAIN: Daily Routine Table (Full Width) */}
        <DailyRoutineTable />

        {/* Secondary Grid: Check-in + Habits + Balance */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <DailyCheckIn />
          </div>
          <div className="md:col-span-4">
            <HabitTrackerWidget />
          </div>
          <div className="md:col-span-4">
            <LifeBalanceWheel />
          </div>
        </div>

        {/* Deep Work Section */}
        <h3 className="text-xl font-bold text-[var(--foreground)] mt-4 mb-2">Deep Work Zone</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmotionTrackerSection />
          <TodoListSection />
        </div>

        {/* Community */}
        <CommunityHighlightsSection />

      </div>
    </main>
  );
};

export default DashboardContent;
