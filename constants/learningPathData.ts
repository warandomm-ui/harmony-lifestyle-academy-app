import type {
  PathLevel, StudentInterest, StudentPersonality, AgeGroup,
  StudentLearningPath, PathLesson,
} from '../types';

/* ═══════════════════════════════════════════════
   LEARNING PATH DATA — Curriculum for both age groups
   ═══════════════════════════════════════════════ */

// ─── Lessons for Age 7-12 ───

const JUNIOR_LEVEL_1_LESSONS: PathLesson[] = [
  {
    id: 'j1-1', title: 'Adab & Respect', description: 'Learn the foundation of good character',
    learnContent: 'Good akhlaq (character) starts with respecting parents, teachers, and elders. The Prophet ﷺ said: "The best of you are those who have the best manners." This means being kind, saying salam, and helping others without being asked.',
    doTask: 'Practice saying "Assalamualaikum" to 5 people today and hold the door open for someone.',
    sharePrompt: 'Take a photo or write about how people reacted when you greeted them kindly.',
    status: 'available', pointsReward: 50,
  },
  {
    id: 'j1-2', title: 'Morning Routine Power', description: 'Build a simple daily routine',
    learnContent: 'A strong day starts with a strong morning. Wake up early, make your bed, brush your teeth, eat breakfast, and plan your day. Discipline means doing what you should — even when you don\'t feel like it.',
    doTask: 'Follow a morning checklist for 3 days: Wake up → Make bed → Breakfast → Read 10 minutes.',
    sharePrompt: 'Upload a photo of your completed morning checklist or describe your routine.',
    status: 'locked', pointsReward: 50,
  },
  {
    id: 'j1-3', title: 'Honesty & Amanah', description: 'Why trust matters',
    learnContent: 'Amanah means being trustworthy. If someone gives you a task, you finish it. If you make a mistake, you admit it. Being honest builds trust, and trust builds strong relationships.',
    doTask: 'Return something you borrowed, or help with a chore without being asked — and tell the truth all day.',
    sharePrompt: 'Write about a moment today where you chose honesty, even if it was hard.',
    status: 'locked', pointsReward: 50,
  },
  {
    id: 'j1-4', title: 'Gratitude & Contentment', description: 'The power of saying Alhamdulillah',
    learnContent: 'Shukr (gratitude) is saying "thank you" to Allah and to people. When you appreciate what you have, you feel happier. Write 3 things you are grateful for every night before sleeping.',
    doTask: 'Keep a gratitude journal for 3 days — write 3 things you are thankful for each day.',
    sharePrompt: 'Share your top 3 gratitude entries from this week.',
    status: 'locked', pointsReward: 50,
  },
];

const JUNIOR_LEVEL_2_LESSONS: PathLesson[] = [
  {
    id: 'j2-1', title: 'Plant a Seed', description: 'Hands-on agriculture basics',
    learnContent: 'Growing food teaches patience and responsibility. You\'ll learn how to plant a seed, care for it daily, and watch it grow. This is real-life science you can eat!',
    doTask: 'Plant a seed (cili, kangkung, or any herb) in a small pot. Water it daily and track its growth.',
    sharePrompt: 'Upload a photo of your planted seed and write what type of plant it is.',
    status: 'locked', pointsReward: 75,
  },
  {
    id: 'j2-2', title: 'Kitchen Helper', description: 'Learn to cook a simple healthy meal',
    learnContent: 'Cooking is a life skill everyone needs. Start simple: learn to make a sandwich, boil an egg, or prepare a fruit salad. Always ask an adult for help near the stove!',
    doTask: 'With a parent, prepare one simple meal or snack from scratch. Clean up after yourself.',
    sharePrompt: 'Take a photo of the meal you prepared and describe the steps you followed.',
    status: 'locked', pointsReward: 75,
  },
  {
    id: 'j2-3', title: 'Money Basics', description: 'Saving and spending wisely',
    learnContent: 'Money is a tool. Learn the difference between needs and wants. If you get RM5 pocket money, try saving RM1. Track where your money goes for one week.',
    doTask: 'Create a simple money tracker: Income / Savings / Spending for one week.',
    sharePrompt: 'Share your weekly money tracker and tell us what you learned about your spending.',
    status: 'locked', pointsReward: 75,
  },
  {
    id: 'j2-4', title: 'Body in Motion', description: 'Simple fitness and healthy habits',
    learnContent: 'Your body is an amanah (trust) from Allah. Move it daily! Try 10 jumping jacks, 5 push-ups, and a short walk. Eat fruits and drink water — avoid too much sugar.',
    doTask: 'Do a 15-minute exercise routine for 3 days. Track what you did each day.',
    sharePrompt: 'Record or describe your 3-day exercise routine. How did you feel after?',
    status: 'locked', pointsReward: 75,
  },
];

