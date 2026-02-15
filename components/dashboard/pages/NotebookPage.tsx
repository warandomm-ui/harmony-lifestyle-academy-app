
import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, ChatAltIcon, AdjustmentsIcon, SparklesIcon, SpinnerIcon, BookOpenIcon, PencilIcon, PlayIcon, StopIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';
import { askAIAboutNote, generatePodcastAudio } from '../../../services/geminiService';
import { decode, decodeAudioData } from '../../../utils/audioUtils';
import type { Note } from '../../../types';

const NotebookPage: React.FC = () => {
    const { addToast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
    
    // Editor State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Audio Overview State
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Load notes on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('smartNotes');
        if (savedNotes) {
            const parsed = JSON.parse(savedNotes);
            setNotes(parsed);
            if (parsed.length > 0) {
                setActiveNoteId(parsed[0].id);
            }
        } else {
            const welcomeNote: Note = {
                id: 'welcome',
                title: 'Welcome to your Smart Notebook 📝',
                content: 'This is where you can jot down ideas, lecture notes, or draft essays.\n\nThe AI Assistant on the right can see what you write here. Try asking it to:\n- Summarize this note\n- Create a quiz based on this\n- Explain a complex term mentioned here\n\nNew Feature: Click "Generate Audio Overview" to hear a podcast-style summary of your notes!',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            setNotes([welcomeNote]);
            setActiveNoteId('welcome');
        }
    }, []);

    // Sync active note details when selection changes
    useEffect(() => {
        if (activeNoteId) {
            const note = notes.find(n => n.id === activeNoteId);
            if (note) {
                setTitle(note.title);
                setContent(note.content);
                setChatMessages([{ role: 'model', text: 'I\'m ready! Ask me anything about this note.' }]);
                stopAudio(); // Stop any playing audio when switching notes
            }
        }
    }, [activeNoteId, notes]);

    // Save notes to local storage
    useEffect(() => {
        localStorage.setItem('smartNotes', JSON.stringify(notes));
    }, [notes]);

    // Scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Cleanup Audio Context
    useEffect(() => {
        return () => {
            stopAudio();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const handleCreateNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
    };

    const handleDeleteNote = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Delete this note?')) {
            const updatedNotes = notes.filter(n => n.id !== id);
            setNotes(updatedNotes);
            if (activeNoteId === id) {
                setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
            }
            addToast('Note deleted.', 'info');
        }
    };

    const handleSave = () => {
        if (!activeNoteId) return;
        setNotes(prev => prev.map(n => 
            n.id === activeNoteId 
            ? { ...n, title, content, updatedAt: Date.now() } 
            : n
        ));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSave();
        }, 500);
        return () => clearTimeout(timer);
    }, [title, content]);

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isAiLoading) return;

        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsAiLoading(true);

        try {
            const response = await askAIAboutNote(content, userMsg, chatMessages);
            setChatMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            addToast('AI failed to respond. Please try again.', 'error');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleQuickAction = (prompt: string) => {
        setChatInput(prompt);
        const userMsg = prompt;
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsAiLoading(true);
        askAIAboutNote(content, userMsg, chatMessages)
            .then(res => setChatMessages(prev => [...prev, { role: 'model', text: res }]))
            .catch(() => addToast('AI failed.', 'error'))
            .finally(() => setIsAiLoading(false));
    };

    // --- Audio Overview Logic ---
    const playAudio = async (base64Audio: string) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => setIsPlayingAudio(false);
            
            source.start(0);
            setAudioSource(source);
            setIsPlayingAudio(true);
        } catch (error) {
            console.error("Audio playback error:", error);
            addToast("Failed to play audio.", 'error');
        }
    };

    const stopAudio = () => {
        if (audioSource) {
            try {
                audioSource.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            setAudioSource(null);
        }
        setIsPlayingAudio(false);
    };

    const handleGenerateAudioOverview = async () => {
        if (!content.trim()) {
            addToast("Write some notes first!", "info");
            return;
        }
        
        stopAudio();
        setIsGeneratingAudio(true);
        addToast("Generating podcast overview... this may take a moment.", "info");

        try {
            const base64 = await generatePodcastAudio(content);
            playAudio(base64);
            addToast("Audio overview ready!", "success");
        } catch (error) {
            addToast("Failed to generate audio overview.", "error");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const toggleAudioPlayback = () => {
        if (isPlayingAudio) {
            stopAudio();
        } else {
            // Re-generation needed if we don't cache the blob. 
            // For simplicity in this demo, the button triggers generation/play.
            // If the user wants to replay, they click generate again or we could cache `lastAudioBase64`.
            // Let's assume the button is primarily for "Generate & Play".
            // If already playing, it stops.
            handleGenerateAudioOverview();
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-[var(--background)] animate-fade-in overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
            {/* Sidebar: Note List */}
            <div className="w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                    <h2 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5 text-[var(--primary)]" />
                        Notes
                    </h2>
                    <button onClick={handleCreateNote} className="p-1.5 rounded-full hover:bg-[var(--secondary)] text-[var(--primary)]" title="New Note">
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {notes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => setActiveNoteId(note.id)}
                            className={`group p-3 rounded-lg cursor-pointer transition-all ${
                                activeNoteId === note.id 
                                ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/20' 
                                : 'hover:bg-[var(--secondary)]/50 border border-transparent'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`font-semibold text-sm truncate ${activeNoteId === note.id ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                                    {note.title || 'Untitled'}
                                </h3>
                                <button 
                                    onClick={(e) => handleDeleteNote(e, note.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xs text-[var(--muted)] mt-1 truncate">
                                {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Editor */}
            <div className="flex-1 flex flex-col bg-[var(--background)] relative">
                {activeNoteId ? (
                    <>
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card)]">
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Note Title"
                                className="text-2xl font-bold bg-transparent border-none focus:outline-none text-[var(--foreground)] placeholder-[var(--muted)] w-full"
                            />
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-[var(--muted)] px-3 py-1 bg-[var(--secondary)]/30 rounded-full">
                                    {content.length} chars
                                </div>
                                <button 
                                    onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                                    className={`p-2 rounded-lg transition-colors ${isAiPanelOpen ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:bg-[var(--secondary)]'}`}
                                    title="Toggle AI Notebook Guide"
                                >
                                    <AdjustmentsIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start typing your notes here..."
                            className="flex-1 w-full p-8 bg-[var(--background)] border-none focus:ring-0 resize-none text-lg text-[var(--foreground)] placeholder-[var(--muted)] leading-relaxed font-sans"
                        />
                        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center gap-4">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase">Sources</span>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--muted)] flex items-center gap-2 cursor-not-allowed" title="Coming Soon">
                                    <span>📄 PDF</span>
                                </div>
                                <div className="px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--muted)] flex items-center gap-2 cursor-not-allowed" title="Coming Soon">
                                    <span>🌐 Web Link</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted)]">
                        <PencilIcon className="h-16 w-16 mb-4 opacity-20" />
                        <p>Select a note or create a new one.</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar: AI Assistant (NotebookLM Style) */}
            {isAiPanelOpen && activeNoteId && (
                <div className="w-80 bg-[var(--card)] border-l border-[var(--border)] flex flex-col flex-shrink-0 transition-all duration-300">
                    {/* Audio Overview Card */}
                    <div className="p-4 border-b border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5">
                        <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2 mb-3">
                            <SparklesIcon className="h-5 w-5 text-[var(--primary)]" />
                            Audio Overview
                        </h3>
                        <div className="bg-[var(--background)] rounded-xl p-3 border border-[var(--border)] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-[var(--foreground)]">Deep Dive</p>
                                    <p className="text-xs text-[var(--muted)]">Two hosts summarize your notes.</p>
                                </div>
                                <button
                                    onClick={isPlayingAudio ? stopAudio : handleGenerateAudioOverview}
                                    disabled={isGeneratingAudio}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                        isPlayingAudio 
                                        ? 'bg-[var(--foreground)] text-[var(--background)] animate-pulse' 
                                        : 'bg-[var(--primary)] text-white hover:opacity-90'
                                    } ${isGeneratingAudio ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    {isGeneratingAudio ? (
                                        <SpinnerIcon className="h-5 w-5" />
                                    ) : isPlayingAudio ? (
                                        <StopIcon className="h-5 w-5" />
                                    ) : (
                                        <PlayIcon className="h-5 w-5 ml-0.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider text-center mb-2">Chat with your notes</p>
                        {chatMessages.length === 0 && (
                            <div className="text-center text-[var(--muted)] text-sm py-4">
                                Ask questions, request summaries, or get quiz ideas based on your note content.
                            </div>
                        )}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-[var(--primary)] text-white rounded-br-none' 
                                    : 'bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-none'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isAiLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--secondary)] p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                                    <SpinnerIcon className="h-4 w-4 text-[var(--primary)]" />
                                    <span className="text-xs text-[var(--muted)]">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-[var(--border)] space-y-3 bg-[var(--background)]">
                        {/* Quick Actions */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['Summarize', 'Quiz Me', 'Explain Concepts'].map(action => (
                                <button
                                    key={action}
                                    onClick={() => handleQuickAction(action)}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--card)] hover:bg-[var(--primary)]/10 text-[var(--foreground)] border border-[var(--border)] transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleAiSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about this note..."
                                disabled={isAiLoading}
                                className="flex-1 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none text-sm transition"
                            />
                            <button 
                                type="submit"
                                disabled={isAiLoading || !chatInput.trim()}
                                className="p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                            >
                                <ChatAltIcon className="h-5 w-5 transform rotate-90" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotebookPage;
