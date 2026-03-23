import React, { useState } from 'react';
import HeaderBar from './HeaderBar';
import SidebarNav from './SidebarNav';
import DashboardContent from './DashboardContent';
import HarmonyAIChat from './HarmonyAIChat';
import AdminPanel from './sections/AdminPanel';
import {
  AnalysisResult, Course, DashboardView, DashboardMode, Product,
  UserStatus, AnonymousPost, PaymentMethod, SubscriptionPlan,
  Transaction, UserProfile, LifeVision,
  StartHereProfile, StudentLearningPath,
} from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useChat } from '../../contexts/ChatContext';
import SupportModal from './SupportModal';
import LeaderboardSection from './gamification/LeaderboardSection';
import BadgesSection from './gamification/BadgesSection';
import { MOCK_ANONYMOUS_POSTS, SUBSCRIPTION_PLANS, MOCK_TRANSACTIONS, MOCK_FULL_COURSE } from '../../constants';
// Legacy Page Imports
import WisdomPage from './pages/WisdomPage';
import KnowledgePage from './pages/KnowledgePage';
import HealthPage from './pages/HealthPage';
import FinancialPage from './pages/FinancialPage';
import BusinessPage from './pages/BusinessPage';
import FitnessPage from './pages/FitnessPage';
import CommunicationPage from './pages/CommunicationPage';
import BehaviourPage from './pages/BehaviourPage';
import PracticeHubPage from './pages/PracticeHubPage';
import ProfilePage from './pages/ProfilePage';
// 7 Dimensions Page Imports
import PhysicalPage from './pages/dimensions/PhysicalPage';
import EmotionalPage from './pages/dimensions/EmotionalPage';
import SocialDimensionPage from './pages/dimensions/SocialPage';
import IntellectualPage from './pages/dimensions/IntellectualPage';
import SpiritualPage from './pages/dimensions/SpiritualPage';
import EnvironmentalPage from './pages/dimensions/EnvironmentalPage';
import VocationalPage from './pages/dimensions/VocationalPage';
import SocialImpactProjectsPage from './pages/dimensions/SocialImpactProjectsPage';
import SunnahModulePage from './pages/dimensions/SunnahModulePage';
import SchoolSubjectsPage from './pages/dimensions/SchoolSubjectsPage';
// New Learning Path Pages
import StartHerePage from './pages/StartHerePage';
import MyPathPage from './pages/MyPathPage';
import LessonViewerPage from './pages/LessonViewerPage';
// Other Page Imports
import LanguageLabPage from './pages/LanguageLabPage';
import IdeaWallPage from './pages/IdeaWallPage';
import RealWorldPage from './pages/RealWorldPage';
import CommunitySpacePage from './pages/CommunitySpacePage';
import ThePathPage from './pages/ThePathPage';
import CoursePlayer from './lms/CoursePlayer';
import StudentDashboard from './pages/StudentDashboard';
import NotebookPage from './pages/NotebookPage';
// Modal Imports
import CourseCreatorModal from './CourseCreatorModal';
import PaymentModal from './PaymentModal';
import CheckoutModal from './CheckoutModal';
import PlanSelectionModal from './PlanSelectionModal';
import RequestHelpModal from './RequestHelpModal';
import DonateModal from './DonateModal';
/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface MainDashboardProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  selectedSkills: string[];
  userStatus: UserStatus;
  lifeVision: LifeVision;
  onProfileUpdate: (profile: UserProfile) => void;
  dashboardMode: DashboardMode;
}
interface FullPageWrapperProps {
  children: React.ReactNode;
  title: string;
}
/* ═══════════════════════════════════════════════
   HELPER: Dimension titles based on dashboard mode
   ═══════════════════════════════════════════════ */
