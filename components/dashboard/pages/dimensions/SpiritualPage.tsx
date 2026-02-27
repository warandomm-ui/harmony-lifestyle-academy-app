import React, { useState, useEffect } from 'react';
import { SparklesIcon, BookOpenIcon, PlayIcon, ChevronLeftIcon, CheckCircleIcon, TrophyIcon, ArrowUpCircleIcon } from '../../Icons';
import { SPIRITUAL_PATHWAYS } from '../../../../constants/quranData';
import type { Surah, SpiritualCategory } from '../../../../types';
import { useToast } from '../../../../contexts/ToastContext';
import { useGamification } from '../../../../contexts/GamificationContext';
import AyatCourseViewer from './AyatCourseViewer';

// --- Components ---

const CategoryTab: React.FC<{ 
    id: string; 
    label: string; 
    icon: string; 
    isActive: boolean; 
    onClick: () => void;
}> = ({ id, label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all whitespace-nowrap ${
            isActive
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-[var(--card)] border-transparent hover:border-indigo-300 text-[var(--foreground)]'
        }`}
    >
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
    </button>
);

const SurahFolder: React.FC<{ surah: Surah; onClick: () => void }> = ({ surah, onClick }) => (
    <div 
        onClick={onClick}
        className="group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full hover:border-indigo-400 transform hover:-translate-y-1"
    >
        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-3xl flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase">
            {surah.number}
        </div>
        
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
            📂
        </div>
        
        <h3 className="font-black text-xl text-[var(--foreground)] group-hover:text-indigo-600 transition-colors">
            {surah.name}
        </h3>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-2">
            {surah.englishName}
        </p>
        <p className="text-sm text-[var(--muted)] flex-grow line-clamp-2 leading-relaxed">
            {surah.description}
        </p>
        
        <div className="mt-5 pt-4 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <span className="bg-[var(--secondary)] px-2 py-1 rounded">{surah.tags[0]}</span>
            <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">Study <span className="text-lg">&rarr;</span></span>
        </div>
    </div>
);

const SurahPlayerOverlay: React.FC<{ surah: Surah; category: SpiritualCategory; onClose: () => void }> = ({ surah, category, onClose }) => {
    const [activeTab, setActiveTab] = useState<'video' | 'reading' | 'ayat'>('ayat');
    const [isCompleted, setIsCompleted] = useState(false);
    const { addToast } = useToast();
    const { addPoints } = useGamification();

    useEffect(() => {
        const key = `completed_surah_${surah.number}`;
        setIsCompleted(localStorage.getItem(key) === 'true');
    }, [surah.number]);

    const handleComplete = () => {
        if (isCompleted) return;
        
        const key = `completed_surah_${surah.number}`;
        localStorage.setItem(key, 'true');
        setIsCompleted(true);
        
        addPoints(50, `mastering ${surah.name}`);
        addToast(`MashaAllah! You've completed the lesson on ${surah.name}.`, 'success');
    };

    return (
        <div className="fixed inset-0 bg-[var(--background)] z-[100] flex flex-col animate-fade-in overflow-hidden">
            {/* Header */}
            <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--card)] flex-shrink-0">
                <div className="flex items-center gap-5">
                    <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors border border-[var(--border)]">
                        <ChevronLeftIcon className="h-6 w-6 text-[var(--muted)]" />
                    </button>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] flex items-center gap-3">
                            <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md">{surah.number}</span>
                            {surah.name}
                        </h1>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{category.arabicTitle} Academy • {surah.englishName}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Tab Switcher - 3 tabs with Ayat as default */}
                    <div className="flex bg-[var(--secondary)]/50 rounded-xl p-1.5 border border-[var(--border)] mr-4">
                        <button 
                            onClick={() => setActiveTab('ayat')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'ayat' ? 'bg-[var(--card)] text-indigo-600 shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-indigo-600'}`}
                        >
                            📖 Ayat
                        </button>
                        <button 
                            onClick={() => setActiveTab('video')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'video' ? 'bg-[var(--card)] text-indigo-600 shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-indigo-600'}`}
                        >
                            <PlayIcon className="h-4 w-4" /> Video
                        </button>
                        <button 
                            onClick={() => setActiveTab('reading')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'reading' ? 'bg-[var(--card)] text-indigo-600 shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-indigo-600'}`}
                        >
                            <BookOpenIcon className="h-4 w-4" /> Reading
                        </button>
                    </div>
                    
                    {activeTab !== 'ayat' && (
                        <button 
                            onClick={handleComplete}
                            disabled={isCompleted}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                                isCompleted 
                                ? 'bg-green-100 text-green-700 border-2 border-green-500 cursor-default' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                            }`}
                        >
                            {isCompleted ? <CheckCircleIcon className="h-4 w-4" /> : <ArrowUpCircleIcon className="h-4 w-4" />}
                            {isCompleted ? 'Completed' : 'Mark as Done'}
                        </button>
                    )}
                </div>
            </header>

            {/* Content Container */}
            <main className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[var(--background)]">
                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Ayat Tab - Quran Course Viewer */}
                        {activeTab === 'ayat' && (
                            <AyatCourseViewer
                                surahNumber={surah.number}
                                onBack={onClose}
                            />
                        )}

                        {activeTab === 'video' && (
                            <div className="space-y-8 animate-fade-in-fast">
                                {surah.videoUrl ? (
                                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group border-4 border-[var(--card)]">
                                        <video src={surah.videoUrl} controls className="w-full h-full" poster="https://placehold.co/1280x720/1e1b4b/ffffff?text=Video+Lesson+Preview" />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group border-4 border-[var(--card)]">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-white">
                                            <PlayIcon className="h-24 w-24 opacity-60 mb-6 group-hover:scale-110 transition-transform duration-300 cursor-pointer text-indigo-400" />
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">{surah.name}</h2>
                                            <p className="text-indigo-300 font-bold uppercase tracking-widest mt-2 text-xs">Awaiting Video Content Integration</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="bento-card bg-white dark:bg-gray-800 p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                            <SparklesIcon className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-black text-xl text-[var(--foreground)] uppercase tracking-tight">Lesson Insights</h3>
                                    </div>
                                    <p className="text-[var(--muted)] leading-relaxed text-lg">
                                        This Surah plays a vital role in the <strong>{category.title} Pathway</strong>. It focuses on shifting our focus from {category.id === 'ruh' ? 'the temporary to the eternal' : category.id === 'qalb' ? 'hardened ego to soft empathy' : category.id === 'aql' ? 'surface logic to divine wisdom' : 'self-serving desire to altruism'}.
                                    </p>
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Primary Objective</h4>
                                            <p className="text-sm font-bold text-[var(--foreground)]">{surah.description}</p>
                                        </div>
                                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Key Tags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {surah.tags.map(tag => (
                                                    <span key={tag} className="text-[9px] font-black uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reading' && (
                            <div className="animate-fade-in-fast min-h-[70vh] bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl p-10 md:p-16 border border-[var(--border)] relative">
                                <div className="absolute top-10 right-10 opacity-5 text-9xl font-serif">
                                    {surah.number}
                                </div>
                                
                                <div className="text-center mb-16">
                                    <h2 className="text-6xl font-black text-indigo-800 dark:text-indigo-300 font-serif lowercase tracking-tighter mb-2">{surah.name}</h2>
                                    <p className="text-[var(--muted)] font-bold uppercase tracking-[0.4em] text-xs">{surah.englishName}</p>
                                    <div className="w-20 h-1.5 bg-indigo-600 mx-auto mt-6 rounded-full"></div>
                                </div>
                                
                                <div className="prose dark:prose-invert max-w-none">
                                    {surah.readingContent ? (
                                        <div className="text-[var(--foreground)] text-lg leading-loose font-serif whitespace-pre-wrap">
                                            {surah.readingContent}
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border-l-[10px] border-indigo-600">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Core Transformational Theme</h4>
                                                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 leading-snug">
                                                    {surah.description}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <section>
                                                    <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                                                        <TrophyIcon className="h-6 w-6 text-indigo-500" /> Deep Insights
                                                    </h3>
                                                    <div className="space-y-6">
                                                        <div className="flex gap-4">
                                                            <span className="text-indigo-600 font-black text-2xl">01</span>
                                                            <p className="text-[var(--muted)] text-sm leading-relaxed">Understanding the historical context ({surah.tags[0]}) helps us apply these timeless lessons to modern challenges.</p>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="text-indigo-600 font-black text-2xl">02</span>
                                                            <p className="text-[var(--muted)] text-sm leading-relaxed">Linguistic precision within these verses targets specific emotional barriers in the <strong>{category.arabicTitle}</strong>.</p>
                                                        </div>
                                                    </div>
                                                </section>
                                                <section>
                                                    <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                                                        <CheckCircleIcon className="h-6 w-6 text-indigo-500" /> Reflective Praxis
                                                    </h3>
                                                    <div className="bg-[var(--background)] p-6 rounded-3xl border border-[var(--border)] shadow-inner">
                                                        <p className="text-sm italic text-[var(--muted)] leading-relaxed mb-6">
                                                            "How does the message of Surah {surah.name} resonate with your current life situation? What is one small step you can take today to align with its wisdom?"
                                                        </p>
                                                        <button 
                                                            onClick={handleComplete}
                                                            className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isCompleted ? 'bg-green-500 text-white' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'}`}
                                                        >
                                                            {isCompleted ? 'Reflection Saved' : 'Commit to Action'}
                                                        </button>
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL MINDFULNESS CONTENT (non-Muslim)
// ─────────────────────────────────────────────────────────────────────────────

interface MindfulnessPathway {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  practices: { title: string; duration: string; desc: string; benefit: string }[];
}

const MINDFULNESS_PATHWAYS: MindfulnessPathway[] = [
  {
    id: 'presence',
    icon: '🧘',
    title: 'Presence',
    subtitle: 'The Art of Being Here',
    description: '"The present moment is the only moment available to us, and it is the door to all moments." — Thich Nhat Hanh',
    color: 'from-teal-900 to-teal-700',
    practices: [
      { title: 'Body Scan Meditation', duration: '10 min', desc: 'Slowly move awareness through each part of your body from feet to crown, releasing tension as you go.', benefit: 'Reduces cortisol by 20%, activates parasympathetic nervous system (Harvard, 2018)' },
      { title: 'Mindful Breathing', duration: '5 min', desc: '4-7-8 breathing: inhale 4 counts, hold 7, exhale 8. Repeat 4 cycles to instantly calm the nervous system.', benefit: 'Lowers heart rate, reduces anxiety within 60 seconds (Journal of Clinical Psychology, 2020)' },
      { title: 'Sensory Grounding', duration: '3 min', desc: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Full presence now.', benefit: 'Interrupts rumination and brings the mind back to the present moment immediately' },
      { title: 'Walking Meditation', duration: '15 min', desc: 'Walk slowly, feeling each footstep. Notice the breath, surroundings, and sensations with full attention.', benefit: 'Increases grey matter in attention regions (NeuroImage, 2015). Stanford: boosts creativity 81%' },
    ],
  },
  {
    id: 'gratitude',
    icon: '🌸',
    title: 'Gratitude',
    subtitle: 'Abundance as a Practice',
    description: '"Gratitude turns what we have into enough." — Melody Beattie',
    color: 'from-rose-900 to-rose-700',
    practices: [
      { title: 'Morning Gratitude Journal', duration: '5 min', desc: 'Write 3 specific things you are grateful for each morning. Be specific — not "family" but "my sister calling me yesterday."', benefit: '8 weeks of daily gratitude journaling increases life satisfaction and reduces depression (J American College Health, 2022)' },
      { title: 'Gratitude Letter', duration: '20 min', desc: 'Write a letter of appreciation to someone who has made a difference. You may or may not send it — the writing itself is the practice.', benefit: 'Gratitude letters increase happiness for up to a month after writing (Positive Psychology, Martin Seligman, 2005)' },
      { title: 'Savouring Practice', duration: '5 min', desc: 'Identify one pleasurable moment today and consciously extend it. Replay it in your mind, share it with someone, take a photo — stretch the joy.', benefit: 'Savouring increases positive emotions and builds psychological resilience (Journal of Positive Psychology, 2019)' },
      { title: 'Evening Review', duration: '10 min', desc: 'Before sleep, recall 3 moments that went well today. No matter how small. Ask: what allowed this to happen?', benefit: 'Reduces insomnia, improves sleep quality, and rewires the brain toward positive pattern recognition' },
    ],
  },
  {
    id: 'purpose',
    icon: '🌟',
    title: 'Purpose',
    subtitle: 'Living Your Values',
    description: '"He who has a why to live can bear almost any how." — Friedrich Nietzsche',
    color: 'from-amber-900 to-amber-700',
    practices: [
      { title: 'Values Clarification', duration: '20 min', desc: 'List 10 values, then ruthlessly narrow to your top 3. Ask: if I could only live by three values, what would they be?', benefit: 'Clarity on values predicts life satisfaction more than wealth or status (Self-Determination Theory, Deci & Ryan)' },
      { title: 'Ikigai Reflection', duration: '30 min', desc: 'Map your Ikigai: What do you love? What are you good at? What does the world need? What can you be paid for? Find the intersection.', benefit: 'Purpose reduces mortality risk by 15%, lowers heart disease risk, and extends healthy lifespan (JAMA Network Open, 2019)' },
      { title: 'Legacy Letter', duration: '25 min', desc: 'Write a letter from your 80-year-old self to your current self. What do you want them to have done? What will you regret not doing?', benefit: 'Future-self reflection increases long-term goal alignment and reduces present-bias in decision making' },
      { title: 'Daily Intention Setting', duration: '3 min', desc: 'Each morning, set one clear intention: "Today I intend to..." — not a task, but a way of being. How do you want to show up?', benefit: 'Intentional living increases engagement, meaning, and consistency across all domains of life' },
    ],
  },
  {
    id: 'resilience',
    icon: '🌊',
    title: 'Resilience',
    subtitle: 'The Strength to Return',
    description: '"The oak fought the wind and was broken, the willow bent when it must and survived." — Robert Jordan',
    color: 'from-blue-900 to-blue-700',
    practices: [
      { title: 'Stoic Evening Review', duration: '10 min', desc: 'Marcus Aurelius did this nightly: What did I do well today? What could I have done better? What will I improve tomorrow?', benefit: 'Self-reflection reduces stress and depression. 8 weeks of journaling increased resilience by 23% (J Occupational Health, 2022)' },
      { title: 'Negative Visualisation', duration: '10 min', desc: 'Imagine losing something you take for granted — your health, a relationship, your sight. Then return to the present with deep appreciation.', benefit: 'Stoic practice of memento mori and negative visualisation measurably increases present-moment gratitude and hedonic adaptation' },
      { title: 'Emotional Labelling', duration: '5 min', desc: 'When difficult emotions arise, name them precisely: "I notice frustration" or "I am feeling fear." The act of labelling reduces intensity immediately.', benefit: 'Affect labelling reduces amygdala activation by 20% — naming the emotion literally calms the brain (Lieberman, UCLA, 2007)' },
      { title: 'Post-Traumatic Growth Journal', duration: '15 min', desc: 'Write about a past difficulty. Ask: What did I learn? How did I grow? What strength did I discover? Reframe challenge as the training ground.', benefit: 'PTG journaling turns adversity into strength. Expressive writing reduces PTSD symptoms and improves immune function (Pennebaker, 1997)' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UniversalMindfulnessPage component
// ─────────────────────────────────────────────────────────────────────────────

const UniversalMindfulnessPage: React.FC = () => {
  const [activeId, setActiveId] = useState('presence');
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null);
  const { addPoints } = useGamification();
  const { addToast } = useToast();

  const active = MINDFULNESS_PATHWAYS.find(p => p.id === activeId) || MINDFULNESS_PATHWAYS[0];

  const handlePracticeComplete = (practiceTitle: string) => {
    addPoints(25, `completing ${practiceTitle}`);
    addToast(`Great work on "${practiceTitle}"! +25 points`, 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Hero */}
      <div
        className={`rounded-3xl text-center p-12 bg-gradient-to-br ${active.color} text-white relative overflow-hidden shadow-2xl`}
        style={{ transition: 'all 0.7s ease' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 left-8 text-9xl">✨</div>
          <div className="absolute bottom-8 right-8 text-9xl">🌿</div>
        </div>
        <div className="relative z-10">
          <div className="text-7xl mb-6 animate-bounce-slow">{active.icon}</div>
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-2">
            {active.title}
          </h2>
          <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-6">
            {active.subtitle}
          </p>
          <p className="text-white/80 text-xl font-medium leading-relaxed italic max-w-2xl mx-auto">
            {active.description}
          </p>
        </div>
      </div>

      {/* Pathway Tabs */}
      <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
        {MINDFULNESS_PATHWAYS.map(p => (
          <button
            key={p.id}
            onClick={() => { setActiveId(p.id); setExpandedPractice(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all whitespace-nowrap ${
              activeId === p.id
                ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg scale-105'
                : 'bg-[var(--card)] border-transparent hover:border-[var(--primary)] text-[var(--foreground)]'
            }`}
          >
            <span className="text-xl">{p.icon}</span>
            <span className="font-bold text-sm uppercase tracking-wide">{p.title}</span>
          </button>
        ))}
      </div>

      {/* Practices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {active.practices.map((practice, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all"
            style={{
              background: 'rgba(13,27,42,0.8)',
              border: expandedPractice === idx ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.15)',
              boxShadow: expandedPractice === idx ? '0 0 20px rgba(201,168,76,0.08)' : 'none',
            }}
            onClick={() => setExpandedPractice(expandedPractice === idx ? null : idx)}
          >
            {/* Card header */}
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    {practice.duration}
                  </span>
                </div>
                <h3
                  className="font-black text-lg"
                  style={{ color: '#f5f0e8', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {practice.title}
                </h3>
              </div>
              <span style={{ color: 'rgba(201,168,76,0.5)', fontSize: '1.2rem' }}>
                {expandedPractice === idx ? '▲' : '▼'}
              </span>
            </div>

            {/* Expanded content */}
            {expandedPractice === idx && (
              <div className="px-5 pb-5 space-y-4" onClick={e => e.stopPropagation()}>
                <p className="text-sm leading-relaxed" style={{ color: '#c8c0b4' }}>
                  {practice.desc}
                </p>

                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
                >
                  <span className="text-2xl mt-0.5">🧬</span>
                  <div>
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1.5">
                      Science & Research
                    </p>
                    <p className="text-xs text-cyan-200/80 leading-relaxed">
                      {practice.benefit}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePracticeComplete(practice.title)}
                  className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    background: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#c9a84c',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.12)'; }}
                >
                  ✦ Mark Practice Complete (+25 pts)
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const SpiritualPage: React.FC<{ religion?: string }> = ({ religion = '' }) => {
    const muslim = religion.trim().toLowerCase() === 'islam';

    const [activeCategoryId, setActiveCategoryId] = useState('ruh');
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

    // Non-Muslim path
    if (!muslim) {
        return <UniversalMindfulnessPage />;
    }

    const activeCategory = SPIRITUAL_PATHWAYS.find(c => c.id === activeCategoryId) || SPIRITUAL_PATHWAYS[0];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Dimension Hero */}
            <div className={`bento-card text-center transition-all duration-700 shadow-2xl border-none p-12 bg-gradient-to-br from-indigo-900 to-indigo-700 text-white relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 text-9xl">✨</div>
                    <div className="absolute bottom-10 right-10 text-9xl">📖</div>
                </div>

                <div className="relative z-10">
                    <div className="text-7xl mb-6 animate-bounce-slow">{activeCategory.icon}</div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter">
                        {activeCategory.arabicTitle} <span className="font-light opacity-30">|</span> {activeCategory.title}
                    </h2>

                    <div className="mt-6 max-w-3xl mx-auto space-y-6">
                        <p className="text-indigo-100 text-xl font-medium leading-relaxed italic">
                            "{activeCategory.longDescription}"
                        </p>
                        {activeCategory.keywords && (
                            <div className="flex flex-wrap justify-center gap-3 pt-4">
                                {activeCategory.keywords.map((keyword, idx) => (
                                    <span key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar border-b border-[var(--border)] scroll-smooth">
                {SPIRITUAL_PATHWAYS.map(cat => (
                    <CategoryTab
                        key={cat.id}
                        id={cat.id}
                        label={cat.arabicTitle}
                        icon={cat.icon}
                        isActive={activeCategoryId === cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                    />
                ))}
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeCategory.surahs.map((surah, idx) => (
                    <div key={`${surah.number}-${idx}`} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                        <SurahFolder
                            surah={surah}
                            onClick={() => setSelectedSurah(surah)}
                        />
                    </div>
                ))}
            </div>

            {/* Academy Course Player Overlay */}
            {selectedSurah && (
                <SurahPlayerOverlay
                    surah={selectedSurah}
                    category={activeCategory}
                    onClose={() => setSelectedSurah(null)}
                />
            )}

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default SpiritualPage;
