import React, { useState } from 'react';
import type { AnonymousPost } from '../../../types';
import { ChatBubbleLeftEllipsisIcon } from '../Icons';

interface AnonymousChatSectionProps {
  posts: AnonymousPost[];
  onPost: (content: string) => void;
}

const AnonymousChatSection: React.FC<AnonymousChatSectionProps> = ({ posts, onPost }) => {
  const [newPostContent, setNewPostContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      onPost(newPostContent.trim());
      setNewPostContent('');
    }
  };

  return (
    <div className="bento-card flex flex-col h-full">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <ChatBubbleLeftEllipsisIcon className="h-7 w-7 text-[var(--accent)]" />
        Safe Space: Anonymous Chat
      </h2>
      <p className="text-sm text-[var(--muted)] mb-4">
        Share your thoughts or ask for help without revealing your identity. Posts are anonymous to other students, but visible to admins for safety.
      </p>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4 flex-shrink-0">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!newPostContent.trim()}
          className="bg-[var(--primary)] text-white font-bold py-2.5 px-6 rounded-full hover:opacity-90 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 self-end"
        >
          Post Anonymously
        </button>
      </form>

      {/* Anonymous Feed */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-[var(--secondary)]/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐼</span>
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-sm text-[var(--foreground)]">Anonymous Panda</p>
                <p className="text-xs text-[var(--muted)]">{post.timestamp}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--foreground)]">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnonymousChatSection;