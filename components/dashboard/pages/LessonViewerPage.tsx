import React, { useState } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';
import type { PathLesson, LessonStep } from '../../../types';

interface LessonViewerPageProps {
  lesson: PathLesson;
  levelTitle: string;
  onComplete: (submission: { type: 'photo' | 'video' | 'text'; content: string }) => void;
  onBack: () => void;
}

const STEP_CONFIG: Record<LessonStep, { label: string; icon: string; color: string }> = {
  learn: { label: 'Learn', icon: '📚', color: '#c9a84c' },
  do: { label: 'Do', icon: '🛠️', color: '#3b82f6' },
  share: { label: 'Share', icon: '📤', color: '#22c55e' },
};

const LessonViewerPage: React.FC<LessonViewerPageProps> = ({ lesson, levelTitle, onComplete, onBack }) => {
  const { addPoints } = useGamification();
  const { addToast } = useToast();
  const [activeStep, setActiveStep] = useState<LessonStep>('learn');
  const [learnDone, setLearnDone] = useState(false);
  const [doDone, setDoDone] = useState(false);
  const [submissionType, setSubmissionType] = useState<'photo' | 'video' | 'text'>('text');
  const [submissionContent, setSubmissionContent] = useState('');

  const handleMarkLearnDone = () => {
    setLearnDone(true);
    addPoints(10, 'Completed Learn step');
    addToast('Learn step completed! Now do the task.', 'success');
    setActiveStep('do');
  };

  const handleMarkDoDone = () => {
    setDoDone(true);
    addPoints(15, 'Completed Do step');
    addToast('Task done! Now share your work.', 'success');
    setActiveStep('share');
  };

  const handleSubmit = () => {
    if (!submissionContent.trim()) {
      addToast('Please add your submission before completing.', 'error');
      return;
    }
    addPoints(lesson.pointsReward, `Completed: ${lesson.title}`);
    onComplete({ type: submissionType, content: submissionContent });
    addToast(`Lesson completed! +${lesson.pointsReward} points`, 'success');
  };

  const steps: LessonStep[] = ['learn', 'do', 'share'];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg transition-colors hover:bg-[rgba(201,168,76,0.1)]"
          style={{ color: '#e8c97a' }}
        >
          ← Back
        </button>
        <div>
          <p className="text-xs text-[var(--muted)]">{levelTitle}</p>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{lesson.title}</h1>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(138,138,154,0.06)' }}>
        {steps.map((step, i) => {
          const config = STEP_CONFIG[step];
          const isActive = activeStep === step;
          const isDone = (step === 'learn' && learnDone) || (step === 'do' && doDone) || (step === 'share' && lesson.status === 'completed');
          const isAccessible = step === 'learn' || (step === 'do' && learnDone) || (step === 'share' && doDone);

          return (
            <button
              key={step}
              onClick={() => isAccessible && setActiveStep(step)}
              disabled={!isAccessible}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40"
              style={{
                background: isActive ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: isDone ? '#22c55e' : isActive ? config.color : '#8a8a9a',
                border: isActive ? `1px solid rgba(201,168,76,0.3)` : '1px solid transparent',
              }}
            >
              <span>{isDone ? '✅' : config.icon}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === 'learn' && (
        <div className="bento-card space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📚</span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Learn</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>5 min</span>
          </div>

          {lesson.learnVideoUrl && (
            <div className="aspect-video rounded-xl overflow-hidden" style={{ background: 'rgba(138,138,154,0.1)' }}>
              <div className="flex items-center justify-center h-full text-[var(--muted)]">
                <div className="text-center">
                  <span className="text-4xl block mb-2">🎬</span>
                  <p className="text-sm">Video lesson</p>
                </div>
              </div>
            </div>
          )}

          <div
            className="p-5 rounded-xl leading-relaxed text-sm"
            style={{ background: 'rgba(138,138,154,0.04)', color: 'var(--foreground)', lineHeight: '1.8' }}
          >
            {lesson.learnContent}
          </div>

          {!learnDone ? (
            <button
              onClick={handleMarkLearnDone}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
            >
              I've Learned This ✓
            </button>
          ) : (
            <div className="text-center py-3 text-green-400 font-bold text-sm">✅ Completed</div>
          )}
        </div>
      )}

      {activeStep === 'do' && (
        <div className="bento-card space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🛠️</span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Do</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>Real-life task</span>
          </div>

          <div
            className="p-5 rounded-xl leading-relaxed text-sm"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', lineHeight: '1.8', color: 'var(--foreground)' }}
          >
            <p className="font-bold mb-2" style={{ color: '#60a5fa' }}>Your Task:</p>
            {lesson.doTask}
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}>
            <p className="text-xs text-[var(--muted)]">
              💡 <strong>Tip:</strong> Take your time with this task. It's the most important part — applying what you learned in real life!
            </p>
          </div>

          {!doDone ? (
            <button
              onClick={handleMarkDoDone}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: '#fff' }}
            >
              I've Done This Task ✓
            </button>
          ) : (
            <div className="text-center py-3 text-green-400 font-bold text-sm">✅ Task Completed</div>
          )}
        </div>
      )}

      {activeStep === 'share' && (
        <div className="bento-card space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📤</span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Share</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Upload & complete</span>
          </div>

          <div
            className="p-4 rounded-xl text-sm"
            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', color: 'var(--foreground)' }}
          >
            <p className="font-bold mb-1" style={{ color: '#22c55e' }}>Share Prompt:</p>
            {lesson.sharePrompt}
          </div>

          {/* Submission Type */}
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] mb-3">How would you like to share?</p>
            <div className="flex gap-2">
              {([
                { value: 'text' as const, label: 'Write', icon: '✏️' },
                { value: 'photo' as const, label: 'Photo', icon: '📷' },
                { value: 'video' as const, label: 'Video', icon: '🎥' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSubmissionType(opt.value)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: submissionType === opt.value ? 'rgba(34,197,94,0.12)' : 'rgba(138,138,154,0.06)',
                    border: submissionType === opt.value ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(138,138,154,0.1)',
                    color: submissionType === opt.value ? '#22c55e' : '#8a8a9a',
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submission Input */}
          {submissionType === 'text' ? (
            <textarea
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
              placeholder="Write about your experience, what you learned, and how it went..."
              rows={5}
              className="w-full p-4 rounded-xl text-sm resize-none"
              style={{
                background: 'rgba(138,138,154,0.06)',
                border: '1px solid rgba(138,138,154,0.15)',
                color: 'var(--foreground)',
              }}
            />
          ) : (
            <div>
              <label
                className="block w-full p-8 rounded-xl text-center cursor-pointer transition-all hover:opacity-80"
                style={{ background: 'rgba(138,138,154,0.06)', border: '2px dashed rgba(138,138,154,0.2)' }}
              >
                <input
                  type="file"
                  accept={submissionType === 'photo' ? 'image/*' : 'video/*'}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSubmissionContent(file.name);
                  }}
                />
                <span className="text-3xl block mb-2">{submissionType === 'photo' ? '📷' : '🎥'}</span>
                <p className="text-sm text-[var(--muted)]">
                  {submissionContent || `Tap to upload ${submissionType}`}
                </p>
              </label>
              {!submissionContent && (
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Or describe your work here..."
                  rows={3}
                  className="w-full p-3 rounded-xl text-sm resize-none mt-3"
                  style={{ background: 'rgba(138,138,154,0.06)', border: '1px solid rgba(138,138,154,0.15)', color: 'var(--foreground)' }}
                />
              )}
            </div>
          )}

          {/* Points Badge */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-sm" style={{ color: '#c9a84c' }}>🏅 Complete to earn</span>
            <span className="font-bold" style={{ color: '#e8c97a' }}>+{lesson.pointsReward} points</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!submissionContent.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)', color: '#0a0a0f' }}
          >
            Complete Lesson 🎉
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonViewerPage;
