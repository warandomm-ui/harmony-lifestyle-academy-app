import React, { useEffect, useMemo, useState } from 'react';
import type { ModuleTopicContent } from '../../../types';
import { useGamification, type QuizOutcome } from '../../../contexts/GamificationContext';
import { XP, isPass, starsFor } from '../../../utils/gameWorld';

interface QuestPlayerProps {
  topic: ModuleTopicContent;
  /** Number of this quest within its world, starting at 1. */
  questNumber: number;
  world: { id: string; name: string; emoji: string; accent: string; topicIds: string[] };
  /** Shows Quran and hadith perspectives; only for learners who selected Islam. */
  isMuslim: boolean;
  /** The next quest in the world, if there is one. */
  onNext?: () => void;
  onClose: () => void;
}

type Stage = 'briefing' | 'learn' | 'challenge' | 'results' | 'reflect';
const STAGES: { id: Stage; label: string; emoji: string }[] = [
  { id: 'briefing', label: 'Briefing', emoji: '📜' },
  { id: 'learn', label: 'Learn', emoji: '📖' },
  { id: 'challenge', label: 'Challenge', emoji: '⚔️' },
  { id: 'reflect', label: 'Reflect', emoji: '🪞' },
];

const reflectionKey = (topicId: string) => `hla_reflection_${topicId}`;

const Stars: React.FC<{ count: number; size?: string }> = ({ count, size = 'text-3xl' }) => (
  <div className={`flex items-center justify-center gap-1 ${size}`} role="img" aria-label={`${count} of 3 stars`}>
    {[1, 2, 3].map((n) => (
      <span key={n} style={{ opacity: n <= count ? 1 : 0.2, filter: n <= count ? 'drop-shadow(0 0 8px rgba(232,201,122,0.6))' : 'grayscale(1)' }}>⭐</span>
    ))}
  </div>
);

const Panel: React.FC<{ title: string; children: React.ReactNode; accent?: string }> = ({ title, children, accent = 'rgba(201,168,76,0.2)' }) => (
  <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(13,27,42,0.7)', border: `1px solid ${accent}` }}>
    <h3 className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: '#c9a84c' }}>{title}</h3>
    {children}
  </section>
);

const body = { color: '#d8d3c8', lineHeight: 1.7 } as const;

