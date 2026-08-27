import type { SurveySection, EducationLevel, SchoolType, TimeAvailability, LearningPreference, AnalysisResult, StudentDataItem, EmotionEntry, Emotion, TimeTableEntry, EducationCountry, LearningMethod, Product, SupportHotline, AnonymousPost, ChatGroup, SubscriptionPlan, Transaction, GamificationProfile, Badge, LeaderboardEntry, IncomeEntry, SecurityAlert, CybersecurityChallenge, CulinaryChallenge, AIProject, MartialArtTechnique, StudentRewardInfo, ProfitPoolInfo, ProfitSharingCycle, SocialImpactProject, Course, StudyBuddyPersona } from './types';

// ═══ AI Study Buddy Team ═══
// A roster of specialized AI coach personas, organized like a small company org chart:
// one root ("Harmony AI") delegating to department leads across academics, wellness, and life skills.
export const STUDY_BUDDY_TEAM: StudyBuddyPersona[] = [
  {
    id: 'explainer',
    name: 'The Explainer',
    role: 'Academic Tutor',
    department: 'Academics',
    emoji: '📘',
    description: 'Breaks down any subject or skill into simple, easy-to-follow lessons and quizzes you.',
    colorClass: 'from-indigo-500 to-blue-500',
    systemFlavor: 'You are "The Explainer", a patient academic tutor. Focus on clear, step-by-step explanations of the topic.',
    requiresTopic: true,
  },
  {
    id: 'focus-trainer',
    name: 'Focus Trainer',
    role: 'Productivity Coach',
    department: 'Academics',
    emoji: '🎯',
    description: 'Helps you plan study sessions, beat procrastination, and stay on track with your goals.',
    colorClass: 'from-cyan-500 to-teal-500',
    systemFlavor: 'You are "Focus Trainer", a productivity coach. Give practical, time-boxed study and focus strategies.',
    requiresTopic: true,
  },
  {
    id: 'mindset-coach',
    name: 'Mindset Coach',
    role: 'Wellness Coach',
    department: 'Wellness',
    emoji: '🧘',
    description: 'Helps you manage stress, build confidence, and stay motivated on tough days.',
    colorClass: 'from-emerald-500 to-green-500',
    systemFlavor: 'You are "Mindset Coach", a warm wellness coach. Focus on encouragement, emotional support, and confidence-building.',
    requiresTopic: false,
  },
  {
    id: 'life-coach',
    name: 'Life Coach',
    role: 'Life Skills Mentor',
    department: 'Wellness',
    emoji: '🌱',
    description: 'Guides you on everyday life skills — habits, relationships, and personal growth.',
    colorClass: 'from-amber-500 to-orange-500',
    systemFlavor: 'You are "Life Coach", a friendly life-skills mentor. Focus on practical everyday advice for personal growth.',
    requiresTopic: false,
  },
  {
    id: 'career-mentor',
    name: 'Career Mentor',
    role: 'Career Guide',
    department: 'Future',
    emoji: '💼',
    description: 'Helps you explore career paths, build skills, and plan your next steps after school.',
    colorClass: 'from-purple-500 to-fuchsia-500',
    systemFlavor: 'You are "Career Mentor", a career guidance coach. Focus on career exploration, skills, and future planning.',
    requiresTopic: true,
  },
  {
    id: 'money-coach',
    name: 'Money Coach',
    role: 'Finance Guide',
    department: 'Future',
    emoji: '💰',
    description: 'Teaches money basics — budgeting, saving, and smart financial habits for teens.',
    colorClass: 'from-rose-500 to-pink-500',
    systemFlavor: 'You are "Money Coach", a friendly financial literacy guide for teens. Focus on budgeting, saving, and money habits.',
    requiresTopic: false,
  },
];

