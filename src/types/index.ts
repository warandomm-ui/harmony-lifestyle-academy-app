// Core application types for Harmony Lifestyle Academy

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserStatus {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActive: Date;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface LifeVision {
  id: string;
  title: string;
  description: string;
  goals: LifeGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LifeGoal {
  id: string;
  title: string;
  category: GoalCategory;
  progress: number;
  milestones: Milestone[];
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
}

export type GoalCategory = 
  | 'health' 
  | 'career' 
  | 'relationships' 
  | 'finance' 
  | 'personal-growth' 
  | 'creativity' 
  | 'spirituality';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface AnalysisResult {
  overallScore: number;
  categories: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: Recommendation[];
}

export interface CategoryScore {
  category: GoalCategory;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: GoalCategory;
  level: number;
  description: string;
}

// Onboarding types
export interface OnboardingData {
  step: number;
  profile: Partial<UserProfile>;
  goals: string[];
  skills: string[];
  visionStatement: string;
}

// Dashboard types
export interface DashboardStats {
  dailyProgress: number;
  weeklyGoals: number;
  completedTasks: number;
  currentStreak: number;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
