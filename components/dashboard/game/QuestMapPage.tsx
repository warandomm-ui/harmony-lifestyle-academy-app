import React, { useEffect, useMemo, useState } from 'react';
import type { DashboardView, ModuleTopicContent, WellnessModuleContent } from '../../../types';
import { getAllModules } from '../../../services/moduleContentService';
import { useGamification } from '../../../contexts/GamificationContext';
import { GAME_WORLDS, isQuestComplete, worldModuleId, worldProgress, type GameWorld } from '../../../utils/gameWorld';
import PlayerHud from './PlayerHud';
import WorldQuests from './WorldQuests';

interface QuestMapPageProps {
  isMuslim: boolean;
  playerName: string;
  onNavigate: (view: DashboardView) => void;
}

interface NextQuest { world: GameWorld; module: WellnessModuleContent; topic: ModuleTopicContent; number: number }

/** The next uncleared quest of each world that still has one. */
export const nextQuests = (modules: WellnessModuleContent[], quests: Record<string, any>, isMuslim: boolean): NextQuest[] =>
  GAME_WORLDS.flatMap((world) => {
    const module = modules.find((m) => m.id === worldModuleId(world, isMuslim));
    if (!module) return [];
    const i = module.topics.findIndex((t) => !isQuestComplete(quests[t.id]));
    return i < 0 ? [] : [{ world, module, topic: module.topics[i], number: i + 1 }];
  });

/** Today's suggested quest: rotates through the worlds by date so every dimension gets attention. */
export const todaysQuest = (candidates: NextQuest[]): NextQuest | null => {
  if (candidates.length === 0) return null;
  const day = Math.floor(Date.now() / 86400000);
  return candidates[day % candidates.length];
};

