
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { PlusIcon, PhotographIcon, MicrophoneIcon, PencilIcon, TrashIcon, LightBulbIcon, StopIcon, XIcon, SearchIcon, CheckCircleIcon } from '../Icons';

interface Idea {
    id: string;
    text: string;
    image?: string; // Used for both Image and Video data URLs
    voiceNote?: string; // Base64 audio data
    category: string;
    timestamp: number;
}

const CATEGORIES = ['Lifestyle Habits', 'Family Activities', 'Personal Growth', 'Creative Projects', 'Kids Experiments', 'Random'];

const IdeaWallPage: React.FC = () => {
    const { addToast } = useToast();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [textInput, setTextInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // Drag and Drop Refs
    const dragItem = useRef<number | null>(null);

    useEffect(() => {
        const savedIdeas = localStorage.getItem('ideaWall');
        if (savedIdeas) {
            setIdeas(JSON.parse(savedIdeas));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ideaWall', JSON.stringify(ideas));
    }, [ideas]);

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedMedia(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setRecordedAudio(reader.result as string);
                };
                reader.readAsDataURL(audioBlob);
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            addToast("Could not access microphone. Please check permissions.", "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            // Clear previous recording if exists
            setRecordedAudio(null);
            startRecording();
        }
    };

    const clearRecordedAudio = () => {
        setRecordedAudio(null);
    };

    const handleAddIdea = () => {
        if (!textInput.trim() && !selectedMedia && !recordedAudio) {
            addToast("Write something, record a note, or add an image first!", "error");
            return;
        }

        if (editingId) {
            // Update existing idea
            setIdeas(prev => prev.map(idea => idea.id === editingId ? {
                ...idea,
                text: textInput,
                image: selectedMedia || undefined,
                voiceNote: recordedAudio || undefined,
                category: selectedCategory,
            } : idea));
            addToast("Idea updated successfully!", "success");
            handleCancelEdit();
        } else {
            // Create new idea
            const newIdea: Idea = {
                id: Date.now().toString(),
                text: textInput,
                image: selectedMedia || undefined,
                voiceNote: recordedAudio || undefined,
                category: selectedCategory,
                timestamp: Date.now(),
            };

            setIdeas(prev => [newIdea, ...prev]);
            addToast("Idea added to the wall! 🚀", "success");
            
            // Reset Inputs
            setTextInput('');
            setSelectedMedia(null);
            setRecordedAudio(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTextInput('');
        setSelectedMedia(null);
        setRecordedAudio(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSelectedCategory(CATEGORIES[0]);
    };

    const startEditing = (idea: Idea) => {
        setEditingId(idea.id);
        setTextInput(idea.text);
        setSelectedCategory(idea.category);
        setSelectedMedia(idea.image || null);
        setRecordedAudio(idea.voiceNote || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteIdea = (id: string) => {
        if (window.confirm("Scrap this idea?")) {
            setIdeas(prev => prev.filter(idea => idea.id !== id));
            if (editingId === id) handleCancelEdit();
        }
    };

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (dragItem.current === null) return;
        if (dragItem.current === index) return;

        const newIdeas = [...ideas];
        const draggedIdea = newIdeas[dragItem.current];
        
        // Remove from old index
        newIdeas.splice(dragItem.current, 1);
        // Insert at new index
        newIdeas.splice(index, 0, draggedIdea);

        // Update ref to track new position
        dragItem.current = index;
        
        setIdeas(newIdeas);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        dragItem.current = null;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const getTimeString = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              idea.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeFilter === 'All' || idea.category === activeFilter;
        return matchesSearch && matchesCategory;
    });

    const isVideoMedia = (dataUrl: string) => dataUrl.startsWith('data:video');

    return (
        <div className="space-y-6 pb-12">
            {/* Weekly Reminder Banner */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white p-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in-up">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <p className="font-bold text-sm md:text-base">Your ideas are waiting. Go build something.</p>
                </div>
                <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition">Review</button>
            </div>

            {/* Header & Input Section */}
            <div className={`bento-card bg-[var(--card)] border-2 transition-colors ${editingId ? 'border-[var(--primary)] shadow-lg' : 'border-[var(--border)]'}`}>
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-[var(--foreground)] mb-2 flex items-center justify-center gap-2">
                        <LightBulbIcon className="h-8 w-8 text-yellow-500" />
                        {editingId ? 'Editing Idea' : 'Idea Wall'}
                    </h1>
                    <p className="text-[var(--muted)] text-sm md:text-base max-w-2xl mx-auto italic">
                        {editingId 
                            ? "Updating your brilliance. Don't forget to save!" 
                            : "\"Drop anything here — messy, raw, unfiltered. If the idea exists, it must go on the wall. No perfection allowed.\""
                        }
                    </p>
                </div>

                <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] shadow-inner">
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Write your raw idea here..."
                        className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-[var(--muted)] text-[var(--foreground)] resize-none min-h-[100px]"
                    />
                    
                    {/* Media Preview */}
                    {selectedMedia && (
                        <div className="relative w-full max-w-xs mb-4 group">
                            {isVideoMedia(selectedMedia) ? (
                                <video src={selectedMedia} controls className="w-full max-h-60 rounded-lg border border-[var(--border)] bg-black" />
                            ) : (
                                <img src={selectedMedia} alt="Preview" className="w-full h-full object-cover rounded-lg border border-[var(--border)]" />
                            )}
                            <button 
                                onClick={() => setSelectedMedia(null)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Audio Preview */}
                    {recordedAudio && (
                        <div className="mb-4 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] flex items-center justify-between gap-3 animate-fade-in-fast">
                            <div className="flex items-center gap-2 overflow-hidden w-full">
                                <span className="text-xl">🎤</span>
                                <audio controls src={recordedAudio} className="w-full h-8" />
                            </div>
                            <button 
                                onClick={clearRecordedAudio}
                                className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition"
                                title="Remove Voice Note"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-full hover:bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--primary)] transition"
                                title="Upload Image or Video"
                            >
                                <PhotographIcon className="h-6 w-6" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*,video/*" 
                                onChange={handleMediaUpload} 
                            />
                            
                            <button 
                                onClick={toggleRecording}
                                className={`p-2 rounded-full transition-all duration-300 relative ${
                                    isRecording 
                                    ? 'bg-red-100 text-red-600 ring-2 ring-red-500 ring-opacity-50' 
                                    : 'hover:bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--primary)]'
                                }`}
                                title={isRecording ? "Stop Recording" : "Voice Note"}
                            >
                                {isRecording ? <StopIcon className="h-6 w-6 animate-pulse" /> : <MicrophoneIcon className="h-6 w-6" />}
                            </button>
                            
                            {isRecording && <span className="text-xs font-bold text-red-500 animate-pulse">Recording...</span>}
                            
                            <div className="h-6 w-px bg-[var(--border)] mx-2 hidden sm:block"></div>

                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] border border-[var(--border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {editingId && (
                                <button 
                                    onClick={handleCancelEdit}
                                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-[var(--foreground)] font-bold py-2 px-4 rounded-full hover:opacity-90 transition"
                                >
                                    Cancel
                                </button>
                            )}
                            <button 
                                onClick={handleAddIdea}
                                disabled={isRecording}
                                className={`w-full sm:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-2 px-6 rounded-full hover:opacity-90 transition transform hover:scale-105 flex items-center justify-center gap-2 ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {editingId ? (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5" /> Update Idea
                                    </>
                                ) : (
                                    'Add to Wall 🚀'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ideas..."
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-[var(--muted)]" />
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                activeFilter === cat
                                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                                    : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ideas Grid */}
            <div className="columns-1 md:columns-2 gap-4 space-y-4">
                {filteredIdeas.map((idea, index) => (
                    <div
                        key={idea.id}
                        className="break-inside-avoid bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] hover:shadow-md transition-all group relative animate-fade-in-up"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] bg-[var(--secondary)]/30 px-2 py-1 rounded">{idea.category}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditing(idea)} className="p-1 text-[var(--muted)] hover:text-[var(--primary)]">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteIdea(idea.id)} className="p-1 text-[var(--muted)] hover:text-red-500">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {idea.image && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-[var(--border)]">
                                {isVideoMedia(idea.image) ? (
                                    <video src={idea.image} controls className="w-full" />
                                ) : (
                                    <img src={idea.image} alt="Idea attachment" className="w-full object-cover" />
                                )}
                            </div>
                        )}

                        {idea.voiceNote && (
                            <div className="mb-3">
                                <audio src={idea.voiceNote} controls className="w-full h-8" />
                            </div>
                        )}

                        <p className="text-[var(--foreground)] font-medium text-lg whitespace-pre-wrap">{idea.text}</p>
                        
                        <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--muted)]">
                            <span>{getTimeString(idea.timestamp)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredIdeas.length === 0 && (
                <div className="text-center py-10 text-[var(--muted)]">
                    <p>No ideas found. Time to brainstorm! 🧠</p>
                </div>
            )}
        </div>
    );
};

export default IdeaWallPage;
