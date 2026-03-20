import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

// --- Post Card ---
interface PostCardProps {
    author: string;
    time: string;
    group: string;
    content: string;
    likes: number;
    comments: number;
}

const PostCard: React.FC<PostCardProps> = ({ author, time, group, content, likes, comments }) => (
    <div
        className="rounded-2xl p-4 transition-all"
        style={{
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.12)',
        }}
    >
        <div className="flex items-start justify-between gap-2">
            <div>
                <p className="font-semibold text-sm" style={{ color: '#f5f0e8', fontFamily: "'DM Sans', sans-serif" }}>
                    {author}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#8a8a9a' }}>
                    {time} in{' '}
                    <span className="font-semibold" style={{ color: '#c9a84c' }}>
                        "{group}"
                    </span>
                </p>
            </div>
        </div>
        <p className="my-3 text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.85)' }}>{content}</p>
        <div className="flex items-center gap-4 text-xs" style={{ color: '#8a8a9a' }}>
            <span>â¤ï¸ {likes}</span>
            <span>ð¬ {comments}</span>
            <button onClick={() => addToast('Post shared to your feed!', 'success')} className="font-semibold hover:underline transition-colors" style={{ color: 'rgba(201,168,76,0.7)' }}>
                Share
            </button>
        </div>
    </div>
);

// --- Event Card ---
interface EventCardProps {
    date: string;
    title: string;
    host: string;
    attendees: string;
    type: 'online' | 'physical';
}

const EventCard: React.FC<EventCardProps> = ({ date, title, host, attendees, type }) => (
    <div
        className="rounded-2xl p-4 flex items-start gap-4 transition-all"
        style={{
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.12)',
        }}
    >
        <div
            className="text-2xl pt-0.5 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
            {type === 'online' ? 'ð' : 'ðï¸'}
        </div>
        <div className="flex-1 min-w-0">
            <p
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: '#c9a84c', fontFamily: "'DM Sans', sans-serif" }}
            >
                {date}
            </p>
            <h4
                className="font-bold mt-0.5 text-sm"
                style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', Georgia, serif" }}
            >
                {title}
            </h4>
            <p className="text-xs mt-0.5" style={{ color: '#8a8a9a' }}>{host}</p>
            <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: '#8a8a9a' }}>{attendees}</span>
                <button
                    className="text-xs font-bold py-1.5 px-4 rounded-full transition-all hover:opacity-90"
                    style={{
                        background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
                        color: '#0a0a0f',
                        fontFamily: "'DM Sans', sans-serif",
                    }} onClick={() => addToast('You have registered for this event!', 'success')}>
                    {type === 'online' ? 'RSVP' : 'Join'}
                </button>
            </div>
        </div>
    </div>
);

// --- Main Section ---
const CommunityHighlightsSection: React.FC = () => {
  const { addToast } = useToast();
    const posts = [
        {
            author: 'Ahmad â Form 4',
            time: '2 hours ago',
            group: 'SPM 2025 Warriors',
            content: 'Just completed my first Python game! ð® So hyped! This is giving me life.',
            likes: 23,
            comments: 8,
        },
    ];

    const events = [
        {
            date: 'Tomorrow, 8:00 PM',
            title: 'Live Q&A: Acing Add Maths',
            host: 'with Cikgu Reza',
            attendees: '45 going',
            type: 'online' as const,
        },
    ];

    return (
        <div className="bento-card h-full">
            <h2
                className="text-xl font-bold mb-5 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f5f0e8' }}
            >
                <span style={{ color: '#c9a84c' }}>â¦</span>
                Community Feed
            </h2>

            <div className="space-y-6">
                <div>
                    <h3
                        className="text-xs uppercase tracking-[0.2em] mb-3 font-semibold"
                        style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
                    >
                        What's Happening
                    </h3>
                    <div className="space-y-3">
                        {posts.map((post, i) => <PostCard key={i} {...post} />)}
                    </div>
                </div>

                <div>
                    <h3
                        className="text-xs uppercase tracking-[0.2em] mb-3 font-semibold"
                        style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
                    >
                        Upcoming Events
                    </h3>
                    <div className="space-y-3">
                        {events.map((event, i) => <EventCard key={i} {...event} />)}
                    </div>
                    <button
                        className="mt-4 w-full text-center text-xs font-semibold uppercase tracking-[0.15em] py-2 transition-colors hover:opacity-80"
                        style={{ color: 'rgba(201,168,76,0.7)', fontFamily: "'DM Sans', sans-serif" }} onClick={() => addToast('Events page coming soon!', 'info')}>
                        View All Events
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityHighlightsSection;
