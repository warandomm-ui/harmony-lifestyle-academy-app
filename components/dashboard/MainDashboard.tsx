import React, { useState, useEffect, useCallback } from 'react';
import HeaderBar from './HeaderBar';
import SidebarNav from './SidebarNav';
import DashboardContent from './DashboardContent';
import HarmonyAIChat from './HarmonyAIChat';
import AdminPanel from './sections/AdminPanel';
import {
  AnalysisResult, Course, DashboardView, DashboardMode, Product,
  UserStatus, AnonymousPost, PaymentMethod, SubscriptionPlan,
  Transaction, UserProfile, LifeVision,
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
import PeriodicTablePage from './pages/PeriodicTablePage';
// Other Page Imports
import LanguageLabPage from './pages/LanguageLabPage';
import IdeaWallPage from './pages/IdeaWallPage';
import RealWorldPage from './pages/RealWorldPage';
import CommunitySpacePage from './pages/CommunitySpacePage';
import ThePathPage from './pages/ThePathPage';
import CoursePlayer from './lms/CoursePlayer';
import StudentDashboard from './pages/StudentDashboard';
import NotebookPage from './pages/NotebookPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import StartHerePage from './pages/StartHerePage';
import MyPathPage from './pages/MyPathPage';
import LessonPage from './pages/LessonPage';
// Modal Imports
import CourseCreatorModal from './CourseCreatorModal';
import PaymentModal from './PaymentModal';
import CheckoutModal from './CheckoutModal';
import PlanSelectionModal from './PlanSelectionModal';
import RequestHelpModal from './RequestHelpModal';
import DonateModal from './DonateModal';
/* âââââââââââââââââââââââââââââââââââââââââââââââ
   TYPES
   âââââââââââââââââââââââââââââââââââââââââââââââ */
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
/* âââââââââââââââââââââââââââââââââââââââââââââââ
   HELPER: Dimension titles based on dashboard mode
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const MUSLIM_TITLES: Partial<Record<DashboardView, string>> = {
  'physical': 'Jasad â Kekuatan Fizikal',
  'emotional': 'Qalb â Pengurusan Emosi',
  'social': 'Suhbah â Hubungan Sosial',
  'intellectual': 'Aql â Kecerdasan & Ilmu',
  'spiritual': 'Ruh â Kesedaran Spiritual',
  'environmental': "Bi'ah â Kelestarian Alam",
  'vocational': 'Rizq â Kemahiran & Kerjaya',
  'sunnah-module': 'Modul Sunnah Nabi ï·º',
  'school-subjects': 'Akademi Sekolah',
};
const UNIVERSAL_TITLES: Partial<Record<DashboardView, string>> = {
  'physical': 'Body â Physical Wellness',
  'emotional': 'Heart â Emotional Intelligence',
  'social': 'Tribe â Social Wellness',
  'intellectual': 'Mind â Intellectual Growth',
  'spiritual': 'Spirit â Inner Awareness',
  'environmental': 'Planet â Environmental Awareness',
  'vocational': 'Wealth â Skills & Career',
  'wellness-module': 'Wellness & Mindfulness',
  'school-subjects': 'School Academy',
};
const getDimensionTitle = (view: DashboardView, mode: DashboardMode): string => {
  const titles = mode === 'muslim' ? MUSLIM_TITLES : UNIVERSAL_TITLES;
  return titles[view] || '';
};
/* âââââââââââââââââââââââââââââââââââââââââââââââ
   REUSABLE WRAPPER
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const FullPageWrapper: React.FC<FullPageWrapperProps> = ({ children, title }) => (
  <main className="flex-1 p-3 sm:p-5 md:p-8 pb-20 md:pb-8 overflow-y-auto bg-[var(--background)] min-w-0">
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
/* âââââââââââââââââââââââââââââââââââââââââââââââ
   DEFAULT COURSES
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const DEFAULT_COURSES: Course[] = [
  { id: 'c_1', icon: 'ð', title: 'Matematik', subtitle: 'Tingkatan 3', progress: 45 },
  { id: 'c_2', icon: 'ð»', title: 'Python', subtitle: 'for Beginners', progress: 30 },
  { id: 'c_3', icon: 'ð¨', title: 'Web Design', subtitle: 'Basics', progress: 15 },
  { id: 'c_4', icon: 'ð¬', title: 'Sains', subtitle: 'Tingkatan 3', progress: 55 },
];
/* âââââââââââââââââââââââââââââââââââââââââââââââ
   MAIN COMPONENT
   âââââââââââââââââââââââââââââââââââââââââââââââ */
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
  // âââ Navigation State âââ
  // ——— Hash-based URL Routing ———
  const getViewFromHash = useCallback((): DashboardView => {
    const hash = window.location.hash.replace('#', '').replace('/', '');
    const validViews: string[] = [
      'dashboard','leaderboard','badges','profile','practice-hub','language-lab',
      'idea-wall','notebook','real-world','community-space','the-path','start-here',
      'my-path','lesson','parent-dashboard','student-dashboard',
      'physical','emotional','social','social-impact','intellectual','spiritual',
      'environmental','vocational','sunnah-module','school-subjects','wellness-module',
      'wisdom','knowledge','health','financial','business','fitness','communication','behaviour',
      'periodic-table'
    ];
    return validViews.includes(hash) ? (hash as DashboardView) : 'dashboard';
  }, []);

  const [currentView, setCurrentView] = useState<DashboardView>(getViewFromHash);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync URL hash when view changes
  useEffect(() => {
    const newHash = currentView === 'dashboard' ? '' : currentView;
    if (window.location.hash.replace('#', '').replace('/', '') !== currentView) {
      window.location.hash = newHash;
    }
  }, [currentView]);

  // Listen for browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const view = getViewFromHash();
      setCurrentView(view);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [getViewFromHash]);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('hla_onboarding_done'));
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  // âââ Data State âââ
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCourses, setActiveCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [anonymousPosts, setAnonymousPosts] = useState<AnonymousPost[]>(MOCK_ANONYMOUS_POSTS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'pm_1', cardType: 'Visa', last4: '4242', expiryMonth: '12', expiryYear: '2025' },
  ]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  // âââ Modal State âââ
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCourseCreatorOpen, setIsCourseCreatorOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isRequestHelpModalOpen, setIsRequestHelpModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  // âââ Handlers âââ
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
        icon: 'ð',
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
  // âââ Content Router âââ
  const renderContent = () => {
    // Admin routes
    if (currentView.startsWith('admin')) {
      return <AdminPanel currentView={currentView} setCurrentView={setCurrentView} />;
    }
    // Course player
    if (currentView === 'course-player' && activeCourse) {
      return <CoursePlayer course={activeCourse} onExit={() => setCurrentView('dashboard')} />;
    }
    switch (currentView) {
      // âââ Gamification âââ
      case 'leaderboard':
        return <LeaderboardSection />;
      case 'badges':
        return <BadgesSection />;
      // âââ Profile âââ
      case 'profile':
        return (
          <ProfilePage
            userProfile={userProfile}
            userResults={userResults}
            onProfileUpdate={onProfileUpdate}
          />
        );
      // âââ Tools & Features âââ
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
      case 'start-here':
        return (
          <FullPageWrapper title="Mula Di Sini">
            <StartHerePage onNavigate={(view) => setCurrentView(view as DashboardView)} />
          </FullPageWrapper>
        );
      case 'my-path':
        return (
          <FullPageWrapper title="Laluan Saya">
            <MyPathPage onNavigate={(view) => setCurrentView(view as DashboardView)} />
          </FullPageWrapper>
        );
      case 'lesson':
        return (
          <FullPageWrapper title="Pelajaran">
            <LessonPage onNavigate={(view) => setCurrentView(view as DashboardView)} />
          </FullPageWrapper>
        );
case 'parent-dashboard':
        return (
          <FullPageWrapper title="Dashboard Ibu Bapa">
            <ParentDashboardPage onNavigate={(view) => setCurrentView(view as DashboardView)} />
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
      // âââ 7 Dimensions âââ
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
      // âââ Mode-Specific Routes âââ
      case 'sunnah-module':
        return (
          <FullPageWrapper title={getDimensionTitle('sunnah-module', dashboardMode)}>
            <SunnahModulePage />
          </FullPageWrapper>
        );
      case 'school-subjects':
        return (
          <FullPageWrapper title={getDimensionTitle('school-subjects', dashboardMode)}>
            <SchoolSubjectsPage dashboardMode={dashboardMode} userProfile={userProfile} userResults={userResults} onNavigate={(view) => setCurrentView(view as DashboardView)} />
          </FullPageWrapper>
        );
      case 'periodic-table':
        return (
          <PeriodicTablePage onNavigate={(view) => setCurrentView(view as DashboardView)} />
        );
      case 'wellness-module':
        return (
          <FullPageWrapper title={getDimensionTitle('wellness-module', dashboardMode)}>
            <SpiritualPage religion={userProfile.religion} />
          </FullPageWrapper>
        );
      // âââ Legacy Pages âââ
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
      // âââ Default: Dashboard Home âââ
      case 'dashboard':
      default:
        return (
          <DashboardContent
            userProfile={userProfile}
            userResults={userResults}
            selectedSkills={selectedSkills}
            onQuickAction={handleQuickAction}
            activeCourses={activeCourses}
          />
        );
    }
  };
  // âââ Layout âââ
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
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-amber-900/30 z-50 safe-area-bottom">
          <div className="flex justify-around items-center h-16 px-1">
            {[
              { view: 'home', label: 'Utama', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
              { view: 'start-here', label: 'Mula Sini', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>) },
              { view: 'my-path', label: 'Laluan', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>) },
              { view: 'community-space', label: 'Komuniti', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
              { view: 'profile', label: 'Profil', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>) },
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view as DashboardView)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                  currentView === item.view
                    ? 'text-amber-400 bg-amber-400/10 scale-105'
                    : 'text-gray-400 hover:text-gray-200 active:scale-95'
                }`}
              >
                <div className={`${currentView === item.view ? 'drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${currentView === item.view ? 'text-amber-400' : ''}`}>{item.label}</span>
                {currentView === item.view && (
                  <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </nav>      </div>
      {/* âââ Modals âââ */}
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