export const STUDENT_360_SURVEY: SurveySection[] = [
  {
    id: 'disc',
    title: 'DISC – Behavior Style',
    description: 'This helps us understand how you act in different situations.',
    questions: [
      {
        id: 'd1',
        text: 'When working in a group, I usually:',
        type: 'multiple-choice',
        options: [
          { text: 'Take charge and lead the discussion', value: 'Dominance' },
          { text: 'Motivate and energize others with my ideas', value: 'Influence' },
          { text: 'Support the team and listen to everyone\'s input', value: 'Steadiness' },
          { text: 'Focus on the details, structure, and accuracy', value: 'Conscientiousness' },
        ],
      },
      {
        id: 'd2',
        text: 'I prefer to make decisions:',
        type: 'multiple-choice',
        options: [
          { text: 'Quickly and confidently, focused on the results', value: 'Dominance' },
          { text: 'Based on group input and enthusiasm', value: 'Influence' },
          { text: 'After careful thought and ensuring stability', value: 'Steadiness' },
          { text: 'With lots of data and logical analysis', value: 'Conscientiousness' },
        ],
      },
    ],
  },
  {
    id: 'mbti',
    title: 'MBTI – Mindset & Motivation',
    description: 'This explores how you think and get your energy.',
    questions: [
      {
        id: 'm1',
        text: 'How do you best recharge your energy?',
        type: 'multiple-choice',
        options: [
          { text: 'By being around people and external activities', value: 'E' },
          { text: 'By spending quiet time alone or with a small group', value: 'I' },
        ],
      },
      {
        id: 'm2',
        text: 'When learning something new, you trust more in:',
        type: 'multiple-choice',
        options: [
          { text: 'Facts, details, and direct experience', value: 'S' },
          { text: 'Ideas, possibilities, and future implications', value: 'N' },
        ],
      },
       {
        id: 'm3',
        text: 'You tend to make decisions based on:',
        type: 'multiple-choice',
        options: [
          { text: 'Logic, objective principles, and fairness', value: 'T' },
          { text: 'Emotions, personal values, and impact on others', value: 'F' },
        ],
      },
       {
        id: 'm4',
        text: 'You prefer your life to be:',
        type: 'multiple-choice',
        options: [
          { text: 'Planned, structured, and organized', value: 'J' },
          { text: 'Flexible, spontaneous, and adaptable', value: 'P' },
        ],
      },
    ],
  },
  {
    id: 'enneagram',
    title: 'Enneagram – Core Motivation',
    description: 'Let\'s explore what fundamentally drives your actions and emotions.',
    questions: [
      {
        id: 'e1',
        text: 'I am most driven by a deep need to:',
        type: 'multiple-choice',
        options: [
          { text: 'Be good, right, and have integrity', value: 1 },
          { text: 'Be loved, connected, and needed by others', value: 2 },
          { text: 'Be valuable, successful, and achieve my goals', value: 3 },
          { text: 'Be unique, authentic, and true to my feelings', value: 4 },
          { text: 'Understand the world and be competent', value: 5 },
          { text: 'Feel safe, secure, and prepared for challenges', value: 6 },
          { text: 'Be happy, satisfied, and enjoy life to the fullest', value: 7 },
          { text: 'Be in control of myself and protect what\'s mine', value: 8 },
          { text: 'Keep peace, harmony, and avoid conflict', value: 9 },
        ],
      },
      {
        id: 'e2',
        text: 'I get most stressed when I feel:',
        type: 'multiple-choice',
        options: [
            { text: 'I might have made a mistake or am being criticized.', value: 1 },
            { text: 'I am not appreciated or am unwanted by others.', value: 2 },
            { text: 'I have failed or am seen as incompetent.', value: 3 },
            { text: 'I am misunderstood or feel abandoned.', value: 4 },
            { text: 'My knowledge is insufficient or my privacy is invaded.', value: 5 },
            { text: 'I have no support or things feel uncertain.', value: 6 },
            { text: 'I am trapped in negativity or missing out on fun.', value: 7 },
            { text: 'I am being controlled or manipulated by others.', value: 8 },
            { text: 'There is conflict and tension around me.', value: 9 },
        ]
      }
    ],
  },
  {
    id: 'bigFive',
    title: 'Big Five – Scientific Traits',
    description: 'Rate yourself on the following statements from 1 (Not like me at all) to 5 (Very much like me).',
    questions: [
      { id: 'bf1', text: 'I enjoy trying new things and have a vivid imagination.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Openness' },
      { id: 'bf2', text: 'I stay organized, meet my deadlines, and am very disciplined.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Conscientiousness' },
      { id: 'bf3', text: 'I feel energized and am talkative when I\'m around other people.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Extraversion' },
      { id: 'bf4', text: 'I am considerate and care deeply about others\' feelings.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Agreeableness' },
      { id: 'bf5', text: 'I often feel anxious, stressed, or sad.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Neuroticism' },
      { id: 'bf6', text: 'I can maintain concentration on a task for extended periods.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Focus' },
      { id: 'bf7', text: 'I remain calm and tolerant even when faced with delays or difficulties.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Patience' },
      { id: 'bf8', text: 'I regularly appreciate the good things in my life.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Gratitude' },
      { id: 'bf9', text: 'I find it easy to forgive others when they wrong me.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Forgiving' },
    ],
  },
  {
    id: 'hexaco',
    title: 'HEXACO – Deeper Personality',
    description: 'Let\'s explore another scientific model of personality traits. Rate yourself from 1 (Not like me at all) to 5 (Very much like me).',
    questions: [
      { id: 'h1', text: 'I am sincere and honest when I talk to people.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Honesty-Humility' },
      { id: 'h2', text: 'I often feel anxious or worried about things.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Emotionality' },
      { id: 'h3', text: 'I am outgoing, energetic, and love social events.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Extraversion' },
      { id: 'h4', text: 'I am generally patient and willing to forgive others.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Agreeableness' },
      { id: 'h5', text: 'I am very organized and like to plan things carefully.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Conscientiousness' },
      { id: 'h6', text: 'I enjoy new experiences and have a creative mind.', type: 'rating-scale', scale: { min: 1, max: 5 }, value: 'Openness' },
    ],
  },
  {
    id: 'temperament',
    title: 'Temperament Theory – Ancient Roots',
    description: 'Choose the overall description that you feel fits you best.',
    questions: [
      {
        id: 't1',
        text: 'Which description best captures your natural energy and vibe?',
        type: 'selection',
        options: [
          { text: 'Sanguine (Air): Fun-loving, sociable, talkative, and spontaneous. You bring energy to a room.', value: 'Sanguine' },
          { text: 'Choleric (Fire): Bold, passionate, goal-driven, and a natural leader. You love a challenge.', value: 'Choleric' },
          { text: 'Melancholic (Earth): Thoughtful, sensitive, perfectionistic, and deeply caring. You value quality.', value: 'Melancholic' },
          { text: 'Phlegmatic (Water): Calm, gentle, steady, and agreeable. You are a peacemaker and reliable.', value: 'Phlegmatic' },
        ],
      },
    ],
  },
  {
    id: 'socialStyles',
    title: 'Social Styles – Interaction Approach',
    description: 'This helps understand how you typically interact in a team or social setting.',
    questions: [
      {
        id: 'ss1',
        text: 'Which of these styles best describes how you work with others?',
        type: 'selection',
        options: [
          { text: 'Driver: I am direct, decisive, and focused on getting results quickly. I like to be in control.', value: 'Driver' },
          { text: 'Amiable: I value relationships and harmony. I am supportive, patient, and a good listener.', value: 'Amiable' },
          { text: 'Analytical: I am logical, detail-oriented, and systematic. I make decisions based on facts and data.', value: 'Analytical' },
          { text: 'Expressive: I am enthusiastic, creative, and persuasive. I enjoy sharing ideas and motivating others.', value: 'Expressive' },
        ],
      },
    ],
  },
  {
    id: 'multipleIntelligences',
    title: 'Multiple Intelligences – Learning Strengths',
    description: 'This helps identify how you learn best. Choose up to 3 activities you enjoy most.',
    questions: [
      {
        id: 'mi1',
        text: 'Which of these activities do you enjoy the most? (Select up to 3)',
        type: 'multiple-choice',
        options: [
          { text: 'Writing, debating, or telling stories (Linguistic)', value: 'Linguistic' },
          { text: 'Solving puzzles, coding, or working with numbers (Logical-Mathematical)', value: 'Logical-Mathematical' },
          { text: 'Drawing, designing, or navigating with maps (Spatial)', value: 'Spatial' },
          { text: 'Playing sports, dancing, or building things with your hands (Bodily-Kinesthetic)', value: 'Bodily-Kinesthetic' },
          { text: 'Playing an instrument, singing, or listening to music (Musical)', value: 'Musical' },
          { text: 'Working in groups, helping others, and understanding people (Interpersonal)', value: 'Interpersonal' },
          { text: 'Reflecting on your own thoughts and feelings (Intrapersonal)', value: 'Intrapersonal' },
          { text: 'Spending time in nature and identifying plants or animals (Naturalist)', value: 'Naturalist' },
          { text: 'Thinking about deep questions like the meaning of life (Existential)', value: 'Existential' },
        ],
      },
    ],
  },
];

export const DEFAULT_ANALYSIS_RESULT: AnalysisResult = {
    studentProfile: {
        disc: { style: "Explorer", summary: "You are open to new experiences and enjoy discovering new things." },
        mbti: { type: "EXPLORER", summary: "You are adaptable and curious, ready to see where your journey takes you." },
        enneagram: { type: "Type 7: The Enthusiast", summary: "You are optimistic and spontaneous, seeking new and exciting experiences." },
        bigFive: { summary: "You exhibit a balanced profile with an openness to experience.", traits: [{name: "Openness", score: 4}] },
        hexaco: { summary: "Your profile suggests a curious and open-minded individual.", traits: [{name: "Openness", score: 4}] },
        temperament: { type: "Sanguine", summary: "You are cheerful and optimistic, enjoying social interactions and new adventures." },
        socialStyles: { style: "Expressive", summary: "You enjoy sharing ideas and motivating others." },
        multipleIntelligences: { topIntelligences: ["Bodily-Kinesthetic", "Interpersonal"], summary: "You learn best by doing and interacting with others." }
    },
    overallSummary: "As an Explorer, you are adaptable, curious, and open to new possibilities. Your journey is just beginning, and you're ready to embrace the many paths available to you. Explore your interests and find what truly excites you!",
    recommendedStudyTechniques: ["Project-based learning", "Group discussions", "Hands-on experiments"],
    personalityType: "The Explorer",
    emoji: "🧭",
    summary: {
        coreStrengths: ["Curiosity", "Adaptability", "Open-mindedness"],
        naturalTalents: ["Discovering new things", "Connecting with people"],
        learningStyle: "Hands-on and social. You learn best by trying things out and collaborating with others.",
        workEnvironmentFit: "Flexible and dynamic environments where you can explore different roles and projects."
    },
    careerRecommendations: [
        { name: "Digital Marketer", match: 80, why: "A dynamic field where you can explore creative strategies.", skills: ["Content Creation", "Social Media", "SEO"], salary: "RM40k-90k/year" },
        { name: "UX/UI Designer", match: 78, why: "Combine creativity with understanding user needs.", skills: ["Figma", "User Research", "Prototyping"], salary: "RM50k-120k/year" },
        { name: "Entrepreneur", match: 75, why: "Forge your own path and bring new ideas to life.", skills: ["Business", "Strategy", "Sales"], salary: "Varies" },
    ],
    otherCareerOptions: [
        { name: "Event Planner", skills: ["Organization", "Communication"], salary: "RM40k-80k/year" },
        { name: "Content Creator", skills: ["Video Editing", "Writing"], salary: "RM35k-100k/year" },
        { name: "Teacher", skills: ["Communication", "Patience"], salary: "RM35k-90k/year" },
        { name: "Social Worker", skills: ["Empathy", "Problem-solving"], salary: "RM40k-85k/year" },
    ],
    learningPath: {
        startWith: "Discovering Your Core Interests",
        thenMaster: "A Foundational Creative or Technical Skill",
        buildToward: "Building a Portfolio of Diverse Projects"
    },
    lifeSkills: ["Time Management", "Budgeting", "Public Speaking", "Networking", "Emotional Intelligence"],
    specialSkills: ["Graphic Design", "Coding", "Video Editing", "Data Analysis", "Photography"],
    recommendedSports: ["Hiking", "Swimming", "Cycling", "Team Sports (e.g., Football, Basketball)", "Yoga"],
    startupIdeas: [
        { 
            title: "Eco-Fashion Brand", 
            description: "Create a clothing line using recycled materials sourced from local Malaysian factories.",
            targetMarket: "Environmentally conscious youth in KL and urban areas.",
            validationSteps: ["Create prototypes from thrifted clothes", "Sell at a weekend pop-up market (e.g., RilekLAH)", "Build an Instagram following with behind-the-scenes content"],
            challenges: ["Sourcing consistent reliable recycled materials", "Keeping production costs low to compete with fast fashion"]
        },
        { 
            title: "Tech Education Platform", 
            description: "Teach coding and tech skills to underserved communities in rural Malaysia via mobile.",
            targetMarket: "Students in rural areas with internet access but limited educational centers.",
            validationSteps: ["Record 3 pilot lessons in Bahasa Malaysia", "Partner with a local school for a weekend workshop", "Survey students on interest and device availability"],
            challenges: ["Internet connectivity stability in remote areas", "Ensuring students have access to devices for practice"]
        },
        { 
            title: "Wellness App for Teens", 
            description: "Develop an app to track mental and physical health specifically designed for the SPM pressures.",
            targetMarket: "Form 4 and Form 5 students facing exam stress.",
            validationSteps: ["Interview 20 SPM students about their biggest stressors", "Create a wireframe prototype and test with a focus group", "Launch a 'beta' Telegram bot to test daily check-ins"],
            challenges: ["User retention after exams are over", "Competing with global wellness apps"]
        }
    ]
};


