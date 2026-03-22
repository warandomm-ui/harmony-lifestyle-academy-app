import React, { useState, useEffect } from 'react';
import type { StudentLearningPath, ParentWeeklyCheckIn } from '../../../types';

interface ParentDashboardPageProps {
  userProfile?: {
    name?: string;
    age?: number;
  };
  learningPath?: StudentLearningPath | null;
  onApproveTask?: (levelIndex: number, lessonIndex: number, feedback: string) => void;
}

const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ userProfile, learningPath, onApproveTask }) => {
  const [streak, setStreak] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [parentPin, setParentPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'learning-path' | 'time' | 'settings'>('overview');
  const [feedbackText, setFeedbackText] = useState('');
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<ParentWeeklyCheckIn[]>(() => {
    const saved = localStorage.getItem('hla_parent_checkins');
    return saved ? JSON.parse(saved) : [];
  });
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInRating, setCheckInRating] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    const savedPin = localStorage.getItem('hla_parent_pin');
    if (!savedPin) {
      setIsAuthenticated(true); // First time - no pin set yet
    }
    setStreak(parseInt(localStorage.getItem('hla_streak') || '0'));
    const chapters = JSON.parse(localStorage.getItem('hla_completed_chapters') || '[]');
    setCompletedChapters(chapters);
    setTotalXP(parseInt(localStorage.getItem('hla_total_xp') || '0'));
  }, []);

  const handlePinSubmit = () => {
    const savedPin = localStorage.getItem('hla_parent_pin');
    if (pinInput === savedPin) {
      setIsAuthenticated(true);
      setPinInput('');
    }
  };

  const handleSetPin = () => {
    if (parentPin.length === 4) {
      localStorage.setItem('hla_parent_pin', parentPin);
      setParentPin('');
    }
  };

  const weeklyActivity = () => {
    const days = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'];
    const today = new Date().getDay();
    return days.map((day, i) => ({
      day,
      active: i <= today && Math.random() > 0.3,
    }));
  };

  const subjectProgress = [
    { name: 'Matematik', progress: Math.min(completedChapters.filter(c => c.startsWith('m')).length * 10, 100) },
    { name: 'Sains', progress: Math.min(completedChapters.filter(c => c.startsWith('s')).length * 10, 100) },
    { name: 'B. Melayu', progress: Math.min(completedChapters.filter(c => c.startsWith('bm')).length * 10, 100) },
    { name: 'English', progress: Math.min(completedChapters.filter(c => c.startsWith('e')).length * 10, 100) },
    { name: 'Sejarah', progress: Math.min(completedChapters.filter(c => c.startsWith('sej')).length * 10, 100) },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Parent Access</h2>
          <p className="text-gray-500 text-sm mb-6">Masukkan PIN 4 digit untuk akses</p>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-2xl tracking-widest border-2 border-purple-200 rounded-xl p-3 mb-4 focus:border-purple-500 focus:outline-none"
            placeholder="●●●●"
          />
          <button
            onClick={handlePinSubmit}
            className="w-full bg-purple-600 text-white rounded-xl py-3 font-semibold hover:bg-purple-700 transition-colors"
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👨‍👩‍👧 Dashboard Ibu Bapa</h1>
            <p className="text-gray-500 text-sm mt-1">Pantau perkembangan anak anda</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Pelajar</p>
            <p className="font-semibold text-gray-700">{userProfile?.name || 'Anak Anda'}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: 'overview' as const, label: 'Ringkasan', icon: '📊' },
          { key: 'progress' as const, label: 'Kemajuan', icon: '📚' },
          { key: 'learning-path' as const, label: 'Learning Path', icon: '🧭' },
          { key: 'time' as const, label: 'Masa Belajar', icon: '⏰' },
          { key: 'settings' as const, label: 'Tetapan', icon: '⚙️' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-purple-50'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-2xl font-bold text-orange-500">{streak} hari</p>
              <p className="text-xs text-gray-500">Login Berturut-turut</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-2xl font-bold text-yellow-500">{totalXP} XP</p>
              <p className="text-xs text-gray-500">Jumlah Mata</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-2">📖</div>
              <p className="text-2xl font-bold text-blue-500">{completedChapters.length}</p>
              <p className="text-xs text-gray-500">Bab Selesai</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-2xl font-bold text-purple-500">Level {Math.floor(totalXP / 100) + 1}</p>
              <p className="text-xs text-gray-500">Tahap Semasa</p>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Aktiviti Mingguan</h3>
            <div className="flex justify-between">
              {weeklyActivity().map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    day.active
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {day.active ? '✓' : '−'}
                  </div>
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insight */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-5 text-white shadow-sm">
            <h3 className="font-semibold mb-2">💡 Pemerhatian</h3>
            <p className="text-sm opacity-90">
              {streak >= 7
                ? 'Tahniah! Anak anda konsisten belajar selama ' + streak + ' hari berturut-turut. Teruskan sokongan!'
                : streak >= 3
                ? 'Anak anda sedang membina tabiat belajar yang baik. ' + streak + ' hari berturut-turut setakat ini.'
                : 'Galakkan anak anda untuk belajar setiap hari bagi membina konsistensi.'}
            </p>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Kemajuan Mengikut Subjek</h3>
            <div className="space-y-4">
              {subjectProgress.map((subject, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                    <span className="text-sm text-gray-500">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: subject.progress + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Bab Terbaru Diselesaikan</h3>
            {completedChapters.length > 0 ? (
              <div className="space-y-2">
                {completedChapters.slice(-5).reverse().map((chapter, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm text-gray-700">{chapter}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Belum ada bab diselesaikan lagi</p>
            )}
          </div>
        </div>
      )}

      {/* Learning Path Tab */}
      {activeTab === 'learning-path' && (
        <div className="space-y-4">
          {learningPath ? (
            <>
              {/* Path Overview */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">🧭 Learning Path Progress</h3>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm text-gray-500">Age Group: <strong>{learningPath.ageGroup}</strong></span>
                  <span className="text-sm text-gray-500">Style: <strong className="capitalize">{learningPath.personality}</strong></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${learningPath.totalLessons > 0 ? (learningPath.completedLessons / learningPath.totalLessons) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{learningPath.completedLessons} of {learningPath.totalLessons} lessons completed</p>
              </div>

              {/* Submissions Needing Approval */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">✅ Tasks to Review</h3>
                {learningPath.levels.flatMap((level, li) =>
                  level.lessons
                    .map((lesson, lei) => ({ lesson, li, lei, levelTitle: level.title }))
                    .filter(({ lesson }) => lesson.status === 'completed' && lesson.submission && !lesson.submission.parentApproved)
                ).length === 0 ? (
                  <p className="text-sm text-gray-400">No tasks waiting for approval</p>
                ) : (
                  <div className="space-y-3">
                    {learningPath.levels.flatMap((level, li) =>
                      level.lessons
                        .map((lesson, lei) => ({ lesson, li, lei, levelTitle: level.title }))
                        .filter(({ lesson }) => lesson.status === 'completed' && lesson.submission && !lesson.submission.parentApproved)
                    ).map(({ lesson, li, lei, levelTitle }) => (
                      <div key={lesson.id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-800">{lesson.title}</p>
                            <p className="text-xs text-gray-500">Level: {levelTitle}</p>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                        </div>
                        <div className="p-3 bg-white rounded-lg mb-3">
                          <p className="text-xs text-gray-500 mb-1">Child's submission ({lesson.submission?.type}):</p>
                          <p className="text-sm text-gray-700">{lesson.submission?.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Leave feedback..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="flex-1 text-sm border rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              onApproveTask?.(li, lei, feedbackText);
                              setFeedbackText('');
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            Approve ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Check-In */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">📋 Weekly Check-In</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">How was your child's progress this week?</p>
                    <div className="flex gap-2 mb-3">
                      {([1, 2, 3, 4, 5] as const).map(r => (
                        <button
                          key={r}
                          onClick={() => setCheckInRating(r)}
                          className={`text-2xl transition-transform ${checkInRating >= r ? 'scale-110' : 'opacity-40'}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    placeholder="Any notes about your child's progress, attitude, or areas to improve..."
                    rows={3}
                    className="w-full border rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => {
                      if (!checkInNotes.trim()) return;
                      const newCheckIn: ParentWeeklyCheckIn = {
                        id: `ci_${Date.now()}`,
                        weekNumber: weeklyCheckIns.length + 1,
                        date: new Date().toISOString(),
                        childProgress: `${learningPath.completedLessons}/${learningPath.totalLessons} lessons`,
                        parentNotes: checkInNotes,
                        rating: checkInRating,
                      };
                      const updated = [...weeklyCheckIns, newCheckIn];
                      setWeeklyCheckIns(updated);
                      localStorage.setItem('hla_parent_checkins', JSON.stringify(updated));
                      setCheckInNotes('');
                      setCheckInRating(3);
                    }}
                    className="w-full py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Submit Check-In
                  </button>
                </div>

                {weeklyCheckIns.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Previous Check-Ins</p>
                    {weeklyCheckIns.slice(-3).reverse().map(ci => (
                      <div key={ci.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Week {ci.weekNumber}</span>
                          <span className="text-xs text-gray-400">{new Date(ci.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{ci.parentNotes}</p>
                        <p className="text-xs text-gray-400 mt-1">{'⭐'.repeat(ci.rating)} · Progress: {ci.childProgress}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-4xl mb-3">🧭</div>
              <p className="text-gray-600">Your child hasn't started their learning path yet.</p>
              <p className="text-sm text-gray-400 mt-1">They need to complete the "Start Here" section first.</p>
            </div>
          )}
        </div>
      )}

      {/* Time Tab */}
      {activeTab === 'time' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Masa Belajar Hari Ini</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#8b5cf6" strokeWidth="10"
                    strokeDasharray="314" strokeDashoffset="200" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">36</span>
                  <span className="text-xs text-gray-500">minit</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">Sasaran harian: 60 minit</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Had Masa Skrin (Coming Soon)</h3>
            <p className="text-sm text-gray-500">
              Ciri ini akan datang tidak lama lagi. Anda akan dapat menetapkan had masa belajar harian untuk anak anda.
            </p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">🔐 Tetapkan PIN Ibu Bapa</h3>
            <p className="text-sm text-gray-500 mb-3">PIN 4 digit untuk mengakses dashboard ini</p>
            <div className="flex gap-3">
              <input
                type="password"
                maxLength={4}
                value={parentPin}
                onChange={(e) => setParentPin(e.target.value.replace(/\D/g, ''))}
                className="flex-1 text-center text-xl tracking-widest border-2 border-gray-200 rounded-xl p-2 focus:border-purple-500 focus:outline-none"
                placeholder="4 digit"
              />
              <button
                onClick={handleSetPin}
                disabled={parentPin.length !== 4}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">🔔 Notifikasi (Coming Soon)</h3>
            <p className="text-sm text-gray-500">
              Dapatkan laporan mingguan melalui email tentang kemajuan anak anda.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">📧 Hubungi Guru (Coming Soon)</h3>
            <p className="text-sm text-gray-500">
              Berhubung terus dengan guru atau mentor anak anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboardPage;
