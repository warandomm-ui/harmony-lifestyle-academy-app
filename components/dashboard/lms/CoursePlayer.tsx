import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, CheckCircleIcon, PlayIcon, DocumentTextIcon, MicrophoneIcon, DownloadIcon, ChevronDownIcon, SparklesIcon, SpinnerIcon } from '../Icons';
import type { Course, CourseLesson, CourseModule } from '../../../types';

interface LessonBrief {
    title: string;
    duration: string;
    objective: string;
    keyPoints: string[];
    script: string;
    visualNotes: string;
}

const LessonBriefCard: React.FC<{ brief: LessonBrief }> = ({ brief }) => (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-[var(--secondary)] to-[var(--background)] p-6 rounded-xl text-left">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center gap-1">
                <SparklesIcon className="h-3 w-3" /> AI LESSON BRIEF
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">{brief.duration}</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{brief.title}</h3>
        <p className="text-sm text-[var(--muted)] italic mb-5">🎯 {brief.objective}</p>

        <div className="mb-5">
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Key Points</p>
            <ul className="space-y-2">
                {brief.keyPoints?.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                        <span className="text-[var(--primary)] font-bold mt-0.5 flex-shrink-0">•</span>
                        {point}
                    </li>
                ))}
            </ul>
        </div>

        <div className="mb-5">
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Narration Script</p>
            <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{brief.script}</p>
        </div>

        {brief.visualNotes && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3">
                <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">🎬 Visual Notes</p>
                <p className="text-xs text-[var(--muted)] italic">{brief.visualNotes}</p>
            </div>
        )}
    </div>
);
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import { generatePlaceholderVideo } from '../../../services/geminiService';