export const CAREER_ICONS: { [key: string]: string } = {
  // General & Tech
  'Software Engineer': '💻',
  'Data Scientist': '📊',
  'Product Manager': '📈',
  'Cybersecurity Engineer': '🛡️',
  'Game Developer': '🎮',
  'AI/ML Engineer': '🤖',
  'Systems Architect': '🏛️',
  'Mobile App Developer': '📱',
  'Cloud Engineer': '☁️',
  'DevOps Engineer': '⚙️',
  'Blockchain Developer': '🔗',
  'UX/UI Designer': '🎨',
  'Business Analyst': '👔',
  'Digital Marketer': '📢',
  'Entrepreneur': '💡',
  'Financial Analyst': '💹',
  'Architect': '🏗️',
  'Mechanical Engineer': '🛠️',
  // People & Health
  'Teacher': '🧑‍🏫',
  'Educator': '🧑‍🏫',
  'Psychologist': '🧠',
  'Doctor': '🩺',
  'Healthcare Professional': '🩺',
  'Human Resources': '👥',
  'Counselor': '❤️‍🩹',
  'Social Worker': '🤝',
  // Creative & Communication
  'Marketing Manager': '📣',
  'Journalist': '✍️',
  'Public Relations': '🌐',
  'Graphic Designer': '🖌️',
  'Event Planner': '🎉',
  'Content Creator': '🎬',
  // Others
  'Research Scientist': '🔬',
  'Consultant': '🤔',
  'Sales': '💰',
  'Lawyer': '⚖️',
  'Project Manager': '📋',
  'default': '🌟'
};

export const getCareerIcon = (careerName: string): string => {
    // Try for an exact match first
    if (CAREER_ICONS[careerName]) {
        return CAREER_ICONS[careerName];
    }
    // Then try a partial match
    const lowerCaseName = careerName.toLowerCase();
    const foundKey = Object.keys(CAREER_ICONS).find(key => key !== 'default' && lowerCaseName.includes(key.toLowerCase()));
    return foundKey ? CAREER_ICONS[foundKey] : CAREER_ICONS.default;
};

export const SKILLS = {
  school: [
    'Matematik Tingkatan 1', 'Matematik Tingkatan 2', 'Matematik Tingkatan 3', 'Matematik Tingkatan 4', 'Matematik Tingkatan 5',
    'Sains Biologi', 'Sains Kimia', 'Sains Fizik',
    'Bahasa Melayu', 'Bahasa Inggeris', 'Sejarah', 'Geografi', 'Pendidikan Islam', 'Prinsip Perakaunan', 'Ekonomi'
  ],
  technical: [
    'Python Programming', 'Data Analysis', 'Web Development', 'Mobile App Development', 'Artificial Intelligence & Machine Learning',
    'Cybersecurity', 'Cloud Computing', 'Game Development', '3D Design & Animation', 'Video Editing', 'Graphic Design', 'Digital Marketing'
  ],
  professional: [
    'Project Management', 'Communication Skills', 'Leadership & Teamwork', 'Critical Thinking', 'Time Management',
    'Public Speaking', 'Negotiation', 'Entrepreneurship'
  ],
  life: [
    // Foundational
    'Mental Wellness', 'Health & Fitness', 'Stress Management', 'Emotional Intelligence (EQ)',
    // Productivity & Growth
    'Goal Setting', 'Habit Building', 'Focus Management', 'Adaptability & Resilience',
    // Practical Skills
    'Financial Literacy', 'Personal Finance', 'Cooking & Nutrition', 'Sustainable Living',
    // Digital Age Skills
    'AI Literacy', 'Digital Wellbeing', 'Media Literacy', 'Personal Branding'
  ],
  creative: [
    'Game Design', 'Music Production', 'Photography', 'Content Creation', 'Animation', 'Creative Writing'
  ]
};

export const EDUCATION_LEVELS: EducationLevel[] = [
  'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5',
  'Post-SPM / Foundation', 'Diploma student', 'University student', 'Working professional', 'Career changer'
];

export const SCHOOL_TYPES: SchoolType[] = [
  'Government school', 'Private school', 'International school', 'Homeschooled', 'Not in school'
];

export const TIME_AVAILABILITY_OPTIONS: { label: string, value: TimeAvailability }[] = [
  { label: '1-3 hours (Busy with school)', value: '1-3 hours' },
  { label: '4-7 hours (Moderate commitment)', value: '4-7 hours' },
  { label: '8-15 hours (Serious learner)', value: '8-15 hours' },
  { label: '16+ hours (Full-time learning)', value: '16+ hours' }
];

export const LEARNING_PREFERENCES: LearningPreference[] = [
  'Self-paced video lessons', 'Live classes & mentorship', 'Project-based learning',
  'Community study groups', 'One-on-one guidance'
];

export const LEARNING_METHODS_OPTIONS: { label: string, value: LearningMethod }[] = [
  { label: 'Visual (e.g., diagrams, videos)', value: 'Visual' },
  { label: 'Auditory (e.g., lectures, discussions)', value: 'Auditory' },
  { label: 'Kinesthetic (e.g., hands-on, experiments)', value: 'Kinesthetic' },
  { label: 'Reading/Writing (e.g., textbooks, notes)', value: 'Reading/Writing' },
];

export const GENDERS: string[] = ['Male', 'Female', 'Prefer not to say'];
export const RACES: string[] = ['Malay', 'Chinese', 'Indian', 'Bumiputera (Sabah/Sarawak)', 'Other', 'Prefer not to say'];
export const RELIGIONS: string[] = ['Islam', 'Buddhism', 'Christianity', 'Hinduism', 'Sikhism', 'Other', 'Prefer not to say'];
export const STATES: string[] = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
  'W.P. Kuala Lumpur', 'W.P. Labuan', 'W.P. Putrajaya'
];

// --- Personality Color Mappings ---
export const DISC_COLORS: { [key: string]: string } = {
  'Dominance': 'text-red-600 dark:text-red-400',
  'Influence': 'text-yellow-600 dark:text-yellow-400',
  'Steadiness': 'text-blue-600 dark:text-blue-400',
  'Conscientiousness': 'text-green-600 dark:text-green-400',
};

