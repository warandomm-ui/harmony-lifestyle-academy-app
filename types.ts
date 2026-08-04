export type QuestionType = 'multiple-choice' | 'rating-scale' | 'selection';

// ═══ NEW: Dashboard mode — determined by religion at registration ═══
// Muslim student → 'muslim' → sees Quran, Sunnah, Doa, Arabic
// Non-Muslim student → 'universal' → sees Science, Philosophy, Wisdom
// Set ONCE at registration. No toggle. No overlap.
export type DashboardMode = 'muslim' | 'universal';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: {
    text: string;
    value: string | number;
  }[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
  value?: string;
}

export interface SurveySection {
  id: 'disc' | 'mbti' | 'enneagram' | 'bigFive' | 'hexaco' | 'temperament' | 'socialStyles' | 'multipleIntelligences';
  title: string;
  description: string;
  questions: Question[];
}

export interface SurveyAnswers {
  [sectionId: string]: { [questionId: string]: any };
}

export interface CareerRecommendation {
  name: string;
  match?: number;
  why?: string;
  skills: string[];
  salary: string;
}

export interface LearningPath {
  startWith: string;
  thenMaster: string;
  buildToward: string;
}

export interface StartupIdea {
  title: string;
  description: string;
  targetMarket: string;
  validationSteps: string[];
  challenges: string[];
}

export interface AnalysisResult {
    studentProfile: {
        disc: { style: string; summary: string; };
        mbti: { type: string; summary:string; };
        enneagram: { type: string; summary:string; };
        bigFive: { summary:string; traits: { name: string; score: number }[] };
        hexaco: { summary:string; traits: { name: string; score: number }[] };
        temperament: { type: string; summary:string; };
        socialStyles: { style: string; summary: string; };
        multipleIntelligences: { topIntelligences: string[]; summary:string; };
    };
    overallSummary: string;
    recommendedStudyTechniques: string[];
    lifeSkills: string[];
    specialSkills: string[];
    recommendedSports: string[];
    startupIdeas: StartupIdea[];
    personalityType: string;
    emoji: string;
    summary: {
        coreStrengths: string[];
        naturalTalents: string[];
        learningStyle: string;
        workEnvironmentFit: string;
    };
    careerRecommendations: CareerRecommendation[];
    otherCareerOptions: CareerRecommendation[];
    learningPath: LearningPath;
}

export type Goal = 'school' | 'career' | 'skills' | 'life' | 'university' | 'freelance' | 'community' | 'hobby' | 'wisdom' | 'knowledge' | 'health' | 'financial' | 'business' | 'fitness' | 'communication' | 'social' | 'behaviour';

export interface LifeVision {
  vision: string;
  mission: string;
  wisdomGoal: string;
  knowledgeGoal: string;
  careerFinanceGoal: string;
  healthFitnessGoal: string;
  socialCommGoal: string;
}

export type EducationLevel = 'Tingkatan 1' | 'Tingkatan 2' | 'Tingkatan 3' | 'Tingkatan 4' | 'Tingkatan 5' | 'Post-SPM / Foundation' | 'Diploma student' | 'University student' | 'Working professional' | 'Career changer';
export type SchoolType = 'Government school' | 'Private school' | 'International school' | 'Homeschooled' | 'Not in school';
export type TimeAvailability = '1-3 hours' | '4-7 hours' | '8-15 hours' | '16+ hours';
export type LearningPreference = 'Self-paced video lessons' | 'Live classes & mentorship' | 'Project-based learning' | 'Community study groups' | 'One-on-one guidance';
export type LearningMethod = 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing';

export interface UserStatus {
  educationLevel: EducationLevel | null;
  schoolType: SchoolType | null;
  timeAvailability: TimeAvailability | null;
  learningPreferences: LearningPreference[];
  learningMethods: LearningMethod[];
}

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LessonType = 'Video' | 'Reading' | 'Quiz' | 'Project' | 'Audio';
export type ContentType = 'video' | 'audio' | 'pdf' | 'text' | 'quiz';

export interface LessonContent {
  type: ContentType;
  url: string;
  text?: string;
  duration?: number;
  filename?: string;
}

export interface CourseLesson {
  id?: string;
  title: string;
  description: string;
  type: LessonType;
  content?: LessonContent;
  isCompleted?: boolean;
}

