import React from 'react';
import { ChatAltIcon, BookOpenIcon, ClipboardListIcon, LightBulbIcon } from './Icons';

interface QuickActionsProps {
  onActionClick: (actionLabel: string) => void;
}

const ACTIONS = [
  {
    label: 'Tanya Harmony',
    subtitle: 'Rakan AI',
    icon: <ChatAltIcon className="h-7 w-7" />,
    gold: true,
  },
  {
    label: 'Sambung Belajar',
    subtitle: 'Kursus Saya',
    icon: <BookOpenIcon className="h-7 w-7" />,
    gold: false,
  },
  {
    label: 'Bina Sesuatu',
    subtitle: 'Cipta & Lancar',
    icon: <ClipboardListIcon className="h-7 w-7" />,
    gold: false,
  },
  {
    label: 'Kongsi Kemahiran',
    subtitle: 'Ajar Rakan',
    icon: <LightBulbIcon className="h-7 w-7" />,
    gold: false,
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <section>
      <h3
        className="text-xs uppercase tracking-[0.25em] mb-4 font-light"
        style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
      >
        Tindakan Pantas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onActionClick(action.label)}
            className="group flex flex-col items-center justify-center text-center p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
            style={{
              background: action.gold
                ? 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(232,201,122,0.1))'
                : 'linear-gradient(135deg, #0d1b2a, #0a0f1a)',
              border: action.gold
                ? '1px solid rgba(201,168,76,0.5)'
                : '1px solid rgba(201,168,76,0.15)',
              boxShadow: action.gold ? '0 4px 24px rgba(201,168,76,0.15)' : 'none',
            }}
            onMouseEnter={e => {
              if (!action.gold) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.35)';
            }}
            onMouseLeave={e => {
              if (!action.gold) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.15)';
            }}
          >
            <div
              className="mb-3 p-2.5 rounded-xl"
              style={{
                color: action.gold ? '#c9a84c' : 'rgba(201,168,76,0.7)',
                background: action.gold ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.06)',
              }}
            >
              {action.icon}
            </div>
            <span
              className="font-semibold text-sm leading-tight"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: action.gold ? '#e8c97a' : '#f5f0e8',
              }}
            >
              {action.label}
            </span>
            <span
              className="text-xs mt-0.5"
              style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
            >
              {action.subtitle}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