const QuestMapPage: React.FC<QuestMapPageProps> = ({ isMuslim, playerName, onNavigate }) => {
  const { quests } = useGamification();
  const [modules, setModules] = useState<WellnessModuleContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWorldId, setOpenWorldId] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getAllModules().then((m) => { if (alive) { setModules(m); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const candidates = useMemo(() => nextQuests(modules, quests, isMuslim), [modules, quests, isMuslim]);
  const today = useMemo(() => todaysQuest(candidates), [candidates]);

  const totals = useMemo(() => {
    let done = 0, total = 0;
    for (const w of GAME_WORLDS) {
      const m = modules.find((x) => x.id === worldModuleId(w, isMuslim));
      if (!m) continue;
      const p = worldProgress(m.topics.map((t) => t.id), quests);
      done += p.done; total += p.total;
    }
    return { done, total };
  }, [modules, quests, isMuslim]);

  const openWorld = GAME_WORLDS.find((w) => w.id === openWorldId);
  const openModuleId = openWorld ? worldModuleId(openWorld, isMuslim) : null;

  // ── A single world ──────────────────────────────────────────────────────────
  if (openWorld && openModuleId) {
    const module = modules.find((m) => m.id === openModuleId);
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setOpenWorldId(null); setAutoStart(null); }}
          className="text-sm font-semibold px-3 py-2 rounded-lg"
          style={{ color: '#e8c97a', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          ← {isMuslim ? 'Peta Misi' : 'Quest Map'}
        </button>
        <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${openWorld.accent}26, rgba(13,27,42,0.8))`, border: `1px solid ${openWorld.accent}66` }}>
          <p className="text-4xl" aria-hidden="true">{openWorld.emoji}</p>
          <h2 className="text-2xl font-bold mt-1" style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', Georgia, serif" }}>
            {isMuslim ? openWorld.name.muslim : openWorld.name.universal}
            <span className="text-base font-normal" style={{ color: '#8a8a9a' }}> — {isMuslim ? openWorld.realm.muslim : openWorld.realm.universal}</span>
          </h2>
          {module && <p className="mt-1 text-sm" style={{ color: '#d8d3c8' }}>{module.description}</p>}
          <button
            onClick={() => onNavigate(openWorld.view)}
            className="mt-3 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ color: openWorld.accent, border: `1px solid ${openWorld.accent}` }}
          >
            {isMuslim ? 'Terokai dunia ini' : 'Explore this world'} →
          </button>
        </div>
        <WorldQuests moduleId={openModuleId} isMuslim={isMuslim} autoStartTopicId={autoStart} />
      </div>
    );
  }

  // ── The map ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* The sidebar already shows the HUD on wide screens. */}
        <div className="md:hidden">
          <PlayerHud isMuslim={isMuslim} />
        </div>
        <div className="lg:col-span-12">
          {today ? (
            <button
              onClick={() => { setAutoStart(today.topic.id); setOpenWorldId(today.world.id); }}
              className="w-full h-full text-left rounded-2xl p-4 sm:p-5 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: `linear-gradient(135deg, ${today.world.accent}33, rgba(13,27,42,0.9))`, border: `1px solid ${today.world.accent}` }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: today.world.accent }}>
                ☀️ {isMuslim ? 'Misi hari ini' : "Today's quest"}
              </p>
              <p className="text-xl font-bold mt-1" style={{ color: '#f5f0e8' }}>{today.topic.icon} {today.topic.title}</p>
              <p className="text-sm mt-1 line-clamp-2" style={{ color: '#d8d3c8' }}>{today.topic.summary}</p>
              <p className="text-xs mt-3 font-semibold" style={{ color: '#e8c97a' }}>
                {today.world.emoji} {isMuslim ? today.world.name.muslim : today.world.name.universal} · Quest {today.number} · ⏱ {today.topic.durationMinutes} min · {isMuslim ? 'Mula' : 'Play'} →
              </p>
            </button>
          ) : !loading && (
            <div className="h-full rounded-2xl p-5 flex items-center" style={{ background: 'rgba(13,27,42,0.8)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <p style={{ color: '#f5f0e8' }}>🏆 {isMuslim ? 'Semua misi selesai. Ulang mana-mana misi untuk menambah bintang.' : 'Every quest is cleared. Replay any quest to earn more stars.'}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs uppercase tracking-[0.25em] font-bold" style={{ color: '#8a8a9a' }}>{isMuslim ? 'Dunia' : 'Worlds'}</h2>
          <p className="text-xs tabular-nums" style={{ color: '#8a8a9a' }}>
            {playerName ? `${playerName} · ` : ''}{totals.done} / {totals.total} {isMuslim ? 'misi selesai' : 'quests cleared'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {GAME_WORLDS.map((w) => {
            const moduleId = worldModuleId(w, isMuslim);
            const module = modules.find((m) => m.id === moduleId);
            const p = worldProgress(module ? module.topics.map((t) => t.id) : [], quests);
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            const hasQuests = Boolean(module);
            return (
              <button
                key={w.id}
                onClick={() => (hasQuests ? (setAutoStart(null), setOpenWorldId(w.id)) : onNavigate(w.view))}
                className="relative text-left rounded-2xl p-4 transition-transform hover:-translate-y-1 active:translate-y-0"
                style={{ background: `linear-gradient(160deg, ${w.accent}22, rgba(13,27,42,0.9) 60%)`, border: `1px solid ${p.complete ? w.accent : `${w.accent}55`}` }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden="true">{w.emoji}</span>
                  {hasQuests ? (
                    <span
                      className="flex items-center justify-center w-12 h-12 rounded-full"
                      style={{ background: `conic-gradient(${w.accent} ${pct}%, rgba(255,255,255,0.08) 0)` }}
                      aria-label={`${pct}% cleared`}
                    >
                      <span className="flex items-center justify-center w-9 h-9 rounded-full text-[11px] font-bold tabular-nums" style={{ background: '#0d1b2a', color: '#f5f0e8' }}>
                        {p.complete ? '🏆' : `${pct}%`}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: w.accent, border: `1px solid ${w.accent}66` }}>{isMuslim ? 'Teroka' : 'Explore'}</span>
                  )}
                </div>
                <p className="text-lg font-bold mt-3" style={{ color: '#f5f0e8' }}>{isMuslim ? w.name.muslim : w.name.universal}</p>
                <p className="text-xs" style={{ color: w.accent }}>{isMuslim ? w.realm.muslim : w.realm.universal}</p>
                <p className="text-xs mt-3 tabular-nums" style={{ color: '#8a8a9a' }}>
                  {loading ? '…' : hasQuests ? `${p.done} / ${p.total} ${isMuslim ? 'misi' : 'quests'} · ⭐ ${p.stars} / ${p.maxStars}` : (isMuslim ? 'Misi akan datang' : 'Quests coming soon')}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestMapPage;