export interface CourseModule {
  id?: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface CourseOutline {
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  duration: string;
  modules: CourseModule[];
}

export interface Course {
    id: string; 
    icon: string;
    title: string;
    subtitle: string;
    description?: string;
    learningObjectives?: string[];
    syllabus?: string[];
    schedule?: string;
    outcomes?: string[];
    progress: number;
    modules?: CourseModule[];
}

export type AdminRole = 'admin' | 'super-admin';

export type DashboardView =
  | 'dashboard'
  | 'student-dashboard'
  | 'leaderboard'
  | 'badges'
  | 'profile'
  | 'idea-wall'
  | 'notebook'
  | 'real-world'
  | 'community-space'
  | 'the-path'
  | 'admin'
  | 'admin-setup'
  | 'admin-branding'
  | 'admin-spaces'
  | 'admin-members'
  | 'admin-gamification'
  | 'admin-moderation'
  | 'admin-invites'
  | 'admin-plans'
  | 'admin-rewards'
  | 'admin-marketing'
  | 'admin-google-cloud'
  | 'admin-courses'
  | 'admin-coupons'
  | 'admin-affiliates'
  | 'admin-revenue'
  | 'admin-integrations'
  | 'admin-profit-sharing'
  | 'admin-resources'
  | 'physical'
  | 'emotional'
  | 'social'
  | 'social-impact'
  | 'intellectual'
  | 'language-lab' 
  | 'spiritual'
  | 'environmental'
  | 'vocational'
  | 'wisdom'
  | 'knowledge'
  | 'health'
  | 'financial'
  | 'business'
  | 'fitness'
  | 'communication'
  | 'behaviour'
  | 'practice-hub'
  | 'course-player'
  | 'sunnah-module'
  | 'school-subjects'
  | 'wellness-module' | 'study-planner' | 'start-here' | 'my-path' | 'parent-dashboard' | 'lesson';

export type Transcript = {
  speaker: 'user' | 'model';
  text: string;
  isFinal: boolean;
  groundingLinks?: { uri: string; title: string }[];
};

export interface AdminAssistanceResult {
  text: string;
  groundingLinks?: { uri: string; title: string }[];
}

export interface StudentDataItem {
  userId: string;
  activity: string;
  timestamp: string;
  engagementScore: number;
  quizScore?: number;
  timeSpentMinutes: number;
  feedback?: string;
  personalityType?: string;
  careerPath?: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    tags?: string[];
}

export type Emotion = 'Happy' | 'Neutral' | 'Sad' | 'Anxious' | 'Angry' | 'Excited' | 'Calm';

export interface EmotionEntry {
  date: string;
  emotion: Emotion;
  note?: string;
}

export interface WeeklyEmotionReview {
  summary: string;
  reflectionQuestions: string[];
  actionableTip: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  reminderTime?: string;
  linkedGoal?: string;
}

export interface TimeTableEntry {
  id: string;
  date: string;
  time: string;
  activity: string;
  type: 'study' | 'leisure' | 'fitness' | 'other';
  colorClass: string;
}

export interface OnlineStudySection {
  name: string;
  url: string;
  description: string;
}

export interface EducationCountry {
  name: string;
  flagEmoji: string;
  summary: string;
  onlineStudySections: OnlineStudySection[];
}

export interface PaymentMethod {
  id: string;
  cardType: 'Visa' | 'Mastercard' | 'American Express';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'month' | 'year';
  features: string[];
  isRecommended?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Study Template' | 'Merch' | 'E-Book' | 'Digital Tool';
  price: number;
  description: string;
  imageUrl: string;
}

export interface SupportHotline {
  name: string;
  phone: string;
  phoneDisplay: string;
  hours: string;
  description: string;
}

export interface AnonymousPost {
  id: string;
  content: string;
  timestamp: string;
  userId: string; 
}

export type ChatGroupCategory = 'Student' | 'Parent' | 'Female Only' | 'Male Only' | 'Mixed Gender';

export interface ChatGroup {
  name: string;
  members: string;
  category: ChatGroupCategory;
}

export interface GamificationProfile {
  points: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  userName: string;
  points: number;
  isCurrentUser: boolean;
  avatar: string;
}

export type StudyMode = 'idle' | 'quiz' | 'explain' | 'encourage';

export interface StudyBuddyMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
  explanation?: string;
  isCorrect?: boolean;
}

export interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
}

export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: 'Open' | 'Resolved';
  timestamp: string;
  resolutionSteps?: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  };
}

export interface CybersecurityChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  rewardPoints: number;
  status: 'Not Started' | 'Completed';
}

export interface CulinaryChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  cuisine: string;
  rewardPoints: number;
  status: 'Not Started' | 'Completed';
  steps: {
    instruction: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
}

export interface AIProject {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  rewardPoints: number;
  status: 'Not Started' | 'Completed';
  steps: {
    instruction: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
}

export interface MartialArtTechnique {
  id: string;
  name: string;
  style: string;
  description: string;
  quiz: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  };
}

export interface UserProfile {
  name: string;
  age: number | null;
  gender: string;
  race: string;
  religion: string;
  schoolName: string;
  state: string;
  country: string;
  email?: string;
  role?: 'student' | 'admin' | 'instructor';
  timezone?: string;
}

export type UserRole = 'student' | 'admin' | 'instructor';

export type PayoutStatus = 'suggested' | 'approved' | 'rejected';
export type StudentLevel = 'Learner' | 'Mentor' | 'Partner';

export interface StudentRewardInfo {
  student_id: string;
  name: string;
  avatar: string;
  level: StudentLevel;
  progress_score: number;
  contribution_points: number;
  harmony_coins: number;
  suggested_payout: number;
  status: PayoutStatus;
}

export interface ProfitPoolInfo {
  month: string;
  total_pool_amount: number;
  eligible_students: number;
}

export interface ProfitSharingCycle {
    id: string;
    month: string;
    totalPool: number;
    eligibleStudents: number;
    status: 'Active' | 'Distributed' | 'Calculating';
    distributedDate?: string;
}

export type ProjectStatus = 'Open' | 'In Progress' | 'Completed';

export interface SocialImpactProject {
    id: string;
    title: string;
    description: string;
    location: string;
    impactArea: string;
    status: ProjectStatus;
    teamSize: string;
    incomePotential: boolean;
    requiredSkills: string[];
    objectives: string[];
}

export interface SpiritualGuidanceResponse {
  category: string;
  problem_summary: string;
  sunnah_solution: {
    title: string;
    page_reference: string;
  };
  quran_support: {
    surah: string;
    ayat_number: string;
    translation: string;
  };
  action_step_today: string;
  motivation: string;
}

// --- Spiritual Academy Learning Types ---
export interface Surah {
    number: number;
    name: string;
    englishName: string;
    description: string;
    videoUrl?: string; 
    readingContent?: string;
    tags: string[]; 
}

export interface SpiritualCategory {
    id: string;
    title: string; 
    arabicTitle: string;
    description: string;
    longDescription?: string;
    keywords?: string[];
    icon: string;
    color: string;
    surahs: Surah[];
}

export interface SkillSuggestion {
    recommendedSkills: { skill: string; reason: string }[];
    smartSuggestions?: { context: string; skills: string[] }[];
}

export interface GroundedCareerDetail {
    groundedExplanation: string;
    groundedSalaryRange: string;
    jobMarketTrends: string;
    groundingLinks: { uri: string; title: string }[];
}

// --- Claude AI Generated Module Content ---
export interface GeneratedLesson {
  title: string;
  explanation: string;
  keyPoints: string[];
  practicalTip: string;
  deeperInsight: string;
}

export interface GeneratedQuiz {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface GeneratedReflection {
  prompt: string;
  guidingQuestions: string[];
}

export interface GeneratedModuleContent {
  lesson: GeneratedLesson;
  quiz: GeneratedQuiz;
  reflection: GeneratedReflection;
  module: string;
  topic: string;
  generatedAt: string;
}

// ═══ NEW: Profile data structure for Supabase storage ═══
export interface ProfileData {
  profile: UserProfile;
  results: AnalysisResult;
  status: UserStatus;
  vision: LifeVision;
  skills: string[];
  dashboardMode: DashboardMode;
}

// Global type extensions for Vite env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      GEMINI_API_KEY: string;
      VITE_GEMINI_API_KEY: string;
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    }
  }
}