const JUNIOR_LEVEL_3_LESSONS: PathLesson[] = [
  {
    id: 'j3-1', title: 'Mini Business Plan', description: 'Create your first halal business idea',
    learnContent: 'Everyone can create value! Think about what people around you need. Maybe cookies, bookmarks, or a small service. Write a simple plan: What will you sell? Who will buy it? How much will it cost?',
    doTask: 'Write a 1-page business plan with: Product, Price, Customer, and How to sell it.',
    sharePrompt: 'Upload your 1-page business plan or present it in a short video.',
    status: 'locked', pointsReward: 100,
  },
  {
    id: 'j3-2', title: 'Community Helper', description: 'Give back to your community',
    learnContent: 'The best people benefit others. Choose a small project: clean a public area, help an elderly neighbor, or donate old books. Small actions create big change.',
    doTask: 'Complete one community service activity this week. It can be as simple as cleaning up litter nearby.',
    sharePrompt: 'Take photos or write a report about your community service activity.',
    status: 'locked', pointsReward: 100,
  },
  {
    id: 'j3-3', title: 'My Presentation', description: 'Share what you learned with others',
    learnContent: 'Great leaders can explain ideas clearly. Prepare a 2-minute presentation about something you learned in this program. Practice speaking clearly and confidently.',
    doTask: 'Present to your family or friends about your favorite lesson. Speak for at least 2 minutes.',
    sharePrompt: 'Record a short video of your presentation or describe how it went.',
    status: 'locked', pointsReward: 100,
  },
];

// ─── Lessons for Age 13-17 ───

const TEEN_LEVEL_1_LESSONS: PathLesson[] = [
  {
    id: 't1-1', title: 'Discipline & Purpose', description: 'Build your foundation of self-mastery',
    learnContent: 'Discipline is the bridge between goals and accomplishment. Start with 5 daily non-negotiables: wake time, prayer/meditation, exercise, learning, and sleep time. Consistency beats motivation.',
    doTask: 'Create your personal "5 Daily Non-Negotiables" list and follow it for 5 days straight.',
    sharePrompt: 'Share your 5 non-negotiables list and track your 5-day streak.',
    status: 'available', pointsReward: 60,
  },
  {
    id: 't1-2', title: 'Islamic Foundations', description: 'Core values that guide everything',
    learnContent: 'Islam teaches balance — between dunya (world) and akhirah (hereafter). The 5 pillars form your spiritual discipline. Understand why each pillar builds a stronger version of you, not just rituals.',
    doTask: 'Write a personal reflection: How do the 5 pillars connect to building discipline in your daily life?',
    sharePrompt: 'Share your reflection (text or video) on how Islamic foundations shape your daily habits.',
    status: 'locked', pointsReward: 60,
  },
  {
    id: 't1-3', title: 'Emotional Intelligence', description: 'Master your emotions before they master you',
    learnContent: 'EQ (Emotional Quotient) is knowing what you feel, why you feel it, and choosing how to respond. The Prophet ﷺ said: "The strong man is not the one who can wrestle, but the one who controls himself when angry."',
    doTask: 'Keep an emotion journal for 3 days: Record triggers, feelings, and how you responded.',
    sharePrompt: 'Share one insight from your emotion journal about a pattern you noticed.',
    status: 'locked', pointsReward: 60,
  },
  {
    id: 't1-4', title: 'Time Management', description: 'Use your 24 hours wisely',
    learnContent: 'Time is your most valuable resource — you can\'t get it back. Use time-blocking: divide your day into focused blocks (study, exercise, rest, worship). The 80/20 rule: 20% of your efforts produce 80% of results.',
    doTask: 'Create a weekly time-block schedule. Follow it for one full week and track what worked.',
    sharePrompt: 'Upload your time-block schedule and describe what you learned about your time usage.',
    status: 'locked', pointsReward: 60,
  },
];

