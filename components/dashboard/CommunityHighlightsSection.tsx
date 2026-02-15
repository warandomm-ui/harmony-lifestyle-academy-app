import React from 'react';

// --- Post Card ---
interface PostCardProps {
    author: string;
    time: string;
    group: string;
    content: string;
    likes: number;
    comments: number;
}

const PostCard: React.FC<PostCardProps> = ({ author, time, group, content, likes, comments }) => {
    return (
        <div className="bg-[var(--secondary)] rounded-2xl p-4">
            <div>
                <p className="font-bold text-sm text-[var(--foreground)]">{author}</p>
                <p className="text-xs text-[var(--muted)]">
                    {time} in "<span className="font-semibold text-[var(--primary)]">{group}</span>"
                </p>
            </div>
            <p className="my-3 text-sm text-[var(--foreground)]">{content}</p>
            <div className="flex items-center space-x-4 text-xs text-[var(--muted)]">
                <span>❤️ {likes}</span>
                <span>💬 {comments}</span>
                <button className="font-semibold hover:underline">Share</button>
            </div>
        </div>
    );
};

// --- Event Card ---
interface EventCardProps {
    date: string;
    title: string;
    host: string;
    attendees: string;
    type: 'online' | 'physical';
}

const EventCard: React.FC<EventCardProps> = ({ date, title, host, attendees, type }) => {
    return (
        <div className="bg-[var(--secondary)] rounded-2xl p-4 flex items-start space-x-4">
            <div className="text-2xl pt-1">
                {type === 'online' ? '📅' : '🏟️'}
            </div>
            <div>
                <p className="text-xs font-bold text-[var(--primary)] uppercase">{date}</p>
                <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
                <p className="text-sm text-[var(--muted)]">{host}</p>
                <div className="flex items-center justify-between mt-3 w-full">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">{attendees}</span>
                    <button className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold py-1.5 px-3 rounded-full hover:opacity-90 transition">
                        {type === 'online' ? 'RSVP' : 'Join'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Section Component ---
const CommunityHighlightsSection: React.FC = () => {
    const posts = [
        {
            author: 'Ahmad - Form 4',
            time: '2 hours ago',
            group: 'SPM 2025 Warriors',
            content: 'Just completed my first Python game! 🎮 So hyped! This is giving me life.',
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
        }
    ];

    return (
        <div className="bento-card h-full">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Community Feed 🔥</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">What's Poppin'</h3>
                    <div className="space-y-4">
                        {posts.map((post, index) => <PostCard key={index} {...post} />)}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Upcoming Events</h3>
                    <div className="space-y-4">
                        {events.map((event, index) => <EventCard key={index} {...event} />)}
                    </div>
                     <button className="mt-4 w-full text-center font-semibold text-[var(--primary)] hover:underline">
                        View All Events
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityHighlightsSection;