import React, { useState, useMemo } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { ChatAlt2Icon } from '../Icons';
import { CHAT_GROUPS } from '../../../constants';
import type { ChatGroup, ChatGroupCategory } from '../../../types';

const ChatGroupsSection: React.FC = () => {
    const { addToast } = useToast();
    const [activeCategory, setActiveCategory] = useState<'All' | ChatGroupCategory>('All');

    const categories: Array<'All' | ChatGroupCategory> = ['All', 'Student', 'Parent', 'Female Only', 'Male Only', 'Mixed Gender'];

    const filteredGroups = useMemo(() => {
        if (activeCategory === 'All') {
            return CHAT_GROUPS;
        }
        return CHAT_GROUPS.filter(group => group.category === activeCategory);
    }, [activeCategory]);

    const handleJoin = (groupName: string) => {
        addToast(`You've joined the "${groupName}" group!`, 'success');
    };

    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Chat Groups</h2>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                        ${activeCategory === category
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--secondary)]/50 text-[var(--foreground)] hover:bg-[var(--secondary)]'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => (
                        <GroupCard key={group.name} {...group} onJoin={handleJoin} />
                    ))
                ) : (
                    <p className="text-center text-[var(--muted)] py-8">No groups in this category yet.</p>
                )}
            </div>
        </div>
    );
};

interface GroupCardProps {
    name: string;
    members: string;
    category: ChatGroupCategory;
    onJoin: (name: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ name, members, onJoin }) => (
    <div className="bg-[var(--secondary)]/50 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <ChatAlt2Icon className="h-6 w-6 text-[var(--muted)] flex-shrink-0"/>
            <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{name}</p>
                <p className="text-xs text-[var(--muted)]">{members}</p>
            </div>
        </div>
        <button
            onClick={() => onJoin(name)}
            className="bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold py-1.5 px-4 rounded-full hover:bg-[var(--primary)]/30 transition whitespace-nowrap"
        >
            Join
        </button>
    </div>
);

export default ChatGroupsSection;