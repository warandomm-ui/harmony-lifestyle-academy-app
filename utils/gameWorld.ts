// utils/gameWorld.ts
// The game layer of the app: worlds (the development dimensions), quests (the
// curated topics inside a world), ranks, XP rules and badges. Pure data and
// functions, no React.

import type { Badge, DashboardView } from '../types';

export interface GameWorld {
  /** Stable id, also used for the world badge. */
  id: string;
  /** Dashboard view that opens this world's page. */
  view: DashboardView;
  /** Curated content module for learners in universal and Muslim mode; null = no quests yet. */
  moduleId: { universal: string | null; muslim: string | null };
  name: { universal: string; muslim: string };
  realm: { universal: string; muslim: string };
  emoji: string;
  /** Accent colour used for the world's card, path and progress. */
  accent: string;
}

export const GAME_WORLDS: GameWorld[] = [
  { id: 'spirit', view: 'spiritual', moduleId: { universal: 'spiritual', muslim: 'spiritual-islamic' }, name: { universal: 'Spirit', muslim: 'Ruh' }, realm: { universal: 'Inner Awareness', muslim: 'Spiritual' }, emoji: '✨', accent: '#c9a84c' },
  { id: 'mind', view: 'intellectual', moduleId: { universal: 'intellectual', muslim: 'intellectual' }, name: { universal: 'Mind', muslim: 'Aql' }, realm: { universal: 'Intellectual', muslim: 'Intelektual' }, emoji: '🧠', accent: '#7aa2f7' },
  { id: 'body', view: 'physical', moduleId: { universal: 'physical', muslim: 'physical' }, name: { universal: 'Body', muslim: 'Jasad' }, realm: { universal: 'Physical', muslim: 'Fizikal' }, emoji: '💪', accent: '#f7768e' },
  { id: 'heart', view: 'emotional', moduleId: { universal: 'emotional', muslim: 'emotional' }, name: { universal: 'Heart', muslim: 'Qalb' }, realm: { universal: 'Emotional', muslim: 'Emosi' }, emoji: '💖', accent: '#ff9e64' },
  { id: 'tribe', view: 'social', moduleId: { universal: 'social', muslim: 'social' }, name: { universal: 'Tribe', muslim: 'Suhbah' }, realm: { universal: 'Social', muslim: 'Sosial' }, emoji: '🤝', accent: '#bb9af7' },
  { id: 'planet', view: 'environmental', moduleId: { universal: 'environmental', muslim: 'environmental' }, name: { universal: 'Planet', muslim: "Bi'ah" }, realm: { universal: 'Environmental', muslim: 'Alam Sekitar' }, emoji: '🌿', accent: '#9ece6a' },
  { id: 'wealth', view: 'vocational', moduleId: { universal: 'vocational', muslim: 'vocational' }, name: { universal: 'Wealth', muslim: 'Rizq' }, realm: { universal: 'Career', muslim: 'Kerjaya' }, emoji: '🧭', accent: '#e0af68' },
  { id: 'digital', view: 'behaviour', moduleId: { universal: null, muslim: null }, name: { universal: 'Digital', muslim: 'Raqmi' }, realm: { universal: 'Tech & AI', muslim: 'Digital' }, emoji: '⬡', accent: '#7dcfff' },
];

export const worldModuleId = (world: GameWorld, isMuslim: boolean): string | null =>
  isMuslim ? world.moduleId.muslim : world.moduleId.universal;

export const worldForModule = (moduleId: string): GameWorld | undefined =>
  GAME_WORLDS.find((w) => w.moduleId.universal === moduleId || w.moduleId.muslim === moduleId);

// ── Ranks ─────────────────────────────────────────────────────────────────────
// A title earned by level. Titles describe growth in learning, not status over others.
const RANKS: { minLevel: number; universal: string; muslim: string; emoji: string }[] = [
  { minLevel: 1, universal: 'Seeker', muslim: 'Pencari', emoji: '🌱' },
  { minLevel: 3, universal: 'Explorer', muslim: 'Peneroka', emoji: '🧭' },
  { minLevel: 5, universal: 'Pathfinder', muslim: 'Perintis', emoji: '🗺️' },
  { minLevel: 7, universal: 'Guardian', muslim: 'Penjaga', emoji: '🛡️' },
  { minLevel: 9, universal: 'Mentor', muslim: 'Pembimbing', emoji: '🕯️' },
  { minLevel: 12, universal: 'Sage', muslim: 'Bijaksana', emoji: '🌟' },
];

