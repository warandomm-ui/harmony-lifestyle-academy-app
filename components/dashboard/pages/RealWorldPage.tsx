import React, { useEffect, useState } from 'react';
import { PlayIcon, DocumentTextIcon, ClipboardListIcon, CheckCircleIcon, CameraIcon, XIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { storage } from '../../../utils/storageUtils';

type Category = 'All' | 'Nature' | 'Family' | 'Creativity' | 'Lifestyle';
type ContentType = 'Video' | 'Template' | 'Challenge' | 'Guide';
type ActivityStatus = 'started' | 'completed';

interface Activity {
    id: string;
    title: string;
    category: Category;
    type: ContentType;
    duration: string;
    emoji: string;
    /** Tailwind gradient classes for the cover tile (built-in, no external image host). */
    cover: string;
    summary: string;
    steps: string[];
}

// Content lives in the app so every card opens something useful, works offline,
// and doesn't depend on a third-party placeholder-image service.
const ACTIVITIES: Activity[] = [
    {
        id: '1', title: 'Backyard Biodiversity Hunt', category: 'Nature', type: 'Challenge', duration: '1 hour', emoji: '🐞',
        cover: 'from-green-400 to-emerald-600',
        summary: 'Find and record as many different living things as you can in one small outdoor area.',
        steps: [
            'Pick a spot about 2m × 2m — a garden corner, park patch or school field.',
            'Spend 20 minutes looking closely: under leaves, on bark, in the grass.',
            'Snap a photo or sketch each different plant, insect or bird you spot.',
            'Count your species. Can you find 10? Share your best find in Community Space.',
        ],
    },
    {
        id: '2', title: 'Urban Gardening Basics', category: 'Nature', type: 'Video', duration: '10 mins', emoji: '🌱',
        cover: 'from-emerald-500 to-green-700',
        summary: 'Grow your first herb or vegetable in a small container — even in a flat or on a windowsill.',
        steps: [
            'Choose an easy plant: daun bawang, kangkung, cili or basil.',
            'Use any container with drainage holes and fill it with potting soil.',
            'Plant the seeds or cuttings, water gently, and place it where it gets 4–6 hours of sun.',
            'Water when the top of the soil feels dry. Track growth weekly with a photo.',
        ],
    },
    {
        id: '3', title: 'The Gratitude Jar', category: 'Family', type: 'Guide', duration: '20 mins', emoji: '🫙',
        cover: 'from-amber-300 to-yellow-500',
        summary: 'Build a family habit of noticing the good things, one small note at a time.',
        steps: [
            'Find an empty jar and decorate it together with your family.',
            'Cut small strips of paper and leave them next to the jar with a pen.',
            'Every day, each person writes one thing they are grateful for and drops it in.',
            'At the end of the month, open the jar together and read the notes aloud.',
        ],
    },
    {
        id: '4', title: 'Sunday Cook-off', category: 'Family', type: 'Challenge', duration: '2 hours', emoji: '🍳',
        cover: 'from-orange-400 to-amber-600',
        summary: 'Plan, cook and serve one simple dish for your family — with an adult nearby for safety.',
        steps: [
            'Choose a simple recipe together (e.g. nasi goreng, pancakes, or a salad).',
            'Write the shopping list and check what is already in the kitchen.',
            'Cook with an adult nearby — always take care with knives, hot oil and the stove.',
            'Serve it, ask everyone for one compliment and one tip, then clean up together.',
        ],
    },
    {
        id: '5', title: 'DIY Phone Stand', category: 'Creativity', type: 'Template', duration: '30 mins', emoji: '📱',
        cover: 'from-sky-400 to-blue-600',
        summary: 'Make a sturdy phone stand from cardboard you already have at home.',
        steps: [
            'Cut a piece of thick cardboard about 20cm × 10cm.',
            'Fold it into a triangle with a 6cm base and tape the edges.',
            'Cut a small slot 2cm from the front edge for the phone to rest in.',
            'Decorate it, test it with your phone, and adjust the angle if it tips.',
        ],
    },
    {
        id: '6', title: 'Daily Sketch Routine', category: 'Creativity', type: 'Challenge', duration: '15 mins/day', emoji: '✏️',
        cover: 'from-indigo-400 to-blue-700',
        summary: 'Sketch one everyday object each day for 7 days and watch your drawing improve.',
        steps: [
            'Set a 15-minute timer at the same time each day.',
            'Pick one object in front of you — a cup, shoe or plant.',
            'Draw only what you see, not what you think it looks like. No erasing!',
            'On day 7, compare your first and last sketches.',
        ],
    },
    {
        id: '7', title: 'Basic Car Maintenance', category: 'Lifestyle', type: 'Video', duration: '15 mins', emoji: '🚗',
        cover: 'from-rose-400 to-red-600',
        summary: 'Learn the 4 quick checks every driver should know — do them with a parent or guardian.',
        steps: [
            'Tyre pressure: check it against the sticker on the driver\'s door frame.',
            'Engine oil: with the engine cold, pull the dipstick, wipe, re-insert and read the level.',
            'Coolant and wiper fluid: check the levels on the side of each reservoir.',
            'Lights: ask someone to stand outside while you test the headlights, brake lights and signals.',
        ],
    },
    {
        id: '8', title: 'Room Organization', category: 'Lifestyle', type: 'Template', duration: '1 hour', emoji: '🧺',
        cover: 'from-pink-400 to-rose-600',
        summary: 'Reset your room with a simple 4-box method, then keep it tidy in 5 minutes a day.',
        steps: [
            'Label 4 boxes or piles: Keep, Donate, Recycle, Relocate.',
            'Work one area at a time — desk, wardrobe, under the bed.',
            'Give every "Keep" item a home. If it has no home, it goes in another box.',
            'Finish with a 5-minute daily reset before bed.',
        ],
    },
];

const ACTION_LABEL: Record<ContentType, string> = {
    Video: 'Watch',
    Challenge: 'Accept Challenge',
    Template: 'Open',
    Guide: 'Open',
};

const TypeIcon: React.FC<{ type: ContentType }> = ({ type }) => {
    if (type === 'Video') return <PlayIcon className="h-4 w-4" />;
    if (type === 'Challenge') return <CheckCircleIcon className="h-4 w-4" />;
    if (type === 'Template') return <ClipboardListIcon className="h-4 w-4" />;
    return <DocumentTextIcon className="h-4 w-4" />;
};

const RealWorldPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [openActivity, setOpenActivity] = useState<Activity | null>(null);
    const { addToast } = useToast();
    const { user } = useAuth();
    const storageKey = `real_world_progress_${user?.id ?? 'guest'}`;
    const [progress, setProgress] = useState<Record<string, ActivityStatus>>(() => storage.get(storageKey) || {});

    useEffect(() => {
        storage.set(storageKey, progress);
    }, [progress, storageKey]);

    // Close the detail panel with the Escape key
    useEffect(() => {
        if (!openActivity) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenActivity(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [openActivity]);

    const filteredActivities = activeCategory === 'All'
        ? ACTIVITIES
        : ACTIVITIES.filter(a => a.category === activeCategory);

    const categories: Category[] = ['All', 'Nature', 'Family', 'Creativity', 'Lifestyle'];
    const completedCount = Object.values(progress).filter(s => s === 'completed').length;

    const handleOpen = (activity: Activity) => {
        setOpenActivity(activity);
        if (!progress[activity.id]) {
            setProgress(prev => ({ ...prev, [activity.id]: 'started' }));
            if (activity.type === 'Challenge') addToast(`Challenge accepted: ${activity.title}. You've got this!`, 'success');
        }
    };

    const handleComplete = (activity: Activity) => {
        setProgress(prev => ({ ...prev, [activity.id]: 'completed' }));
        setOpenActivity(null);
        addToast(`Well done! "${activity.title}" marked as completed. 🎉`, 'success');
    };

    const handleReset = (activity: Activity) => {
        setProgress(prev => {
            const next = { ...prev };
            delete next[activity.id];
            return next;
        });
    };

    const buttonLabel = (activity: Activity) => {
        const status = progress[activity.id];
        if (status === 'completed') return 'Completed — view again';
        if (status === 'started') return 'Continue';
        return ACTION_LABEL[activity.type];
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <CameraIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold">Real-World Lab</h1>
                </div>
                <p className="text-emerald-100 text-lg max-w-2xl">
                    Step away from the screen. Learn hands-on skills, connect with nature, and build real-life creativity.
                </p>
                <p className="mt-4 text-sm font-bold text-white/90">
                    {completedCount} of {ACTIVITIES.length} activities completed
                </p>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar animate-fade-in-up">
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        aria-pressed={activeCategory === cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                            activeCategory === cat
                                ? 'bg-[var(--primary)] text-white shadow-md transform scale-105'
                                : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                {filteredActivities.map(activity => {
                    const status = progress[activity.id];
                    return (
                        <div key={activity.id} className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${activity.cover} flex items-center justify-center`}>
                                <span className="text-6xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110" aria-hidden="true">{activity.emoji}</span>
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                                    {activity.type}
                                </div>
                                {status && (
                                    <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-md ${status === 'completed' ? 'bg-green-600 text-white' : 'bg-white/90 text-gray-900'}`}>
                                        {status === 'completed' ? '✓ Completed' : 'In progress'}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">{activity.category}</span>
                                    <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                        ⏱️ {activity.duration}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                    {activity.title}
                                </h3>
                                <p className="text-sm text-[var(--muted)] line-clamp-2">{activity.summary}</p>

                                <div className="mt-auto pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleOpen(activity)}
                                        className="w-full py-2 rounded-lg bg-[var(--secondary)]/50 text-[var(--foreground)] font-bold text-sm hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <TypeIcon type={activity.type} />
                                        {buttonLabel(activity)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Activity detail panel */}
            {openActivity && (
                <div
                    className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={() => setOpenActivity(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="activity-title"
                        className="bg-[var(--card)] w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[var(--border)] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`relative h-32 bg-gradient-to-br ${openActivity.cover} flex items-center justify-center`}>
                            <span className="text-6xl" aria-hidden="true">{openActivity.emoji}</span>
                            <button
                                type="button"
                                onClick={() => setOpenActivity(null)}
                                aria-label="Close"
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold uppercase tracking-wider text-[var(--primary)]">{openActivity.category} · {openActivity.type}</span>
                                <span className="text-[var(--muted)]">⏱️ {openActivity.duration}</span>
                            </div>
                            <h2 id="activity-title" className="text-2xl font-extrabold text-[var(--foreground)]">{openActivity.title}</h2>
                            <p className="text-[var(--muted)]">{openActivity.summary}</p>
                            <ol className="space-y-3">
                                {openActivity.steps.map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                                        <span className="text-[var(--foreground)] text-sm leading-relaxed pt-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                {progress[openActivity.id] === 'completed' ? (
                                    <button
                                        type="button"
                                        onClick={() => handleReset(openActivity)}
                                        className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-bold hover:bg-[var(--secondary)]/50"
                                    >
                                        Do it again
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleComplete(openActivity)}
                                        className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleIcon className="h-5 w-5" /> Mark as completed
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setOpenActivity(null)}
                                    className="flex-1 py-3 rounded-xl bg-[var(--secondary)]/50 text-[var(--foreground)] font-bold hover:bg-[var(--secondary)]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealWorldPage;