export const MBTI_COLORS: { [key: string]: string } = {
  'ISTJ': 'text-blue-600 dark:text-blue-400',
  'ISFJ': 'text-teal-600 dark:text-teal-400',
  'INFJ': 'text-purple-600 dark:text-purple-400',
  'INTJ': 'text-indigo-600 dark:text-indigo-400',
  'ISTP': 'text-cyan-600 dark:text-cyan-400',
  'ISFP': 'text-emerald-600 dark:text-emerald-400',
  'INFP': 'text-pink-600 dark:text-pink-400',
  'INTP': 'text-violet-600 dark:text-violet-400',
  'ESTP': 'text-orange-600 dark:text-orange-400',
  'ESFP': 'text-rose-600 dark:text-rose-400',
  'ENFP': 'text-lime-600 dark:text-lime-400',
  'ENTP': 'text-fuchsia-600 dark:text-fuchsia-400',
  'ESTJ': 'text-sky-600 dark:text-sky-400',
  'ESFJ': 'text-amber-600 dark:text-amber-400',
  'ENFJ': 'text-red-600 dark:text-red-400',
  'ENTJ': 'text-green-600 dark:text-green-400',
};

export const ENNEAGRAM_COLORS: { [key: string]: string } = {
  'Type 1: The Reformer': 'text-blue-600 dark:text-blue-400',
  'Type 2: The Helper': 'text-green-600 dark:text-green-400',
  'Type 3: The Achiever': 'text-purple-600 dark:text-purple-400',
  'Type 4: The Individualist': 'text-indigo-600 dark:text-indigo-400',
  'Type 5: The Investigator': 'text-orange-600 dark:text-orange-400',
  'Type 6: The Loyalist': 'text-red-600 dark:text-red-400',
  'Type 7: The Enthusiast': 'text-yellow-600 dark:text-yellow-400',
  'Type 8: The Challenger': 'text-gray-800 dark:text-gray-200',
  'Type 9: The Peacemaker': 'text-teal-600 dark:text-teal-400',
};

export const TEMPERAMENT_COLORS: { [key: string]: string } = {
  'Sanguine': 'text-yellow-600 dark:text-yellow-400',
  'Choleric': 'text-red-600 dark:text-red-400',
  'Melancholic': 'text-blue-600 dark:text-blue-400',
  'Phlegmatic': 'text-green-600 dark:text-green-400',
};

export const SOCIAL_STYLES_COLORS: { [key: string]: string } = {
  'Driver': 'text-red-600 dark:text-red-400',
  'Amiable': 'text-blue-600 dark:text-blue-400',
  'Analytical': 'text-green-600 dark:text-green-400',
  'Expressive': 'text-yellow-600 dark:text-yellow-400',
};

// Helper to get color class for personality types
export const getPersonalityColor = (type: string, mapping: { [key: string]: string }): string => {
  // Attempt to find exact match first
  const exactMatch = mapping[type];
  if (exactMatch) {
    return exactMatch;
  }

  // For MBTI, try to match by first letter (E/I, S/N, T/F, J/P) for broader categories if no exact match
  if (mapping === MBTI_COLORS && type.length === 4) {
      const typePrefix = type.substring(0, 1); // Get the first letter, e.g., 'E' or 'I'
      const genericMbtiColors: { [key: string]: string } = {
          'E': 'text-orange-600 dark:text-orange-400',
          'I': 'text-purple-600 dark:text-purple-400',
          // More specific mappings could be added here if needed, e.g. for sensing/intuition
      };
      return genericMbtiColors[typePrefix] || 'text-green-600 dark:text-green-500';
  }

  // Fallback to a default color if no specific mapping is found
  return 'text-green-600 dark:text-green-500'; 
};

export const MOCK_STUDENT_DATA: StudentDataItem[] = [
    {
      userId: 'user-001',
      activity: 'Completed "Introduction to Python" Module 1',
      timestamp: '2024-07-20T10:00:00Z',
      engagementScore: 90,
      quizScore: 85,
      timeSpentMinutes: 120,
      feedback: 'Really enjoyed the interactive coding exercises. Video quality was good.',
      personalityType: 'The Analytical Architect',
      careerPath: 'Software Engineer',
    },
    {
      userId: 'user-002',
      activity: 'Attempted "Matematik Tingkatan 3" Quiz 2',
      timestamp: '2024-07-20T11:30:00Z',
      engagementScore: 65,
      quizScore: 55,
      timeSpentMinutes: 45,
      feedback: 'Struggled with algebraic fractions. Need more examples.',
      personalityType: 'The Empathetic Collaborator',
      careerPath: 'Teacher',
    },
    {
      userId: 'user-003',
      activity: 'Participated in "SPM 2025 Warriors" chat group',
      timestamp: '2024-07-20T14:00:00Z',
      engagementScore: 80,
      timeSpentMinutes: 30,
      feedback: 'Good discussion on study techniques, but some members were off-topic.',
      personalityType: 'The Social Innovator',
      careerPath: 'Digital Marketer',
    },
    {
      userId: 'user-004',
      activity: 'Viewed "Financial Literacy for Teens" lesson on budgeting',
      timestamp: '2024-07-20T16:00:00Z',
      engagementScore: 75,
      timeSpentMinutes: 20,
      feedback: null,
      personalityType: 'The Pragmatic Planner',
      careerPath: 'Financial Analyst',
    },
    {
      userId: 'user-005',
      activity: 'Completed "Introduction to Python" Module 2',
      timestamp: '2024-07-21T09:00:00Z',
      engagementScore: 92,
      quizScore: 90,
      timeSpentMinutes: 150,
      feedback: 'Project was challenging but rewarding. Learned a lot!',
      personalityType: 'The Analytical Architect',
      careerPath: 'Software Engineer',
    },
    {
      userId: 'user-006',
      activity: 'Skipped "Sains Tingkatan 3" Chapter 5 reading',
      timestamp: '2024-07-21T10:15:00Z',
      engagementScore: 30,
      timeSpentMinutes: 5,
      feedback: 'Reading material was too dry. Prefer videos.',
      personalityType: 'The Creative Explorer',
      careerPath: 'Content Creator',
    },
    {
      userId: 'user-007',
      activity: 'Logged 30 minutes of workout in Health & Fitness section',
      timestamp: '2024-07-21T18:00:00Z',
      engagementScore: 88,
      timeSpentMinutes: 30,
      feedback: null,
      personalityType: 'The Action-Oriented Driver',
      careerPath: 'Entrepreneur',
    },
    {
      userId: 'user-008',
      activity: 'Started "UX/UI Design Basics" course, but only viewed first lesson',
      timestamp: '2024-07-22T11:00:00Z',
      engagementScore: 40,
      timeSpentMinutes: 15,
      feedback: 'Lost interest after the intro. Not as engaging as expected.',
      personalityType: 'The Visionary Innovator',
      careerPath: 'UX/UI Designer',
    },
    {
      userId: 'user-009',
      activity: 'Completed "Matematik Tingkatan 3" Quiz 2 with improved score',
      timestamp: '2024-07-22T14:00:00Z',
      engagementScore: 80,
      quizScore: 78,
      timeSpentMinutes: 60,
      feedback: 'The extra practice problems really helped!',
      personalityType: 'The Empathetic Collaborator',
      careerPath: 'Teacher',
    },
    {
      userId: 'user-010',
      activity: 'Posted a question in "Career Skills" forum about interview tips',
      timestamp: '2024-07-22T16:30:00Z',
      engagementScore: 70,
      timeSpentMinutes: 10,
      feedback: null,
      personalityType: 'The Driven Achiever',
      careerPath: 'Product Manager',
    },
    {
      userId: 'user-011',
      activity: 'Completed "Introduction to Python" Module 3, including final project',
      timestamp: '2024-07-23T10:00:00Z',
      engagementScore: 95,
      quizScore: 92,
      timeSpentMinutes: 180,
      feedback: 'Excellent course! Feeling confident to build more.',
      personalityType: 'The Analytical Architect',
      careerPath: 'Software Engineer',
    },
    {
      userId: 'user-012',
      activity: 'Viewed "Digital Marketing Fundamentals" first module videos',
      timestamp: '2024-07-23T11:45:00Z',
      engagementScore: 70,
      timeSpentMinutes: 40,
      feedback: null,
      personalityType: 'The Social Innovator',
      careerPath: 'Digital Marketer',
    },
    {
      userId: 'user-013',
      activity: 'Reported a bug in the "Game Studio" app builder',
      timestamp: '2024-07-23T13:00:00Z',
      engagementScore: 50,
      timeSpentMinutes: 10,
      feedback: 'App crashed when trying to add a new asset. Very frustrating.',
      personalityType: 'The Creative Explorer',
      careerPath: 'Game Developer',
    },
    {
      userId: 'user-014',
      activity: 'Visited "My Courses" section, no new activity',
      timestamp: '2024-07-23T15:00:00Z',
      engagementScore: 20,
      timeSpentMinutes: 5,
      feedback: null,
      personalityType: 'The Pragmatic Planner',
      careerPath: 'Business Analyst',
    },
    {
      userId: 'user-015',
      activity: 'Successfully completed the "Build a Weather App" challenge',
      timestamp: '2024-07-23T17:00:00Z',
      engagementScore: 98,
      timeSpentMinutes: 240,
      feedback: 'The challenge was super fun and pushed my skills!',
      personalityType: 'The Action-Oriented Driver',
      careerPath: 'Software Engineer',
    },
];

