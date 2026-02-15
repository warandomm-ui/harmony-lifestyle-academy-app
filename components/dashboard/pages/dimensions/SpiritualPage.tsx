import React, { useState, useEffect } from 'react';
import { SparklesIcon, BookOpenIcon, PlayIcon, ChevronLeftIcon, CheckCircleIcon, TrophyIcon, ArrowUpCircleIcon } from '../../Icons';
import { SPIRITUAL_PATHWAYS } from '../../../../constants/quranData';
import type { Surah, SpiritualCategory } from '../../../../types';
import { useToast } from '../../../../contexts/ToastContext';
import { useGamification } from '../../../../contexts/GamificationContext';

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
    const [activeTab, setActiveTab] = useState<'video' | 'reading'>('video');
    const [isCompleted, setIsCompleted] = useState(false);
    const { addToast } = useToast();
    const { addPoints } = useGamification();

    useEffect(() => {
        // Reset completion status when Surah changes
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
                    <div className="flex bg-[var(--secondary)]/50 rounded-xl p-1.5 border border-[var(--border)] mr-4">
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
                </div>
            </header>

            {/* Content Container */}
            <main className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[var(--background)]">
                {/* Scrollable Sidebar for Context - Optional, but keeping it simple for now */}
                
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'video' ? (
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
                        ) : (
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

// --- Main Page ---

const SpiritualPage: React.FC = () => {
    const [activeCategoryId, setActiveCategoryId] = useState('ruh');
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

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