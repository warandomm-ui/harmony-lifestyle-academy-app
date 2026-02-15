import React from 'react';
import { ChatAltIcon, BookOpenIcon, ClipboardListIcon, LightBulbIcon } from './Icons';

interface QuickActionsProps {
  onActionClick: (actionLabel: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    { label: "Ask Harmony", icon: <ChatAltIcon className="h-8 w-8 text-[var(--primary)]" />, bgColor: "bg-[var(--primary)]/10" },
    { label: "Keep Learning", icon: <BookOpenIcon className="h-8 w-8 text-[var(--accent)]" />, bgColor: "bg-[var(--accent)]/10" },
    { label: "Build Something", icon: <ClipboardListIcon className="h-8 w-8 text-orange-500" />, bgColor: "bg-orange-500/10" },
    { label: "Share Your Skills", icon: <LightBulbIcon className="h-8 w-8 text-pink-500" />, bgColor: "bg-pink-500/10" },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {actions.map((action, index) => (
        <button key={index} onClick={() => onActionClick(action.label)} className={`flex flex-col items-center justify-center text-center p-4 rounded-3xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${action.bgColor} border border-transparent hover:border-[var(--border)]`}>
          <div className={`mb-2`}>
            {action.icon}
          </div>
          <span className={`font-bold text-[var(--foreground)]`}>{action.label}</span>
        </button>
      ))}
    </section>
  );
};

export default QuickActions;