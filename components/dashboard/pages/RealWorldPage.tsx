
import React, { useState } from 'react';
import { PlayIcon, DocumentTextIcon, ClipboardListIcon, CheckCircleIcon, CameraIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

type Category = 'All' | 'Nature' | 'Family' | 'Creativity' | 'Lifestyle';
type ContentType = 'Video' | 'Template' | 'Challenge' | 'Guide';

interface Activity {
    id: string;
    title: string;
    category: Category;
    type: ContentType;
    duration: string;
    image: string;
}

const ACTIVITIES: Activity[] = [
    { id: '1', title: 'Backyard Biodiversity Hunt', category: 'Nature', type: 'Challenge', duration: '1 hour', image: 'https://placehold.co/400x250/4ade80/ffffff?text=Nature+Hunt' },
    { id: '2', title: 'Urban Gardening Basics', category: 'Nature', type: 'Video', duration: '10 mins', image: 'https://placehold.co/400x250/16a34a/ffffff?text=Gardening' },
    { id: '3', title: 'The Gratitude Jar', category: 'Family', type: 'Guide', duration: '20 mins', image: 'https://placehold.co/400x250/facc15/ffffff?text=Gratitude' },
    { id: '4', title: 'Sunday Cook-off', category: 'Family', type: 'Challenge', duration: '2 hours', image: 'https://placehold.co/400x250/f59e0b/ffffff?text=Cook-off' },
    { id: '5', title: 'DIY Phone Stand', category: 'Creativity', type: 'Template', duration: '30 mins', image: 'https://placehold.co/400x250/3b82f6/ffffff?text=DIY+Project' },
    { id: '6', title: 'Daily Sketch Routine', category: 'Creativity', type: 'Challenge', duration: '15 mins/day', image: 'https://placehold.co/400x250/2563eb/ffffff?text=Sketching' },
    { id: '7', title: 'Basic Car Maintenance', category: 'Lifestyle', type: 'Video', duration: '15 mins', image: 'https://placehold.co/400x250/f43f5e/ffffff?text=Car+Care' },
    { id: '8', title: 'Room Organization', category: 'Lifestyle', type: 'Template', duration: '1 hour', image: 'https://placehold.co/400x250/e11d48/ffffff?text=Clean+Room' },
];

const RealWorldPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const { addToast } = useToast();

    const filteredActivities = activeCategory === 'All' 
        ? ACTIVITIES 
        : ACTIVITIES.filter(a => a.category === activeCategory);

    const categories: Category[] = ['All', 'Nature', 'Family', 'Creativity', 'Lifestyle'];

    const handleStartActivity = (title: string, type: ContentType) => {
        addToast(`Starting ${type}: ${title}`, 'success');
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
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar animate-fade-in-up">
                {categories.map(cat => (
                    <button
                        key={cat}
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
                {filteredActivities.map(activity => (
                    <div key={activity.id} className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:shadow-xl transition-all group flex flex-col h-full">
                        <div className="relative aspect-video overflow-hidden">
                            <img src={activity.image} alt={activity.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                                {activity.type}
                            </div>
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
                            
                            <div className="mt-auto pt-4">
                                <button 
                                    onClick={() => handleStartActivity(activity.title, activity.type)}
                                    className="w-full py-2 rounded-lg bg-[var(--secondary)]/50 text-[var(--foreground)] font-bold text-sm hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    {activity.type === 'Video' && <PlayIcon className="h-4 w-4" />}
                                    {activity.type === 'Challenge' && <CheckCircleIcon className="h-4 w-4" />}
                                    {activity.type === 'Template' && <ClipboardListIcon className="h-4 w-4" />}
                                    {activity.type === 'Guide' && <DocumentTextIcon className="h-4 w-4" />}
                                    {activity.type === 'Video' ? 'Watch' : activity.type === 'Challenge' ? 'Accept Challenge' : 'Open'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RealWorldPage;
