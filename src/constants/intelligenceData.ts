export interface IntelligenceTypeData {
  id: string;
  name: string;
  icon: string;
  description: string;
  careers: { title: string; salary: string; demand: string }[];
}

export const INTELLIGENCE_TYPES: Record<string, IntelligenceTypeData> = {
  logical: {
    id: 'logical',
    name: 'Logical-Mathematical',
    icon: '🧮',
    description: 'You excel at reasoning, problem-solving, and working with numbers and patterns.',
    careers: [
      { title: 'Software Engineer', salary: '$95k–$150k', demand: 'Very High' },
      { title: 'Data Scientist', salary: '$90k–$140k', demand: 'High' },
      { title: 'Financial Analyst', salary: '$65k–$100k', demand: 'High' },
      { title: 'Research Scientist', salary: '$70k–$120k', demand: 'Medium' },
    ],
  },
  linguistic: {
    id: 'linguistic',
    name: 'Linguistic',
    icon: '📝',
    description: 'You have a gift for words, language, reading, and storytelling.',
    careers: [
      { title: 'Content Strategist', salary: '$60k–$95k', demand: 'High' },
      { title: 'Journalist', salary: '$45k–$80k', demand: 'Medium' },
      { title: 'Lawyer', salary: '$80k–$160k', demand: 'High' },
      { title: 'Teacher', salary: '$45k–$75k', demand: 'High' },
    ],
  },
  spatial: {
    id: 'spatial',
    name: 'Visual-Spatial',
    icon: '🎨',
    description: 'You think in pictures and have strong visualization and design abilities.',
    careers: [
      { title: 'Architect', salary: '$70k–$120k', demand: 'Medium' },
      { title: 'UX Designer', salary: '$75k–$130k', demand: 'Very High' },
      { title: 'Graphic Designer', salary: '$50k–$85k', demand: 'High' },
      { title: 'Photographer', salary: '$40k–$75k', demand: 'Medium' },
    ],
  },
  musical: {
    id: 'musical',
    name: 'Musical',
    icon: '🎵',
    description: 'You have a natural ability for rhythm, melody, and sound patterns.',
    careers: [
      { title: 'Sound Engineer', salary: '$50k–$90k', demand: 'Medium' },
      { title: 'Music Therapist', salary: '$45k–$70k', demand: 'Growing' },
      { title: 'Music Producer', salary: '$45k–$100k', demand: 'Medium' },
      { title: 'Audio Designer', salary: '$55k–$95k', demand: 'Medium' },
    ],
  },
  kinesthetic: {
    id: 'kinesthetic',
    name: 'Bodily-Kinesthetic',
    icon: '🤸',
    description: 'You learn through movement and have excellent physical coordination.',
    careers: [
      { title: 'Physical Therapist', salary: '$70k–$100k', demand: 'Very High' },
      { title: 'Athletic Trainer', salary: '$45k–$75k', demand: 'High' },
      { title: 'Surgeon', salary: '$250k–$500k', demand: 'High' },
      { title: 'Dancer/Choreographer', salary: '$35k–$70k', demand: 'Medium' },
    ],
  },
  interpersonal: {
    id: 'interpersonal',
    name: 'Interpersonal',
    icon: '👥',
    description: 'You understand others well and excel in teamwork and communication.',
    careers: [
      { title: 'HR Manager', salary: '$65k–$110k', demand: 'High' },
      { title: 'Counselor', salary: '$45k–$80k', demand: 'High' },
      { title: 'Sales Director', salary: '$80k–$150k', demand: 'High' },
      { title: 'Public Relations', salary: '$55k–$95k', demand: 'Medium' },
    ],
  },
  intrapersonal: {
    id: 'intrapersonal',
    name: 'Intrapersonal',
    icon: '🧘',
    description: 'You have deep self-awareness and excel at reflection and independent work.',
    careers: [
      { title: 'Psychologist', salary: '$60k–$100k', demand: 'High' },
      { title: 'Entrepreneur', salary: 'Variable', demand: 'Very High' },
      { title: 'Life Coach', salary: '$40k–$80k', demand: 'Growing' },
      { title: 'Author', salary: 'Variable', demand: 'Medium' },
    ],
  },
  naturalistic: {
    id: 'naturalistic',
    name: 'Naturalistic',
    icon: '🌿',
    description: 'You connect with nature and excel at understanding living systems.',
    careers: [
      { title: 'Environmental Scientist', salary: '$60k–$95k', demand: 'High' },
      { title: 'Veterinarian', salary: '$80k–$120k', demand: 'High' },
      { title: 'Botanist', salary: '$55k–$85k', demand: 'Medium' },
      { title: 'Marine Biologist', salary: '$50k–$80k', demand: 'Medium' },
    ],
  },
};

export interface QuizOption {
  text: string;
  intelligence: string;
  score: number;
  secondary?: Record<string, number>;
}

export interface QuizQuestion {
  question: string;
  type: string;
  options: QuizOption[];
}