const TEEN_LEVEL_2_LESSONS: PathLesson[] = [
  {
    id: 't2-1', title: 'Halal Income Mindset', description: 'Learn how money really works',
    learnContent: 'Islam encourages earning — as long as it\'s halal (permissible). Understand value creation: you earn money by solving problems. Start thinking like an entrepreneur: "What problem can I solve?"',
    doTask: 'Identify 3 real problems in your community or school. For each, brainstorm a business solution.',
    sharePrompt: 'Present your 3 problem-solution pairs. Which one excites you most?',
    status: 'locked', pointsReward: 80,
  },
  {
    id: 't2-2', title: 'Communication & Influence', description: 'Speak with clarity and confidence',
    learnContent: 'Great communicators listen more than they talk. Learn the STAR method (Situation, Task, Action, Result) for clear storytelling. Practice speaking in front of a mirror for 5 minutes daily.',
    doTask: 'Record a 2-minute video explaining your favorite topic using the STAR method.',
    sharePrompt: 'Upload your 2-minute video and rate your own performance (what went well, what to improve).',
    status: 'locked', pointsReward: 80,
  },
  {
    id: 't2-3', title: 'Digital Skills & AI', description: 'Use technology as a tool, not a distraction',
    learnContent: 'Technology is a tool for impact. Learn how to use AI assistants to help with homework, Canva for design, and basic spreadsheets for tracking. Limit social media to 30 minutes/day.',
    doTask: 'Create something useful using a digital tool: a poster, a budget tracker, or an AI-generated study guide.',
    sharePrompt: 'Share what you created with the digital tool and explain how it could help others.',
    status: 'locked', pointsReward: 80,
  },
  {
    id: 't2-4', title: 'Fitness & Nutrition Plan', description: 'Build a body that supports your goals',
    learnContent: 'Your physical health directly impacts your mental performance. Create a simple plan: 30 min exercise/day, drink 8 glasses of water, eat more vegetables, sleep 7-8 hours.',
    doTask: 'Follow a 7-day fitness + nutrition plan. Track your energy levels each day (1-10 scale).',
    sharePrompt: 'Share your 7-day tracking sheet and describe how your energy levels changed.',
    status: 'locked', pointsReward: 80,
  },
];

const TEEN_LEVEL_3_LESSONS: PathLesson[] = [
  {
    id: 't3-1', title: 'Start Your Side Hustle', description: 'Earn your first halal income',
    learnContent: 'It\'s time to turn knowledge into action. Pick one idea from Level 2 and make it real. Start small: sell online, offer a service (tutoring, design, baking), or create digital content.',
    doTask: 'Launch your mini business: Make your first sale or deliver your first service. Document everything.',
    sharePrompt: 'Share proof of your first sale/service: screenshots, photos, or a video journal.',
    status: 'locked', pointsReward: 150,
  },
  {
    id: 't3-2', title: 'Financial Tracking', description: 'Track every ringgit',
    learnContent: 'If you can\'t measure it, you can\'t manage it. Track income, expenses, and profit. Learn about saving (10-20% of income), giving (sadaqah), and reinvesting.',
    doTask: 'Create a financial tracker for your side hustle or personal money. Track for 2 weeks.',
    sharePrompt: 'Upload your financial tracker and share your biggest financial lesson.',
    status: 'locked', pointsReward: 150,
  },
  {
    id: 't3-3', title: 'Impact Project', description: 'Use your skills to benefit the ummah',
    learnContent: 'True success is when your success benefits others. Plan a small impact project: teach younger kids, organize a clean-up, or fundraise for a cause. Lead with ihsan (excellence).',
    doTask: 'Plan and execute one impact project this month. Get at least 3 people involved.',
    sharePrompt: 'Document your impact project with photos, a written report, and feedback from participants.',
    status: 'locked', pointsReward: 150,
  },
];

// ─── Level Templates ───

