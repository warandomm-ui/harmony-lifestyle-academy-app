import React from 'react';

const DesktopMenuBar: React.FC = () => {
  const menuItems = ['Harmony', 'File', 'View', 'Community', 'Help'];

  return (
    <nav className="hidden md:flex items-center h-8 bg-gray-100 dark:bg-gray-900 border-b border-[var(--border)] px-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <span className="font-bold text-sm">Harmony</span>
      </div>
      <ul className="flex items-center ml-4">
        {menuItems.map(item => (
          <li key={item}>
            <button className="px-3 py-1 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] rounded-md transition-colors">
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopMenuBar;
