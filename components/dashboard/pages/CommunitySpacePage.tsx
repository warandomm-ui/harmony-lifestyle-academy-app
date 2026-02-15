
import React, { useState } from 'react';
import { UsersIcon, ChatAlt2Icon, HeartIcon, SparklesIcon, PlusIcon, BellIcon, ChevronDownIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

type Tab = 'feed' | 'qa' | 'updates';

const CommunitySpacePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const { addToast } = useToast();

    // --- Weekly Challenge Banner ---
    const ChallengeBanner = () => (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                    <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                    <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">Weekly Challenge</p>
                    <h2 className="text-2xl font-extrabold">Harmony Hero: Digital Detox 🌿</h2>
                    <p className="text-purple-100 text-sm mt-1">Spend 1 hour screen-free today and journal about it.</p>
                </div>
            </div>
            <button 
                onClick={() => addToast('Challenge accepted! Good luck!', 'success')}
                className="bg-white text-purple-600 font-bold py-2 px-6 rounded-full hover:bg-purple-50 transition-transform transform hover:scale-105 whitespace-nowrap"
            >
                Accept Challenge
            </button>
        </div>
    );

    // --- Feed Tab ---
    const FeedTab = () => {
        const [posts, setPosts] = useState([
            { id: 1, user: 'Sarah K.', avatar: '👩‍🎨', time: '2h ago', content: 'Just finished my first Python project thanks to the Harmony course! It\'s a simple calculator but I\'m so proud. 🐍💻', likes: 24, comments: 5 },
            { id: 2, user: 'Amirul H.', avatar: '🏃‍♂️', time: '5h ago', content: 'Morning run complete! 5km in 30 mins. Who else is training for the community marathon?', likes: 45, comments: 12 },
            { id: 3, user: 'Mei Ling', avatar: '📚', time: '1d ago', content: 'Reviewing for SPM trials. The study techniques module really helped me organize my notes.', likes: 60, comments: 8 },
        ]);
        const [newPost, setNewPost] = useState('');

        const handlePost = () => {
            if (!newPost.trim()) return;
            const post = {
                id: Date.now(),
                user: 'You',
                avatar: '👤',
                time: 'Just now',
                content: newPost,
                likes: 0,
                comments: 0
            };
            setPosts([post, ...posts]);
            setNewPost('');
            addToast('Post shared to community!', 'success');
        };

        return (
            <div className="space-y-6 animate-fade-in">
                {/* Input */}
                <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center text-xl">👤</div>
                        <div className="flex-1">
                            <textarea
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Share your progress, wins, or thoughts..."
                                className="w-full bg-transparent border-none focus:ring-0 resize-none text-[var(--foreground)] placeholder-[var(--muted)]"
                                rows={2}
                            />
                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={handlePost}
                                    disabled={!newPost.trim()}
                                    className="bg-[var(--primary)] text-white px-4 py-1.5 rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/50 flex items-center justify-center text-xl border border-[var(--border)]">{post.avatar}</div>
                                <div>
                                    <p className="font-bold text-[var(--foreground)]">{post.user}</p>
                                    <p className="text-xs text-[var(--muted)]">{post.time}</p>
                                </div>
                            </div>
                            <p className="text-[var(--foreground)] mb-4 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
                                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                    <HeartIcon className="h-5 w-5" /> {post.likes}
                                </button>
                                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                    <ChatAlt2Icon className="h-5 w-5" /> {post.comments}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Q&A Tab ---
    const QaTab = () => {
        const questions = [
            { id: 1, tag: 'Parent Ask', question: "How can I motivate my teen to balance gaming and study?", answers: 12, status: 'Hot' },
            { id: 2, tag: 'Teen Ask', question: "My parents don't understand that esports is a real career path. Help?", answers: 8, status: 'New' },
            { id: 3, tag: 'General', question: "What are good universities for Graphic Design in KL?", answers: 24, status: 'Solved' },
        ];

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Recent Discussions</h3>
                    <button className="bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--primary)]/20 transition">
                        Ask a Question
                    </button>
                </div>

                <div className="space-y-4">
                    {questions.map(q => (
                        <div key={q.id} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    q.tag === 'Parent Ask' ? 'bg-orange-100 text-orange-700' : 
                                    q.tag === 'Teen Ask' ? 'bg-purple-100 text-purple-700' : 
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {q.tag}
                                </span>
                                <span className="text-xs text-[var(--muted)] font-medium">{q.status}</span>
                            </div>
                            <h4 className="font-bold text-lg text-[var(--foreground)] mb-3">{q.question}</h4>
                            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <ChatAlt2Icon className="h-4 w-4" />
                                <span>{q.answers} answers</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Updates Tab ---
    const UpdatesTab = () => {
        const updates = [
            { title: 'New Course: Mobile App Dev', date: 'Today', desc: 'Learn React Native and build your first iOS/Android app.', type: 'Content' },
            { title: 'Weekend Workshop: Public Speaking', date: 'Sat, 2 PM', desc: 'Join us live for a masterclass on confidence.', type: 'Event' },
            { title: 'Platform Update v2.1', date: 'Yesterday', desc: 'We fixed the dark mode toggle and improved speed.', type: 'System' },
        ];

        return (
            <div className="space-y-6 animate-fade-in">
                {updates.map((update, i) => (
                    <div key={i} className="flex gap-4 items-start bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)]">
                        <div className="p-3 bg-[var(--secondary)]/50 rounded-xl text-[var(--primary)]">
                            <BellIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded uppercase tracking-wide">{update.type}</span>
                                <span className="text-xs text-[var(--muted)]">{update.date}</span>
                            </div>
                            <h4 className="font-bold text-[var(--foreground)]">{update.title}</h4>
                            <p className="text-sm text-[var(--muted)] mt-1">{update.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <UsersIcon className="h-8 w-8 text-[var(--primary)]" />
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Community Space</h1>
            </div>

            <ChallengeBanner />

            {/* Tabs */}
            <div className="border-b border-[var(--border)] flex gap-6 mb-6">
                {['feed', 'qa', 'updates'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`pb-3 text-sm font-bold transition-colors relative ${
                            activeTab === tab 
                            ? 'text-[var(--primary)]' 
                            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        {tab === 'feed' && 'Community Feed'}
                        {tab === 'qa' && 'Parents & Teens Q&A'}
                        {tab === 'updates' && 'Harmony Updates'}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'feed' && <FeedTab />}
                {activeTab === 'qa' && <QaTab />}
                {activeTab === 'updates' && <UpdatesTab />}
            </div>
        </div>
    );
};

export default CommunitySpacePage;
