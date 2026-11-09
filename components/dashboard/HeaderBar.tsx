import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useChat } from '../../contexts/ChatContext';
import { BellIcon, SearchIcon, ChevronDownIcon, ShoppingCartIcon } from './Icons';
import type { UserProfile } from '../../types';

interface HeaderBarProps {
  userProfile: UserProfile;
  cartItemCount?: number;
  onMobileMenuToggle?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ userProfile, cartItemCount = 0, onMobileMenuToggle }) => {
  const { addToast } = useToast();
  const { toggleChat } = useChat();
  const [showSearch, setShowSearch] = useState(false);
  return (
    <header className="flex-shrink-0 z-10 hla-dashboard-header">
      <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-8 gap-2">

        {/* Left: hamburger (mobile) + wordmark */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-full transition-colors"
            style={{ color: '#8a8a9a' }}
            aria-label="Open navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden sm:flex flex-col leading-none">
            <h1
              className="text-lg font-bold hla-gold-text"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Harmony
            </h1>
            <span
              className="text-[9px] uppercase tracking-[0.22em]"
              style={{ color: 'rgba(201,168,76,0.45)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Lifestyle Academy
            </span>
          </div>
        </div>

        {/* Center: search bar */}
        <div className="hidden sm:flex flex-1 justify-center px-2 lg:px-4">
          <div className="w-full max-w-xs md:max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4" style={{ color: '#c9a84c' }} />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-4 py-2 rounded-full leading-5 text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  color: '#f5f0e8',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)')}
                placeholder="Search anything..."
                type="search"
              />
            </div>
          </div>
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Search icon — xs only */}
          <button
            className="sm:hidden flex items-center justify-center w-11 h-11 rounded-full transition-colors"
            style={{ color: '#8a8a9a' }}
            aria-label="Search"
              onClick={() => addToast("Search feature coming soon!", "info")}
            >
              <SearchIcon className="h-5 w-5" />
          </button>

          <button
            className="relative flex items-center justify-center w-11 h-11 rounded-full transition-colors"
            style={{ color: '#8a8a9a' }}
            aria-label="Cart"
              onClick={() => addToast(cartItemCount > 0 ? "You have items in cart" : "Your cart is empty", "info")}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
            style={{ color: '#8a8a9a' }}
            aria-label="Notifications"
              onClick={() => addToast("No new notifications", "info")}
          >
            <BellIcon className="h-5 w-5" />
          </button>

          {/* Avatar with gold ring */}
          <div
              onClick={() => addToast("Profile menu coming soon!", "info")}
              className="flex items-center gap-1.5 cursor-pointer p-1 rounded-full ml-1 transition-all"
            style={{ border: '1px solid rgba(201,168,76,0.35)' }}
          >
            <img
              className="h-8 w-8 rounded-full flex-shrink-0"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=c9a84c&color=0a0a0f&bold=true`}
              alt="User profile picture"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%23c9a84c'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-size='14' font-weight='bold' fill='%230a0a0f'%3E${encodeURIComponent((userProfile.name?.[0] || '?').toUpperCase())}%3C/text%3E%3C/svg%3E`;
              }}
            />
            <ChevronDownIcon className="h-4 w-4 hidden sm:block" style={{ color: '#c9a84c' }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
