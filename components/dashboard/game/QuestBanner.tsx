import React, { useEffect, useMemo, useState } from 'react';
import type { WellnessModuleContent } from '../../../types';
import { getAllModules } from '../../../services/moduleContentService';
import { useGamification } from '../../../contexts/GamificationContext';
import { nextQuests, todaysQuest } from './QuestMapPage';

interface QuestBannerProps {
  isMuslim: boolean;
  onOpenQuestMap: () => void;
}

/** Home-page shortcut into the game: today's quest and overall progress. */
const QuestBanner: React.FC<QuestBannerProps> = ({ isMuslim, onOpenQuestMap }) => {
  const { quests, profile } = useGamification();
  const [modules, setModules] = useState<WellnessModuleContent[]>([]);

  useEffect(() => {
    let alive = true;
    getAllModules().then((m) => { if (alive) setModules(m); });
    return () => { alive = false; };
  }, []);

  const today = useMemo(() => todaysQuest(nextQuests(modules, quests, isMuslim)), [modules, quests, isMuslim]);
  const accent = today?.world.accent ?? '#c9a84c';

  return (
    <button
      onClick={onOpenQuestMap}
      className="w-full flex items-center gap-4 text-left rounded-2xl p-4 sm:p-5 transition-transform hover:scale-[1.005] active:scale-[0.995]"
      style={{ background: `linear-gradient(135deg, ${accent}2e, rgba(13,27,42,0.9))`, border: `1px solid ${accent}` }}
    >
      <span className="text-4xl flex-shrink-0" aria-hidden="true">🗺️</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: accent }}>
          {isMuslim ? 'Peta Misi' : 'Quest Map'} · Level {profile.level}
        </span>
        <span className="block text-lg font-bold truncate" style={{ color: '#f5f0e8' }}>
          {today
            ? `${isMuslim ? 'Misi hari ini' : "Today's quest"}: ${today.topic.icon} ${today.topic.title}`
            : (isMuslim ? 'Teroka lapan dunia pembangunan diri' : 'Explore the eight worlds of growth')}
        </span>
        {today && (
          <span className="block text-sm truncate" style={{ color: '#8a8a9a' }}>
            {today.world.emoji} {isMuslim ? today.world.name.muslim : today.world.name.universal} · ⏱ {today.topic.durationMinutes} min
          </span>
        )}
      </span>
      <span className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}>
        {isMuslim ? 'Mula' : 'Play'} →
      </span>
    </button>
  );
};

export default QuestBanner;
