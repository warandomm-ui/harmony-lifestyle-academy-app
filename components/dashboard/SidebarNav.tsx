
import React from 'react';
import * as Icons from './Icons';
import { useChat } from '../../contexts/ChatContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardView } from '../../types';

interface SidebarNavProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  onOpenSupport: () => void;
}

const NavGroup: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ label, icon, children, defaultOpen = false }) => (
    <details className="group" open={defaultOpen}>
        <summary className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 list-none hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="text-gray-400 dark:text-gray-500">{icon}</span>
            <span className="flex-1 font-bold text-xs uppercase tracking-wider">{label}</span>
            <Icons.ChevronDownIcon className="h-4 w-4 transform transition-transform group-open:rotate-90" />
        </summary>
        <div className="space-y-1 mt-1">
            {children}
        </div>
    </details>
);

const SidebarNav: React.FC<SidebarNavProps> = ({ currentView, setCurrentView, onOpenSupport }) => {
  const { toggleChat, isChatOpen } = useChat();
  const { isAdminMode, toggleAdminMode, adminRole, setAdminRole } = useAdmin();
  const { signOut } = useAuth();

  const handleSuperAdminToggle = () => {
      setAdminRole(adminRole === 'super-admin' ? 'admin' : 'super-admin');
  };
  
  return (
    <nav className="hidden md:flex flex-col w-64 bg-[var(--card)] border-r border-[var(--border)] flex-shrink-0">
      <div className="flex items-center justify-center h-16 border-b border-[var(--border)] px-4">
         <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex-1">Harmony</h1>
         <button onClick={signOut} className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors" title="Log Out">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
         </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isAdminMode ? (
          <NavItem
            icon={<Icons.ShieldCheckIcon />}
            label="Admin Panel"
            isActive={currentView.startsWith('admin')}
            onClick={() => setCurrentView('admin')}
          />
        ) : (
          <>
            <NavItem icon={<Icons.HomeIcon />} label="Home" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavItem icon={<Icons.BookOpenIcon />} label="My Learning" isActive={currentView === 'student-dashboard'} onClick={() => setCurrentView('student-dashboard')} />
            <NavItem icon={<Icons.UserIcon />} label="Profile" isActive={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
            <NavItem icon={<Icons.LightBulbIcon />} label="Idea Wall" isActive={currentView === 'idea-wall'} onClick={() => setCurrentView('idea-wall')} className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20" />
            <NavItem icon={<Icons.NotebookIcon />} label="Smart Notebook" isActive={currentView === 'notebook'} onClick={() => setCurrentView('notebook')} className="bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20" />
            <NavItem icon={<Icons.CameraIcon />} label="Real World" isActive={currentView === 'real-world'} onClick={() => setCurrentView('real-world')} className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20" />
            <NavItem icon={<Icons.UsersIcon />} label="Community Space" isActive={currentView === 'community-space'} onClick={() => setCurrentView('community-space')} className="bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20" />
            
            <div className="pt-2 border-t border-[var(--border)] mt-2">
                <NavItem icon={<Icons.SparklesIcon />} label="The Path Book" isActive={currentView === 'the-path'} onClick={() => setCurrentView('the-path')} className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20" />
            </div>

            <div className="pt-2">
                <NavGroup label="7 Dimensions of Wellness" icon={<Icons.SparklesIcon />} defaultOpen={true}>
                    <NavItem label="Physical" icon={<Icons.BarbellIcon />} isActive={currentView === 'physical'} onClick={() => setCurrentView('physical')} />
                    <NavItem label="Emotional" icon={<Icons.FaceSmileIcon />} isActive={currentView === 'emotional'} onClick={() => setCurrentView('emotional')} />
                    <NavItem label="Social" icon={<Icons.UsersIcon />} isActive={currentView === 'social' || currentView === 'social-impact'} onClick={() => setCurrentView('social')} />
                    <NavItem label="Intellectual" icon={<Icons.AcademicCapIcon />} isActive={currentView === 'intellectual' || currentView === 'language-lab' || currentView === 'practice-hub'} onClick={() => setCurrentView('intellectual')} />
                    <NavItem label="Spiritual" icon={<Icons.SparklesIcon />} isActive={currentView === 'spiritual'} onClick={() => setCurrentView('spiritual')} />
                    <NavItem label="Environmental" icon={<Icons.GlobeAltIcon />} isActive={currentView === 'environmental'} onClick={() => setCurrentView('environmental')} />
                    <NavItem label="Vocational" icon={<Icons.BriefcaseIcon />} isActive={currentView === 'vocational'} onClick={() => setCurrentView('vocational')} />
                </NavGroup>
            </div>
          </>
        )}
        
        <div className="py-2">
            <button onClick={toggleChat} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-white transition-all transform hover:scale-105 shadow-lg shadow-[var(--primary)]/30 ${isChatOpen ? 'bg-gradient-to-r from-[var(--primary)] to-[#5a38a8]' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[var(--primary)] hover:to-[#5a38a8]'}`}>
                <Icons.ChatAltIcon />
                <span className="font-bold">Harmony AI</span>
            </button>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <button onClick={onOpenSupport} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left font-bold transition-colors bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20">
          <Icons.LifebuoyIcon />
          <span>Counseling & Support</span>
        </button>
      </div>

      <div className="p-4 border-t border-[var(--border)] mt-auto space-y-3">
          <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2 cursor-pointer">
                  <Icons.ShieldCheckIcon className="h-5 w-5" /> Admin Mode
              </label>
              <button role="switch" aria-checked={isAdminMode} onClick={toggleAdminMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${isAdminMode ? 'bg-[var(--primary)]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isAdminMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
          </div>
      </div>
    </nav>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void; className?: string; }> = ({ icon, label, isActive, onClick, className = '' }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-full transition-colors text-left ${isActive ? 'bg-[var(--secondary)] text-[var(--primary)] font-bold' : 'hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium'} ${className}`}>
    {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
    <span>{label}</span>
  </button>
);

export default SidebarNav;
