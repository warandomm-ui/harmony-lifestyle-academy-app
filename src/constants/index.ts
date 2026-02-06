import type { AnalysisResult, GoalCategory, SurveySection } from '../types';

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

// Student 360 Assessment Survey
export const STUDENT_360_SURVEY: SurveySection[] = [
  {
    id: 'learning-style',
    title: 'Learning Style',
    description: 'Discover how you learn best and retain information most effectively.',
    questions: [
      {
        id: 'ls1',
        text: 'When learning something new, I prefer to:',
        type: 'multiple-choice',
        options: [
          { value: 'visual', text: 'See diagrams, charts, or demonstrations' },
          { value: 'auditory', text: 'Listen to explanations or discussions' },
          { value: 'reading', text: 'Read written instructions or books' },
          { value: 'kinesthetic', text: 'Try it hands-on and learn by doing' },
        ],
      },
      {
        id: 'ls2',
        text: 'I remember information best when I:',
        type: 'rating-scale',
        value: 'visual_memory',
        scale: { min: 1, max: 5 },
      },
    ],
  },
  {
    id: 'motivation',
    title: 'Motivation & Drive',
    description: 'Understand what motivates you and keeps you going.',
    questions: [
      {
        id: 'mo1',
        text: 'What drives you most in your personal development?',
        type: 'selection',
        options: [
          { value: 'achievement', text: 'Achievement: Reaching goals and milestones gives me satisfaction' },
          { value: 'growth', text: 'Growth: Becoming a better version of myself each day' },
          { value: 'connection', text: 'Connection: Building meaningful relationships with others' },
          { value: 'impact', text: 'Impact: Making a difference in the world around me' },
        ],
      },
      {
        id: 'mo2',
        text: 'How often do you set personal goals for yourself?',
        type: 'rating-scale',
        value: 'goal_setting_frequency',
        scale: { min: 1, max: 5 },
      },
    ],
  },
  {
    id: 'multiple-intelligences',
    title: 'Your Intelligences',
    description: 'Identify your unique combination of strengths and abilities.',
    questions: [
      {
        id: 'mi1',
        text: 'Select up to 3 areas where you feel most capable:',
        type: 'multiple-choice',
        options: [
          { value: 'linguistic', text: 'Words & Language - Reading, writing, storytelling' },
          { value: 'logical', text: 'Logic & Numbers - Problem-solving, patterns, analysis' },
          { value: 'spatial', text: 'Visual & Spatial - Art, design, visualization' },
          { value: 'musical', text: 'Music & Rhythm - Melody, harmony, sound patterns' },
          { value: 'bodily', text: 'Physical & Movement - Sports, dance, hands-on skills' },
          { value: 'interpersonal', text: 'People & Social - Understanding others, teamwork' },
          { value: 'intrapersonal', text: 'Self-awareness - Reflection, emotions, personal insight' },
          { value: 'naturalistic', text: 'Nature & Environment - Plants, animals, ecosystems' },
        ],
      },
    ],
  },
  {
    id: 'wellbeing',
    title: 'Wellbeing Check',
    description: 'Rate your current state in these key life areas.',
    questions: [
      {
        id: 'wb1',
        text: 'How would you rate your current energy levels?',
        type: 'rating-scale',
        value: 'energy_level',
        scale: { min: 1, max: 5 },
      },
      {
        id: 'wb2',
        text: 'How balanced do you feel in your daily life?',
        type: 'rating-scale',
        value: 'life_balance',
        scale: { min: 1, max: 5 },
      },
      {
        id: 'wb3',
        text: 'How confident are you in achieving your goals?',
        type: 'rating-scale',
        value: 'goal_confidence',
        scale: { min: 1, max: 5 },
      },
    ],
  },
];
