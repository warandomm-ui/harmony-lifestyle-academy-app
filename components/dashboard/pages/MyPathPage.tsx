import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabaseClient';

interface MyPathPageProps {
  onNavigate?: (view: string, params?: any) => void;
}

interface LessonWithProgress {
  id: string;
  title: string;
  description: string;
  order_index: number;
  xp_reward: number;
  duration_minutes: number;
  requires_upload: boolean;
  video_url: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  xp_earned: number;
}

const MyPathPage: React.FC<MyPathPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(profileData);

    const ageGroup = profileData?.age_group || localStorage.getItem('hla_student_profile')
      ? JSON.parse(localStorage.getItem('hla_student_profile') || '{}').ageGroup || '13-17'
      : '13-17';

    // Get learning path
    const { data: path } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('age_group', ageGroup)
      .single();
    if (!path) {
      setLoading(false);
      return;
    }
    setLearningPath(path);

    // Get lessons
    const { data: lpLessons } = await supabase
      .from('lp_lessons')
      .select('*')
      .eq('learning_path_id', path.id)
      .order('order_index');

    // Get progress
    const { data: progress } = await supabase
      .from('lp_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('learning_path_id', path.id);

    const progressMap: Record<string, any> = {};
    (progress || []).forEach(p => { progressMap[p.lesson_id] = p; });

    const lessonsWithProgress: LessonWithProgress[] = (lpLessons || []).map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order_index: lesson.order_index,
      xp_reward: lesson.xp_reward,
      duration_minutes: lesson.duration_minutes,
      requires_upload: lesson.requires_upload,
      video_url: lesson.video_url,
      status: progressMap[lesson.id]?.status || 'not_started',
      xp_earned: progressMap[lesson.id]?.xp_earned || 0,
    }));

    setLessons(lessonsWithProgress);
    const completed = lessonsWithProgress.filter(l => l.status === 'completed').length;
    setCompletedCount(completed);
    setTotalXP(lessonsWithProgress.reduce((sum, l) => sum + l.xp_earned, 0));
    setLoading(false);
  };
  const getStatusIcon = (status: string, index: number) => {
    if (status === 'completed') return '✅';
    if (status === 'in_progress') return '📝';
    // First not_started after last completed = unlocked
    const prevCompleted = index === 0 || lessons[index - 1]?.status === 'completed';
    if (prevCompleted) return '🔓';
    return '🔒';
  };

  const isLessonAccessible = (index: number) => {
    if (index === 0) return true;
    return lessons[index - 1]?.status === 'completed' || lessons[index]?.status !== 'not_started';
  };

  const handleLessonClick = (lesson: LessonWithProgress, index: number) => {
    if (!isLessonAccessible(index)) return;
    // Navigate to lesson page with lesson ID
    if (onNavigate) {
      localStorage.setItem('hla_current_lesson_id', lesson.id);
      onNavigate('lesson');
    }
  };

  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Find next lesson to continue
  const nextLesson = lessons.find(l => l.status === 'in_progress') ||
                     lessons.find((l, i) => l.status === 'not_started' && isLessonAccessible(i));
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📚</div>
          <p className="text-gray-400">Memuatkan laluan kamu...</p>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
        <div className="max-w-xl mx-auto text-center py-20">
          <div className="text-5xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-white mb-3">Belum Ada Laluan</h1>
          <p className="text-gray-400 mb-6">Sila lengkapkan profil kamu di "Mula Di Sini" untuk dapatkan laluan pembelajaran.</p>
          <button
            onClick={() => onNavigate?.('start-here')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Mula Di Sini →
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{learningPath.icon}</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{learningPath.title}</h1>
              <p className="text-gray-400 text-sm">{learningPath.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-3xl font-bold text-white">{progressPercent}%</div>
              <div className="text-gray-400 text-sm">{completedCount}/{lessons.length} selesai</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">{totalXP}</div>
              <div className="text-gray-400 text-sm">XP Dikumpul</div>
            </div>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-700"
              style={{ width: progressPercent + '%' }}
            />
          </div>
          {/* Level indicator */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-amber-400 text-sm font-medium">
              Level {Math.floor(totalXP / 50) + 1}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-sm">
              {50 - (totalXP % 50)} XP lagi ke level seterusnya
            </span>
          </div>
        </div>

        {/* Continue Button */}
        {nextLesson && (
          <button
            onClick={() => handleLessonClick(nextLesson, lessons.indexOf(nextLesson))}
            className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
          >
            {nextLesson.status === 'in_progress' ? '📝 Teruskan: ' : '▶️ Mula: '}
            {nextLesson.title}
          </button>
        )}

        {/* All completed */}
        {completedCount === lessons.length && lessons.length > 0 && (
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-lg font-bold text-green-400">Tahniah! Level 1 Selesai!</h3>
            <p className="text-gray-400 text-sm mt-1">Kamu telah menyelesaikan semua {lessons.length} pelajaran. Level seterusnya akan datang!</p>
          </div>
        )}
        {/* Lesson List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mb-3">Pelajaran</h2>
          {lessons.map((lesson, i) => {
            const accessible = isLessonAccessible(i);
            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonClick(lesson, i)}
                disabled={!accessible}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  lesson.status === 'completed'
                    ? 'bg-green-500/5 border-green-500/30 hover:bg-green-500/10'
                    : lesson.status === 'in_progress'
                    ? 'bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10'
                    : accessible
                    ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800'
                    : 'bg-gray-800/20 border-gray-800/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-lg">
                    {getStatusIcon(lesson.status, i)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">#{lesson.order_index}</span>
                      <h3 className={`font-medium truncate ${
                        lesson.status === 'completed' ? 'text-green-400' :
                        lesson.status === 'in_progress' ? 'text-amber-400' :
                        accessible ? 'text-white' : 'text-gray-500'
                      }`}>
                        {lesson.title}
                      </h3>
                    </div>                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{lesson.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-amber-400/60">⭐ {lesson.xp_reward} XP</span>
                      {lesson.duration_minutes && (
                        <span className="text-xs text-gray-600">⏱ {lesson.duration_minutes} min</span>
                      )}
                      {lesson.requires_upload && (
                        <span className="text-xs text-blue-400/50">📸 Upload</span>
                      )}
                      {lesson.video_url && (
                        <span className="text-xs text-red-400/50">🎬 Video</span>
                      )}
                    </div>
                  </div>
                  {accessible && lesson.status !== 'completed' && (
                    <div className="text-gray-500 text-sm">→</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyPathPage;