const MUSLIM_TITLES: Partial<Record<DashboardView, string>> = {
  'physical': 'Jasad — Kekuatan Fizikal',
  'emotional': 'Qalb — Pengurusan Emosi',
  'social': 'Suhbah — Hubungan Sosial',
  'intellectual': 'Aql — Kecerdasan & Ilmu',
  'spiritual': 'Ruh — Kesedaran Spiritual',
  'environmental': "Bi'ah — Kelestarian Alam",
  'vocational': 'Rizq — Kemahiran & Kerjaya',
  'sunnah-module': 'Modul Sunnah Nabi ﷺ',
  'school-subjects': 'Akademi Sekolah',
};
const UNIVERSAL_TITLES: Partial<Record<DashboardView, string>> = {
  'physical': 'Body — Physical Wellness',
  'emotional': 'Heart — Emotional Intelligence',
  'social': 'Tribe — Social Wellness',
  'intellectual': 'Mind — Intellectual Growth',
  'spiritual': 'Spirit — Inner Awareness',
  'environmental': 'Planet — Environmental Awareness',
  'vocational': 'Wealth — Skills & Career',
  'wellness-module': 'Wellness & Mindfulness',
  'school-subjects': 'School Academy',
};
const getDimensionTitle = (view: DashboardView, mode: DashboardMode): string => {
  const titles = mode === 'muslim' ? MUSLIM_TITLES : UNIVERSAL_TITLES;
  return titles[view] || '';
};
/* ═══════════════════════════════════════════════
   REUSABLE WRAPPER
   ═══════════════════════════════════════════════ */
const FullPageWrapper: React.FC<FullPageWrapperProps> = ({ children, title }) => (
  <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto bg-[var(--background)] min-w-0">
    <div className="max-w-7xl mx-auto">
      {title && (
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-5 sm:mb-8">
          {title}
        </h1>
      )}
      {children}
    </div>
  </main>
);
/* ═══════════════════════════════════════════════
   DEFAULT COURSES
   ═══════════════════════════════════════════════ */
