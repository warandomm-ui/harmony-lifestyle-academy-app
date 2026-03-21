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
} from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useChat } from '../../contexts/ChatContext';
import SupportModal from './SupportModal';
import LeaderboardSection from './gamification/LeaderboardSection';
import BadgesSection from './gamification/BadgesSection';
import { MOCK_ANONYMOUS_POSTS, SUBSCRIPTION_PLANS, MOCK_TRANSACTIONS, MOCK_FULL_COURSE } from '../../constants';
import DesktopMenuBar from './DesktopMenuBar';

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
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

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

  // ─── Content Router ───

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
            <SchoolSubjectsPage setMode={setMode} userProfile={userProfile} userResults={userResults} />
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
          <DesktopMenuBar
            setCurrentView={setCurrentView}
            onOpenSupport={() => setIsSupportModalOpen(true)}
          />
        )}
        {!isInCoursePlayer && (
          <HeaderBar
            userProfile={userProfile}
            cartItemCount={cart.length}
            onMobileMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        )}

        {renderContent()}

        {!isInCoursePlayer && <HarmonyAIChat />}
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
} from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useChat } from '../../contexts/ChatContext';
import SupportModal from './SupportModal';
import LeaderboardSection from './gamification/LeaderboardSection';
import BadgesSection from './gamification/BadgesSection';
import { MOCK_ANONYMOUS_POSTS, SUBSCRIPTION_PLANS, MOCK_TRANSACTIONS, MOCK_FULL_COURSE } from '../../constants';
import DesktopMenuBar from './DesktopMenuBar';

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

