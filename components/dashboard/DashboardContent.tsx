
import React from 'react';
import HeroSection from './HeroSection';
import QuickActions from './QuickActions';
import CommunityHighlightsSection from './CommunityHighlightsSection';
import { AnalysisResult, Course, DashboardView, UserProfile } from '../../types';
import QuestBanner from './game/QuestBanner';
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
  isMuslim?: boolean;
  onNavigate?: (view: DashboardView) => void;
}

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-4 my-2">
    <div className="hla-gold-divider flex-1" />
    <h3
      className="text-xs uppercase tracking-[0.25em] flex-shrink-0 px-1"
      style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </h3>
    <div className="hla-gold-divider flex-1" />
  </div>
);

const DashboardContent: React.FC<DashboardContentProps> = (props) => {
  const {
    userProfile,
    userResults,
    onQuickAction,
    isMuslim = false,
    onNavigate,
  } = props;

  return (
    <main
      className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(13,27,42,0.9), transparent), #0a0a0f',
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Hero */}
        <HeroSection userProfile={userProfile} userResults={userResults} />

        {/* Quest shortcut */}
        <QuestBanner isMuslim={isMuslim} onOpenQuestMap={() => onNavigate?.('quest-map')} />

        {/* Quick Actions + Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <QuickActions onActionClick={onQuickAction} />
          </div>
          <div className="md:col-span-4">
            <GamificationWidget />
          </div>
        </div>

        {/* Daily Routine */}
        <SectionHeading>Daily Schedule</SectionHeading>
        <DailyRoutineTable religion={userProfile.religion} />

        {/* Wellness Grid */}
        <SectionHeading>Wellness Trackers</SectionHeading>
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

        {/* Deep Work */}
        <SectionHeading>Deep Work Zone</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmotionTrackerSection />
          <TodoListSection />
        </div>

        {/* Community */}
        <SectionHeading>Community</SectionHeading>
        <CommunityHighlightsSection />

      </div>
    </main>
  );
};

export default DashboardContent;
