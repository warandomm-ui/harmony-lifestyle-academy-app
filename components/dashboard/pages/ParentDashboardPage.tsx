import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabaseClient';

interface ParentDashboardPageProps {
  onNavigate?: (view: string) => void;
}

interface ChildData {
  id: string;
  full_name: string;
  email: string;
  age_group: string;
  onboarding_completed: boolean;
  progress: {
    total_lessons: number;
    completed_lessons: number;
    total_xp: number;
    current_lesson: string;
    percent: number;
  };
  submissions: Array<{
    id: string;
    lesson_title: string;
    task_response: string;
    file_url: string | null;
    status: string;
    created_at: string;
  }>;
  badges: Array<{
    badge_name: string;
    badge_icon: string;
    earned_at: string;
  }>;
}
const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'feedback'>('overview');
  const [weeklyComment, setWeeklyComment] = useState('');
  const [weeklyRating, setWeeklyRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadChildren();
  }, [user]);

  const loadChildren = async () => {
    if (!user) return;
    setLoading(true);

    // Get linked children
    const { data: links } = await supabase
      .from('parent_children')
      .select('child_id')
      .eq('parent_id', user.id);

    if (!links || links.length === 0) {
      // If no linked children, show the parent's own data as demo
      await loadChildData(user.id);
      setLoading(false);
      return;
    }

    for (const link of links) {
      await loadChildData(link.child_id);
    }
    setLoading(false);
  };
  const loadChildData = async (childId: string) => {
    // Get child profile
    const { data: childProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', childId)
      .single();

    if (!childProfile) return;

    // Get learning path based on age group
    const { data: path } = await supabase
      .from('learning_paths')
      .select('*, lp_lessons(*)')
      .eq('age_group', childProfile.age_group || '13-17')
      .single();

    const totalLessons = path?.lp_lessons?.length || 0;

    // Get progress
    const { data: progress } = await supabase
      .from('lp_progress')
      .select('*')
      .eq('user_id', childId);

    const completedLessons = (progress || []).filter(p => p.status === 'completed').length;
    const totalXP = (progress || []).reduce((sum, p) => sum + (p.xp_earned || 0), 0);
    // Get current lesson (in_progress or next)
    const inProgress = (progress || []).find(p => p.status === 'in_progress');
    let currentLessonTitle = 'Belum mula';
    if (inProgress) {
      const { data: lessonData } = await supabase
        .from('lp_lessons')
        .select('title')
        .eq('id', inProgress.lesson_id)
        .single();
      currentLessonTitle = lessonData?.title || 'Dalam progress';
    } else if (completedLessons > 0 && completedLessons < totalLessons) {
      currentLessonTitle = 'Sedia untuk pelajaran seterusnya';
    } else if (completedLessons === totalLessons && totalLessons > 0) {
      currentLessonTitle = 'Semua selesai!';
    }

    // Get submissions
    const { data: subs } = await supabase
      .from('lesson_submissions')
      .select('*, lp_lessons(title)')
      .eq('user_id', childId)
      .order('created_at', { ascending: false });

    // Get badges
    const { data: badges } = await supabase
      .from('badges_earned')
      .select('*')
      .eq('user_id', childId)
      .order('earned_at', { ascending: false });
    const childData: ChildData = {
      id: childId,
      full_name: childProfile.full_name || childProfile.email || 'Anak',
      email: childProfile.email || '',
      age_group: childProfile.age_group || '',
      onboarding_completed: childProfile.onboarding_completed || false,
      progress: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        total_xp: totalXP,
        current_lesson: currentLessonTitle,
        percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
      submissions: (subs || []).map(s => ({
        id: s.id,
        lesson_title: (s as any).lp_lessons?.title || 'Pelajaran',
        task_response: s.task_response || '',
        file_url: s.file_url,
        status: s.status,
        created_at: s.created_at,
      })),
      badges: (badges || []).map(b => ({
        badge_name: b.badge_name,
        badge_icon: b.badge_icon,
        earned_at: b.earned_at,
      })),
    };

    setChildren(prev => {
      const existing = prev.findIndex(c => c.id === childId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = childData;
        return updated;
      }
      return [...prev, childData];
    });

    if (!selectedChild) setSelectedChild(childId);
  };
  const handleSubmitFeedback = async () => {
    if (!user || !selectedChild || !weeklyRating) return;
    setSubmittingFeedback(true);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    await supabase.from('weekly_checkins').insert({
      parent_id: user.id,
      child_id: selectedChild,
      week_start: weekStart.toISOString().split('T')[0],
      rating: weeklyRating,
      comment: weeklyComment,
      improved: weeklyRating >= 3,
    });

    setFeedbackSent(true);
    setSubmittingFeedback(false);
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const currentChild = children.find(c => c.id === selectedChild);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">👨‍👩‍👧‍👦</div>
          <p className="text-gray-400">Memuatkan dashboard ibu bapa...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>👨‍👩‍👧</span> Dashboard Ibu Bapa
          </h1>
          <p className="text-gray-400 text-sm mt-1">Pantau perkembangan anak anda</p>
        </div>

        {/* Child selector (if multiple) */}
        {children.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedChild === child.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {child.full_name}
              </button>
            ))}
          </div>
        )}
        {currentChild ? (
          <>
            {/* Progress Overview Card */}
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{currentChild.full_name}</h2>
                  <p className="text-gray-400 text-sm">
                    {currentChild.age_group ? `Umur ${currentChild.age_group}` : 'Belum set umur'}
                    {currentChild.onboarding_completed ? ' — Onboarding selesai' : ' — Belum mula onboarding'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{currentChild.progress.total_xp}</div>
                  <div className="text-xs text-gray-500">Total XP</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress Keseluruhan</span>
                  <span className="text-white font-medium">{currentChild.progress.percent}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: currentChild.progress.percent + '%' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-gray-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{currentChild.progress.completed_lessons}</div>
                  <div className="text-xs text-gray-400">Selesai</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{currentChild.progress.total_lessons}</div>
                  <div className="text-xs text-gray-400">Jumlah</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{currentChild.badges.length}</div>
                  <div className="text-xs text-gray-400">Badge</div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-gray-700/20 rounded-xl">
                <span className="text-xs text-gray-500">Pelajaran Semasa:</span>
                <p className="text-sm text-amber-400 font-medium">{currentChild.progress.current_lesson}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { id: 'overview' as const, label: 'Ringkasan', emoji: '📊' },
                { id: 'submissions' as const, label: 'Tugasan', emoji: '📝' },
                { id: 'feedback' as const, label: 'Maklum Balas', emoji: '💬' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <span>{tab.emoji}</span> {tab.label}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Badges */}
                {currentChild.badges.length > 0 && (
                  <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-5">
                    <h3 className="text-white font-medium mb-3">Badge Diperoleh</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentChild.badges.map((b, i) => (
                        <span key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-sm text-amber-300">
                          {b.badge_icon} {b.badge_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips for parents */}
                <div className="bg-gray-800/60 rounded-2xl border border-blue-500/20 p-5">
                  <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                    <span>💡</span> Tips Untuk Ibu Bapa
                  </h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Tanya anak tentang pelajaran hari ini — dialog lebih berkesan daripada arahan</p>
                    <p>• Puji usaha, bukan hasil — "Saya bangga kamu cuba" lebih baik dari "Bagus markah kamu"</p>
                    <p>• Beri ruang untuk gagal — kegagalan adalah guru terbaik</p>
                    <p>• Beri maklum balas mingguan untuk bantu kami improve pengalaman anak anda</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'submissions' && (
              <div className="space-y-3">
                {currentChild.submissions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <div className="text-3xl mb-2">📭</div>
                    <p>Belum ada tugasan yang dihantar.</p>
                  </div>
                ) : (
                  currentChild.submissions.map(sub => (
                    <div key={sub.id} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{sub.lesson_title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sub.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                          sub.status === 'needs_revision' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {sub.status === 'approved' ? 'Diluluskan' : sub.status === 'needs_revision' ? 'Perlu perbaiki' : 'Dihantar'}
                        </span>
                      </div>
                      {sub.task_response && (
                        <p className="text-gray-400 text-sm line-clamp-3">{sub.task_response}</p>
                      )}
                      {sub.file_url && (
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                          📎 Lihat lampiran
                        </a>
                      )}
                      <div className="text-xs text-gray-600 mt-2">
                        {new Date(sub.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'feedback' && (
              <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-5">
                <h3 className="text-white font-medium mb-4">Maklum Balas Mingguan</h3>

                {feedbackSent ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-green-400 font-medium">Terima kasih! Maklum balas anda telah dihantar.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="text-sm text-gray-400 mb-2 block">Bagaimana perkembangan anak minggu ini?</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setWeeklyRating(star)}
                            className={`w-12 h-12 rounded-xl text-xl transition-all ${
                              star <= weeklyRating
                                ? 'bg-amber-500/20 border-amber-500/50 border'
                                : 'bg-gray-700/50 border border-gray-600/50 hover:border-gray-500'
                            }`}
                          >
                            {star <= weeklyRating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm text-gray-400 mb-2 block">Komen tambahan (pilihan)</label>
                      <textarea
                        value={weeklyComment}
                        onChange={(e) => setWeeklyComment(e.target.value)}
                        placeholder="Contoh: Anak lebih rajin buat kerja rumah minggu ini..."
                        rows={3}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!weeklyRating || submittingFeedback}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        !weeklyRating || submittingFeedback
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 hover:from-amber-400 hover:to-amber-500'
                      }`}
                    >
                      {submittingFeedback ? 'Menghantar...' : 'Hantar Maklum Balas'}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <h2 className="text-xl font-bold text-white mb-2">Tiada Data Anak</h2>
            <p className="text-gray-400 text-sm mb-6">Hubungkan akaun anak anda untuk mula melihat perkembangan mereka.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboardPage;
