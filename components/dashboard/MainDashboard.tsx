


import React, { useState } from 'react';
import HeaderBar from './HeaderBar';
import SidebarNav from './SidebarNav';
import DashboardContent from './DashboardContent';
import HarmonyAIChat from './HarmonyAIChat';
import AdminPanel from './sections/AdminPanel';
import { AnalysisResult, Course, DashboardView, Product, UserStatus, AnonymousPost, PaymentMethod, SubscriptionPlan, Transaction, UserProfile, LifeVision } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import SupportModal from './SupportModal';
import LeaderboardSection from './gamification/LeaderboardSection';
import BadgesSection from './gamification/BadgesSection';
import { MOCK_ANONYMOUS_POSTS, SUBSCRIPTION_PLANS, MOCK_TRANSACTIONS, MOCK_FULL_COURSE } from '../../constants';
import DesktopMenuBar from './DesktopMenuBar';

// Old Page Imports
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

// New 7 Dimensions Page Imports
import PhysicalPage from './pages/dimensions/PhysicalPage';
import EmotionalPage from './pages/dimensions/EmotionalPage';
import SocialDimensionPage from './pages/dimensions/SocialPage';
import IntellectualPage from './pages/dimensions/IntellectualPage';
import SpiritualPage from './pages/dimensions/SpiritualPage';
import EnvironmentalPage from './pages/dimensions/EnvironmentalPage';
import VocationalPage from './pages/dimensions/VocationalPage';
import SocialImpactProjectsPage from './pages/dimensions/SocialImpactProjectsPage';
import LanguageLabPage from './pages/LanguageLabPage'; 
import IdeaWallPage from './pages/IdeaWallPage'; 
import RealWorldPage from './pages/RealWorldPage';
import CommunitySpacePage from './pages/CommunitySpacePage'; 
import ThePathPage from './pages/ThePathPage'; // New Import
import CoursePlayer from './lms/CoursePlayer'; 
import StudentDashboard from './pages/StudentDashboard';
import NotebookPage from './pages/NotebookPage'; // New Notebook Import

import CourseCreatorModal from './CourseCreatorModal';
import PaymentModal from './PaymentModal';
import CheckoutModal from './CheckoutModal'; 
import PlanSelectionModal from './PlanSelectionModal';
import RequestHelpModal from './RequestHelpModal';
import DonateModal from './DonateModal';

