import React from 'react';
import * as Icons from './Icons';
import { useChat } from '../../contexts/ChatContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardView, DashboardMode } from '../../types';

interface SidebarNavProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  onOpenSupport: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  dashboardMode: DashboardMode; // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ NEW PROP Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ
}

const NavGroup: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ label, icon, children, defaultOpen = false }) => (
    <details className="group" open={defaultOpen}>
        <summary className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer list-none min-h-[44px] transition-colors hover:bg-[var(--secondary)]" style={{ color: '#8a8a9a' }}>
            <span style={{ color: 'rgba(201,168,76,0.5)' }}>{icon}</span>
            <span className="flex-1 font-bold text-xs uppercase tracking-wider" style={{ color: '#8a8a9a' }}>{label}</span>
            <Icons.ChevronDownIcon className="h-4 w-4 transform transition-transform group-open:rotate-90" />
        </summary>
        <div className="space-y-1 mt-1">
            {children}
        </div>
    </details>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void; className?: string; }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 py-2 min-h-[44px] text-left transition-all duration-200 rounded-xl"
    style={isActive ? {
      background: 'rgba(201,168,76,0.12)',
      color: '#e8c97a',
      fontWeight: 700,
      paddingLeft: '10px',
      paddingRight: '12px',
      borderLeft: '2px solid #c9a84c',
      boxShadow: '0 0 12px rgba(201,168,76,0.08)',
    } : {
      color: '#8a8a9a',
      fontWeight: 500,
      paddingLeft: '12px',
      paddingRight: '12px',
      borderLeft: '2px solid transparent',
    }}
    onMouseEnter={e => {
      if (!isActive) {
        (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.06)';
        (e.currentTarget as HTMLElement).style.color = '#f5f0e8';
      }
    }}
    onMouseLeave={e => {
      if (!isActive) {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = '#8a8a9a';
      }
    }}
  >
    <span style={{ color: isActive ? '#c9a84c' : 'rgba(201,168,76,0.5)' }}>
      {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
    </span>
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>{label}</span>
  </button>
);

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  currentView, setCurrentView, onOpenSupport, isMobileOpen = false, onMobileClose,
  dashboardMode // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ RECEIVE MODE Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ
}) => {
  const { toggleChat, isChatOpen } = useChat();
  const { isAdminMode, toggleAdminMode, adminRole, setAdminRole } = useAdmin();
  const { signOut } = useAuth();

  const isMuslim = dashboardMode === 'muslim';

  const handleSuperAdminToggle = () => {
      setAdminRole(adminRole === 'super-admin' ? 'admin' : 'super-admin');
  };

  const handleNavClick = (view: DashboardView) => {
    setCurrentView(view);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <nav className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-[var(--card)] border-r border-[var(--border)] flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        md:relative md:w-64 md:z-auto md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-4" style={{ height: '4.5rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div>
            <h1
              className="text-xl font-bold hla-gold-text leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Harmony
            </h1>
            <p className="text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(201,168,76,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
              Lifestyle Academy
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMobileClose}
              className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={signOut}
              className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Log Out"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button
              onClick={signOut}
              className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Log Out"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {isAdminMode ? (
            <NavItem
              icon={<Icons.ShieldCheckIcon />}
              label="Admin Panel"
              isActive={currentView.startsWith('admin')}
              onClick={() => handleNavClick('admin')}
            />
          ) : (
            <>
              {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ COMMON NAV Ã¢ÂÂ Same for both Muslim & Universal Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
              <NavItem 
                icon={<Icons.HomeIcon />} 
                label={isMuslim ? "Utama" : "Home"} 
                isActive={currentView === 'dashboard'} 
                onClick={() => handleNavClick('dashboard')} 
              />
                <NavItem 
                icon={<Icons.SparklesIcon />} 
                label="Mula Di Sini" 
                isActive={currentView === 'start-here'} 
                onClick={() => handleNavClick('start-here')} 
                />
                <NavItem 
                icon={<Icons.BookOpenIcon />} 
                label="Laluan Saya" 
                isActive={currentView === 'my-path'} 
                onClick={() => handleNavClick('my-path')} 
                />
              <NavItem 
                icon={<Icons.BookOpenIcon />} 
                label={isMuslim ? "Pembelajaran" : "My Learning"} 
                isActive={currentView === 'student-dashboard'} 
                onClick={() => handleNavClick('student-dashboard')} 
              />
              <NavItem 
                icon={<Icons.UserIcon />} 
                label={isMuslim ? "Profil" : "Profile"} 
                isActive={currentView === 'profile'} 
                onClick={() => handleNavClick('profile')} 
              />
              <NavItem 
                icon={<Icons.LightBulbIcon />} 
                label={isMuslim ? "Dinding Idea" : "Idea Wall"} 
                isActive={currentView === 'idea-wall'} 
                onClick={() => handleNavClick('idea-wall')} 
              />
              <NavItem 
                icon={<Icons.NotebookIcon />} 
                label={isMuslim ? "Buku Nota Pintar" : "Smart Notebook"} 
                isActive={currentView === 'notebook'} 
                onClick={() => handleNavClick('notebook')} 
              />
              <NavItem 
                icon={<Icons.CameraIcon />} 
                label={isMuslim ? "Dunia Sebenar" : "Real World"} 
                isActive={currentView === 'real-world'} 
                onClick={() => handleNavClick('real-world')} 
              />
              <NavItem 
                icon={<Icons.UsersIcon />} 
                label={isMuslim ? "Ruang Komuniti" : "Community Space"} 
                isActive={currentView === 'community-space'} 
                onClick={() => handleNavClick('community-space')} 
              />

              {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ THE PATH Ã¢ÂÂ both get this Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
              <div className="pt-2 mt-2" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
                <NavItem 
                  icon={<Icons.SparklesIcon />} 
                  label={isMuslim ? "Buku The Path" : "The Path Book"} 
                  isActive={currentView === 'the-path'} 
                  onClick={() => handleNavClick('the-path')} 
                />
              </div>

              {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
              {/* THIS IS WHERE THE TWO DASHBOARDS DIVERGE COMPLETELY */}
              {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}

              {isMuslim ? (
                /* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ MUSLIM SIDEBAR Ã¢ÂÂ Islamic terms, Sunnah module Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
                <div className="pt-2">
                  <NavGroup label="8 Dimensi Pembangunan" icon={<Icons.SparklesIcon />} defaultOpen={true}>
                    <NavItem label="Ruh Ã¢ÂÂ Spiritual" icon="Ã¢ÂÂ¦" isActive={currentView === 'spiritual'} onClick={() => handleNavClick('spiritual')} />
                    <NavItem label="Aql Ã¢ÂÂ Intelektual" icon="Ã¢ÂÂ" isActive={currentView === 'intellectual' || currentView === 'language-lab' || currentView === 'practice-hub'} onClick={() => handleNavClick('intellectual')} />
                    <NavItem label="Jasad Ã¢ÂÂ Fizikal" icon="Ã¢ÂÂ" isActive={currentView === 'physical'} onClick={() => handleNavClick('physical')} />
                    <NavItem label="Qalb Ã¢ÂÂ Emosi" icon="Ã¢ÂÂ¡" isActive={currentView === 'emotional'} onClick={() => handleNavClick('emotional')} />
                    <NavItem label="Suhbah Ã¢ÂÂ Sosial" icon="Ã¢ÂÂ" isActive={currentView === 'social' || currentView === 'social-impact'} onClick={() => handleNavClick('social')} />
                    <NavItem label="Bi'ah Ã¢ÂÂ Alam Sekitar" icon={<Icons.GlobeAltIcon />} isActive={currentView === 'environmental'} onClick={() => handleNavClick('environmental')} />
                    <NavItem label="Rizq Ã¢ÂÂ Kerjaya" icon="Ã¢ÂÂ" isActive={currentView === 'vocational'} onClick={() => handleNavClick('vocational')} />
                    <NavItem label="Raqmi Ã¢ÂÂ Digital" icon="Ã¢Â¬Â¡" isActive={currentView === 'behaviour'} onClick={() => handleNavClick('behaviour')} />
                  </NavGroup>

                  {/* Muslim-only items */}
                  <div className="pt-2 mt-1" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
                    <NavItem 
                      label="Modul Sunnah" 
                      icon="Ã°ÂÂÂ" 
                      isActive={currentView === 'sunnah-module'} 
                      onClick={() => handleNavClick('sunnah-module')} 
                    />
                    <NavItem 
                      label="Akademi Sekolah" 
                      icon="Ã°ÂÂÂ«" 
                      isActive={currentView === 'school-subjects'} 
                      onClick={() => handleNavClick('school-subjects')} 
                    />
                  </div>
                </div>
              ) : (
                /* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ UNIVERSAL SIDEBAR Ã¢ÂÂ English terms, Wellness module Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
                /* NO Arabic. NO Islamic references. Completely separate. */
                <div className="pt-2">
                  <NavGroup label="8 Development Dimensions" icon={<Icons.SparklesIcon />} defaultOpen={true}>
                    <NavItem label="Spirit Ã¢ÂÂ Inner Awareness" icon="Ã¢ÂÂ¦" isActive={currentView === 'spiritual'} onClick={() => handleNavClick('spiritual')} />
                    <NavItem label="Mind Ã¢ÂÂ Intellectual" icon="Ã¢ÂÂ" isActive={currentView === 'intellectual' || currentView === 'language-lab' || currentView === 'practice-hub'} onClick={() => handleNavClick('intellectual')} />
                    <NavItem label="Body Ã¢ÂÂ Physical" icon="Ã¢ÂÂ" isActive={currentView === 'physical'} onClick={() => handleNavClick('physical')} />
                    <NavItem label="Heart Ã¢ÂÂ Emotional" icon="Ã¢ÂÂ¡" isActive={currentView === 'emotional'} onClick={() => handleNavClick('emotional')} />
                    <NavItem label="Tribe Ã¢ÂÂ Social" icon="Ã¢ÂÂ" isActive={currentView === 'social' || currentView === 'social-impact'} onClick={() => handleNavClick('social')} />
                    <NavItem label="Planet Ã¢ÂÂ Environmental" icon={<Icons.GlobeAltIcon />} isActive={currentView === 'environmental'} onClick={() => handleNavClick('environmental')} />
                    <NavItem label="Wealth Ã¢ÂÂ Career" icon="Ã¢ÂÂ" isActive={currentView === 'vocational'} onClick={() => handleNavClick('vocational')} />
                    <NavItem label="Digital Ã¢ÂÂ Tech & AI" icon="Ã¢Â¬Â¡" isActive={currentView === 'behaviour'} onClick={() => handleNavClick('behaviour')} />
                  </NavGroup>

                  {/* Universal-only items */}
                  <div className="pt-2 mt-1" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
                    <NavItem 
                      label="Wellness Module" 
                      icon="Ã°ÂÂ§Â" 
                      isActive={currentView === 'wellness-module'} 
                      onClick={() => handleNavClick('wellness-module')} 
                    />
                    <NavItem 
                      label="School Academy" 
                      icon="Ã°ÂÂÂ«" 
                      isActive={currentView === 'school-subjects'} 
                      onClick={() => handleNavClick('school-subjects')} 
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="py-2">
            <button
              onClick={toggleChat}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all transform hover:scale-[1.02]"
              style={{
                background: isChatOpen
                  ? 'linear-gradient(135deg, #a8873a, #c9a84c)'
                  : 'linear-gradient(135deg, #c9a84c, #e8c97a)',
                color: '#0a0a0f',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
              }}
            >
              <Icons.ChatAltIcon />
              <span className="font-bold">Harmony AI</span>
            </button>
          </div>
        </div>

        <div className="p-4" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
          <button
            onClick={() => handleNavClick('parent-dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              currentView === 'parent-dashboard'
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-lg shadow-amber-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ibu Bapa</span>
          </button>

          <button
            onClick={() => { onOpenSupport(); onMobileClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-bold transition-colors min-h-[44px]"
            style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(252,165,165,0.9)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Icons.LifebuoyIcon />
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {isMuslim ? "Kaunseling & Sokongan" : "Counseling & Support"}
            </span>
          </button>
        </div>

        <div className="p-4 mt-auto space-y-3" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
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
    </>
  );
};

export default SidebarNav;
