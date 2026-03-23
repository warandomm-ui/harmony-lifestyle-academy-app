import React, { useState, useEffect } from 'react';

interface MyPathPageProps {
  onNavigate?: (view: string) => void;
}

interface LessonStep {
  type: 'learn' | 'do' | 'share';
  title: string;
  desc: string;
  done: boolean;
}

interface Lesson {
  id: string;
  title: string;
  level: number;
  emoji: string;
  steps: LessonStep[];
  unlocked: boolean;
}

const LESSONS_DATA: Lesson[] = [
  {
    id: 'L1-1', title: 'Disiplin Pagi', level: 1, emoji: '🌅', unlocked: true,
    steps: [
      { type: 'learn', title: 'Video: Kenapa Disiplin Penting', desc: 'Tonton video 3 minit tentang kuasa disiplin', done: false },
      { type: 'do', title: 'Buat Jadual Pagi Kamu', desc: 'Tulis jadual pagi kamu dari bangun hingga 10 pagi. WAJIB hantar.', done: false },
      { type: 'share', title: 'Kongsi Jadual Kamu', desc: 'Upload gambar jadual kamu untuk dikongsi', done: false },
    ],
  },
  {
    id: 'L1-2', title: 'Matlamat Hidup', level: 1, emoji: '🎯', unlocked: true,
    steps: [
      { type: 'learn', title: 'Video: Cara Tetapkan Matlamat', desc: 'Pelajari teknik SMART goal dalam 4 minit', done: false },
      { type: 'do', title: 'Tulis 3 Matlamat Kamu', desc: 'Tulis 3 matlamat untuk bulan ini. WAJIB hantar.', done: false },
      { type: 'share', title: 'Kongsi Matlamat', desc: 'Upload matlamat kamu untuk komuniti lihat', done: false },
    ],
  },
  {
    id: 'L1-3', title: 'Urus Wang Pertama', level: 1, emoji: '💰', unlocked: true,
    steps: [
      { type: 'learn', title: 'Video: Asas Pengurusan Wang', desc: 'Belajar konsep simpan, belanja, labur', done: false },
      { type: 'do', title: 'Buat Bajet Mingguan', desc: 'Rekod perbelanjaan kamu selama 7 hari. WAJIB hantar.', done: false },
      { type: 'share', title: 'Kongsi Bajet Kamu', desc: 'Upload rekod perbelanjaan untuk feedback', done: false },
    ],
  },
  {
    id: 'L1-4', title: 'Komunikasi Berkesan', level: 1, emoji: '🗣️', unlocked: true,
    steps: [
      { type: 'learn', title: 'Video: Seni Bercakap', desc: 'Teknik komunikasi yang menarik perhatian', done: false },
      { type: 'do', title: 'Rakam Perkenalan Diri 1 Minit', desc: 'Rakam video perkenalan diri kamu. WAJIB hantar.', done: false },
      { type: 'share', title: 'Kongsi Video Kamu', desc: 'Upload video perkenalan untuk maklum balas', done: false },
    ],
  },
  {
    id: 'L1-5', title: 'Projek Mini Pertama', level: 1, emoji: '🚀', unlocked: true,
    steps: [
      { type: 'learn', title: 'Video: Cara Mulakan Projek', desc: 'Langkah-langkah memulakan projek kecil', done: false },
      { type: 'do', title: 'Rancang & Laksana Projek', desc: 'Pilih 1 projek kecil dan siapkan dalam 3 hari. WAJIB hantar.', done: false },
      { type: 'share', title: 'Tunjuk Hasil Projek', desc: 'Upload bukti projek kamu yang sudah siap', done: false },
    ],
  },
  {
    id: 'L2-1', title: 'Bisnes Pertama', level: 2, emoji: '💼', unlocked: false,
    steps: [
      { type: 'learn', title: 'Video: Idea Bisnes Untuk Remaja', desc: 'Cari idea bisnes yang sesuai untuk umur kamu', done: false },
      { type: 'do', title: 'Buat Pelan Bisnes Mini', desc: 'Tulis pelan bisnes 1 halaman. WAJIB hantar.', done: false },
      { type: 'share', title: 'Present Idea Kamu', desc: 'Kongsi idea bisnes untuk review', done: false },
    ],
  },
];

