import React, { useState, useEffect } from 'react';

interface ParentDashboardPageProps {
  userProfile?: {
    name?: string;
    age?: number;
  };
}

const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ userProfile }) => {
  const [streak, setStreak] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [parentPin, setParentPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'time' | 'settings'>('overview');

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