export const INTELLIGENCE_QUESTIONS: QuizQuestion[] = [
  {
    question: 'When solving problems, you prefer to:',
    type: 'logical',
    options: [
      { text: 'Break it down logically and analyze', intelligence: 'logical', score: 3 },
      { text: 'Discuss with others', intelligence: 'interpersonal', score: 3 },
      { text: 'Visualize the solution', intelligence: 'spatial', score: 3 },
      { text: 'Think deeply alone', intelligence: 'intrapersonal', score: 3 },
    ],
  },
  {
    question: 'In free time, you enjoy:',
    type: 'linguistic',
    options: [
      { text: 'Reading or writing', intelligence: 'linguistic', score: 3 },
      { text: 'Sports or physical activities', intelligence: 'kinesthetic', score: 3 },
      { text: 'Being in nature', intelligence: 'naturalistic', score: 3 },
      { text: 'Playing or listening to music', intelligence: 'musical', score: 3 },
    ],
  },
  {
    question: 'You learn best by:',
    type: 'spatial',
    options: [
      { text: 'Doing hands-on activities', intelligence: 'kinesthetic', score: 3 },
      { text: 'Reading and taking notes', intelligence: 'linguistic', score: 3 },
      { text: 'Looking at visuals and diagrams', intelligence: 'spatial', score: 3 },
      { text: 'Listening and discussing', intelligence: 'interpersonal', score: 3 },
    ],
  },
  {
    question: 'Which describes you best?',
    type: 'musical',
    options: [
      { text: 'Love numbers and logic', intelligence: 'logical', score: 3 },
      { text: 'Good sense of rhythm', intelligence: 'musical', score: 3 },
      { text: 'Notice small details in everything', intelligence: 'spatial', score: 2, secondary: { naturalistic: 1 } },
      { text: 'Understand my emotions well', intelligence: 'intrapersonal', score: 3 },
    ],
  },
  {
    question: 'Favorite subjects include:',
    type: 'kinesthetic',
    options: [
      { text: 'Math, Physics, Computer Science', intelligence: 'logical', score: 3 },
      { text: 'Art, Design, Drama', intelligence: 'spatial', score: 3 },
      { text: 'Biology, Geography, Environmental Science', intelligence: 'naturalistic', score: 3 },
      { text: 'Languages, Literature, History', intelligence: 'linguistic', score: 3 },
    ],
  },
  {
    question: 'In group projects, you typically:',
    type: 'interpersonal',
    options: [
      { text: 'Take the lead and organize', intelligence: 'interpersonal', score: 3 },
      { text: 'Work independently on your part', intelligence: 'intrapersonal', score: 3 },
      { text: 'Create visual presentations', intelligence: 'spatial', score: 3 },
      { text: 'Help resolve team conflicts', intelligence: 'interpersonal', score: 2 },
    ],
  },
  {
    question: 'You feel most energized when:',
    type: 'intrapersonal',
    options: [
      { text: 'Building or creating something', intelligence: 'kinesthetic', score: 3 },
      { text: 'Being outdoors in nature', intelligence: 'naturalistic', score: 3 },
      { text: 'Solving complex puzzles', intelligence: 'logical', score: 3 },
      { text: 'Performing for others', intelligence: 'interpersonal', score: 3 },
    ],
  },
  {
    question: 'Your dream workspace would be:',
    type: 'naturalistic',
    options: [
      { text: 'A quiet place for deep thinking', intelligence: 'intrapersonal', score: 3 },
      { text: 'A collaborative open office', intelligence: 'interpersonal', score: 3 },
      { text: 'A creative studio with tools', intelligence: 'spatial', score: 3 },
      { text: 'Outdoors or in a lab', intelligence: 'naturalistic', score: 3 },
    ],
  },
  {
    question: 'You express yourself best through:',
    type: 'logical',
    options: [
      { text: 'Writing and words', intelligence: 'linguistic', score: 3 },
      { text: 'Art and design', intelligence: 'spatial', score: 3 },
      { text: 'Music and rhythm', intelligence: 'musical', score: 3 },
      { text: 'Physical movement and dance', intelligence: 'kinesthetic', score: 3 },
    ],
  },
  {
    question: 'You remember things best by:',
    type: 'linguistic',
    options: [
      { text: 'Writing them down', intelligence: 'linguistic', score: 3 },
      { text: 'Seeing pictures or diagrams', intelligence: 'spatial', score: 3 },
      { text: 'Associating them with songs', intelligence: 'musical', score: 3 },
      { text: 'Physically doing them', intelligence: 'kinesthetic', score: 3 },
    ],
  },
  {
    question: 'What motivates you most?',
    type: 'spatial',
    options: [
      { text: 'Understanding how things work', intelligence: 'logical', score: 3 },
      { text: 'Helping and connecting with people', intelligence: 'interpersonal', score: 3 },
      { text: 'Personal growth and self-improvement', intelligence: 'intrapersonal', score: 3 },
      { text: 'Protecting the environment', intelligence: 'naturalistic', score: 3 },
    ],
  },
  {
    question: 'Your ideal career involves:',
    type: 'musical',
    options: [
      { text: 'Data and technology', intelligence: 'logical', score: 3 },
      { text: 'Creating designs and visuals', intelligence: 'spatial', score: 3 },
      { text: 'Communicating ideas and stories', intelligence: 'linguistic', score: 3 },
      { text: 'Physical activity and sports', intelligence: 'kinesthetic', score: 3 },
    ],
  },
];
