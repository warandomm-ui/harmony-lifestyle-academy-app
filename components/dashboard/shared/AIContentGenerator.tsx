import React, { useState, useEffect } from 'react';
import { generateModuleContent, clearModuleContentCache } from '../../../services/claudeService';
import type { GeneratedModuleContent } from '../../../types';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';

interface AIContentGeneratorProps {
  moduleId: string;
  moduleName: string;
  topics: { icon: string; title: string }[];
  context?: string;
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 rounded-xl w-3/4" style={{ background: 'rgba(201,168,76,0.1)' }} />
    <div className="h-4 rounded-xl w-full" style={{ background: 'rgba(201,168,76,0.07)' }} />
    <div className="h-4 rounded-xl w-5/6" style={{ background: 'rgba(201,168,76,0.07)' }} />
    <div className="h-4 rounded-xl w-4/6" style={{ background: 'rgba(201,168,76,0.07)' }} />
    <p className="text-center text-sm pt-4" style={{ color: '#c9a84c' }}>✦ Claude is generating your lesson…</p>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  moduleId,
  moduleName,
  topics,
  context,
}) => {
  const { addPoints } = useGamification();
  const { addToast } = useToast();

  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.title ?? '');
  const [content, setContent] = useState<GeneratedModuleContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz' | 'reflection'>('lesson');

  // Quiz state
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reflection state
  const [reflectionText, setReflectionText] = useState('');

  // Load cached reflection text when topic/content changes
  useEffect(() => {
    if (!content) return;
    const slug = content.topic.toLowerCase().replace(/\s+/g, '_');
    const saved = localStorage.getItem(`harmony_reflection_${moduleId}_${slug}`) ?? '';
    setReflectionText(saved);
    // Reset quiz state when content changes
    setQuizSelected(null);
    setQuizSubmitted(false);
    setActiveTab('lesson');
  }, [content, moduleId]);

  const handleGenerate = async (forceRefresh = false) => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setError(null);
    setContent(null);

    try {
      if (forceRefresh) {
        clearModuleContentCache(moduleId, selectedTopic);
      }
      const cached = !forceRefresh && !!localStorage.getItem(
        `harmony_ai_${moduleId}_${selectedTopic.toLowerCase().replace(/\s+/g, '_')}`
      );
      const result = await generateModuleContent(moduleName, selectedTopic, context);
      setContent(result);
      setFromCache(cached && new Date(result.generatedAt).getTime() < Date.now() - 1000);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => handleGenerate(true);

  const handleQuizSubmit = () => {
    if (quizSelected === null || !content) return;
    setQuizSubmitted(true);
    if (quizSelected === content.quiz.correctIndex) {
      addPoints(20, `AI Quiz: ${selectedTopic}`);
      addToast(`Correct! +20 XP for the ${selectedTopic} quiz! 🎉`, 'success');
    }
  };

  const handleSaveReflection = () => {
    if (!content) return;
    const slug = content.topic.toLowerCase().replace(/\s+/g, '_');
    localStorage.setItem(`harmony_reflection_${moduleId}_${slug}`, reflectionText);
    addToast('Reflection saved! ✦', 'success');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: 'rgba(13,27,42,0.85)',
        border: '1px solid rgba(201,168,76,0.18)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3
            className="font-black text-xl flex items-center gap-2"
            style={{ color: '#e8c97a', fontFamily: "'Playfair Display', serif" }}
          >
            ✨ AI-Powered Deep Dive
          </h3>
          <p className="text-sm mt-1" style={{ color: '#8a8a9a' }}>
            Select a topic, then generate a personalised lesson.
          </p>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            color: '#c9a84c',
          }}
        >
          Powered by Claude
        </span>
      </div>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2">
        {topics.map(t => (
          <button
            key={t.title}
            onClick={() => { setSelectedTopic(t.title); setContent(null); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={
              selectedTopic === t.title
                ? { background: 'rgba(201,168,76,0.2)', border: '1.5px solid #c9a84c', color: '#e8c97a' }
                : { background: 'transparent', border: '1.5px solid rgba(201,168,76,0.2)', color: '#8a8a9a' }
            }
          >
            <span>{t.icon}</span>
            <span>{t.title}</span>
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={() => handleGenerate(false)}
        disabled={isLoading || !selectedTopic}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isLoading ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.18)',
          border: '1.5px solid rgba(201,168,76,0.4)',
          color: '#c9a84c',
        }}
        onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.28)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isLoading ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.18)'; }}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          '✨ Generate AI Lesson'
        )}
      </button>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl p-5" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <Skeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-sm font-bold" style={{ color: '#fca5a5' }}>⚠ {error}</p>
          <button
            onClick={() => handleGenerate(false)}
            className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content area */}
      {content && !isLoading && (
        <div className="space-y-4">
          {/* Tab bar + cache badge */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.12)' }}>
              {(['lesson', 'quiz', 'reflection'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all capitalize"
                  style={
                    activeTab === tab
                      ? { background: 'rgba(201,168,76,0.22)', color: '#e8c97a' }
                      : { color: '#8a8a9a' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {fromCache && (
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: 'rgba(201,168,76,0.07)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  color: '#c9a84c',
                }}
              >
                Cached · Refresh ↺
              </button>
            )}
          </div>

          {/* ── LESSON TAB ── */}
          {activeTab === 'lesson' && (
            <div className="rounded-xl p-5 space-y-5" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
              <h4
                className="text-2xl font-black leading-snug"
                style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', serif" }}
              >
                {content.lesson.title}
              </h4>

              <div className="text-sm leading-relaxed space-y-3" style={{ color: '#c8c0b4' }}>
                {content.lesson.explanation.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key points */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>Key Points</p>
                <ul className="space-y-2">
                  {content.lesson.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#c8c0b4' }}>
                      <span style={{ color: '#c9a84c', flexShrink: 0 }}>✦</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical tip */}
              <div
                className="rounded-xl p-4"
                style={{ borderLeft: '4px solid #c9a84c', background: 'rgba(201,168,76,0.07)' }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#c9a84c' }}>Practical Tip</p>
                <p className="text-sm" style={{ color: '#f5f0e8' }}>{content.lesson.practicalTip}</p>
              </div>

              {/* Deeper insight */}
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: '#8a8a9a', fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}
              >
                "{content.lesson.deeperInsight}"
              </p>
            </div>
          )}

          {/* ── QUIZ TAB ── */}
          {activeTab === 'quiz' && (
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
              <p className="font-bold text-base" style={{ color: '#f5f0e8' }}>{content.quiz.question}</p>

              <div className="space-y-2">
                {content.quiz.options.map((opt, i) => {
                  const isCorrect = i === content.quiz.correctIndex;
                  const isSelected = i === quizSelected;
                  let borderColor = 'rgba(201,168,76,0.25)';
                  let bgColor = 'transparent';
                  let textColor = '#c8c0b4';

                  if (quizSubmitted) {
                    if (isCorrect) { borderColor = '#22c55e'; bgColor = 'rgba(34,197,94,0.1)'; textColor = '#86efac'; }
                    else if (isSelected) { borderColor = '#ef4444'; bgColor = 'rgba(239,68,68,0.1)'; textColor = '#fca5a5'; }
                  } else if (isSelected) {
                    borderColor = '#c9a84c'; bgColor = 'rgba(201,168,76,0.1)'; textColor = '#e8c97a';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !quizSubmitted && setQuizSelected(i)}
                      disabled={quizSubmitted}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: bgColor, border: `1.5px solid ${borderColor}`, color: textColor }}
                    >
                      <span className="mr-2 font-black">{['A', 'B', 'C', 'D'][i]}.</span>
                      {opt}
                      {quizSubmitted && isCorrect && <span className="float-right">✓</span>}
                      {quizSubmitted && isSelected && !isCorrect && <span className="float-right">✗</span>}
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={quizSelected === null}
                  className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-40"
                  style={{ background: 'rgba(201,168,76,0.18)', border: '1.5px solid rgba(201,168,76,0.4)', color: '#c9a84c' }}
                >
                  Submit Answer
                </button>
              ) : (
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#c9a84c' }}>Explanation</p>
                  <p className="text-sm" style={{ color: '#c8c0b4' }}>{content.quiz.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* ── REFLECTION TAB ── */}
          {activeTab === 'reflection' && (
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
              <p className="font-bold text-base leading-relaxed" style={{ color: '#f5f0e8' }}>{content.reflection.prompt}</p>

              <div className="space-y-2">
                {content.reflection.guidingQuestions.map((q, i) => (
                  <p key={i} className="text-sm flex items-start gap-2" style={{ color: '#8a8a9a' }}>
                    <span style={{ color: '#c9a84c', flexShrink: 0 }}>→</span>
                    {q}
                  </p>
                ))}
              </div>

              <textarea
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder="Write your reflection here…"
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                style={{
                  background: 'rgba(201,168,76,0.05)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  color: '#f5f0e8',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)'; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)'; }}
              />

              <button
                onClick={handleSaveReflection}
                disabled={!reflectionText.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-40"
                style={{ background: 'rgba(201,168,76,0.18)', border: '1.5px solid rgba(201,168,76,0.4)', color: '#c9a84c' }}
              >
                Save Reflection
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AIContentGenerator;