interface CoursePlayerProps {
    course: Course;
    onExit: () => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onExit }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const allLessons = course.modules?.flatMap(m => m.lessons) || [];
    
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(course.modules?.map(m => m.id!) || []));
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    
    const [generatingLessonId, setGeneratingLessonId] = useState<string | null>(null);
    const [dynamicVideoUrls, setDynamicVideoUrls] = useState<Record<string, string>>({});

    const currentLesson = allLessons[currentLessonIndex];

    useEffect(() => {
        const loadProgress = async () => {
            if (!user) return;
            setIsLoadingProgress(true);
            
            try {
                // Table name aligned with RLS policy: 'progress'
                const { data, error } = await supabase
                    .from('progress')
                    .select('lesson_id')
                    .eq('user_id', user.id)
                    .eq('course_id', course.id);

                if (error) {
                    const localProgress = localStorage.getItem(`progress_${user.id}_${course.id}`);
                    if (localProgress) {
                        setCompletedLessonIds(new Set(JSON.parse(localProgress)));
                    }
                } else if (data) {
                    setCompletedLessonIds(new Set(data.map(d => d.lesson_id)));
                }
            } catch (err) {
                console.error("Progress fetch error:", err);
            } finally {
                setIsLoadingProgress(false);
            }
        };
        loadProgress();
    }, [course.id, user]);

    const handleMarkComplete = async () => {
        if (!currentLesson || !user) return;
        
        const newSet = new Set(completedLessonIds).add(currentLesson.id!);
        setCompletedLessonIds(newSet);
        
        try {
            // Upsert respect RLS as user_id is explicitly set to authenticated ID
            const { error } = await supabase
                .from('progress')
                .upsert({ 
                    user_id: user.id, 
                    course_id: course.id, 
                    lesson_id: currentLesson.id, 
                    completed_at: new Date().toISOString() 
                });
            
            if (error) throw error;
        } catch (err) {
             localStorage.setItem(`progress_${user.id}_${course.id}`, JSON.stringify(Array.from(newSet)));
        }

        addToast("Lesson completed! 🎉", "success");
        if (currentLessonIndex < allLessons.length - 1) {
            setTimeout(() => setCurrentLessonIndex(prev => prev + 1), 1500);
        }
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) newSet.delete(moduleId);
            else newSet.add(moduleId);
            return newSet;
        });
    };

    const handleGenerateVideo = async () => {
        if (!currentLesson || !currentLesson.id) return;

        setGeneratingLessonId(currentLesson.id);
        addToast("Generating AI lesson brief...", 'info');

        try {
            const url = await generatePlaceholderVideo(`${currentLesson.title}: ${currentLesson.description}`);
            setDynamicVideoUrls(prev => ({...prev, [currentLesson.id!]: url}));
            addToast("Lesson brief ready!", 'success');
        } catch (error) {
            addToast("Failed to generate lesson brief.", 'error');
        } finally {
            setGeneratingLessonId(null);
        }
    };

    const renderContent = () => {
        if (!currentLesson?.content) return <div className="p-10 text-center text-[var(--muted)]">No content available.</div>;

        switch (currentLesson.content.type) {
            case 'video': {
                const videoUrl = dynamicVideoUrls[currentLesson.id!] || currentLesson.content.url;
                const isGenerating = currentLesson.id === generatingLessonId;

                let briefData: LessonBrief | null = null;
                if (videoUrl) {
                    try { briefData = JSON.parse(videoUrl); } catch { briefData = null; }
                }

                return (
                    <div className="aspect-video bg-[var(--secondary)] rounded-xl overflow-hidden shadow-lg relative group">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10">
                                <SpinnerIcon className="h-12 w-12 mb-4 text-[var(--primary)]" />
                                <p className="font-bold text-lg animate-pulse">Generating lesson brief...</p>
                            </div>
                        ) : briefData ? (
                            <LessonBriefCard brief={briefData} />
                        ) : (
                            <video key={videoUrl} src={videoUrl} controls className="w-full h-full" />
                        )}
                        {!isGenerating && !briefData && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={handleGenerateVideo} className="bg-black/60 hover:bg-[var(--primary)] backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10">
                                    <SparklesIcon className="h-4 w-4" />
                                    AI Brief
                                </button>
                            </div>
                        )}
                        {!isGenerating && briefData && (
                            <div className="absolute top-4 right-4">
                                <button onClick={handleGenerateVideo} className="bg-[var(--primary)]/80 hover:bg-[var(--primary)] backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <SparklesIcon className="h-3 w-3" />
                                    Regenerate
                                </button>
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return <div className="p-10 text-center">Lesson type "{currentLesson.content.type}" ready to view.</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-[var(--background)] z-50 flex flex-col">
            <header className="h-16 border-b border-[var(--border)] flex items-center px-4 bg-[var(--card)] flex-shrink-0 justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-[var(--secondary)] rounded-full transition"><ChevronLeftIcon className="h-6 w-6 text-[var(--muted)]" /></button>
                    <h1 className="font-bold text-lg text-[var(--foreground)] truncate max-w-md">{course.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-[var(--muted)]">Progress: {Math.round((completedLessonIds.size / Math.max(allLessons.length, 1)) * 100)}%</div>
                </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-80 border-r border-[var(--border)] bg-[var(--card)] overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <h2 className="font-bold text-lg mb-4 uppercase text-[var(--muted)] text-[10px] tracking-widest">Course Content</h2>
                        <div className="space-y-4">
                            {course.modules?.map((module) => (
                                <div key={module.id}>
                                    <button onClick={() => toggleModule(module.id!)} className="flex items-center justify-between w-full text-left font-bold text-[var(--foreground)] hover:text-[var(--primary)] mb-2">
                                        <span>{module.title}</span>
                                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${expandedModules.has(module.id!) ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedModules.has(module.id!) && (
                                        <div className="space-y-1 pl-2 border-l border-[var(--border)] ml-1">
                                            {module.lessons.map((lesson) => {
                                                const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                                                const isActive = globalIdx === currentLessonIndex;
                                                const isDone = completedLessonIds.has(lesson.id!);
                                                return (
                                                    <button key={lesson.id} onClick={() => setCurrentLessonIndex(globalIdx)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs transition-all ${isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'text-[var(--muted)] hover:bg-[var(--secondary)]'}`}>
                                                        {isDone ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <PlayIcon className="h-4 w-4" />}
                                                        <span className="text-left">{lesson.title}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <main className="flex-1 overflow-y-auto bg-[var(--background)] p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] mb-2">{currentLesson?.title}</h2>
                            <p className="text-[var(--muted)]">{currentLesson?.description}</p>
                        </div>
                        {renderContent()}
                        <div className="mt-8 flex justify-between items-center pt-6 border-t border-[var(--border)]">
                            <button onClick={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))} disabled={currentLessonIndex === 0} className="px-6 py-2 rounded-full font-bold border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--secondary)] disabled:opacity-30">Previous</button>
                            <button onClick={handleMarkComplete} disabled={completedLessonIds.has(currentLesson?.id!)} className={`px-8 py-3 rounded-full font-black text-white transition-all transform hover:scale-105 ${completedLessonIds.has(currentLesson?.id!) ? 'bg-green-500' : 'bg-indigo-600 shadow-lg shadow-indigo-500/20'}`}>
                                {completedLessonIds.has(currentLesson?.id!) ? 'Completed' : 'Mark as Done'}
                            </button>
                            <button onClick={() => setCurrentLessonIndex(prev => Math.min(allLessons.length - 1, prev + 1))} disabled={currentLessonIndex === allLessons.length - 1} className="px-6 py-2 rounded-full font-bold border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--secondary)] disabled:opacity-30">Next</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CoursePlayer;