export const MOCK_EMOTION_DATA: EmotionEntry[] = [
  { date: '2024-07-23', emotion: 'Happy', note: 'Had a great coding session and solved a tough bug!' },
  { date: '2024-07-22', emotion: 'Calm', note: 'Relaxed after a long walk in the park.' },
  { date: '2024-07-21', emotion: 'Excited', note: 'Received an acceptance letter for a summer program!' },
  { date: '2024-07-20', emotion: 'Neutral', note: 'Just another normal day of studying.' },
  { date: '2024-07-19', emotion: 'Anxious', note: 'Big exam tomorrow, feeling a bit stressed.' },
  { date: '2024-07-18', emotion: 'Happy', note: 'Spent time with friends, lots of laughter.' },
  { date: '2024-07-17', emotion: 'Sad', note: 'Missed my online class due to internet issues.' },
];

export const EMOTION_OPTIONS: { emotion: Emotion; emoji: string; color: string }[] = [
  { emotion: 'Happy', emoji: '😄', color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
  { emotion: 'Excited', emoji: '🤩', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' },
  { emotion: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' },
  { emotion: 'Neutral', emoji: '😐', color: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300' },
  { emotion: 'Anxious', emoji: '😟', color: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300' },
  { emotion: 'Sad', emoji: '😔', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300' },
  { emotion: 'Angry', emoji: '😡', color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' },
];

// Helper to format date for MOCK_TIMETABLE_DATA
const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
};
const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};
const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

export const MOCK_TIMETABLE_DATA: TimeTableEntry[] = [
  { id: 'tt1', date: getTodayString(), time: '08:00 AM - 09:00 AM', activity: 'Matematik Tingkatan 3 (Module 5)', type: 'study', colorClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { id: 'tt2', date: getTodayString(), time: '09:00 AM - 10:00 AM', activity: 'Sains Fizik (Chapter 2 Reading)', type: 'study', colorClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { id: 'tt3', date: getTodayString(), time: '10:00 AM - 10:30 AM', activity: 'Break / Snack', type: 'leisure', colorClass: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
  { id: 'tt4', date: getTodayString(), time: '10:30 AM - 12:00 PM', activity: 'Python Programming (Project Work)', type: 'study', colorClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { id: 'tt5', date: getTodayString(), time: '12:00 PM - 01:00 PM', activity: 'Lunch Break', type: 'leisure', colorClass: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
  { id: 'tt6', date: getTodayString(), time: '01:00 PM - 02:00 PM', activity: 'Workout / Exercise', type: 'fitness', colorClass: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' },
  { id: 'tt7', date: getTodayString(), time: '02:00 PM - 03:00 PM', activity: 'Community Study Group (History)', type: 'study', colorClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { id: 'tt8', date: getTodayString(), time: '03:00 PM - 04:00 PM', activity: 'Personal Project (Digital Art)', type: 'leisure', colorClass: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' },
  { id: 'tt9', date: getTodayString(), time: '04:00 PM - 05:00 PM', activity: 'Reading a Book', type: 'leisure', colorClass: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
  { id: 'tt10', date: getTodayString(), time: '05:00 PM - 06:00 PM', activity: 'Family Time', type: 'other', colorClass: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300' },
  // Example entries for tomorrow and yesterday to show calendar functionality
  { id: 'tt11', date: getTomorrowString(), time: '09:00 AM - 10:00 AM', activity: 'Plan Week Ahead', type: 'other', colorClass: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300' },
  { id: 'tt12', date: getTomorrowString(), time: '11:00 AM - 12:30 PM', activity: 'Deep Work: Project Alpha', type: 'study', colorClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { id: 'tt13', date: getYesterdayString(), time: '07:00 PM - 08:00 PM', activity: 'Evening Run', type: 'fitness', colorClass: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' },
];

export const TIMETABLE_ACTIVITY_TYPE_OPTIONS: { type: TimeTableEntry['type']; label: string; colorClass: string; }[] = [
  { type: 'study', label: 'Study', colorClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { type: 'leisure', label: 'Leisure', colorClass: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
  { type: 'fitness', label: 'Fitness', colorClass: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' },
  { type: 'other', label: 'Other', colorClass: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300' },
];

export const TODO_PRIORITY_OPTIONS = [
  { priority: 'high', label: 'High', colorClass: 'bg-red-500' },
  { priority: 'medium', label: 'Medium', colorClass: 'bg-yellow-500' },
  { priority: 'low', label: 'Low', colorClass: 'bg-blue-500' },
];

const getGenericDateStringForCurrentMonth = (day: number) => {
    const d = new Date();
    d.setDate(day);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD for the current month
};

export const MOCK_INCOME_DATA: IncomeEntry[] = [
  { id: 'inc1', source: 'Part-time Tutoring', amount: 150, date: getGenericDateStringForCurrentMonth(15) },
  { id: 'inc2', source: 'Allowance', amount: 100, date: getGenericDateStringForCurrentMonth(1) },
  { id: 'inc3', source: 'Freelance Design', amount: 50, date: getGenericDateStringForCurrentMonth(10) },
  { id: 'inc4', source: 'Content Creation', amount: 80, date: getGenericDateStringForCurrentMonth(20) },
];

export const MOCK_WORLD_EDUCATION_DATA: EducationCountry[] = [
  {
    name: 'Finland',
    flagEmoji: '🇫🇮',
    summary: 'Known for its highly skilled teachers, individualized learning paths, and equitable education system. Focuses on comprehensive development rather than standardized testing.',
    onlineStudySections: [
      { name: 'Finnish National Agency for Education', url: 'https://oph.fi/en', description: 'Information on Finnish education system and resources.' },
      { name: 'Open Universities in Finland', url: 'https://www.studyinfinland.fi/universities-of-applied-sciences/open-university-studies', description: 'Various courses for flexible learning.' },
    ],
  },
  {
    name: 'Singapore',
    flagEmoji: '🇸🇬',
    summary: 'Famous for its rigorous curriculum, strong emphasis on STEM, and innovative teaching methods. Consistently ranks high in international assessments.',
    onlineStudySections: [
      { name: 'Ministry of Education Singapore', url: 'https://www.moe.gov.sg/online-learning', description: 'Resources and platforms for home-based learning.' },
      { name: 'Singapore University of Social Sciences (SUSS) Online', url: 'https://www.suss.edu.sg/programmes/online-learning', description: 'Online degree and continuing education courses.' },
    ],
  },
  {
    name: 'Canada',
    flagEmoji: '🇨🇦',
    summary: 'Offers a high-quality, publicly funded education system. Known for its multicultural environment, strong focus on student well-being, and research-intensive universities.',
    onlineStudySections: [
      { name: 'ILC - Independent Learning Centre', url: 'https://www.ilc.org/', description: 'Ontario\'s distance education high school, offering courses for credit.' },
      { name: 'Athabasca University', url: 'https://www.athabascau.ca/', description: 'Canada\'s leading online university with flexible programs.' },
    ],
  },
  {
    name: 'South Korea',
    flagEmoji: '🇰🇷',
    summary: 'Highly competitive and achievement-oriented system. Excels in digital education and technological integration, producing top academic results.',
    onlineStudySections: [
      { name: 'Korea National Open University (KNOU)', url: 'http://en.knou.ac.kr/ou/index.do', description: 'Public university providing distance learning higher education.' },
      { name: 'EBS Online Class', url: 'https://www.ebs.co.kr/home', description: 'Educational broadcasting system offering online courses for students.' },
    ],
  },
  {
    name: 'Switzerland',
    flagEmoji: '🇨🇭',
    summary: 'Renowned for its vocational training, dual education system, and specialized higher education. Emphasis on practical skills and multilingualism.',
    onlineStudySections: [
      { name: 'Distance Learning University Switzerland', url: 'https://www.fernuni.ch/en/', description: 'Provides bachelor\'s and master\'s degrees through distance learning.' },
      { name: 'Swiss Virtual Campus', url: 'https://www.swissvirtualcampus.ch/', description: 'Projects and resources supporting e-learning initiatives.' },
    ],
  },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'prod_1', name: 'Notion Study Planner', category: 'Study Template', price: 25.00, description: 'Organize your studies like a pro with this aesthetic template.', imageUrl: 'https://placehold.co/400x300/D9CEFF/1B1B1F?text=Notion+Planner' },
    { id: 'prod_2', name: 'Harmony Hoodie', category: 'Merch', price: 120.00, description: 'Cozy and stylish official merch to rep the academy.', imageUrl: 'https://placehold.co/400x300/7F5AF0/FFFFFF?text=Harmony+Hoodie' },
    { id: 'prod_3', name: 'SPM Sejarah Survival E-Book', category: 'E-Book', price: 15.00, description: 'Key notes and proven tips to help you ace the Sejarah paper.', imageUrl: 'https://placehold.co/400x300/00F5D4/1B1B1F?text=Sejarah+E-Book' },
    { id: 'prod_4', name: 'Focus Pomodoro Timer App', category: 'Digital Tool', price: 5.00, description: 'A minimal and beautiful timer to boost your focus sessions.', imageUrl: 'https://placehold.co/400x300/F8F7FF/1B1B1F?text=Pomodoro+App' },
    { id: 'prod_5', name: 'Aesthetic Sticker Pack', category: 'Merch', price: 12.00, description: 'High-quality vinyl stickers for your laptop, water bottle, etc.', imageUrl: 'https://placehold.co/400x300/FF6B6B/FFFFFF?text=Stickers' },
    { id: 'prod_6', name: 'Python for Beginners Video Course', category: 'E-Book', price: 50.00, description: 'A comprehensive video course to start your coding journey.', imageUrl: 'https://placehold.co/400x300/4ECDC4/FFFFFF?text=Python+Course' },
];

export const SUPPORT_HOTLINES: SupportHotline[] = [
  {
    name: 'Befrienders KL',
    phone: '0376272929',
    phoneDisplay: '03-7627 2929',
    hours: '24 hours',
    description: 'Provides confidential emotional support to people who are lonely, in distress, in despair, or having suicidal thoughts.',
  },
  {
    name: 'Talian Kasih',
    phone: '15999',
    phoneDisplay: '15999',
    hours: '24 hours',
    description: 'A government helpline for psychological support, domestic issues, and welfare assistance.',
  },
  {
    name: 'MIASA Malaysia',
    phone: '1800820066',
    phoneDisplay: '1-800-82-0066',
    hours: '24 hours',
    description: 'Mental Illness Awareness & Support Association offers a crisis hotline for mental health support.',
  },
  {
    name: 'Malaysian Mental Health Association (MMHA)',
    phone: '0327806803',
    phoneDisplay: '03-2780 6803',
    hours: 'Mon-Fri, 9am-5pm',
    description: 'Provides support via phone calls and WhatsApp for various mental health concerns.',
  },
];

export const MOCK_ANONYMOUS_POSTS: AnonymousPost[] = [
  {
    id: 'anon_1',
    content: "Feeling really overwhelmed with SPM trials. It feels like I can't keep up no matter how hard I study. Does anyone else feel this way?",
    timestamp: '2 hours ago',
    userId: 'user-hidden-1',
  },
  {
    id: 'anon_2',
    content: "I'm having a tough time making friends at my new uni. Everyone seems to have their own groups already. It's pretty lonely.",
    timestamp: '5 hours ago',
    userId: 'user-hidden-2',
  },
  {
    id: 'anon_3',
    content: "My parents are putting a lot of pressure on me to choose a career I'm not passionate about. I don't know how to tell them without disappointing them.",
    timestamp: '1 day ago',
    userId: 'user-hidden-3',
  },
];

export const CHAT_GROUPS: ChatGroup[] = [
  // Student Groups
  { name: 'Form 1-3 Hangout', members: '128 members', category: 'Student' },
  { name: 'SPM Warriors 2024/25', members: '342 members', category: 'Student' },
  { name: 'Pre-University & Foundation', members: '215 members', category: 'Student' },
  { name: 'Uni Students Malaysia', members: '500+ members', category: 'Student' },
  // Parent Groups
  { name: 'Parents of Secondary Students', members: '98 members', category: 'Parent' },
  { name: 'Parents of University Students', members: '76 members', category: 'Parent' },
  // Female Only
  { name: 'Girl Gamers Malaysia 🎮', members: '88 members', category: 'Female Only' },
  { name: 'Women in Tech MY', members: '150 members', category: 'Female Only' },
  // Male Only
  { name: 'Brotherhood Book Club 📚', members: '45 members', category: 'Male Only' },
  { name: 'KL Futsal Crew', members: '112 members', category: 'Male Only' },
  // Mixed Gender (General Interest)
  { name: 'KL & Selangor Foodies', members: '600+ members', category: 'Mixed Gender' },
  { name: 'Malaysian Memes & Lols', members: '1000+ members', category: 'Mixed Gender' },
  { name: 'Anime & Manga Fans', members: '450+ members', category: 'Mixed Gender' },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'plan_free',
        name: 'Free',
        price: 0,
        billingCycle: 'month',
        features: [
            'Basic Personality Analysis',
            'Access to 5 Core Courses',
            'Community Forum Access',
            'Standard AI Chat',
        ],
    },
    {
        id: 'plan_pro',
        name: 'Pro',
        price: 25,
        billingCycle: 'month',
        features: [
            'Everything in Free, plus:',
            'Unlimited Course Access',
            'Advanced AI Career Guidance',
            'Priority AI Chat Support',
            'Create & Join Private Groups',
        ],
        isRecommended: true,
    },
    {
        id: 'plan_premium',
        name: 'Premium',
        price: 50,
        billingCycle: 'month',
        features: [
            'Everything in Pro, plus:',
            '1-on-1 Monthly Mentorship',
            'Personalized Learning Path Reviews',
            'Exclusive Workshops & Events',
            'Early Access to New Features',
        ],
    },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn_1', date: '2024-07-20', description: 'Harmony Store: Notion Planner', amount: 25.00, status: 'Completed' },
    { id: 'txn_2', date: '2024-07-15', description: 'Donation to Community Fund', amount: 10.00, status: 'Completed' },
    { id: 'txn_3', date: '2024-07-01', description: 'Pro Plan Subscription', amount: 25.00, status: 'Failed' },
    { id: 'txn_4', date: '2024-06-30', description: 'Harmony Store: Hoodie', amount: 120.00, status: 'Completed' },
];

// --- Gamification Data ---
export const MOCK_USER_GAMIFICATION_PROFILE: GamificationProfile = {
  points: 1250,
  level: 5,
  xpInLevel: 250,
  xpForNextLevel: 1000,
  badges: ['newbie', 'task-master-1', 'streaker-1'],
};

export const MOCK_BADGES: Badge[] = [
  { id: 'newbie', name: 'Welcome!', description: 'Joined Harmony Lifestyle Academy.', icon: '👋' },
  { id: 'task-master-1', name: 'Task Starter', description: 'Completed your first 10 tasks.', icon: '✅' },
  { id: 'task-master-2', name: 'Task Pro', description: 'Completed 50 tasks.', icon: '🎯' },
  { id: 'streaker-1', name: 'Daily Streaker', description: 'Logged in for 7 consecutive days.', icon: '🔥' },
  { id: 'learner-1', name: 'Course Starter', description: 'Completed your first course module.', icon: '🎓' },
  { id: 'learner-2', name: 'Knowledge Seeker', description: 'Completed 5 courses.', icon: '📚' },
  { id: 'social-1', name: 'Community Member', description: 'Joined a chat group.', icon: '🤝' },
  { id: 'social-2', name: 'Contributor', description: 'Posted 10 messages in chat.', icon: '💬' },
  { id: 'creator-1', name: 'Builder', description: 'Started your first project.', icon: '🛠️' },
  { id: 'healthy-1', name: 'Health Advocate', description: 'Completed a 7-day health challenge.', icon: '🧘' },
  { id: 'finance-1', name: 'Budget Boss', description: 'Set up your first budget.', icon: '💰' },
  { id: 'explorer-1', name: 'Explorer', description: 'Visited all main sections of the app.', icon: '🧭' },
  { id: 'mastery-1', name: 'Practitioner', description: 'Completed your first Practice Hub challenge.', icon: '💪' },
  { id: 'mentor-1', name: 'Mentor', description: 'Created your first mini-lesson for the community.', icon: '🧑‍🏫' },
  { id: 'sunnah-first', name: 'First Step', description: 'Completed your first Sunnah practice.', icon: '🌱' },
  { id: 'sunnah-100', name: 'Sunnah Student', description: 'Completed 100 Sunnah practices.', icon: '📿' },
  { id: 'sunnah-morning', name: 'Morning Person', description: 'Completed all 118 Morning Sunnah practices.', icon: '🌅' },
  { id: 'sunnah-afternoon', name: 'Afternoon Warrior', description: 'Completed all 118 Afternoon Sunnah practices.', icon: '☀️' },
  { id: 'sunnah-evening', name: 'Night Guardian', description: 'Completed all 118 Evening Sunnah practices.', icon: '🌙' },
  { id: 'sunnah-master', name: 'Sunnah Master', description: 'Completed all 354 Sunnah practices. SubhanAllah!', icon: '🏆' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userName: 'Aina C.', points: 12500, isCurrentUser: false, avatar: '🧕' },
  { rank: 2, userName: 'Bala S.', points: 11800, isCurrentUser: false, avatar: '👳' },
  { rank: 3, userName: 'Chen W.', points: 10500, isCurrentUser: false, avatar: '👲' },
  { rank: 4, userName: 'Dania R.', points: 9800, isCurrentUser: false, avatar: '👩‍💻' },
  { rank: 5, userName: 'Ethan L.', points: 9200, isCurrentUser: false, avatar: '👨‍🎨' },
  { rank: 6, userName: 'Farah A.', points: 8500, isCurrentUser: false, avatar: '🧑‍🔬' },
  { rank: 28, userName: 'You', points: 1250, isCurrentUser: true, avatar: '🧑‍🚀' },
];

export const DAILY_QUOTES = [
  { quote: "You become who you are from what you read, watch, listen and talk. Choose good.", author: "Anonymous" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { quote: "Ilmu itu didapat dengan lidah yang gemar bertanya dan akal yang suka berpikir.", author: "Abdullah bin Abbas" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
];

export const MOCK_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'alert-1',
    title: 'Suspicious Login Attempt',
    description: 'A login was detected from a new device and location (Johor Bahru) for a user who is usually based in Kuala Lumpur.',
    severity: 'Medium',
    status: 'Open',
    timestamp: '5 minutes ago',
    resolutionSteps: {
      question: 'What is the standard procedure for a suspicious login from a new location?',
      options: [
        'Ignore the alert as it might be a false positive.',
        'Immediately suspend the user\'s account and notify them via email.',
        'Ban the IP address permanently.',
      ],
      correctOptionIndex: 1,
      explanation: 'Correct! Suspending the account prevents unauthorized access while the user verifies the login attempt. Banning the IP might block legitimate users on shared networks.'
    }
  },
  {
    id: 'alert-2',
    title: 'Potential Phishing Email Reported',
    description: 'A user reported an email claiming to be from "Harmony Bank" asking for password reset.',
    severity: 'High',
    status: 'Open',
    timestamp: '30 minutes ago',
    resolutionSteps: {
      question: 'What is the primary indicator of phishing in this scenario?',
      options: [
        'The email is from a bank.',
        'It requests a password reset.',
        'The sender\'s domain is likely not the official bank domain.',
      ],
      correctOptionIndex: 2,
      explanation: 'Exactly! Phishing emails often use spoofed sender names but have mismatched or suspicious domain names. Always check the sender\'s full email address.'
    }
  },
  {
    id: 'alert-3',
    title: 'Brute-force Attack Thwarted',
    description: 'Automated systems blocked 1,500 failed login attempts on a single account within 10 minutes.',
    severity: 'Low',
    status: 'Resolved',
    timestamp: '2 hours ago',
  },
];

export const MOCK_CYBERSECURITY_CHALLENGES: CybersecurityChallenge[] = [
  {
    id: 'chal-1',
    title: 'Identify the Vulnerability',
    description: 'Review a sample piece of code and identify a common SQL injection vulnerability.',
    difficulty: 'Easy',
    rewardPoints: 100,
    status: 'Not Started',
  },
  {
    id: 'chal-2',
    title: 'Network Traffic Analysis',
    description: 'Analyze a mock network traffic log to find a hidden malicious packet.',
    difficulty: 'Medium',
    rewardPoints: 250,
    status: 'Not Started',
  },
  {
    id: 'chal-3',
    title: 'Sandbox Escape',
    description: 'Find a way to execute a command outside of the provided sandboxed web environment.',
    difficulty: 'Hard',
    rewardPoints: 500,
    status: 'Completed',
  },
];


// --- New Mocks for Practice Hub ---

export const MOCK_CULINARY_CHALLENGES: CulinaryChallenge[] = [
  {
    id: 'cul-1',
    title: 'Perfect Nasi Lemak Sambal',
    description: 'Master the balance of sweet, spicy, and savory in Malaysia\'s most iconic sambal.',
    difficulty: 'Medium',
    cuisine: 'Malaysian',
    rewardPoints: 150,
    status: 'Not Started',
    steps: [
      {
        instruction: 'First, prepare your aromatics. What is the most crucial ingredient for the sambal\'s base flavor?',
        question: 'Which ingredient forms the foundational paste of the sambal?',
        options: ['Garlic & Ginger', 'Lemongrass & Turmeric', 'Dried Chilies & Onions', 'Tamarind & Shrimp Paste'],
        correctOptionIndex: 2,
        explanation: 'Correct! A paste of rehydrated dried chilies, onions, and sometimes garlic is the heart of a good sambal.'
      },
      {
        instruction: 'Next, you need to balance the flavors. This is called "tumis" or sauteeing.',
        question: 'To achieve the "pecah minyak" stage (oil splitting), what should you do?',
        options: ['Cook on high heat quickly', 'Cook on low heat, stirring occasionally until the oil separates', 'Add water continuously', 'Add sugar at the beginning'],
        correctOptionIndex: 1,
        explanation: 'Exactly! Slow cooking allows the chili paste to cook through and the oil to separate, indicating a well-cooked sambal with a longer shelf life.'
      }
    ],
  },
];

export const MOCK_AI_PROJECTS: AIProject[] = [
  {
    id: 'ai-1',
    title: 'Train a Cat vs. Dog Classifier',
    description: 'Build a simple machine learning model to distinguish between images of cats and dogs.',
    difficulty: 'Easy',
    rewardPoints: 200,
    status: 'Not Started',
    steps: [
      {
        instruction: 'The first step in any ML project is gathering data. You have a folder of cat images and a folder of dog images.',
        question: 'What is the process of labeling this data called?',
        options: ['Data Augmentation', 'Supervised Learning', 'Feature Engineering', 'Unsupervised Learning'],
        correctOptionIndex: 1,
        explanation: 'Correct! Since we are provided with the model with labeled examples (this is a cat, this is a dog), it\'s a form of supervised learning.'
      },
      {
        instruction: 'Now you need to choose a model architecture.',
        question: 'For image classification, what type of neural network is most commonly used?',
        options: ['Recurrent Neural Network (RNN)', 'Generative Adversarial Network (GAN)', 'Convolutional Neural Network (CNN)', 'Transformer'],
        correctOptionIndex: 2,
        explanation: 'Right! CNNs are specifically designed to recognize patterns in visual data, making them ideal for image classification tasks.'
      }
    ]
  }
];

export const MOCK_MARTIAL_ARTS_TECHNIQUES: MartialArtTechnique[] = [
    {
        id: 'ma-1',
        name: 'Kuda-Kuda Pasang (Ready Stance)',
        style: 'Silat',
        description: 'A fundamental stance in Silat, providing balance and readiness for attack or defense. It involves a low center of gravity and bent knees.',
        quiz: {
            question: 'What is the primary purpose of a low stance like Kuda-Kuda?',
            options: ['To look intimidating', 'To increase speed', 'To improve stability and generate power from the ground', 'To make it easier to fall'],
            correctOptionIndex: 2,
            explanation: 'Correct. A low center of gravity provides a stable base, which is crucial for both defending against attacks and launching powerful movements.'
        }
    },
    {
        id: 'ma-2',
        name: 'Ap Chagi (Front Kick)',
        style: 'Taekwondo',
        description: 'A direct, linear kick aimed at the opponent\'s torso or head, using the ball of the foot as the striking surface.',
        quiz: {
            question: 'When performing an Ap Chagi, where should your supporting foot be pointing?',
            options: ['Directly at the target', 'To the side (90 degrees)', 'Slightly turned, but mostly forward', 'Backwards'],
            correctOptionIndex: 2,
            explanation: 'Good! Pointing the supporting foot slightly away from the target allows your hips to rotate freely for better extension and power in the kick.'
        }
    }
];

// --- Mock Profit-Sharing Data ---
export const MOCK_STUDENT_REWARD_DATA: StudentRewardInfo[] = [
  { student_id: 'user-001', name: 'Aina C.', avatar: '🧕', level: 'Partner', progress_score: 95, contribution_points: 120, harmony_coins: 1580, suggested_payout: 250, status: 'suggested' },
  { student_id: 'user-002', name: 'Bala S.', avatar: '👳', level: 'Mentor', progress_score: 88, contribution_points: 95, harmony_coins: 1230, suggested_payout: 180, status: 'suggested' },
  { student_id: 'user-003', name: 'Chen W.', avatar: '👲', level: 'Mentor', progress_score: 92, contribution_points: 80, harmony_coins: 1100, suggested_payout: 150, status: 'suggested' },
  { student_id: 'user-004', name: 'Dania R.', avatar: '👩‍💻', level: 'Learner', progress_score: 75, contribution_points: 50, harmony_coins: 650, suggested_payout: 75, status: 'suggested' },
  { student_id: 'user-005', name: 'Ethan L.', avatar: '👨‍🎨', level: 'Learner', progress_score: 68, contribution_points: 30, harmony_coins: 400, suggested_payout: 50, status: 'suggested' },
];

export const MOCK_PROFIT_POOL_DATA: ProfitPoolInfo = {
  month: 'July 2024',
  total_pool_amount: 10000,
  eligible_students: 28,
};

export const MOCK_PROFIT_SHARING_CYCLES: ProfitSharingCycle[] = [
    { id: 'cycle-1', month: 'July 2024', totalPool: 10000, eligibleStudents: 28, status: 'Active' },
    { id: 'cycle-2', month: 'June 2024', totalPool: 8500, eligibleStudents: 22, status: 'Distributed', distributedDate: '2024-07-01' },
    { id: 'cycle-3', month: 'May 2024', totalPool: 7200, eligibleStudents: 18, status: 'Distributed', distributedDate: '2024-06-01' },
];

// --- Mock Social Impact Projects ---
export const MOCK_SOCIAL_PROJECTS: SocialImpactProject[] = [
    {
        id: 'proj-001',
        title: 'School Washroom Improvement',
        description: 'The main student washrooms are old, with broken tiles, leaking taps, and poor ventilation. This project aims to renovate the washrooms to create a cleaner, safer, and more pleasant environment for everyone.',
        location: 'SMK Taman Melati, Kuala Lumpur',
        impactArea: 'Health & Sanitation',
        status: 'Open',
        teamSize: '3-5 students',
        incomePotential: true,
        requiredSkills: ['Project Management', 'Fundraising', 'Basic Plumbing', 'Interior Design'],
        objectives: ['Repair all leaks', 'Repaint walls with anti-mold paint', 'Install water-saving taps', 'Improve ventilation'],
    },
    {
        id: 'proj-002',
        title: 'Community Recycling Program',
        description: 'Our neighborhood lacks a systematic recycling program, leading to excess waste. This project will establish collection points and a student-led initiative to educate residents on proper recycling.',
        location: 'Taman Bunga Raya, Selangor',
        impactArea: 'Environment',
        status: 'Open',
        teamSize: '5-8 students',
        incomePotential: true,
        requiredSkills: ['Event Planning', 'Public Speaking', 'Logistics', 'Social Media Marketing'],
        objectives: ['Set up 3 recycling collection points', 'Run 2 educational workshops', 'Partner with a local recycling center'],
    },
    {
        id: 'proj-003',
        title: 'Digital Literacy for Seniors',
        description: 'Many elderly members of our community struggle with using smartphones and accessing digital services. This project will organize weekly workshops to teach them essential digital skills.',
        location: 'Balai Raya, Kampung Baru',
        impactArea: 'Education & Community',
        status: 'In Progress',
        teamSize: '4 students',
        incomePotential: false,
        requiredSkills: ['Teaching', 'Patience', 'Communication', 'Basic IT'],
        objectives: ['Teach 20 seniors how to use WhatsApp', 'Help them set up MySejahtera', 'Explain how to spot online scams'],
    },
];

export const MOCK_FULL_COURSE: Course = {
    id: 'c_101',
    icon: '🐍',
    title: 'Python for Beginners: From Zero to Hero',
    subtitle: 'Master the basics of Python programming with hands-on projects.',
    description: 'Start your coding journey with Python. This comprehensive course covers everything from variables and loops to functions and data structures. Perfect for beginners with no prior experience.',
    progress: 0,
    modules: [
        {
            id: 'm_1',
            title: 'Introduction to Python',
            description: 'Get set up and write your first line of code.',
            lessons: [
                {
                    id: 'l_1_1',
                    title: 'Welcome & Setup',
                    description: 'Installing Python and VS Code.',
                    type: 'Video',
                    content: {
                        type: 'video',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video
                        duration: 5
                    }
                },
                {
                    id: 'l_1_2',
                    title: 'Your First Program',
                    description: 'Writing Hello World and understanding syntax.',
                    type: 'Video',
                    content: {
                        type: 'video',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                        duration: 8
                    }
                },
                {
                    id: 'l_1_3',
                    title: 'Cheat Sheet: Basic Syntax',
                    description: 'A quick reference guide for Python syntax.',
                    type: 'Reading',
                    content: {
                        type: 'pdf',
                        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Sample PDF
                        filename: 'python_cheatsheet_v1.pdf'
                    }
                }
            ]
        },
        {
            id: 'm_2',
            title: 'Variables & Data Types',
            description: 'Understanding how to store and manipulate data.',
            lessons: [
                {
                    id: 'l_2_1',
                    title: 'Variables Explained',
                    description: 'What are variables and how to use them.',
                    type: 'Audio',
                    content: {
                        type: 'audio',
                        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav', // Sample audio
                        duration: 3
                    }
                },
                {
                    id: 'l_2_2',
                    title: 'Data Types Quiz',
                    description: 'Test your knowledge on strings, integers, and booleans.',
                    type: 'Quiz'
                }
            ]
        }
    ]
};