const STEP_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  learn: { icon: '📖', label: 'BELAJAR', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  do: { icon: '✋', label: 'BUAT', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  share: { icon: '📤', label: 'KONGSI', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
};

const MyPathPage: React.FC<MyPathPageProps> = ({ onNavigate }) => {
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS_DATA);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('hla_my_path_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.lessons) setLessons(data.lessons);
        if (data.xp) setXp(data.xp);
        if (data.level) setLevel(data.level);
      } catch(e) {}
    }
  }, []);

  const saveProgress = (updatedLessons: Lesson[], newXp: number, newLevel: number) => {
    localStorage.setItem('hla_my_path_progress', JSON.stringify({ lessons: updatedLessons, xp: newXp, level: newLevel }));
  };

  const toggleStep = (lessonId: string, stepIdx: number) => {
    const updated = lessons.map(l => {
      if (l.id === lessonId) {
        const newSteps = l.steps.map((s, i) => i === stepIdx ? { ...s, done: !s.done } : s);
        return { ...l, steps: newSteps };
      }
      return l;
    });
    const completedSteps = updated.reduce((acc, l) => acc + l.steps.filter(s => s.done).length, 0);
    const newXp = completedSteps * 20;
    const newLevel = Math.floor(newXp / 100) + 1;
    setLessons(updated);
    setXp(newXp);
    setLevel(newLevel);
    saveProgress(updated, newXp, newLevel);
  };

  const totalSteps = lessons.reduce((acc, l) => acc + l.steps.length, 0);
  const doneSteps = lessons.reduce((acc, l) => acc + l.steps.filter(s => s.done).length, 0);
  const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const currentLevelLessons = lessons.filter(l => l.level === level);
  const nextLesson = lessons.find(l => l.steps.some(s => !s.done) && l.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-white">Laluan Saya</h1>
              <p className="text-gray-400 text-sm">Level {level} • {xp} XP</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400">{progressPct}%</div>
              <div className="text-gray-500 text-xs">Kemajuan</div>
            </div>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-3">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-700" style={{ width: progressPct + '%' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{doneSteps} selesai</span>
            <span>{totalSteps - doneSteps} lagi</span>
          </div>
        </div>

        {/* Continue Button */}
        {nextLesson && (
          <button
            onClick={() => setActiveLesson(nextLesson.id)}
            className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg flex items-center justify-between hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
          >
            <span>Sambung Belajar: {nextLesson.emoji} {nextLesson.title}</span>
            <span>→</span>
          </button>
        )}

        {/* Level Sections */}
        {[1, 2].map(lvl => {
          const lvlLessons = lessons.filter(l => l.level === lvl);
          const lvlDone = lvlLessons.reduce((a, l) => a + l.steps.filter(s => s.done).length, 0);
          const lvlTotal = lvlLessons.reduce((a, l) => a + l.steps.length, 0);
          const isLocked = lvl > level;
          return (
            <div key={lvl} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className={'text-lg font-bold ' + (isLocked ? 'text-gray-600' : 'text-white')}>
                  Level {lvl} {isLocked ? '🔒' : ''}
                </h2>
                <span className="text-xs text-gray-500">{lvlDone}/{lvlTotal} selesai</span>
              </div>
              <div className="space-y-3">
                {lvlLessons.map(lesson => {
                  const lessonDone = lesson.steps.filter(s => s.done).length;
                  const isComplete = lessonDone === lesson.steps.length;
                  const isActive = activeLesson === lesson.id;
                  return (
                    <div key={lesson.id} className={'rounded-2xl border transition-all ' + (isLocked ? 'opacity-50 border-gray-800 bg-gray-900/50' : isComplete ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700/50 bg-gray-800/60')}>
                      <button
                        onClick={() => !isLocked && setActiveLesson(isActive ? null : lesson.id)}
                        className="w-full p-4 flex items-center gap-3 text-left"
                        disabled={isLocked}
                      >
                        <span className="text-2xl">{lesson.emoji}</span>
                        <div className="flex-1">
                          <div className={'font-bold ' + (isComplete ? 'text-green-400' : 'text-white')}>{lesson.title}</div>
                          <div className="text-gray-500 text-xs">{lessonDone}/{lesson.steps.length} langkah selesai</div>
                        </div>
                        {isComplete && <span className="text-green-400 text-xl">✓</span>}
                        {!isComplete && !isLocked && <span className="text-gray-500">{isActive ? '▲' : '▼'}</span>}
                      </button>
                      {isActive && !isLocked && (
                        <div className="px-4 pb-4 space-y-2">
                          {lesson.steps.map((step, si) => {
                            const stepMeta = STEP_ICONS[step.type];
                            return (
                              <div key={si} className={'flex items-start gap-3 p-3 rounded-xl border ' + stepMeta.color}>
                                <button onClick={() => toggleStep(lesson.id, si)} className={'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ' + (step.done ? 'bg-amber-500 border-amber-500 text-gray-900' : 'border-gray-500')}>
                                  {step.done && <span className="text-xs font-bold">✓</span>}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider">{stepMeta.icon} {stepMeta.label}</span>
                                  </div>
                                  <div className={'font-medium text-sm ' + (step.done ? 'line-through text-gray-500' : 'text-white')}>{step.title}</div>
                                  <div className="text-gray-400 text-xs mt-0.5">{step.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Badges Section */}
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mt-6">
          <h3 className="text-lg font-bold text-white mb-3">Lencana Kamu</h3>
          <div className="flex gap-3 flex-wrap">
            {doneSteps >= 3 && <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">🌟 Pemula</div>}
            {doneSteps >= 9 && <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">⚡ Rajin</div>}
            {doneSteps >= 15 && <div className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">🏆 Level 1 Master</div>}
            {doneSteps === 0 && <div className="text-gray-500 text-sm">Selesaikan pelajaran untuk dapatkan lencana!</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPathPage;
