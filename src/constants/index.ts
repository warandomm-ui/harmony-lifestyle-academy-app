import type { AnalysisResult, GoalCategory } from '../types';

export const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string; color: string }[] = [
  { value: 'health', label: 'Health & Fitness', icon: '💪', color: 'hsl(160 60% 45%)' },
  { value: 'career', label: 'Career & Work', icon: '💼', color: 'hsl(220 70% 50%)' },
  { value: 'relationships', label: 'Relationships', icon: '❤️', color: 'hsl(340 75% 55%)' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'hsl(45 90% 50%)' },
  { value: 'personal-growth', label: 'Personal Growth', icon: '🌱', color: 'hsl(120 60% 45%)' },
  { value: 'creativity', label: 'Creativity', icon: '🎨', color: 'hsl(280 70% 55%)' },
  { value: 'spirituality', label: 'Spirituality', icon: '🧘', color: 'hsl(200 70% 50%)' },
];

export const SKILLS_LIST = [
  'Time Management',
  'Goal Setting',
  'Mindfulness',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Emotional Intelligence',
  'Financial Planning',
  'Health & Nutrition',
  'Stress Management',
  'Creativity',
  'Networking',
];

export const DEFAULT_ANALYSIS_RESULT: AnalysisResult = {
  overallScore: 0,
  categories: GOAL_CATEGORIES.map(cat => ({
    category: cat.value,
    score: 0,
    trend: 'stable' as const,
  })),
  strengths: [],
  areasForImprovement: [],
  recommendations: [],
};
