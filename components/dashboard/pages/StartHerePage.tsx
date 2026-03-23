import React, { useState } from 'react';

interface StartHerePageProps {
  onComplete?: (profile: StudentProfile) => void;
  onNavigate?: (view: string) => void;
}

interface StudentProfile {
  ageGroup: '7-12' | '13-17' | '';
  interest: string;
  personality: string;
}

const AGE_GROUPS = [
  { id: '7-12', label: 'Umur 7-12', desc: 'Asas kehidupan & penerokaan', emoji: '🌱', color: 'from-green-500 to-emerald-600' },
  { id: '13-17', label: 'Umur 13-17', desc: 'Kemahiran hidup & projek sebenar', emoji: '🚀', color: 'from-blue-500 to-indigo-600' },
];

const INTERESTS = [
  { id: 'nature', label: 'Alam & Sains', emoji: '🌿', desc: 'Teroka alam semulajadi' },
  { id: 'business', label: 'Bisnes & Wang', emoji: '💼', desc: 'Belajar urus duit' },
  { id: 'fitness', label: 'Kecergasan', emoji: '💪', desc: 'Jaga kesihatan badan' },
  { id: 'learning', label: 'Ilmu & Kreativiti', emoji: '📚', desc: 'Suka belajar benda baru' },
];

const PERSONALITIES = [
  { id: 'aktif', label: 'Aktif', emoji: '⚡', desc: 'Suka bergerak & buat kerja' },
  { id: 'tenang', label: 'Tenang', emoji: '🧘', desc: 'Suka berfikir & fokus' },
  { id: 'curious', label: 'Ingin Tahu', emoji: '🔍', desc: 'Selalu tanya & explore' },
];

const LEARNING_PATHS: Record<string, { title: string; weeks: { week: string; topic: string; task: string }[] }> = {
  '7-12': {
    title: 'Laluan Penerokaan Muda',
    weeks: [
      { week: 'Minggu 1-2', topic: 'Disiplin Diri', task: 'Buat jadual harian & ikut 7 hari' },
      { week: 'Minggu 3-4', topic: 'Kenali Alam', task: 'Projek mini alam sekitar' },
      { week: 'Minggu 5-6', topic: 'Kreativiti', task: 'Hasilkan karya kreatif pertama' },
      { week: 'Minggu 7-8', topic: 'Projek Mini', task: 'Tunjuk hasil kerja kepada keluarga' },
    ],
  },
  '13-17': {
    title: 'Laluan Kemahiran Sebenar',
    weeks: [
      { week: 'Minggu 1-2', topic: 'Disiplin & Mindset', task: 'Tetapkan matlamat & buat jurnal harian' },
      { week: 'Minggu 3-4', topic: 'Kemahiran Hidup', task: 'Belajar masak, urus wang, komunikasi' },
      { week: 'Minggu 5-6', topic: 'Projek Sebenar', task: 'Mula bisnes kecil atau projek komuniti' },
      { week: 'Minggu 7-8', topic: 'Jana Pendapatan', task: 'Lancar produk/servis pertama' },
    ],
  },
};

const StartHerePage: React.FC<StartHerePageProps> = ({ onComplete, onNavigate }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<StudentProfile>({ ageGroup: '', interest: '', personality: '' });
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (field: keyof StudentProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    setTimeout(() => {
      if (field === 'personality') {
        localStorage.setItem('hla_student_profile', JSON.stringify(updated));
        localStorage.setItem('hla_start_here_done', 'true');
        setShowResult(true);
      } else {
        setStep(step + 1);
      }
    }, 300);
  };

  const handleStartPath = () => {
    if (onComplete) onComplete(profile);
    if (onNavigate) onNavigate('my-path');
  };

  const progressWidth = showResult ? 100 : ((step) / 3) * 100;

  if (showResult) {
    const path = LEARNING_PATHS[profile.ageGroup] || LEARNING_PATHS['13-17'];
    const selectedInterest = INTERESTS.find(i => i.id === profile.interest);
    const selectedPersonality = PERSONALITIES.find(p => p.id === profile.personality);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Laluan Kamu Dah Siap!</h1>
            <p className="text-gray-400">Berdasarkan profil kamu, ini laluan pembelajaran terbaik</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-400 mb-1">{path.title}</h2>
            <div className="flex gap-3 mb-4">
              <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">{selectedInterest?.emoji} {selectedInterest?.label}</span>
              <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">{selectedPersonality?.emoji} {selectedPersonality?.label}</span>
            </div>
            <div className="space-y-3">
              {path.weeks.map((w, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">{i + 1}</div>
                  <div>
                    <div className="text-sm text-amber-400 font-medium">{w.week}</div>
                    <div className="text-white font-medium">{w.topic}</div>
                    <div className="text-gray-400 text-sm">{w.task}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartPath}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
          >
            Mula Belajar Sekarang →
          </button>

          <button
            onClick={() => { setShowResult(false); setStep(0); setProfile({ ageGroup: '', interest: '', personality: '' }); }}
            className="w-full mt-3 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            Ulang Semula
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mula Di Sini</h1>
          <p className="text-gray-400">3 soalan mudah untuk bina laluan kamu</p>
        </div>

        <div className="w-full bg-gray-700/30 rounded-full h-2 mb-8">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: progressWidth + '%' }} />
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {['Umur', 'Minat', 'Personaliti'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ' + (i < step ? 'bg-amber-500 text-gray-900' : i === step ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' : 'bg-gray-700 text-gray-500')}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={'text-sm hidden sm:inline ' + (i === step ? 'text-amber-400' : 'text-gray-500')}>{label}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Berapa umur kamu?</h2>
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.id}
                onClick={() => handleSelect('ageGroup', ag.id)}
                className={'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ' + (profile.ageGroup === ag.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800')}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{ag.emoji}</span>
                  <div>
                    <div className="text-white font-bold text-lg">{ag.label}</div>
                    <div className="text-gray-400 text-sm">{ag.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Apa minat utama kamu?</h2>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect('interest', item.id)}
                  className={'p-4 rounded-2xl border-2 transition-all duration-200 text-center ' + (profile.interest === item.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500')}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-white font-medium text-sm">{item.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Personaliti kamu?</h2>
            {PERSONALITIES.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect('personality', item.id)}
                className={'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ' + (profile.personality === item.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500')}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <div className="text-white font-bold">{item.label}</div>
                    <div className="text-gray-400 text-sm">{item.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-gray-400 hover:text-white text-sm flex items-center gap-1 mx-auto transition-colors"
          >
            ← Kembali
          </button>
        )}
      </div>
    </div>
  );
};

export default StartHerePage;
