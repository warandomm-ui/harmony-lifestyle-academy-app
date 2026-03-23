import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

interface MyPathPageProps {
  onNavigate?: (view: string) => void;
}

interface LpLesson {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  content: string;
  task_instruction: string;
  requires_upload: boolean;
  order_index: number;
  xp_reward: number;
  duration_minutes: number;
}

interface LpProgress {
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  xp_earned: number;
  upload_url: string | null;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  age_group: string;
  level: number;
  icon: string;
  color: string;
  total_lessons: number;
}

const MyPathPage: React.FC<MyPathPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [lessons, setLessons] = useState<LpLesson[]>([]);
  const [progress, setProgress] = useState<Record<string, LpProgress>>({});
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [taskText, setTaskText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalXp = Object.values(progress).reduce((acc, p) => acc + (p.xp_earned || 0), 0);
  const completedCount = Object.values(progress).filter(p => p.status === 'completed').length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) { setLoading(false); return; }

    try {
      // Get user's age group from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('age_group')
        .eq('id', user.id)
        .single();

      const ageGroup = profileData?.age_group || '7-12';

      // Get learning path for this age group
      const { data: pathData } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('age_group', ageGroup)
        .eq('level', 1)
        .single();

      if (!pathData) {
        // Fallback: get any learning path
        const { data: anyPath } = await supabase
          .from('learning_paths')
          .select('*')
          .limit(1)
          .single();
        if (anyPath) setLearningPath(anyPath);
        else { setLoading(false); return; }
      } else {
        setLearningPath(pathData);
      }

      const pathId = pathData?.id || (learningPath?.id);
      if (!pathId) { setLoading(false); return; }

      // Get lessons for this path
      const { data: lessonsData } = await supabase
        .from('lp_lessons')
        .select('*')
        .eq('learning_path_id', pathId)
        .order('order_index', { ascending: true });

      if (lessonsData) setLessons(lessonsData);

      // Get user's progress
      const { data: progressData } = await supabase
        .from('lp_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('learning_path_id', pathId);

      if (progressData) {
        const progressMap: Record<string, LpProgress> = {};
        progressData.forEach(p => {
          progressMap[p.lesson_id] = {
            lesson_id: p.lesson_id,
            status: p.status,
            xp_earned: p.xp_earned,
            upload_url: p.upload_url
          };
        });
        setProgress(progressMap);
      }
    } catch (e) {
      console.error('Error loading learning path:', e);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lessonId: string) => {
    if (!user || !learningPath) return;

    const current = progress[lessonId];
    if (!current || current.status === 'not_started') {
      // Create or update progress to in_progress
      const { error } = await supabase
        .from('lp_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          learning_path_id: learningPath.id,
          status: 'in_progress',
          xp_earned: 0
        }, { onConflict: 'user_id,lesson_id' });

      if (!error) {
        setProgress(prev => ({
          ...prev,
          [lessonId]: { lesson_id: lessonId, status: 'in_progress', xp_earned: 0, upload_url: null }
        }));
      }
    }
    setViewingContent(lessonId);
    setTaskText('');
  };

  const completeLesson = async (lessonId: string) => {
    if (!user || !learningPath) return;
    setSubmitting(true);

    const lesson = lessons.find(l => l.id === lessonId);
    const xpReward = lesson?.xp_reward || 10;

    try {
      const { error } = await supabase
        .from('lp_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          learning_path_id: learningPath.id,
          status: 'completed',
          xp_earned: xpReward,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (!error) {
        setProgress(prev => ({
          ...prev,
          [lessonId]: { lesson_id: lessonId, status: 'completed', xp_earned: xpReward, upload_url: null }
        }));
      }
    } catch (e) {
      console.error('Error completing lesson:', e);
    } finally {
      setSubmitting(false);
      setViewingContent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuatkan laluan pembelajaran...</p>
        </div>
      </div>
    );
  }

  if (!learningPath || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">ð</div>
          <h2 className="text-xl font-bold text-white mb-2">Tiada Laluan Ditemui</h2>
          <p className="text-gray-400 mb-6">Sila lengkapkan profil kamu terlebih dahulu di "Mula Di Sini"</p>
          <button
            onClick={() => onNavigate?.('start-here')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Pergi ke Mula Di Sini
          </button>
        </div>
      </div>
    );
  }

  // Viewing lesson content
  if (viewingContent) {
    const lesson = lessons.find(l => l.id === viewingContent);
    if (!lesson) return null;
    const lessonProgress = progress[lesson.id];
    const isCompleted = lessonProgress?.status === 'completed';

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setViewingContent(null)}
            className="mb-4 text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            â Kembali ke Laluan
          </button>

          {/* Lesson Header */}
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                {lesson.order_index <= 5 ? ['ð', 'ð§ ', 'ð¤', 'â³', 'ð'][lesson.order_index - 1] || 'ð' : 'ð'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
                <p className="text-gray-400 text-sm">{lesson.duration_minutes} minit â¢ {lesson.xp_reward} XP</p>
              </div>
              {isCompleted && (
                <span className="ml-auto px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                  â Selesai
                </span>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">ð</span> Belajar
            </h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {lesson.content}
            </div>
          </div>

          {/* Video Section (if available) */}
          {lesson.video_url && (
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">ð¥</span> Video
              </h2>
              <div className="bg-gray-700/50 rounded-xl p-8 text-center">
                <p className="text-gray-400">Video akan datang</p>
              </div>
            </div>
          )}

          {/* Task Section */}
          {lesson.task_instruction && (
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-amber-500/30 p-6 mb-6">
              <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                <span>â</span> Tugasan
              </h2>
              <p className="text-gray-300 mb-4">{lesson.task_instruction}</p>

              {!isCompleted && (
                <>
                  <textarea
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="Tulis jawapan kamu di sini..."
                    className="w-full p-4 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
                    rows={5}
                  />
                  {lesson.requires_upload && (
                    <div className="mt-3 p-4 rounded-xl border-2 border-dashed border-gray-600 text-center">
                      <span className="text-gray-400 text-sm">ð¤ Upload gambar/fail (akan datang)</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Complete Button */}
          {!isCompleted && (
            <button
              onClick={() => completeLesson(lesson.id)}
              disabled={submitting}
              className={
                'w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/25 ' +
                (submitting ? 'opacity-50 cursor-not-allowed' : '')
              }
            >
              {submitting ? 'Menyimpan...' : `Selesai & Dapat ${lesson.xp_reward} XP â`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Main path view
  const nextLesson = lessons.find(l => !progress[l.id] || progress[l.id].status !== 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-white">{learningPath.icon} {learningPath.title}</h1>
              <p className="text-gray-400 text-sm">{learningPath.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400">{totalXp}</div>
              <div className="text-gray-500 text-xs">XP</div>
            </div>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-700"
              style={{ width: progressPct + '%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{completedCount}/{lessons.length} selesai</span>
            <span>{progressPct}%</span>
          </div>
        </div>

        {/* Continue Button */}
        {nextLesson && (
          <button
            onClick={() => startLesson(nextLesson.id)}
            className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg flex items-center justify-between hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
          >
            <span>Sambung: {nextLesson.title}</span>
            <span>â</span>
          </button>
        )}

        {/* Lessons List */}
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const lp = progress[lesson.id];
            const isCompleted = lp?.status === 'completed';
            const isInProgress = lp?.status === 'in_progress';
            const isActive = activeLesson === lesson.id;

            return (
              <div
                key={lesson.id}
                className={
                  'rounded-2xl border transition-all ' +
                  (isCompleted
                    ? 'border-green-500/30 bg-green-500/5'
                    : isInProgress
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-gray-700/50 bg-gray-800/60')
                }
              >
                <button
                  onClick={() => setActiveLesson(isActive ? null : lesson.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className={
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ' +
                    (isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : isInProgress
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-700 text-gray-500')
                  }>
                    {isCompleted ? 'â' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={'font-bold ' + (isCompleted ? 'text-green-400' : 'text-white')}>
                      {lesson.title}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {lesson.duration_minutes} minit â¢ {lesson.xp_reward} XP
                      {isCompleted && ` â¢ â ${lp.xp_earned} XP diperoleh`}
                    </div>
                  </div>
                  <span className="text-gray-500">{isActive ? 'â²' : 'â¼'}</span>
                </button>

                {isActive && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-400 text-sm mb-3">{lesson.description}</p>
                    {lesson.task_instruction && (
                      <div className="text-xs text-amber-400/70 mb-3">
                        â Tugasan: {lesson.task_instruction.substring(0, 80)}...
                      </div>
                    )}
                    <button
                      onClick={() => startLesson(lesson.id)}
                      className={
                        'w-full py-2 rounded-xl text-sm font-bold transition-all ' +
                        (isCompleted
                          ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 hover:from-amber-400 hover:to-amber-500')
                      }
                    >
                      {isCompleted ? 'Lihat Semula' : isInProgress ? 'Sambung Belajar' : 'Mula Pelajaran'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Badges Section */}
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mt-6">
          <h3 className="text-lg font-bold text-white mb-3">Lencana Kamu</h3>
          <div className="flex gap-3 flex-wrap">
            {completedCount >= 1 && (
              <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                ð Pemula
              </div>
            )}
            {completedCount >= 3 && (
              <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
                â¡ Rajin
              </div>
            )}
            {completedCount >= 5 && (
              <div className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                ð Master Harmoni
              </div>
            )}
            {completedCount === 0 && (
              <div className="text-gray-500 text-sm">Selesaikan pelajaran untuk dapatkan lencana!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPathPage;
