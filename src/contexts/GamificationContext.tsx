import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UserStatus, Badge } from '../types';

interface GamificationContextType {
  userStatus: UserStatus;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  awardBadge: (badge: Omit<Badge, 'earnedAt'>) => void;
  levelUp: () => void;
}

const defaultUserStatus: UserStatus = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streak: 0,
  lastActive: new Date(),
  badges: [],
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userStatus, setUserStatus] = useState<UserStatus>(() => {
    const saved = localStorage.getItem('hla_gamification');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastActive: new Date(parsed.lastActive),
        badges: parsed.badges.map((b: any) => ({ ...b, earnedAt: new Date(b.earnedAt) })),
      };
    }
    return defaultUserStatus;
  });

  const saveStatus = useCallback((status: UserStatus) => {
    localStorage.setItem('hla_gamification', JSON.stringify(status));
  }, []);

  const addXP = useCallback((amount: number) => {
    setUserStatus(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let xpToNext = prev.xpToNextLevel;

      while (newXP >= xpToNext) {
        newXP -= xpToNext;
        newLevel++;
        xpToNext = Math.floor(xpToNext * 1.5);
      }

      const updated = { ...prev, xp: newXP, level: newLevel, xpToNextLevel: xpToNext, lastActive: new Date() };
      saveStatus(updated);
      return updated;
    });
  }, [saveStatus]);

  const incrementStreak = useCallback(() => {
    setUserStatus(prev => {
      const updated = { ...prev, streak: prev.streak + 1, lastActive: new Date() };
      saveStatus(updated);
      return updated;
    });
  }, [saveStatus]);

  const resetStreak = useCallback(() => {
    setUserStatus(prev => {
      const updated = { ...prev, streak: 0 };
      saveStatus(updated);
      return updated;
    });
  }, [saveStatus]);

  const awardBadge = useCallback((badge: Omit<Badge, 'earnedAt'>) => {
    setUserStatus(prev => {
      if (prev.badges.some(b => b.id === badge.id)) return prev;
      const newBadge: Badge = { ...badge, earnedAt: new Date() };
      const updated = { ...prev, badges: [...prev.badges, newBadge] };
      saveStatus(updated);
      return updated;
    });
  }, [saveStatus]);

  const levelUp = useCallback(() => {
    addXP(100);
  }, [addXP]);

  return (
    <GamificationContext.Provider value={{ userStatus, addXP, incrementStreak, resetStreak, awardBadge, levelUp }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
