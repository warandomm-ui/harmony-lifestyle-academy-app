import React, { useEffect, useState } from 'react';
import type { WellnessModuleContent } from '../../../types';
import { getModule } from '../../../services/moduleContentService';
import { useGamification } from '../../../contexts/GamificationContext';
import { isQuestComplete, isQuestUnlocked, starsFor, worldForModule, worldProgress } from '../../../utils/gameWorld';
import QuestPlayer from './QuestPlayer';

interface WorldQuestsProps {
  /** Content module whose topics are this world's quests. */
  moduleId: string;
  isMuslim: boolean;
  /** Opens this quest as soon as the world loads (used by "continue" shortcuts). */
  autoStartTopicId?: string | null;
}

/** A world's quest path: every quest in order, with locks, stars and the quest player. */
const WorldQuests: React.FC<WorldQuestsProps> = ({ moduleId, isMuslim, autoStartTopicId }) => {
  const { quests } = useGamification();
  const [module, setModule] = useState<WellnessModuleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setActiveIndex(null);
    getModule(moduleId).then((m) => {
      if (!alive) return;
      setModule(m);
      setLoading(false);
      if (m && autoStartTopicId) {
        const i = m.topics.findIndex((t) => t.id === autoStartTopicId);
        if (i >= 0) setActiveIndex(i);
      }
    });
    return () => { alive = false; };
  }, [moduleId, autoStartTopicId]);

  const world = worldForModule(moduleId);
  if (loading) {
    return <div className="rounded-2xl p-6 animate-pulse text-sm" style={{ background: 'rgba(13,27,42,0.6)', color: '#8a8a9a' }}>Loading quests…</div>;
  }
  if (!module || !world) return null;

  const accent = world.accent;
  const worldName = isMuslim ? world.name.muslim : world.name.universal;
  const topicIds = module.topics.map((t) => t.id);
  const prog = worldProgress(topicIds, quests);
  const nextIndex = topicIds.findIndex((id) => !isQuestComplete(quests[id]));
  const active = activeIndex !== null ? module.topics[activeIndex] : null;
  const hasNext = activeIndex !== null && activeIndex + 1 < module.topics.length
    && isQuestUnlocked(activeIndex + 1, topicIds, quests);

  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{ background: 'rgba(13,27,42,0.85)', border: `1px solid ${accent}55` }}
      aria-label={`${worldName} quests`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: accent }}>{world.emoji} {worldName} world</p>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#f5f0e8' }}>Quests</h2>
        </div>
        <div className="text-right text-xs font-semibold tabular-nums" style={{ color: '#e8c97a' }}>
          <p>{prog.done} / {prog.total} cleared {prog.complete && '🏆'}</p>
          <p>⭐ {prog.stars} / {prog.maxStars}</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${prog.total ? (prog.done / prog.total) * 100 : 0}%`, background: accent }} />
      </div>

      <ol className="relative space-y-3">
        {module.topics.map((t, i) => {
          const p = quests[t.id];
          const done = isQuestComplete(p);
          const unlocked = isQuestUnlocked(i, topicIds, quests);
          const isNext = i === nextIndex;
          return (
            <li key={t.id} className="relative flex items-stretch gap-3">
              {/* Path node and connector */}
              <div className="flex flex-col items-center flex-shrink-0 w-10">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-extrabold"
                  style={{
                    background: done ? accent : unlocked ? `${accent}22` : 'rgba(255,255,255,0.04)',
                    color: done ? '#0a0a0f' : unlocked ? accent : '#5a5a6a',
                    border: `2px solid ${unlocked ? accent : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isNext ? `0 0 16px ${accent}88` : 'none',
                  }}
                >
                  {done ? '✓' : unlocked ? i + 1 : '🔒'}
                </div>
                {i < module.topics.length - 1 && <div className="flex-1 w-0.5 mt-1" style={{ background: done ? accent : 'rgba(255,255,255,0.1)', minHeight: 12 }} />}
              </div>
              <button
                disabled={!unlocked}
                onClick={() => setActiveIndex(i)}
                className="flex-1 min-w-0 flex items-center gap-3 text-left rounded-xl px-4 py-3 transition-transform enabled:hover:translate-x-1 disabled:cursor-not-allowed"
                style={{
                  background: isNext ? `${accent}18` : 'rgba(10,10,15,0.5)',
                  border: `1px solid ${isNext ? accent : 'rgba(201,168,76,0.12)'}`,
                  opacity: unlocked ? 1 : 0.5,
                }}
                aria-label={`Quest ${i + 1}: ${t.title}${done ? ', cleared' : unlocked ? '' : ', locked'}`}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{t.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold truncate" style={{ color: '#f5f0e8' }}>{t.title}</span>
                  <span className="block text-xs truncate" style={{ color: '#8a8a9a' }}>
                    {unlocked ? t.summary : `Clear "${module.topics[i - 1].title}" to unlock`}
                  </span>
                </span>
                <span className="flex-shrink-0 text-right">
                  {p && p.attempts > 0
                    ? <span className="text-sm whitespace-nowrap" aria-label={`${starsFor(p.bestScore, p.total)} of 3 stars`}>
                        {[1, 2, 3].map((n) => <span key={n} style={{ opacity: n <= starsFor(p.bestScore, p.total) ? 1 : 0.2 }}>⭐</span>)}
                      </span>
                    : unlocked && <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: isNext ? accent : 'transparent', color: isNext ? '#0a0a0f' : accent, border: `1px solid ${accent}` }}>{isNext ? 'Play' : 'Open'}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {active && activeIndex !== null && (
        <QuestPlayer
          topic={active}
          questNumber={activeIndex + 1}
          world={{ id: world.id, name: worldName, emoji: world.emoji, accent, topicIds }}
          isMuslim={isMuslim}
          onNext={hasNext ? () => setActiveIndex(activeIndex + 1) : undefined}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </section>
  );
};

export default WorldQuests;