const QuestPlayer: React.FC<QuestPlayerProps> = ({ topic, questNumber, world, isMuslim, onNext, onClose }) => {
  const { quests, completeLesson, submitQuiz, completeReflection } = useGamification();
  const progress = quests[topic.id];

  const [stage, setStage] = useState<Stage>('briefing');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // A new quest starts from its briefing.
  useEffect(() => {
    setStage('briefing');
    setQIndex(0); setSelected(null); setChecked(false); setScore(0); setOutcome(null);
    setReflectionSaved(false);
    try { setReflection(localStorage.getItem(reflectionKey(topic.id)) ?? ''); } catch { setReflection(''); }
  }, [topic.id]);

  // Close on Escape, and keep the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const total = topic.quiz.length;
  const question = topic.quiz[qIndex];
  const paragraphs = useMemo(() => topic.lesson.explanation.split('\n\n'), [topic.lesson.explanation]);
  const sources = topic.lesson.sources ?? [];
  const maxXp = XP.lesson + total * XP.perCorrectAnswer + topic.xpReward + XP.reflection;

  const startChallenge = () => {
    setQIndex(0); setSelected(null); setChecked(false); setScore(0); setOutcome(null);
    setStage('challenge');
  };

  const finishLesson = () => {
    completeLesson(topic.id, topic.title);
    startChallenge();
  };

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === question.correctIndex) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (qIndex + 1 < total) {
      setQIndex(qIndex + 1); setSelected(null); setChecked(false);
      return;
    }
    setOutcome(submitQuiz(topic.id, topic.title, score, total, topic.xpReward, world));
    setStage('results');
  };

  const saveReflection = () => {
    if (!reflection.trim()) return;
    try { localStorage.setItem(reflectionKey(topic.id), reflection); } catch { /* kept for this session only */ }
    completeReflection(topic.id, topic.title);
    setReflectionSaved(true);
  };

  const stageIndex = STAGES.findIndex((s) => s.id === (stage === 'results' ? 'challenge' : stage));
  const primaryBtn = 'w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed';
  const primaryStyle = { background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f', boxShadow: '0 4px 20px rgba(201,168,76,0.25)' };
  const ghostStyle = { background: 'transparent', color: '#e8c97a', border: '1px solid rgba(201,168,76,0.35)' };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: '#0a0a0f' }} role="dialog" aria-modal="true" aria-label={`Quest: ${topic.title}`}>
      {/* Top bar */}
      <header className="flex-shrink-0 px-3 sm:px-6 py-3" style={{ borderBottom: `1px solid ${world.accent}55`, background: '#0d1b2a' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={onClose} aria-label="Leave quest" className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0" style={{ color: '#8a8a9a', border: '1px solid rgba(201,168,76,0.2)' }}>✕</button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] truncate" style={{ color: world.accent }}>
              {world.emoji} {world.name} · Quest {questNumber}
            </p>
            <h2 className="text-base sm:text-lg font-bold truncate" style={{ color: '#f5f0e8' }}>{topic.icon} {topic.title}</h2>
          </div>
          {progress && <Stars count={starsFor(progress.bestScore, progress.total)} size="text-sm" />}
        </div>
        {/* Stage track */}
        <ol className="max-w-3xl mx-auto flex items-center gap-1 mt-3">
          {STAGES.map((s, i) => (
            <li key={s.id} className="flex-1">
              <div className="h-1.5 rounded-full" style={{ background: i <= stageIndex ? world.accent : 'rgba(255,255,255,0.08)' }} />
              <p className="text-[10px] mt-1 text-center" style={{ color: i === stageIndex ? '#f5f0e8' : '#8a8a9a', fontWeight: i === stageIndex ? 700 : 400 }}>
                <span aria-hidden="true">{s.emoji} </span>{s.label}
              </p>
            </li>
          ))}
        </ol>
      </header>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5">
        <div className="max-w-3xl mx-auto space-y-4">

          {stage === 'briefing' && (
            <>
              <Panel title="Mission">
                <p style={body}>{topic.summary}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#e8c97a' }}>⏱ {topic.durationMinutes} min</span>
                  <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#e8c97a' }}>✦ up to {maxXp} XP</span>
                  <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#e8c97a' }}>⚔️ {total} questions</span>
                </div>
              </Panel>
              <Panel title="Objectives">
                <ul className="space-y-2">
                  {topic.objectives.map((o, i) => (
                    <li key={i} className="flex gap-2" style={body}><span style={{ color: world.accent }}>◆</span><span>{o}</span></li>
                  ))}
                </ul>
              </Panel>
              <div className="flex justify-end">
                <button className={primaryBtn} style={primaryStyle} onClick={() => setStage('learn')}>Begin quest →</button>
              </div>
            </>
          )}

          {stage === 'learn' && (
            <>
              <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', Georgia, serif" }}>{topic.lesson.title}</h3>
              <div className="space-y-3">
                {paragraphs.map((p, i) => <p key={i} style={body}>{p}</p>)}
              </div>
              <Panel title="Key points">
                <ul className="space-y-2">
                  {topic.lesson.keyPoints.map((k, i) => (
                    <li key={i} className="flex gap-2" style={body}><span style={{ color: world.accent }}>✓</span><span>{k}</span></li>
                  ))}
                </ul>
              </Panel>
              {topic.lesson.examples.map((ex, i) => (
                <Panel key={i} title={`Example ${i + 1}: ${ex.title}`}>
                  <p style={body}>{ex.scenario}</p>
                  <p className="mt-2 pl-3" style={{ ...body, borderLeft: `2px solid ${world.accent}`, color: '#f5f0e8' }}>{ex.takeaway}</p>
                </Panel>
              ))}
              <Panel title="Try this">
                <p style={body}>{topic.lesson.practicalTip}</p>
              </Panel>
              <Panel title="Go deeper">
                <p style={body}>{topic.lesson.deeperInsight}</p>
              </Panel>
              {isMuslim && topic.faithLens && (
                <Panel title="Perspektif Islam" accent="rgba(201,168,76,0.45)">
                  <p style={body}>{topic.faithLens.text}</p>
                  <p className="text-xs mt-3" style={{ color: '#8a8a9a' }}>{topic.faithLens.sources.join(' · ')}</p>
                </Panel>
              )}
              {sources.length > 0 && (
                <Panel title="Sources">
                  <ul className="space-y-1 text-xs" style={{ color: '#8a8a9a' }}>
                    {sources.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Panel>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <button className={primaryBtn} style={ghostStyle} onClick={() => setStage('briefing')}>← Briefing</button>
                <button className={primaryBtn} style={primaryStyle} onClick={finishLesson}>
                  {progress?.lessonDone ? 'Start the challenge →' : `I've got it — start the challenge (+${XP.lesson} XP) →`}
                </button>
              </div>
            </>
          )}

          {stage === 'challenge' && question && (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: world.accent }}>Question {qIndex + 1} of {total}</p>
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#f5f0e8' }}>{question.question}</h3>
              <div className="space-y-2" role="radiogroup" aria-label="Answer options">
                {question.options.map((opt, i) => {
                  const isCorrect = i === question.correctIndex;
                  const isChosen = i === selected;
                  let border = 'rgba(201,168,76,0.2)', bg = 'rgba(13,27,42,0.7)', mark = String.fromCharCode(65 + i);
                  if (checked && isCorrect) { border = '#9ece6a'; bg = 'rgba(158,206,106,0.12)'; mark = '✓'; }
                  else if (checked && isChosen) { border = '#f7768e'; bg = 'rgba(247,118,142,0.12)'; mark = '✕'; }
                  else if (isChosen) { border = world.accent; bg = `${world.accent}22`; }
                  return (
                    <button
                      key={i}
                      role="radio" aria-checked={isChosen}
                      disabled={checked}
                      onClick={() => setSelected(i)}
                      className="w-full flex items-start gap-3 text-left rounded-xl px-4 py-3 transition-colors"
                      style={{ background: bg, border: `1px solid ${border}`, color: '#f5f0e8' }}
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold" style={{ border: `1px solid ${border}`, color: border }}>{mark}</span>
                      <span className="pt-0.5">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {checked && (
                <Panel title={selected === question.correctIndex ? 'Correct' : 'Not quite'} accent={selected === question.correctIndex ? '#9ece6a' : '#f7768e'}>
                  <p style={body}>{question.explanation}</p>
                </Panel>
              )}
              <div className="flex justify-end">
                {!checked
                  ? <button className={primaryBtn} style={primaryStyle} disabled={selected === null} onClick={check}>Check answer</button>
                  : <button className={primaryBtn} style={primaryStyle} onClick={nextQuestion}>{qIndex + 1 < total ? 'Next question →' : 'See results →'}</button>}
              </div>
            </>
          )}

          {stage === 'results' && outcome && (
            <>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(13,27,42,0.8)', border: `1px solid ${outcome.passed ? '#9ece6a' : 'rgba(201,168,76,0.3)'}` }}>
                <Stars count={starsFor(score, total)} size="text-5xl" />
                <h3 className="text-2xl font-bold mt-3" style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {outcome.worldCleared ? `${world.name} world cleared!` : outcome.passed ? 'Quest cleared!' : 'Almost there'}
                </h3>
                <p className="mt-1" style={{ color: '#8a8a9a' }}>
                  You answered {score} of {total} correctly.
                  {!outcome.passed && ' Review the lesson and try again — nothing is lost.'}
                </p>
                {outcome.xpGained > 0 && (
                  <p className="inline-block mt-3 px-4 py-1.5 rounded-full font-bold" style={{ background: 'rgba(201,168,76,0.12)', color: '#e8c97a' }}>+{outcome.xpGained} XP</p>
                )}
                {outcome.worldCleared && <p className="mt-3 text-sm" style={{ color: '#e8c97a' }}>🏆 New badge: {world.name} World Cleared</p>}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className={primaryBtn} style={ghostStyle} onClick={() => setStage('learn')}>📖 Review lesson</button>
                  {score < total && <button className={primaryBtn} style={ghostStyle} onClick={startChallenge}>⚔️ Try again</button>}
                </div>
                {outcome.passed || isPass(progress?.bestScore ?? 0, total)
                  ? <button className={primaryBtn} style={primaryStyle} onClick={() => setStage('reflect')}>Reflect →</button>
                  : null}
              </div>
            </>
          )}

          {stage === 'reflect' && (
            <>
              <Panel title="Reflection">
                <p className="text-lg font-semibold" style={{ color: '#f5f0e8' }}>{topic.reflection.prompt}</p>
                <ul className="space-y-1.5 mt-3">
                  {topic.reflection.guidingQuestions.map((g, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={body}><span style={{ color: world.accent }}>?</span><span>{g}</span></li>
                  ))}
                </ul>
              </Panel>
              <label className="block">
                <span className="sr-only">Your reflection</span>
                <textarea
                  value={reflection}
                  onChange={(e) => { setReflection(e.target.value); setReflectionSaved(false); }}
                  rows={6}
                  placeholder="Write a few honest sentences. Only you can see this."
                  className="w-full rounded-xl p-4 text-sm focus:outline-none"
                  style={{ background: 'rgba(13,27,42,0.7)', border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8' }}
                />
              </label>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <button className={primaryBtn} style={ghostStyle} disabled={!reflection.trim()} onClick={saveReflection}>
                  {reflectionSaved ? '✓ Saved' : progress?.reflectionDone ? 'Save reflection' : `Save reflection (+${XP.reflection} XP)`}
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className={primaryBtn} style={onNext ? ghostStyle : primaryStyle} onClick={onClose}>Back to world</button>
                  {onNext && <button className={primaryBtn} style={primaryStyle} onClick={onNext}>Next quest →</button>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestPlayer;