const JUNIOR_LEVELS: PathLevel[] = [
  {
    id: 'junior-l1', number: 1, title: 'Akhlaq & Discipline',
    subtitle: 'Build your character foundation',
    description: 'Learn the basics of good character, daily routines, honesty, and gratitude.',
    durationWeeks: '1-2 weeks', status: 'current',
    lessons: JUNIOR_LEVEL_1_LESSONS,
    badge: { name: 'Character Builder', icon: '🌟' },
  },
  {
    id: 'junior-l2', number: 2, title: 'Explore & Build Skills',
    subtitle: 'Hands-on learning adventures',
    description: 'Plant seeds, cook meals, learn about money, and get active.',
    durationWeeks: '1-2 weeks', status: 'locked',
    lessons: JUNIOR_LEVEL_2_LESSONS,
    badge: { name: 'Skill Explorer', icon: '🔍' },
  },
  {
    id: 'junior-l3', number: 3, title: 'Mini Project',
    subtitle: 'Apply what you learned',
    description: 'Create a business plan, help your community, and present your journey.',
    durationWeeks: '1-2 weeks', status: 'locked',
    lessons: JUNIOR_LEVEL_3_LESSONS,
    badge: { name: 'Young Leader', icon: '🏆' },
  },
];

const TEEN_LEVELS: PathLevel[] = [
  {
    id: 'teen-l1', number: 1, title: 'Discipline & Islamic Foundation',
    subtitle: 'Master yourself first',
    description: 'Build daily discipline, deepen Islamic understanding, develop EQ, and manage your time.',
    durationWeeks: '1-2 weeks', status: 'current',
    lessons: TEEN_LEVEL_1_LESSONS,
    badge: { name: 'Foundation Master', icon: '⚡' },
  },
  {
    id: 'teen-l2', number: 2, title: 'Skill Building',
    subtitle: 'Business, tech, communication & health',
    description: 'Learn halal income, communication, digital skills, and fitness planning.',
    durationWeeks: '1-2 weeks', status: 'locked',
    lessons: TEEN_LEVEL_2_LESSONS,
    badge: { name: 'Skill Builder', icon: '🛠️' },
  },
  {
    id: 'teen-l3', number: 3, title: 'Real-World Project',
    subtitle: 'Earn, track, and give back',
    description: 'Start a side hustle, track finances, and create an impact project.',
    durationWeeks: '1-2 weeks', status: 'locked',
    lessons: TEEN_LEVEL_3_LESSONS,
    badge: { name: 'Changemaker', icon: '🌍' },
  },
];

// ─── Path Generator ───

export function generateLearningPath(
  ageGroup: AgeGroup,
  interests: StudentInterest[],
  personality: StudentPersonality,
): StudentLearningPath {
  const levels = ageGroup === '7-12'
    ? JUNIOR_LEVELS.map(l => ({ ...l, lessons: l.lessons.map(le => ({ ...le })) }))
    : TEEN_LEVELS.map(l => ({ ...l, lessons: l.lessons.map(le => ({ ...le })) }));

  const totalLessons = levels.reduce((sum, l) => sum + l.lessons.length, 0);

  return {
    ageGroup,
    interests,
    personality,
    levels,
    currentLevelIndex: 0,
    totalPoints: 0,
    completedLessons: 0,
    totalLessons,
  };
}

export const INTEREST_OPTIONS: { value: StudentInterest; label: string; icon: string }[] = [
  { value: 'business', label: 'Business & Money', icon: '💼' },
  { value: 'nature', label: 'Nature & Outdoors', icon: '🌿' },
  { value: 'fitness', label: 'Fitness & Sports', icon: '💪' },
  { value: 'technology', label: 'Technology & AI', icon: '💻' },
  { value: 'arts', label: 'Arts & Creativity', icon: '🎨' },
  { value: 'cooking', label: 'Cooking & Food', icon: '🍳' },
  { value: 'agriculture', label: 'Agriculture & Farming', icon: '🌾' },
  { value: 'leadership', label: 'Leadership & Community', icon: '👑' },
];

export const PERSONALITY_OPTIONS: { value: StudentPersonality; label: string; icon: string; description: string }[] = [
  { value: 'active', label: 'Active', icon: '⚡', description: 'Energetic, loves action and movement' },
  { value: 'calm', label: 'Calm', icon: '🧘', description: 'Thoughtful, prefers steady and peaceful pace' },
  { value: 'curious', label: 'Curious', icon: '🔍', description: 'Loves exploring, asking questions, learning new things' },
];
