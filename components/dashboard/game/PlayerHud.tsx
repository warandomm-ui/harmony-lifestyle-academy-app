import React from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { rankForLevel, starsFor } from '../../../utils/gameWorld';

interface PlayerHudProps {
  isMuslim: boolean;
  /** 'card' for the sidebar and pages, 'chip' for the header. */
  variant?: 'card' | 'chip';
  onClick?: () => void;
}

const GOLD = '#c9a84c';

/** The player's level, rank, XP towards the next level, streak and stars. */
const PlayerHud: React.FC<PlayerHudProps> = ({ isMuslim, variant = 'card', onClick }) => {
  const { profile, quests, streak } = useGamification();
  const rank = rankForLevel(profile.level, isMuslim);
  const pct = Math.min(100, Math.round((profile.xpInLevel / profile.xpForNextLevel) * 100));
  const stars = Object.values(quests).reduce((n, q) => n + starsFor(q.bestScore, q.total), 0);

  if (variant === 'chip') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 pl-1 pr-3 h-9 rounded-full transition-transform active:scale-95"
        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}
        aria-label={`Level ${profile.level}, ${profile.xpInLevel} of ${profile.xpForNextLevel} XP. Open quest map`}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold"
          style={{ background: `conic-gradient(${GOLD} ${pct}%, rgba(201,168,76,0.15) 0)`, color: '#0a0a0f' }}
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: '#0d1b2a', color: '#e8c97a' }}>
            {profile.level}
          </span>
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: '#e8c97a' }}>🔥 {streak}</span>
        <span className="hidden sm:inline text-xs font-bold tabular-nums" style={{ color: '#e8c97a' }}>⭐ {stars}</span>
      </button>
    );
  }

  const Tag: any = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className="w-full text-left rounded-2xl p-3 transition-colors"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(13,27,42,0.6))',
        border: '1px solid rgba(201,168,76,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl"
          style={{ background: 'rgba(10,10,15,0.6)', border: `1px solid ${GOLD}` }}
        >
          <span className="text-[8px] uppercase tracking-widest leading-none" style={{ color: '#8a8a9a' }}>Lv</span>
          <span className="text-lg font-extrabold leading-none hla-gold-text">{profile.level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: '#f5f0e8' }}>
            {rank.emoji} {rank.title}
          </p>
          <div
            className="h-1.5 rounded-full mt-1.5 overflow-hidden"
            style={{ background: 'rgba(201,168,76,0.15)' }}
            role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="XP to next level"
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c97a)' }} />
          </div>
          <p className="text-[10px] mt-1 tabular-nums" style={{ color: '#8a8a9a' }}>
            {profile.xpInLevel} / {profile.xpForNextLevel} XP
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs font-semibold tabular-nums" style={{ color: '#e8c97a' }}>
        <span title="Day streak">🔥 {streak} {isMuslim ? 'hari' : streak === 1 ? 'day' : 'days'}</span>
        <span title="Stars earned">⭐ {stars}</span>
        <span title="Total XP">✦ {profile.points.toLocaleString()} XP</span>
      </div>
    </Tag>
  );
};

export default PlayerHud;
