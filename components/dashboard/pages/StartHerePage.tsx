import React, { useState } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import {
  INTEREST_OPTIONS, PERSONALITY_OPTIONS, generateLearningPath,
} from '../../../constants/learningPathData';
import type {
  AgeGroup, StudentInterest, StudentPersonality, StartHereProfile, StudentLearningPath,
} from '../../../types';

interface StartHerePageProps {
  onComplete: (profile: StartHereProfile, path: StudentLearningPath) => void;
  existingProfile?: StartHereProfile | null;
}

type Step = 'age' | 'interests' | 'personality' | 'generating' | 'ready';

const StartHerePage: React.FC<StartHerePageProps> = ({ onComplete, existingProfile }) => {
  const { addPoints } = useGamification();
  const [step, setStep] = useState<Step>(existingProfile ? 'ready' : 'age');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(existingProfile?.ageGroup || null);
  const [interests, setInterests] = useState<StudentInterest[]>(existingProfile?.interests || []);
  const [personality, setPersonality] = useState<StudentPersonality | null>(existingProfile?.personality || null);

  const toggleInterest = (interest: StudentInterest) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest],
    );
  };

  const handleGenerate = () => {
    if (!ageGroup || interests.length === 0 || !personality) return;
    setStep('generating');

    setTimeout(() => {
      const profile: StartHereProfile = {
        ageGroup,
        interests,
        personality,
        completedAt: new Date().toISOString(),
      };
      const path = generateLearningPath(ageGroup, interests, personality);
      addPoints(100, 'Completed Start Here');
      onComplete(profile, path);
      setStep('ready');
    }, 1500);
  };

  // Already completed
  if (step === 'ready' && existingProfile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bento-card text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">You're All Set!</h2>
          <p className="text-[var(--muted)] mb-6">
            Your personalized learning path has been created.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium" style={{ color: '#e8c97a' }}>
              Age {existingProfile.ageGroup} · {existingProfile.personality} learner · {existingProfile.interests.length} interests
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-6">
            Head to <strong style={{ color: '#e8c97a' }}>My Path</strong> to start your first lesson!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3">
        {(['age', 'interests', 'personality'] as Step[]).map((s, i) => {
          const steps: Step[] = ['age', 'interests', 'personality'];
          const currentIdx = steps.indexOf(step === 'generating' ? 'personality' : step);
          const isActive = i <= currentIdx;
          return (
            <div key={s} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #c9a84c, #e8c97a)' : 'rgba(138,138,154,0.2)',
                  color: isActive ? '#0a0a0f' : '#8a8a9a',
                }}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-12 h-0.5" style={{ background: isActive ? 'rgba(201,168,76,0.4)' : 'rgba(138,138,154,0.15)' }} />}
            </div>
          );
        })}
      </div>

      {/* Step: Age Group */}
      {step === 'age' && (
        <div className="bento-card space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Welcome! Let's Get Started</h2>
            <p className="text-[var(--muted)]">First, tell us your age group</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { value: '7-12' as AgeGroup, label: 'Age 7-12', icon: '🧒', desc: 'With parent guidance' },
              { value: '13-17' as AgeGroup, label: 'Age 13-17', icon: '🧑', desc: 'More independent' },
            ]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setAgeGroup(opt.value)}
                className="p-6 rounded-xl text-left transition-all duration-200"
                style={{
                  background: ageGroup === opt.value ? 'rgba(201,168,76,0.15)' : 'rgba(138,138,154,0.06)',
                  border: ageGroup === opt.value ? '2px solid rgba(201,168,76,0.5)' : '2px solid rgba(138,138,154,0.12)',
                }}
              >
                <div className="text-3xl mb-2">{opt.icon}</div>
                <h3 className="font-bold text-lg text-[var(--foreground)]">{opt.label}</h3>
                <p className="text-sm text-[var(--muted)]">{opt.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => ageGroup && setStep('interests')}
            disabled={!ageGroup}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Step: Interests */}
      {step === 'interests' && (
        <div className="bento-card space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">What Interests You?</h2>
            <p className="text-[var(--muted)]">Choose at least 1 (pick as many as you like)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {INTEREST_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleInterest(opt.value)}
                className="p-4 rounded-xl text-left transition-all duration-200"
                style={{
                  background: interests.includes(opt.value) ? 'rgba(201,168,76,0.15)' : 'rgba(138,138,154,0.06)',
                  border: interests.includes(opt.value) ? '2px solid rgba(201,168,76,0.5)' : '2px solid rgba(138,138,154,0.12)',
                }}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <h3 className="font-semibold text-sm text-[var(--foreground)]">{opt.label}</h3>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('age')} className="flex-1 py-3 rounded-xl font-bold text-sm border" style={{ borderColor: 'rgba(201,168,76,0.3)', color: '#e8c97a' }}>
              ← Back
            </button>
            <button
              onClick={() => interests.length > 0 && setStep('personality')}
              disabled={interests.length === 0}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step: Personality */}
      {step === 'personality' && (
        <div className="bento-card space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">What's Your Style?</h2>
            <p className="text-[var(--muted)]">This helps us personalize your learning pace</p>
          </div>

          <div className="space-y-3">
            {PERSONALITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPersonality(opt.value)}
                className="w-full p-5 rounded-xl text-left transition-all duration-200"
                style={{
                  background: personality === opt.value ? 'rgba(201,168,76,0.15)' : 'rgba(138,138,154,0.06)',
                  border: personality === opt.value ? '2px solid rgba(201,168,76,0.5)' : '2px solid rgba(138,138,154,0.12)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <h3 className="font-bold text-[var(--foreground)]">{opt.label}</h3>
                    <p className="text-sm text-[var(--muted)]">{opt.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('interests')} className="flex-1 py-3 rounded-xl font-bold text-sm border" style={{ borderColor: 'rgba(201,168,76,0.3)', color: '#e8c97a' }}>
              ← Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!personality}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
            >
              Generate My Path ✨
            </button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === 'generating' && (
        <div className="bento-card text-center py-16">
          <div className="animate-spin text-5xl mb-4">⚙️</div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Creating Your Learning Path...</h2>
          <p className="text-[var(--muted)]">Personalizing lessons based on your profile</p>
        </div>
      )}
    </div>
  );
};

export default StartHerePage;
