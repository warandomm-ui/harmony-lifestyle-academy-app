
import React from 'react';
import { AnalysisResult, Course, DashboardView, UserProfile, StudentLearningPath } from '../../types';
import { useGamification } from '../../contexts/GamificationContext';
import GamificationWidget from './gamification/GamificationWidget';
import SectionErrorBoundary from '../SectionErrorBoundary';

interface DashboardContentProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  selectedSkills: string[];
  onQuickAction: (action: string) => void;
  activeCourses: Course[];
  setCurrentView: (view: DashboardView) => void;
  learningPath: StudentLearningPath | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  userProfile,
  setCurrentView,
  learningPath,
}) => {
  const { profile: gamProfile } = useGamification();
  const firstName = (userProfile.name || 'Student').split(' ')[0];
  const hasStarted = !!learningPath;
  const completedLessons = learningPath?.completedLessons ?? 0;
  const totalLessons = learningPath?.totalLessons ?? 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(13,27,42,0.9), transparent), #0a0a0f' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ═══════════════════════════════════════
           SECTION 1: HERO
           ═══════════════════════════════════════ */}
        <section className="text-center py-8 sm:py-14 animate-fade-in">
          <p
            className="text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: 'rgba(201,168,76,0.6)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Harmony Lifestyle Academy
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              background: 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 40%, #f0d990 60%, #c9a84c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Build Your Child's Life Skills with Islamic Values
          </h1>
          <p
            className="text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#8a8a9a', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            A structured, step-by-step learning journey for ages 7&ndash;17.
            Discipline. Character. Real-world skills. Halal income mindset.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setCurrentView(hasStarted ? 'my-path' : 'start-here')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
            >
              {hasStarted ? 'Continue My Path →' : 'START HERE →'}
            </button>
            {hasStarted && (
              <button
                onClick={() => setCurrentView('parent-dashboard')}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#e8c97a' }}
              >
                Parent Dashboard
              </button>
            )}
          </div>

          {/* Quick progress if user already started */}
          {hasStarted && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs text-[#8a8a9a] mb-2">
                <span>Progress: {completedLessons}/{totalLessons} lessons</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(138,138,154,0.15)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c97a)' }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Gold divider */}
        <div className="hla-gold-divider" />

        {/* ═══════════════════════════════════════
           SECTION 2: WHAT YOUR CHILD WILL GAIN
           ═══════════════════════════════════════ */}
        <section className="animate-fade-in">
          <h2
            className="text-center text-xs uppercase tracking-[0.3em] mb-8"
            style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
          >
            What Your Child Will Gain
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🕌', title: 'Daily Discipline', desc: 'Strong routines built on Islamic values & akhlaq' },
              { icon: '📖', title: 'Deep Understanding', desc: 'Connecting faith with purpose and real life' },
              { icon: '💼', title: 'Life Skills', desc: 'Business, communication, health & agriculture' },
              { icon: '💰', title: 'Halal Income', desc: 'Learn to earn through value creation' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-xl text-center transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-sm text-[var(--foreground)] mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#8a8a9a' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
           SECTION 3: HOW IT WORKS
           ═══════════════════════════════════════ */}
        <section className="animate-fade-in">
          <h2
            className="text-center text-xs uppercase tracking-[0.3em] mb-8"
            style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1', icon: '🎯', title: 'Choose Your Age',
                desc: 'Select 7-12 (with parent) or 13-17 (independent). Tell us your interests and personality.',
                action: 'Start Here',
              },
              {
                step: '2', icon: '🧭', title: 'Follow Your Path',
                desc: '3 levels of guided lessons. Each lesson: Learn (5 min) → Do (real task) → Share (upload proof).',
                action: 'My Path',
              },
              {
                step: '3', icon: '🏆', title: 'Earn & Grow',
                desc: 'Collect points and badges. Complete real projects. Build skills you can use in life.',
                action: 'Badges',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl text-center relative"
                style={{ background: 'rgba(138,138,154,0.04)', border: '1px solid rgba(138,138,154,0.1)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,201,122,0.2))', color: '#e8c97a' }}
                >
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-[var(--foreground)] mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#8a8a9a' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
           SECTION 4: LESSON FORMAT
           ═══════════════════════════════════════ */}
        <section className="animate-fade-in">
          <h2
            className="text-center text-xs uppercase tracking-[0.3em] mb-8"
            style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
          >
            Every Lesson Follows This Formula
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {[
              { icon: '📚', label: 'LEARN', desc: 'Short 3-5 min video or reading', color: '#c9a84c' },
              { icon: '🛠️', label: 'DO', desc: 'Real-life task (help at home, plant a seed, sell something)', color: '#3b82f6' },
              { icon: '📤', label: 'SHARE', desc: 'Upload photo, video, or write a report', color: '#22c55e' },
            ].map((item, i) => (
              <div key={i} className="flex-1 relative">
                <div
                  className="p-6 rounded-xl text-center h-full"
                  style={{ background: `rgba(${item.color === '#c9a84c' ? '201,168,76' : item.color === '#3b82f6' ? '59,130,246' : '34,197,94'},0.06)`, border: `1px solid rgba(${item.color === '#c9a84c' ? '201,168,76' : item.color === '#3b82f6' ? '59,130,246' : '34,197,94'},0.15)` }}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.label}</h3>
                  <p className="text-xs" style={{ color: '#8a8a9a' }}>{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-lg" style={{ color: 'rgba(201,168,76,0.4)' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
           SECTION 5: FOR PARENTS
           ═══════════════════════════════════════ */}
        <section className="animate-fade-in">
          <div
            className="p-6 sm:p-8 rounded-2xl"
            style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="text-5xl">👨‍👩‍👧</div>
              <div className="flex-1">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: '#e8c97a',
                  }}
                >
                  For Parents (Age 7-12)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: '📊', text: 'View your child\'s progress in real-time' },
                    { icon: '✅', text: 'Approve completed tasks with feedback' },
                    { icon: '📋', text: 'Weekly check-in to track growth' },
                    { icon: '🔒', text: 'PIN-protected parent dashboard' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <p className="text-sm" style={{ color: '#8a8a9a' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentView('parent-dashboard')}
                  className="mt-5 px-6 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8c97a' }}
                >
                  Open Parent Dashboard →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
           SECTION 6: PRICING
           ═══════════════════════════════════════ */}
        <section className="animate-fade-in">
          <h2
            className="text-center text-xs uppercase tracking-[0.3em] mb-2"
            style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
          >
            Simple Pricing
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: '#666' }}>Start free. Upgrade when you're ready.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div
              className="p-6 rounded-xl"
              style={{ background: 'rgba(138,138,154,0.04)', border: '1px solid rgba(138,138,154,0.12)' }}
            >
              <div className="text-center mb-4">
                <span className="text-2xl">🟢</span>
                <h3 className="font-bold text-lg text-[var(--foreground)] mt-2">Free</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: '#e8c97a' }}>RM 0</p>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: '#8a8a9a' }}>
                {['Level 1 (5 lessons)', 'Learn → Do → Share format', 'Basic gamification', 'Start Here assessment'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: '#22c55e' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setCurrentView('start-here')}
                className="w-full mt-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(138,138,154,0.1)', border: '1px solid rgba(138,138,154,0.2)', color: '#8a8a9a' }}
              >
                Get Started Free
              </button>
            </div>

            {/* Full Access */}
            <div
              className="p-6 rounded-xl relative"
              style={{ background: 'rgba(201,168,76,0.06)', border: '2px solid rgba(201,168,76,0.3)' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: '#c9a84c', color: '#0a0a0f' }}>
                POPULAR
              </div>
              <div className="text-center mb-4">
                <span className="text-2xl">🟡</span>
                <h3 className="font-bold text-lg text-[var(--foreground)] mt-2">Full Access</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: '#e8c97a' }}>RM 19<span className="text-sm font-normal">/month</span></p>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: '#8a8a9a' }}>
                {['All 3 Levels (11+ lessons)', 'Full Learn → Do → Share', 'All badges & certificates', 'Parent Dashboard', 'Community access'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: '#22c55e' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full mt-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
              >
                Upgrade Now
              </button>
            </div>

            {/* Premium */}
            <div
              className="p-6 rounded-xl"
              style={{ background: 'rgba(138,138,154,0.04)', border: '1px solid rgba(138,138,154,0.12)' }}
            >
              <div className="text-center mb-4">
                <span className="text-2xl">🔴</span>
                <h3 className="font-bold text-lg text-[var(--foreground)] mt-2">Premium</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: '#e8c97a' }}>RM 49<span className="text-sm font-normal">/month</span></p>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: '#8a8a9a' }}>
                {['Everything in Full Access', '1-on-1 mentorship sessions', 'Parent coaching calls', 'Priority support', 'Early access to new content'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: '#22c55e' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full mt-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(138,138,154,0.1)', border: '1px solid rgba(138,138,154,0.2)', color: '#8a8a9a' }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
           SECTION 7: GAMIFICATION QUICK STATS (if started)
           ═══════════════════════════════════════ */}
        {hasStarted && (
          <section className="animate-fade-in">
            <h2
              className="text-center text-xs uppercase tracking-[0.3em] mb-6"
              style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
            >
              Your Progress
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Points', value: gamProfile.points, icon: '⭐' },
                { label: 'Level', value: gamProfile.level, icon: '🏅' },
                { label: 'Lessons Done', value: completedLessons, icon: '📚' },
                { label: 'Badges', value: gamProfile.badges.length, icon: '🎖️' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="text-xl font-bold" style={{ color: '#e8c97a' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: '#8a8a9a' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="text-center py-8">
          <div className="hla-gold-divider mb-8" />
          <p className="text-sm mb-4" style={{ color: '#8a8a9a' }}>
            Ready to build discipline, character, and real-world skills?
          </p>
          <button
            onClick={() => setCurrentView(hasStarted ? 'my-path' : 'start-here')}
            className="px-10 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a0a0f' }}
          >
            {hasStarted ? 'Continue Learning →' : 'Begin Your Journey →'}
          </button>
        </section>

      </div>
    </main>
  );
};

export default DashboardContent;
