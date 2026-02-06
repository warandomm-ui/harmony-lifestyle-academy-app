import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  LogOut, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  HomeIcon, 
  GoalsIcon, 
  AchievementsIcon, 
  ProfileIcon, 
  SettingsIcon,
  LearnIcon,
  ProgressIcon
} from './Icons';
import ThemeToggle from '../ThemeToggle';
import type { UserProfile, UserStatus } from '../../types';
import { useGamification } from '../../contexts/GamificationContext';

interface SidebarProps {
  userProfile: UserProfile;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'goals', label: 'Goals', icon: GoalsIcon },
  { id: 'progress', label: 'Progress', icon: ProgressIcon },
  { id: 'learn', label: 'Learn', icon: LearnIcon },
  { id: 'achievements', label: 'Achievements', icon: AchievementsIcon },
  { id: 'profile', label: 'Profile', icon: ProfileIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile, 
  activeTab, 
  onTabChange,
  onLogout 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { userStatus } = useGamification();

  const xpProgress = (userStatus.xp / userStatus.xpToNextLevel) * 100;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sidebar-foreground">Harmony</span>
              <span className="text-xs text-muted-foreground">Lifestyle Academy</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="font-medium text-sidebar-foreground truncate">
                {userProfile.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Level {userStatus.level}</span>
                <span>•</span>
                <span>🔥 {userStatus.streak} day streak</span>
              </div>
            </motion.div>
          )}
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3"
          >
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{userStatus.xp} XP</span>
              <span>{userStatus.xpToNextLevel} XP</span>
            </div>
            <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className={isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 text-left text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {!isCollapsed && isActive && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          <ThemeToggle />
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-card p-2 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 w-72 glass-card z-50 lg:hidden"
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col h-screen glass-card border-r border-sidebar-border sticky top-0"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default Sidebar;
