import React from 'react';
import { DashboardView } from '../../types';

interface DesktopMenuBarProps {
  setCurrentView: (view: DashboardView) => void;
  onOpenSupport: () => void;
}

const DesktopMenuBar: React.FC<DesktopMenuBarProps> = ({ setCurrentView, onOpenSupport }) => {
  const menuItems: { label: string; action: () => void }[] = [
    { label: 'Harmony', action: () => setCurrentView('dashboard') },
    { label: 'File', action: () => setCurrentView('notebook') },
    { label: 'View', action: () => setCurrentView('student-dashboard') },
    { label: 'Community', action: () => setCurrentView('community-space') },
    { label: 'Help', action: onOpenSupport },
  ];

  return (
    <nav
      className="hidden md:flex items-center h-8 px-4 flex-shrink-0"
      style={{
        background: 'rgba(7,11,18,0.98)',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#c9a84c' }}>✦</span>
        <span
          className="font-bold text-sm"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#c9a84c' }}
        >
          Harmony
        </span>
      </div>
      <ul className="flex items-center ml-4">
        {menuItems.map(item => (
          <li key={item.label}>
            <button
              onClick={item.action}
              className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f5f0e8';
                (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#8a8a9a';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopMenuBar;