export const rankForLevel = (level: number, isMuslim: boolean): { title: string; emoji: string; nextAt: number | null } => {
  let i = 0;
  while (i + 1 < RANKS.length && level >= RANKS[i + 1].minLevel) i++;
  return {
    title: isMuslim ? RANKS[i].muslim : RANKS[i].universal,
    emoji: RANKS[i].emoji,
    nextAt: RANKS[i + 1]?.minLevel ?? null,
  };
};

// ── XP rules ──────────────────────────────────────────────────────────────────
// Every reward is earned by a learning action and is paid once, so replaying a
// quest cannot farm XP. Nothing is random and nothing is lost by taking a break.
export const XP = {
  lesson: 10,
  perCorrectAnswer: 10,
  reflection: 10,
  worldComplete: 100,
} as const;

/** A quest is cleared when at least two thirds of the challenge is answered correctly. */
export const isPass = (score: number, total: number): boolean => total > 0 && score / total >= 2 / 3;

/** 0-3 stars from the best challenge score. */
export const starsFor = (bestScore: number, total: number): number =>
  total > 0 ? Math.round((bestScore / total) * 3) : 0;

export interface QuestProgress {
  lessonDone: boolean;
  /** Best number of correct answers in the challenge so far. */
  bestScore: number;
  total: number;
  attempts: number;
  reflectionDone: boolean;
  /** Set the first time the challenge is passed. */
  completedAt?: string;
}

export const EMPTY_QUEST: QuestProgress = { lessonDone: false, bestScore: 0, total: 0, attempts: 0, reflectionDone: false };

export const isQuestComplete = (p?: QuestProgress): boolean => Boolean(p?.completedAt);

/** Quests in a world unlock in order: the first is open, each next one opens when the previous is cleared. */
export const isQuestUnlocked = (index: number, topicIds: string[], quests: Record<string, QuestProgress>): boolean =>
  index === 0 || isQuestComplete(quests[topicIds[index - 1]]);

export const worldProgress = (topicIds: string[], quests: Record<string, QuestProgress>) => {
  const done = topicIds.filter((id) => isQuestComplete(quests[id])).length;
  const stars = topicIds.reduce((n, id) => n + (quests[id] ? starsFor(quests[id].bestScore, quests[id].total) : 0), 0);
  return { done, total: topicIds.length, stars, maxStars: topicIds.length * 3, complete: topicIds.length > 0 && done === topicIds.length };
};

// ── Badges ────────────────────────────────────────────────────────────────────
export const worldBadgeId = (worldId: string): string => `world-${worldId}`;

export const WORLD_BADGES: Badge[] = GAME_WORLDS.filter((w) => w.moduleId.universal).map((w) => ({
  id: worldBadgeId(w.id),
  name: `${w.name.universal} World Cleared`,
  description: `Cleared every quest in the ${w.name.universal} world.`,
  icon: w.emoji,
}));

// ── Daily streak ──────────────────────────────────────────────────────────────
// Counts consecutive days the learner opened the app. Missing a day resets the
// count to 1 the next time they return; no XP or progress is taken away.
const dayKey = (d: Date): string => d.toISOString().split('T')[0];

export const touchStreak = (): number => {
  try {
    const today = dayKey(new Date());
    const saved = parseInt(localStorage.getItem('hla_streak') || '0', 10) || 0;
    const last = localStorage.getItem('hla_last_login') || '';
    if (last === today) return Math.max(saved, 1);
    const next = last === dayKey(new Date(Date.now() - 86400000)) ? saved + 1 : 1;
    localStorage.setItem('hla_streak', String(next));
    localStorage.setItem('hla_last_login', today);
    return next;
  } catch {
    return 1;
  }
};