const DEFAULT_COURSES: Course[] = [
  { id: 'c_1', icon: '📐', title: 'Matematik', subtitle: 'Tingkatan 3', progress: 45 },
  { id: 'c_2', icon: '💻', title: 'Python', subtitle: 'for Beginners', progress: 30 },
  { id: 'c_3', icon: '🎨', title: 'Web Design', subtitle: 'Basics', progress: 15 },
  { id: 'c_4', icon: '🔬', title: 'Sains', subtitle: 'Tingkatan 3', progress: 55 },
];
/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
const MainDashboard: React.FC<MainDashboardProps> = ({
  userProfile,
  userResults,
  selectedSkills,
  userStatus,
  lifeVision,
  onProfileUpdate,
  dashboardMode,
}) => {
  const { addToast } = useToast();
  const { toggleChat } = useChat();
  const isMuslim = dashboardMode === 'muslim';
  // ─── Navigation State ───
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('hla_onboarding_done'));
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  // ─── Learning Path State ───
  const [startHereProfile, setStartHereProfile] = useState<StartHereProfile | null>(() => {
    const saved = localStorage.getItem('hla_start_here_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [learningPath, setLearningPath] = useState<StudentLearningPath | null>(() => {
    const saved = localStorage.getItem('hla_learning_path');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeLessonRef, setActiveLessonRef] = useState<{ levelIndex: number; lessonIndex: number } | null>(null);
  // ─── Data State ───
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCourses, setActiveCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [anonymousPosts, setAnonymousPosts] = useState<AnonymousPost[]>(MOCK_ANONYMOUS_POSTS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'pm_1', cardType: 'Visa', last4: '4242', expiryMonth: '12', expiryYear: '2025' },
  ]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  // ─── Modal State ───
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCourseCreatorOpen, setIsCourseCreatorOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isRequestHelpModalOpen, setIsRequestHelpModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  // ─── Handlers ───
  const handleInitiateCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };
  const handleCheckoutSuccess = () => {
    if (!checkoutProduct) return;
    setIsCheckoutOpen(false);
    const emailSlug = userProfile.name.toLowerCase().replace(/\s/g, '.');
    addToast(`Receipt for ${checkoutProduct.name} sent to ${emailSlug}@gmail.com`, 'success');
    if (checkoutProduct.category === 'E-Book' || checkoutProduct.name.includes('Course')) {
      const newCourse: Course = {
        id: `purchased_${Date.now()}`,
        title: checkoutProduct.name,
        subtitle: 'Enrolled via Purchase',
        icon: '🎓',
        progress: 0,
      };
      setActiveCourses((prev) => [newCourse, ...prev]);
      addToast(`Auto-enrolled in ${checkoutProduct.name}! Check 'My Learning'.`, 'info');
    }
    setCheckoutProduct(null);
  };
  const handleAddToCart = (product: Product) => {
    handleInitiateCheckout(product);
  };
  const handleQuickAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'Ask Harmony':
        toggleChat();
        break;
      case 'Keep Learning':
        setCurrentView('student-dashboard');
        break;
      case 'Build Something':
        setIsCourseCreatorOpen(true);
        break;
      case 'Share Your Skills':
        setIsCourseCreatorOpen(true);
        break;
    }
  };
  const handleCourseCreated = (newCourse: Course) => {
    setActiveCourses((prev) => [newCourse, ...prev]);
    setIsCourseCreatorOpen(false);
  };
  const handleSavePaymentMethod = (data: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = { id: `pm_${Date.now()}`, ...data };
    setPaymentMethods((prev) => [...prev, newMethod]);
    setIsPaymentModalOpen(false);
    addToast(`${data.cardType} card ending in ${data.last4} added.`, 'success');
  };
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsPlanModalOpen(false);
    addToast(`Switched to ${plan.name} plan!`, 'success');
  };
  const handlePostAnonymously = (content: string) => {
    const newPost: AnonymousPost = {
      id: `anon_${Date.now()}`,
      content,
      timestamp: 'Just now',
      userId: 'user-current',
    };
    setAnonymousPosts((prev) => [newPost, ...prev]);
    addToast('Your anonymous post has been shared.', 'success');
  };
  const handlePlayCourse = (course: Course) => {
    setActiveCourse(course);
    setCurrentView('course-player');
  };
  // ─── Learning Path Handlers ───
  const handleStartHereComplete = (profile: StartHereProfile, path: StudentLearningPath) => {
    setStartHereProfile(profile);
    setLearningPath(path);
    localStorage.setItem('hla_start_here_profile', JSON.stringify(profile));
    localStorage.setItem('hla_learning_path', JSON.stringify(path));
    addToast('Your learning path is ready! Go to "My Path" to begin.', 'success');
    setCurrentView('my-path');
  };
  const handleOpenLesson = (levelIndex: number, lessonIndex: number) => {
    if (!learningPath) return;
    const lesson = learningPath.levels[levelIndex]?.lessons[lessonIndex];
    if (!lesson || lesson.status === 'locked') return;
    // Mark as in-progress if available
    if (lesson.status === 'available') {
      const updated = { ...learningPath };
      updated.levels[levelIndex].lessons[lessonIndex] = { ...lesson, status: 'in-progress' };
      setLearningPath(updated);
      localStorage.setItem('hla_learning_path', JSON.stringify(updated));
    }
    setActiveLessonRef({ levelIndex, lessonIndex });
    setCurrentView('lesson-viewer');
  };
  const handleLessonComplete = (submission: { type: 'photo' | 'video' | 'text'; content: string }) => {
    if (!learningPath || !activeLessonRef) return;
    const { levelIndex, lessonIndex } = activeLessonRef;
    const updated = { ...learningPath };
    const level = updated.levels[levelIndex];
    level.lessons[lessonIndex] = {
      ...level.lessons[lessonIndex],
      status: 'completed',
      submission: { ...submission, submittedAt: new Date().toISOString() },
    };
    updated.completedLessons = updated.levels.reduce(
      (sum, l) => sum + l.lessons.filter(le => le.status === 'completed').length, 0,
    );
    // Unlock next lesson if available
    if (lessonIndex + 1 < level.lessons.length && level.lessons[lessonIndex + 1].status === 'locked') {
      level.lessons[lessonIndex + 1] = { ...level.lessons[lessonIndex + 1], status: 'available' };
    }
    // Check if level is complete → unlock next level
    const allLessonsComplete = level.lessons.every(l => l.status === 'completed');
    if (allLessonsComplete) {
      level.status = 'completed';
      if (levelIndex + 1 < updated.levels.length) {
        updated.levels[levelIndex + 1].status = 'current';
        updated.levels[levelIndex + 1].lessons[0] = { ...updated.levels[levelIndex + 1].lessons[0], status: 'available' };
        updated.currentLevelIndex = levelIndex + 1;
      }
    }
    setLearningPath(updated);
    localStorage.setItem('hla_learning_path', JSON.stringify(updated));
    setActiveLessonRef(null);
    setCurrentView('my-path');
  };
  const handleParentApproveTask = (levelIndex: number, lessonIndex: number, feedback: string) => {
    if (!learningPath) return;
    const updated = { ...learningPath };
    const lesson = updated.levels[levelIndex].lessons[lessonIndex];
    if (lesson.submission) {
      lesson.submission.parentApproved = true;
      lesson.submission.parentFeedback = feedback;
    }
    setLearningPath(updated);
    localStorage.setItem('hla_learning_path', JSON.stringify(updated));
    addToast('Task approved! Your child will see your feedback.', 'success');
  };
  // ─── Content Router ───
  const renderContent = () => {
    // Admin routes
    if (currentView.startsWith('admin')) {
      return <AdminPanel currentView={currentView} setCurrentView={setCurrentView} />
      {showOnboarding && (
        <OnboardingFlow onComplete={() => { localStorage.setItem('hla_onboarding_done', 'true'); setShowOnboarding(false); }} />
      )};
    }
    // Course player
    if (currentView === 'course-player' && activeCourse) {
      return <CoursePlayer course={activeCourse} onExit={() => setCurrentView('dashboard')} />;
    }
    switch (currentView) {
      // ─── Learning Path System ───
      case 'start-here':
        return (
          <FullPageWrapper title={isMuslim ? 'Mula Di Sini' : 'Start Here'}>
            <StartHerePage
              onComplete={handleStartHereComplete}
              existingProfile={startHereProfile}
            />
          </FullPageWrapper>
        );
      case 'my-path':
        return (
          <FullPageWrapper title="">
            <MyPathPage
              learningPath={learningPath}
              onStartHere={() => setCurrentView('start-here')}
              onOpenLesson={handleOpenLesson}
            />
          </FullPageWrapper>
        );
      case 'lesson-viewer': {
        if (!learningPath || !activeLessonRef) {
          setCurrentView('my-path');
          return null;
        }
        const level = learningPath.levels[activeLessonRef.levelIndex];
        const lesson = level.lessons[activeLessonRef.lessonIndex];
        return (
          <FullPageWrapper title="">
            <LessonViewerPage
              lesson={lesson}
              levelTitle={`Level ${level.number}: ${level.title}`}
              onComplete={handleLessonComplete}
              onBack={() => { setActiveLessonRef(null); setCurrentView('my-path'); }}
            />
          </FullPageWrapper>
        );
      }
      // ─── Gamification ───
      case 'leaderboard':
        return <LeaderboardSection />;
      case 'badges':
        return <BadgesSection />;
      // ─── Profile ───
      case 'profile':
        return (
          <ProfilePage
            userProfile={userProfile}
            userResults={userResults}
            onProfileUpdate={onProfileUpdate}
          />
        );
      // ─── Tools & Features ───
      case 'practice-hub':
        return (
          <FullPageWrapper title="Practice Hub">
            <PracticeHubPage />
          </FullPageWrapper>
        );
      case 'language-lab':
        return (
          <FullPageWrapper title="Polyglot Lab">
            <LanguageLabPage />
          </FullPageWrapper>
        );
      case 'idea-wall':
        return (
          <FullPageWrapper title="">
            <IdeaWallPage />
          </FullPageWrapper>
        );
      case 'notebook':
        return (
          <FullPageWrapper title={isMuslim ? 'Buku Nota Pintar' : 'Smart Notebook'}>
            <NotebookPage />
          </FullPageWrapper>
        );
      case 'real-world':
        return (
          <FullPageWrapper title="">
            <RealWorldPage />
          </FullPageWrapper>
        );
      case 'community-space':
        return (
          <FullPageWrapper title="">
            <CommunitySpacePage />
          </FullPageWrapper>
        );
      case 'the-path':
        return (
          <FullPageWrapper title="">
            <ThePathPage />
          </FullPageWrapper>
        );
      case 'parent-dashboard':
        return (
          <FullPageWrapper title="Dashboard Ibu Bapa">
            <ParentDashboardPage
              userProfile={userProfile}
              learningPath={learningPath}
              onApproveTask={handleParentApproveTask}
            />
          </FullPageWrapper>
        );
      case 'student-dashboard':
        return (
          <FullPageWrapper title={isMuslim ? 'Dashboard Pembelajaran' : 'My Learning Dashboard'}>
            <StudentDashboard
              courses={activeCourses}
              userProfile={userProfile}
              onPlayCourse={handlePlayCourse}
            />
          </FullPageWrapper>
        );
      // ─── 7 Dimensions ───
      case 'physical':
        return (
          <FullPageWrapper title={getDimensionTitle('physical', dashboardMode)}>
            <PhysicalPage />
          </FullPageWrapper>
        );
      case 'emotional':
        return (
          <FullPageWrapper title={getDimensionTitle('emotional', dashboardMode)}>
            <EmotionalPage />
          </FullPageWrapper>
        );
      case 'social':
        return (
          <FullPageWrapper title={getDimensionTitle('social', dashboardMode)}>
            <SocialDimensionPage />
          </FullPageWrapper>
        );
      case 'social-impact':
        return (
          <FullPageWrapper title="Social Impact Projects">
            <SocialImpactProjectsPage />
          </FullPageWrapper>
        );
      case 'intellectual':
        return (
          <FullPageWrapper title={getDimensionTitle('intellectual', dashboardMode)}>
            <IntellectualPage />
          </FullPageWrapper>
        );
      case 'spiritual':
        return (
          <FullPageWrapper title={getDimensionTitle('spiritual', dashboardMode)}>
            <SpiritualPage religion={userProfile.religion} />
          </FullPageWrapper>
        );
      case 'environmental':
        return (
          <FullPageWrapper title={getDimensionTitle('environmental', dashboardMode)}>
            <EnvironmentalPage />
          </FullPageWrapper>
        );
      case 'vocational':
        return (
          <FullPageWrapper title={getDimensionTitle('vocational', dashboardMode)}>
            <VocationalPage />
          </FullPageWrapper>
        );
      // ─── Mode-Specific Routes ───
      case 'sunnah-module':
        return (
          <FullPageWrapper title={getDimensionTitle('sunnah-module', dashboardMode)}>
            <SunnahModulePage />
          </FullPageWrapper>
        );
      case 'school-subjects':
        return (
          <FullPageWrapper title={getDimensionTitle('school-subjects', dashboardMode)}>
            <SchoolSubjectsPage dashboardMode={dashboardMode} userProfile={userProfile} userResults={userResults} />
          </FullPageWrapper>
        );
      case 'wellness-module':
        return (
          <FullPageWrapper title={getDimensionTitle('wellness-module', dashboardMode)}>
            <SpiritualPage religion={userProfile.religion} />
          </FullPageWrapper>
        );
      // ─── Legacy Pages ───
      case 'wisdom':
        return (
          <FullPageWrapper title={isMuslim ? 'Hikmah (Ruh)' : 'Wisdom (Soul)'}>
            <WisdomPage
              initialLifeVision={lifeVision}
              posts={anonymousPosts}
              onPost={handlePostAnonymously}
              onRequestHelp={() => setIsRequestHelpModalOpen(true)}
              onDonate={() => setIsDonateModalOpen(true)}
            />
          </FullPageWrapper>
        );
      case 'knowledge':
        return (
          <FullPageWrapper title={isMuslim ? 'Ilmu (Aql)' : 'Knowledge (Mind)'}>
            <KnowledgePage
              courses={activeCourses}
              selectedSkills={selectedSkills}
              onOpenCourseCreator={() => setIsCourseCreatorOpen(true)}
              onPlayCourse={handlePlayCourse}
            />
          </FullPageWrapper>
        );
      case 'health':
        return (
          <FullPageWrapper title={isMuslim ? 'Sihat (Qalb & Emosi)' : 'Health (Heart & Emotions)'}>
            <HealthPage />
          </FullPageWrapper>
        );
      case 'financial':
        return (
          <FullPageWrapper title={isMuslim ? 'Rizq (Kewangan)' : 'Finance'}>
            <FinancialPage
              onAddToCart={handleAddToCart}
              currentPlan={currentPlan}
              paymentMethods={paymentMethods}
              transactions={transactions}
              onAddPaymentMethod={() => setIsPaymentModalOpen(true)}
              onRemovePaymentMethod={() => {}}
              onChangePlan={() => setIsPlanModalOpen(true)}
            />
          </FullPageWrapper>
        );
      case 'business':
        return (
          <FullPageWrapper title={isMuslim ? 'Rizq (Bisnes & Kerjaya)' : 'Business & Career'}>
            <BusinessPage userResults={userResults} />
          </FullPageWrapper>
        );
      case 'fitness':
        return (
          <FullPageWrapper title={isMuslim ? 'Jasad (Kecergasan)' : 'Fitness & Self-Defense'}>
            <FitnessPage />
          </FullPageWrapper>
        );
      case 'communication':
        return (
          <FullPageWrapper title={isMuslim ? 'Bayan (Komunikasi)' : 'Communication'}>
            <CommunicationPage />
          </FullPageWrapper>
        );
      case 'behaviour':
        return (
          <FullPageWrapper title={isMuslim ? 'Akhlak (Perwatakan)' : 'Behaviour & Profile'}>
            <BehaviourPage userResults={userResults} />
          </FullPageWrapper>
        );
      // ─── Default: Dashboard Home ───
      case 'dashboard':
      default:
        return (
          <DashboardContent
            userProfile={userProfile}
            userResults={userResults}
            selectedSkills={selectedSkills}
            onQuickAction={handleQuickAction}
            activeCourses={activeCourses}
            setCurrentView={setCurrentView}
            learningPath={learningPath}
          />
        );
    }
  };
  // ─── Layout ───
  const isInCoursePlayer = currentView === 'course-player';
  return (
    <div className="hla-dashboard flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {!isInCoursePlayer && (
        <SidebarNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenSupport={() => setIsSupportModalOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          dashboardMode={dashboardMode}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {!isInCoursePlayer && (
          <HeaderBar
            userProfile={userProfile}
            cartItemCount={cart.length}
            onMobileMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        )}
        {renderContent()}
        {!isInCoursePlayer && <HarmonyAIChat />}
        {/* Mobile Bottom Tab Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: '#0a0a0f', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="flex justify-around items-center h-14">
            {[
              { view: 'dashboard' as DashboardView, label: 'Home', icon: '🏠' },
              { view: 'start-here' as DashboardView, label: 'Start', icon: '✨' },
              { view: 'my-path' as DashboardView, label: 'My Path', icon: '🧭' },
              { view: 'community-space' as DashboardView, label: 'Community', icon: '👥' },
              { view: 'profile' as DashboardView, label: 'Profile', icon: '👤' },
            ].map(tab => (
              <button
                key={tab.view}
                onClick={() => setCurrentView(tab.view)}
                className="flex flex-col items-center gap-0.5 px-2 py-1"
                style={{ color: currentView === tab.view ? '#e8c97a' : '#8a8a9a' }}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
      {/* ─── Modals ─── */}
      {isSupportModalOpen && (
        <SupportModal onClose={() => setIsSupportModalOpen(false)} />
      )}
      {isCourseCreatorOpen && (
        <CourseCreatorModal
          onClose={() => setIsCourseCreatorOpen(false)}
          onCourseCreated={handleCourseCreated}
        />
      )}
      {isRequestHelpModalOpen && (
        <RequestHelpModal onClose={() => setIsRequestHelpModalOpen(false)} />
      )}
      {isDonateModalOpen && (
        <DonateModal onClose={() => setIsDonateModalOpen(false)} />
      )}
      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={handleSavePaymentMethod}
        />
      )}
      {isPlanModalOpen && (
        <PlanSelectionModal
          currentPlanId={currentPlan.id}
          plans={SUBSCRIPTION_PLANS}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectPlan={handleSelectPlan}
        />
      )}
      {isCheckoutOpen && checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};
export default MainDashboard;
