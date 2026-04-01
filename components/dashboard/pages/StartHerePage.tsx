import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../supabase/client';

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
  { id: 'tech', label: 'Teknologi', emoji: '💻', desc: 'Coding & digital' },
  { id: 'art', label: 'Seni & Muzik', emoji: '🎨', desc: 'Kreatif & ekspresif' },
];

const PERSONALITIES = [
  { id: 'aktif', label: 'Aktif', emoji: '⚡', desc: 'Suka bergerak & buat kerja' },
  { id: 'tenang', label: 'Tenang', emoji: '🧘', desc: 'Suka berfikir & fokus' },
  { id: 'curious', label: 'Ingin Tahu', emoji: '🔍', desc: 'Selalu tanya & explore' },
  { id: 'social', label: 'Sosial', emoji: '🤝', desc: 'Suka kerja dalam kumpulan' },
];
const StartHerePage: React.FC<StartHerePageProps> = ({ onComplete, onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<StudentProfile>({ ageGroup: '', interest: '', personality: '' });
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  // Check if onboarding already done
  useEffect(() => {
    if (!user) return;
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed, age_group, personality_data, interests')
        .eq('id', user.id)
        .single();

      if (data?.onboarding_completed) {
        setProfile({
          ageGroup: (data.age_group || '') as any,
          interest: data.interests?.[0] || '',
          personality: data.personality_data?.type || '',
        });
        await loadLearningPath(data.age_group || '13-17');
        setShowResult(true);
      }
    };
    checkOnboarding();
  }, [user]);

  const loadLearningPath = async (ageGroup: string) => {
    const { data: path } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('age_group', ageGroup)
      .single();

    if (path) {
      setLearningPath(path);
      const { data: lpLessons } = await supabase
        .from('lp_lessons')
        .select('*')
        .eq('learning_path_id', path.id)
        .order('order_index');
      setLessons(lpLessons || []);
    }
  };
  const handleSelect = async (field: keyof StudentProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);

    setTimeout(async () => {
      if (field === 'personality') {
        setSaving(true);
        // Save to Supabase profiles table
        if (user) {
          await supabase
            .from('profiles')
            .update({
              age_group: updated.ageGroup,
              interests: [updated.interest],
              personality_data: { type: updated.personality },
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }
        // Also keep localStorage for offline/fallback
        localStorage.setItem('hla_student_profile', JSON.stringify(updated));
        localStorage.setItem('hla_start_here_done', 'true');

        await loadLearningPath(updated.ageGroup || '13-17');
        setSaving(false);
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

  // Loading screen while saving
  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎯</div>
          <h2 className="text-xl font-bold text-white mb-2">Menyediakan laluan kamu...</h2>
          <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }
  // Result screen
  if (showResult) {
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

          {learningPath && (
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{learningPath.icon}</span>
                <h2 className="text-xl font-bold text-amber-400">{learningPath.title}</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">{learningPath.description}</p>

              <div className="flex gap-3 mb-5">
                {selectedInterest && (
                  <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                    {selectedInterest.emoji} {selectedInterest.label}
                  </span>
                )}
                {selectedPersonality && (
                  <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                    {selectedPersonality.emoji} {selectedPersonality.label}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{lesson.title}</div>
                      <div className="text-gray-400 text-sm">{lesson.description}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-amber-400/70">⭐ {lesson.xp_reward} XP</span>
                        {lesson.duration_minutes && (
                          <span className="text-xs text-gray-500">⏱ {lesson.duration_minutes} min</span>
                        )}
                        {lesson.requires_upload && (
                          <span className="text-xs text-blue-400/70">📸 Upload</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleStartPath}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
          >
            Mula Belajar Sekarang →
          </button>

          <button
            onClick={() => {
              setShowResult(false);
              setStep(0);
              setProfile({ ageGroup: '', interest: '', personality: '' });
            }}
            className="w-full mt-3 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            Ulang Semula
          </button>
        </div>
      </div>
    );
  }
  // Onboarding steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mula Di Sini</h1>
          <p className="text-gray-400">3 soalan mudah untuk bina laluan kamu</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700/30 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: progressWidth + '%' }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {['Umur', 'Minat', 'Personaliti'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ' +
                (i < step ? 'bg-amber-500 text-gray-900' :
                  i === step ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' :
                  'bg-gray-700 text-gray-500')}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={'text-sm hidden sm:inline ' + (i === step ? 'text-amber-400' : 'text-gray-500')}>{label}</span>
            </div>
          ))}
        </div>
        {/* Step 0: Age */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Berapa umur kamu?</h2>
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.id}
                onClick={() => handleSelect('ageGroup', ag.id)}
                className={'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ' +
                  (profile.ageGroup === ag.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800')}
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

        {/* Step 1: Interest */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Apa minat utama kamu?</h2>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect('interest', item.id)}
                  className={'p-4 rounded-2xl border-2 transition-all duration-200 text-center ' +
                    (profile.interest === item.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-500')}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-white font-medium text-sm">{item.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Step 2: Personality */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Personaliti kamu?</h2>
            {PERSONALITIES.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect('personality', item.id)}
                className={'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ' +
                  (profile.personality === item.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500')}
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
