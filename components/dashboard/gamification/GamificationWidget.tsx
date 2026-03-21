import React, { useState, useEffect } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { MOCK_BADGES } from '../../../constants';
import { ProgressBar } from '../shared/ProgressBar';

const GamificationWidget: React.FC = () => {
  const { profile } = useGamification();
  const { level, points, xpInLevel, xpForNextLevel, badges: earnedBadgeIds } = profile;

  const progressPercentage = (xpInLevel / xpForNextLevel) * 100;

  const recentBadges = MOCK_BADGES
    .filter(badge => earnedBadgeIds.includes(badge.id))
    .slice(0, 3);

  
  // Streak tracking with localStorage
  const [streak, setStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState('');
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedStreak = parseInt(localStorage.getItem('hla_streak') || '0');
    const savedDate = localStorage.getItem('hla_last_login') || '';
    
    if (savedDate === today) {
      setStreak(savedStreak);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = savedDate === yesterday ? savedStreak + 1 : 1;
      setStreak(newStreak);
      localStorage.setItem('hla_streak', String(newStreak));
      localStorage.setItem('hla_last_login', today);
    }
    setLastLoginDate(today);
  }, []);

return (
    <div className="bento-card h-full" style={{ border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 0 30px rgba(201,168,76,0.06)' }}>
      <h2
        className="text-xl font-bold mb-5 flex items-center gap-2"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f5f0e8' }}
      >
        <span style={{ color: '#c9a84c' }}>✦</span>
        Your Progress
      </h2>

      <div className="space-y-4">
        {/* Level ring card */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,201,122,0.05))',
            border: '1px solid rgba(201,168,76,0.45)',
            boxShadow: '0 0 24px rgba(201,168,76,0.12), inset 0 1px 0 rgba(232,201,122,0.15)',
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.2em] mb-1"
            style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
          >
            Level
          </p>
          <p
            className="text-5xl font-extrabold hla-gold-text"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {level}
          </p>
          <p
            className="font-semibold text-base mt-1"
            style={{ color: '#f5f0e8', fontFamily: "'DM Sans', sans-serif" }}
          >
            {points.toLocaleString()} pts
          </p>
        </div>
            {/* Streak Counter */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Login Streak</p>
                  <p className="text-2xl font-bold">{streak} hari</p>
                </div>
                <div className="text-3xl">{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '✨'}</div>
              </div>
              <p className="text-xs mt-2 opacity-80">{streak >= 7 ? 'Hebat! Konsisten!' : streak >= 3 ? 'Teruskan!' : 'Log in setiap hari!'}</p>
            </div>

        {/* XP progress bar */}
        <div>
          <ProgressBar
            label="Level Progress"
            percentage={progressPercentage}
            value={`${xpInLevel} / ${xpForNextLevel} XP`}
          />
        </div>

        {/* Recent badges */}
        <div>
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-[0.15em]"
            style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
          >
            Recent Badges
          </h3>
          <div className="flex items-center gap-4">
            {recentBadges.length > 0 ? (
              recentBadges.map(badge => (
                <div key={badge.id} className="text-center group relative">
                  <div
                    className="text-3xl p-2 rounded-full transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
                  >
                    {badge.icon}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
                    style={{ background: '#0d1b2a', border: '1px solid rgba(201,168,76,0.25)' }}
                  >
                    <p className="font-bold text-xs" style={{ color: '#e8c97a' }}>{badge.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8a8a9a' }}>{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}>
                Start learning to earn badges!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationWidget;
