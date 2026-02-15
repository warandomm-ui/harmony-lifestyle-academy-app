import React from 'react';
import { BellIcon, SearchIcon, ChevronDownIcon, ShoppingCartIcon } from './Icons';
import type { UserProfile } from '../../types';

interface HeaderBarProps {
  userProfile: UserProfile;
  cartItemCount?: number;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ userProfile, cartItemCount = 0 }) => {
  return (
    <header className="flex-shrink-0 bg-transparent backdrop-blur-md border border-[var(--border)] z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hidden sm:block">
                Harmony ✨
            </h1>
        </div>
        <div className="flex-1 flex justify-center px-4 lg:px-0">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[var(--muted)]" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-12 pr-4 py-2.5 border border-transparent rounded-full leading-5 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                placeholder="Search anything..."
                type="search"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="relative p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--secondary)] focus:outline-none">
            <ShoppingCartIcon className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
          <button className="p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--secondary)] focus:outline-none">
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-[var(--secondary)]">
            <img
              className="h-8 w-8 rounded-full"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=7F5AF0&color=fff&bold=true`}
              alt="User profile picture"
            />
            <ChevronDownIcon className="h-4 w-4 text-[var(--muted)]" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;