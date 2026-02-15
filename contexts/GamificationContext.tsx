import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { GamificationProfile } from '../types';
import { MOCK_USER_GAMIFICATION_PROFILE } from '../constants';
import { useToast } from './ToastContext';

interface GamificationContextType {
  profile: GamificationProfile;
  addPoints: (amount: number, activity: string) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<GamificationProfile>(MOCK_USER_GAMIFICATION_PROFILE);
  const { addToast } = useToast();

  const addPoints = useCallback((amount: number, activity: string) => {
    setProfile(prevProfile => {
      let newPoints = prevProfile.points + amount;
      let newXpInLevel = prevProfile.xpInLevel + amount;
      let newLevel = prevProfile.level;
      let newXpForNextLevel = prevProfile.xpForNextLevel;

      // Check for level up
      while (newXpInLevel >= newXpForNextLevel) {
        newLevel += 1;
        newXpInLevel -= newXpForNextLevel;
        newXpForNextLevel = Math.floor(newXpForNextLevel * 1.5); // Increase XP requirement for next level
        addToast(`🎉 Level Up! You've reached Level ${newLevel}!`, 'success');
      }

      addToast(`+${amount} XP for ${activity}!`, 'info');

      return {
        ...prevProfile,
        points: newPoints,
        level: newLevel,
        xpInLevel: newXpInLevel,
        xpForNextLevel: newXpForNextLevel,
      };
    });
  }, [addToast]);

  return (
    <GamificationContext.Provider value={{ profile, addPoints }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};