
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
        
        {/* Smart Grid Layout (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Column 1: Daily Focus & Habits (Left) */}
            <div className="md:col-span-12 lg:col-span-4 space-y-6 flex flex-col">
                <div className="flex-shrink-0">
                    <DailyCheckIn />
                </div>
                <div className="flex-grow">
                    <HabitTrackerWidget />
                </div>
            </div>

            {/* Column 2: Core Insights & Quick Actions (Center) */}
            <div className="md:col-span-12 lg:col-span-5 space-y-6">
                <div className="h-full flex flex-col gap-6">
                    <div className="flex-shrink-0">
                        <QuickActions onActionClick={onQuickAction}/>
                    </div>
                    <div className="flex-grow">
                        <LifeBalanceWheel />
                    </div>
                </div>
            </div>

            {/* Column 3: Progress & Community (Right) */}
            <div className="md:col-span-12 lg:col-span-3 space-y-6 flex flex-col">
                <div className="flex-shrink-0">
                    <GamificationWidget />
                </div>
                <div className="flex-grow">
                    <CommunityHighlightsSection />
                </div>
            </div>
        </div>

        {/* Deep Work Section */}
        <h3 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-2">Deep Work Zone</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-full">
            <EmotionTrackerSection />
          </div>
          <div className="h-full">
            <TodoListSection />
          </div>
        </div>

      </div>
    </main>
  );
};

export default DashboardContent;
