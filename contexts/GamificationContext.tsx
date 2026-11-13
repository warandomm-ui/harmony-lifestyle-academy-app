import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import type { GamificationProfile } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import {
  EMPTY_QUEST, XP, isPass, isQuestComplete, touchStreak, worldBadgeId,
  type QuestProgress,
} from '../utils/gameWorld';

interface GameState {
  profile: GamificationProfile;
  quests: Record<string, QuestProgress>;
}

export interface QuizOutcome {
  xpGained: number;
  passed: boolean;
  firstClear: boolean;
  worldCleared: boolean;
}

interface GamificationContextType {
  profile: GamificationProfile;
  /** Progress per quest, keyed by topic id ('<moduleId>/<slug>'). */
  quests: Record<string, QuestProgress>;
  /** Consecutive days the learner has opened the app. */
  streak: number;
  addPoints: (amount: number, activity: string) => void;
  /** Marks a quest's lesson as read. Pays XP the first time only. */
  completeLesson: (topicId: string, title: string) => void;
  /**
   * Records a challenge attempt. XP is paid only for answers beyond the previous best,
   * plus the quest's reward the first time it is cleared. When `world` is given and this
   * clears its last quest, the world badge and bonus are awarded.
   */
  submitQuiz: (
    topicId: string, title: string, score: number, total: number, questReward: number,
    world?: { id: string; name: string; topicIds: string[] },
  ) => QuizOutcome;
  /** Marks a quest's reflection as written. Pays XP the first time only. */
  completeReflection: (topicId: string, title: string) => void;
}

const NEW_PLAYER: GameState = {
  profile: { points: 0, level: 1, xpInLevel: 0, xpForNextLevel: 100, badges: ['newbie'] },
  quests: {},
};

const storageKey = (userId?: string) => `hla_game_v1_${userId ?? 'guest'}`;

const load = (userId?: string): GameState => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return NEW_PLAYER;
    const saved = JSON.parse(raw);
    if (!saved?.profile || typeof saved.profile.level !== 'number') return NEW_PLAYER;
    return { profile: { ...NEW_PLAYER.profile, ...saved.profile }, quests: saved.quests ?? {} };
  } catch {
    return NEW_PLAYER;
  }
};

/** Adds XP to a profile and returns the new profile with the levels gained. */
const grant = (profile: GamificationProfile, amount: number): { profile: GamificationProfile; levelsGained: number[] } => {
  let { level, xpInLevel, xpForNextLevel } = profile;
  xpInLevel += amount;
  const levelsGained: number[] = [];
  while (xpInLevel >= xpForNextLevel) {
    xpInLevel -= xpForNextLevel;
    level += 1;
    xpForNextLevel = Math.floor(xpForNextLevel * 1.5);
    levelsGained.push(level);
  }
  return { profile: { ...profile, points: profile.points + amount, level, xpInLevel, xpForNextLevel }, levelsGained };
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const userId = user?.id;

  const [state, setState] = useState<GameState>(() => load(userId));
  const [streak] = useState<number>(() => touchStreak());
  // The ref is the source of truth for updates, so that rewards are computed once
  // and toasts are raised outside React's state updater.
  const stateRef = useRef(state);

  useEffect(() => {
    const loaded = load(userId);
    stateRef.current = loaded;
    setState(loaded);
  }, [userId]);

  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(next));
    } catch {
      // storage unavailable: progress lasts for this session only
    }
  }, [userId]);

  const award = useCallback((base: GameState, amount: number, activity: string): GameState => {
    if (amount <= 0) return base;
    const { profile, levelsGained } = grant(base.profile, amount);
    addToast(`+${amount} XP for ${activity}!`, 'info');
    levelsGained.forEach((lvl) => addToast(`🎉 Level Up! You've reached Level ${lvl}!`, 'success'));
    return { ...base, profile };
  }, [addToast]);

  const addPoints = useCallback((amount: number, activity: string) => {
    commit(award(stateRef.current, amount, activity));
  }, [award, commit]);

  const completeLesson = useCallback((topicId: string, title: string) => {
    const cur = stateRef.current;
    const quest = cur.quests[topicId] ?? EMPTY_QUEST;
    if (quest.lessonDone) return;
    const next = { ...cur, quests: { ...cur.quests, [topicId]: { ...quest, lessonDone: true } } };
    commit(award(next, XP.lesson, `studying ${title}`));
  }, [award, commit]);

  const completeReflection = useCallback((topicId: string, title: string) => {
    const cur = stateRef.current;
    const quest = cur.quests[topicId] ?? EMPTY_QUEST;
    if (quest.reflectionDone) return;
    const next = { ...cur, quests: { ...cur.quests, [topicId]: { ...quest, reflectionDone: true } } };
    commit(award(next, XP.reflection, `reflecting on ${title}`));
  }, [award, commit]);

  const submitQuiz = useCallback<GamificationContextType['submitQuiz']>((topicId, title, score, total, questReward, world) => {
    const cur = stateRef.current;
    const quest = cur.quests[topicId] ?? EMPTY_QUEST;
    const passed = isPass(score, total);
    const firstClear = passed && !isQuestComplete(quest);
    const improvement = Math.max(0, score - quest.bestScore);

    const updated: QuestProgress = {
      ...quest,
      bestScore: Math.max(quest.bestScore, score),
      total,
      attempts: quest.attempts + 1,
      completedAt: quest.completedAt ?? (passed ? new Date().toISOString() : undefined),
    };
    let next: GameState = { ...cur, quests: { ...cur.quests, [topicId]: updated } };

    let xpGained = improvement * XP.perCorrectAnswer + (firstClear ? questReward : 0);
    next = award(next, xpGained, firstClear ? `clearing ${title}` : `the ${title} challenge`);

    let worldCleared = false;
    if (firstClear && world) {
      const badge = worldBadgeId(world.id);
      const allDone = world.topicIds.every((id) => isQuestComplete(next.quests[id]));
      if (allDone && !next.profile.badges.includes(badge)) {
        worldCleared = true;
        next = { ...next, profile: { ...next.profile, badges: [...next.profile.badges, badge] } };
        next = award(next, XP.worldComplete, `clearing the ${world.name} world`);
        xpGained += XP.worldComplete;
        addToast(`🏆 Badge earned: ${world.name} World Cleared`, 'success');
      }
    }
    commit(next);
    return { xpGained, passed, firstClear, worldCleared };
  }, [addToast, award, commit]);

  return (
    <GamificationContext.Provider
      value={{ profile: state.profile, quests: state.quests, streak, addPoints, completeLesson, submitQuiz, completeReflection }}
    >
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