interface MainDashboardProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  selectedSkills: string[];
  userStatus: UserStatus;
  lifeVision: LifeVision;
  onProfileUpdate: (profile: UserProfile) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ userProfile, userResults, selectedSkills, userStatus, lifeVision, onProfileUpdate }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const { addToast } = useToast();
  
  // Lifted State from DashboardContent
  const [cart, setCart] = useState<Product[]>([]);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCourseCreatorOpen, setIsCourseCreatorOpen] = useState(false);
  const [activeCourses, setActiveCourses] = useState<Course[]>([
    { id: 'c_1', icon: '📐', title: 'Matematik', subtitle: 'Tingkatan 3', progress: 45 },
    { id: 'c_2', icon: '💻', title: 'Python', subtitle: 'for Beginners', progress: 30 },
    { id: 'c_3', icon: '🎨', title: 'Web Design', subtitle: 'Basics', progress: 15 },
    { id: 'c_4', icon: '🔬', title: 'Sains', subtitle: 'Tingkatan 3', progress: 55 },
  ]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
      { id: 'pm_1', cardType: 'Visa', last4: '4242', expiryMonth: '12', expiryYear: '2025' }
  ]);
  const [anonymousPosts, setAnonymousPosts] = useState<AnonymousPost[]>(MOCK_ANONYMOUS_POSTS);
  const [isRequestHelpModalOpen, setIsRequestHelpModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  // Handlers
  const handleInitiateCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
      if (checkoutProduct) {
          setIsCheckoutOpen(false);
          addToast(`Receipt for ${checkoutProduct.name} sent to ${userProfile.name.toLowerCase().replace(/\s/g, '.')}@gmail.com`, 'success');
          
          // Auto-enrollment Logic (Simulated)
          if (checkoutProduct.category === 'E-Book' || checkoutProduct.name.includes('Course')) {
              const newCourse: Course = {
                  id: `purchased_${Date.now()}`,
                  title: checkoutProduct.name,
                  subtitle: 'Enrolled via Purchase',
                  icon: '🎓',
                  progress: 0
              };
              setActiveCourses(prev => [newCourse, ...prev]);
              addToast(`Auto-enrolled in ${checkoutProduct.name}! Check 'My Learning'.`, 'info');
          }
          setCheckoutProduct(null);
      }
  };

  const handleAddToCart = (product: Product) => {
    // Redirect to immediate checkout for this demo
    handleInitiateCheckout(product);
  };

  const handleQuickAction = (actionLabel: string) => {
    if (actionLabel === "Share Your Skills") {
        setIsCourseCreatorOpen(true);
    }
  };

  const handleCourseCreated = (newCourse: Course) => {
      setActiveCourses(prev => [newCourse, ...prev]);
      setIsCourseCreatorOpen(false);
  };
  
  const handleSavePaymentMethod = (data: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = { id: `pm_${Date.now()}`, ...data };
    setPaymentMethods(prev => [...prev, newMethod]);
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
    setAnonymousPosts(prev => [newPost, ...prev]);
    addToast('Your anonymous post has been shared.', 'success');
  };

  const handlePlayCourse = (course: Course) => {
      setActiveCourse(MOCK_FULL_COURSE); 
      setCurrentView('course-player');
  };

  const renderContent = () => {
    if (currentView.startsWith('admin')) {
      return <AdminPanel currentView={currentView} setCurrentView={setCurrentView} />;
    }

    if (currentView === 'course-player' && activeCourse) {
        return <CoursePlayer course={activeCourse} onExit={() => setCurrentView('dashboard')} />;
    }

    const FullPageWrapper: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
        <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto bg-[var(--background)] min-w-0">
            <div className="max-w-7xl mx-auto">
                {title && <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-5 sm:mb-8">{title}</h1>}
                {children}
            </div>
        </main>
    );

    switch (currentView) {
      case 'leaderboard':
        return <LeaderboardSection />;
      case 'badges':
        return <BadgesSection />;
      case 'profile':
        return <ProfilePage userProfile={userProfile} userResults={userResults} onProfileUpdate={onProfileUpdate} />;
      case 'practice-hub':
        return <FullPageWrapper title="Practice Hub"><PracticeHubPage /></FullPageWrapper>;
      case 'language-lab':
        return <FullPageWrapper title="Polyglot Lab"><LanguageLabPage /></FullPageWrapper>;
      case 'idea-wall':
        return <FullPageWrapper title=""><IdeaWallPage /></FullPageWrapper>;
      case 'notebook': // New Case for Notebook
        return <FullPageWrapper title="Smart Notebook"><NotebookPage /></FullPageWrapper>;
      case 'real-world':
        return <FullPageWrapper title=""><RealWorldPage /></FullPageWrapper>;
      case 'community-space':
        return <FullPageWrapper title=""><CommunitySpacePage /></FullPageWrapper>;
      case 'the-path': // Route for "The Path"
        return <FullPageWrapper title=""><ThePathPage /></FullPageWrapper>;
      case 'student-dashboard':
        return <FullPageWrapper title="My Learning Dashboard"><StudentDashboard courses={activeCourses} userProfile={userProfile} onPlayCourse={handlePlayCourse} /></FullPageWrapper>;
      
      // Dimensions
      case 'physical':
        return <FullPageWrapper title="Physical Wellness"><PhysicalPage /></FullPageWrapper>;
      case 'emotional':
        return <FullPageWrapper title="Emotional Wellness"><EmotionalPage /></FullPageWrapper>;
      case 'social':
        return <FullPageWrapper title="Social Wellness"><SocialDimensionPage /></FullPageWrapper>;
      case 'social-impact':
        return <FullPageWrapper title="Social Impact Projects"><SocialImpactProjectsPage /></FullPageWrapper>;
      case 'intellectual':
        return <FullPageWrapper title="Intellectual Wellness"><IntellectualPage /></FullPageWrapper>;
      case 'spiritual':
        return <FullPageWrapper title="Spiritual Wellness"><SpiritualPage /></FullPageWrapper>;
      case 'environmental':
        return <FullPageWrapper title="Environmental Wellness"><EnvironmentalPage /></FullPageWrapper>;
      case 'vocational':
        return <FullPageWrapper title="Vocational Wellness"><VocationalPage /></FullPageWrapper>;

      // Legacy Pages
      case 'wisdom':
        return <FullPageWrapper title="Wisdom (Soul)"><WisdomPage initialLifeVision={lifeVision} posts={anonymousPosts} onPost={handlePostAnonymously} onRequestHelp={() => setIsRequestHelpModalOpen(true)} onDonate={() => setIsDonateModalOpen(true)}/></FullPageWrapper>;
      case 'knowledge':
        return <FullPageWrapper title="Knowledge (Mind)"><KnowledgePage courses={activeCourses} selectedSkills={selectedSkills} onOpenCourseCreator={() => setIsCourseCreatorOpen(true)} onPlayCourse={handlePlayCourse} /></FullPageWrapper>;
      case 'health':
        return <FullPageWrapper title="Health (Heart & Emotions)"><HealthPage /></FullPageWrapper>;
      case 'financial':
        return <FullPageWrapper title="Desire (Finance)"><FinancialPage onAddToCart={handleAddToCart} currentPlan={currentPlan} paymentMethods={paymentMethods} transactions={transactions} onAddPaymentMethod={() => setIsPaymentModalOpen(true)} onRemovePaymentMethod={() => {}} onChangePlan={() => setIsPlanModalOpen(true)} /></FullPageWrapper>;
      case 'business':
        return <FullPageWrapper title="Desire (Business & Career)"><BusinessPage userResults={userResults} /></FullPageWrapper>;
      case 'fitness':
        return <FullPageWrapper title="Health (Fitness & Self-Defense)"><FitnessPage /></FullPageWrapper>;
      case 'communication':
        return <FullPageWrapper title="Body (Communication)"><CommunicationPage /></FullPageWrapper>;
      case 'behaviour':
        return <FullPageWrapper title="Body (Behaviour & Profile)"><BehaviourPage userResults={userResults} /></FullPageWrapper>;
      
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

  return (
    <div className="hla-dashboard flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {currentView !== 'course-player' && (
        <SidebarNav
            currentView={currentView}
            setCurrentView={setCurrentView}
            onOpenSupport={() => setIsSupportModalOpen(true)}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {currentView !== 'course-player' && <DesktopMenuBar setCurrentView={setCurrentView} onOpenSupport={() => setIsSupportModalOpen(true)} />}
        {currentView !== 'course-player' && (
          <HeaderBar
            userProfile={userProfile}
            cartItemCount={cart.length}
            onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          />
        )}
        {renderContent()}
        {currentView !== 'course-player' && <HarmonyAIChat />}
      </div>
      
      {/* Modals */}
      {isSupportModalOpen && <SupportModal onClose={() => setIsSupportModalOpen(false)} />}
      {isCourseCreatorOpen && <CourseCreatorModal onClose={() => setIsCourseCreatorOpen(false)} onCourseCreated={handleCourseCreated} />}
      {isRequestHelpModalOpen && <RequestHelpModal onClose={() => setIsRequestHelpModalOpen(false)} />}
      {isDonateModalOpen && <DonateModal onClose={() => setIsDonateModalOpen(false)} />}
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
