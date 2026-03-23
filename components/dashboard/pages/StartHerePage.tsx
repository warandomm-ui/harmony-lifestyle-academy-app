import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

interface StartHerePageProps {
  onComplete?: (profile: StudentProfile) => void;
  onNavigate?: (view: string) => void;
}

interface StudentProfile {
  ageGroup: '7-12' | '13-17' | '';
  interests: string[];
  personality: string;
}

interface InterestItem {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const AGE_GROUPS = [
  { id: '7-12', label: 'Umur 7-12', desc: 'Asas kehidupan & penerokaan', emoji: 'ð±', color: 'from-green-500 to-emerald-600' },
  { id: '13-17', label: 'Umur 13-17', desc: 'Kemahiran hidup & projek sebenar', emoji: 'ð', color: 'from-blue-500 to-indigo-600' },
];

const PERSONALITIES = [
  { id: 'aktif', label: 'Aktif', emoji: 'â¡', desc: 'Suka bergerak & buat kerja' },
  { id: 'tenang', label: 'Tenang', emoji: 'ð§', desc: 'Suka berfikir & fokus' },
  { id: 'curious', label: 'Ingin Tahu', emoji: 'ð', desc: 'Selalu tanya & explore' },
];

const StartHerePage: React.FC<StartHerePageProps> = ({ onComplete, onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<StudentProfile>({ ageGroup: '', interests: [], personality: '' });
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbInterests, setDbInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Load interests from Supabase & check onboarding status
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch interests from DB
        const { data: interestsData } = await supabase
          .from('interests')
          .select('*')
          .order('category', { ascending: true });

        if (interestsData) setDbInterests(interestsData);

        // Check if user already completed onboarding
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('onboarding_completed, age_group, personality_data, interests')
            .eq('id', user.id)
            .single();

          if (profileData?.onboarding_completed) {
            setAlreadyDone(true);
            setProfile({
              ageGroup: (profileData.age_group as '7-12' | '13-17') || '',
              interests: profileData.interests || [],
              personality: profileData.personality_data?.type || ''
            });
            setShowResult(true);
          }
        }
      } catch (e) {
        console.error('Error loading start-here data:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const handleSelectAge = (value: string) => {
    setProfile(prev => ({ ...prev, ageGroup: value as '7-12' | '13-17' }));
    setTimeout(() => setStep(1), 300);
  };

  const handleToggleInterest = (interestId: string) => {
    setProfile(prev => {
      const current = prev.interests;
      const updated = current.includes(interestId)
        ? current.filter(i => i !== interestId)
        : current.length < 3 ? [...current, interestId] : current;
      return { ...prev, interests: updated };
    });
  };

  const handleConfirmInterests = () => {
    if (profile.interests.length > 0) setStep(2);
  };

  const handleSelectPersonality = async (value: string) => {
    const updated = { ...profile, personality: value };
    setProfile(updated);
    setSaving(true);

    try {
      if (user) {
        // Save to Supabase profiles
        await supabase
          .from('profiles')
          .update({
            age_group: updated.ageGroup,
            personality_data: { type: value },
            onboarding_completed: true,
            role: 'student'
          })
          .eq('id', user.id);

        // Save user interests
        const interestRows = updated.interests
          .map(name => {
            const found = dbInterests.find(i => i.id === name || i.name === name);
            return found ? { user_id: user.id, interest_id: found.id } : null;
          })
          .filter(Boolean);

        if (interestRows.length > 0) {
          // Delete existing interests first
          await supabase.from('user_interests').delete().eq('user_id', user.id);
          await supabase.from('user_interests').insert(interestRows);
        }
      }

      // Also save to localStorage as fallback
      localStorage.setItem('hla_student_profile', JSON.stringify(updated));
      localStorage.setItem('hla_start_here_done', 'true');
    } catch (e) {
      console.error('Error saving profile:', e);
      // Still save to localStorage
      localStorage.setItem('hla_student_profile', JSON.stringify(updated));
      localStorage.setItem('hla_start_here_done', 'true');
    } finally {
      setSaving(false);
      setShowResult(true);
    }
  };

  const handleStartPath = () => {
    if (onComplete) onComplete(profile as any);
    if (onNavigate) onNavigate('my-path');
  };

  const handleReset = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: false, age_group: null, personality_data: null })
        .eq('id', user.id);
      await supabase.from('user_interests').delete().eq('user_id', user.id);
    }
    localStorage.removeItem('hla_student_profile');
    localStorage.removeItem('hla_start_here_done');
    setShowResult(false);
    setAlreadyDone(false);
    setStep(0);
    setProfile({ ageGroup: '', interests: [], personality: '' });
  };

  const progressWidth = showResult ? 100 : ((step) / 3) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuatkan...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const selectedPersonality = PERSONALITIES.find(p => p.id === profile.personality);
    const selectedInterestNames = profile.interests.map(id => {
      const found = dbInterests.find(i => i.id === id || i.name === id);
      return found ? { icon: found.icon, name: found.name } : { icon: 'ð', name: id };
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">ð</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {alreadyDone ? 'Profil Kamu' : 'Laluan Kamu Dah Siap!'}
            </h1>
            <p className="text-gray-400">Berdasarkan profil kamu, ini laluan pembelajaran terbaik</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-400 mb-3">
              {profile.ageGroup === '7-12' ? 'ð± Laluan Penerokaan Muda' : 'ð Laluan Kemahiran Sebenar'}
            </h2>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Minat Kamu:</div>
              <div className="flex gap-2 flex-wrap">
                {selectedInterestNames.map((item, i) => (
                  <span key={i} className="text-sm bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                    {item.icon} {item.name}
                  </span>
                ))}
              </div>
            </div>

            {selectedPersonality && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Personaliti:</div>
                <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                  {selectedPersonality.emoji} {selectedPersonality.label}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Apa Yang Menanti Kamu</h3>
            <div className="space-y-3">
              {[
                { icon: 'ð', title: 'Pelajaran Interaktif', desc: 'Video + nota + tugasan praktikal' },
                { icon: 'â', title: 'Tugasan Hands-On', desc: 'Buat tugasan sebenar & upload bukti' },
                { icon: 'ð', title: 'XP & Lencana', desc: 'Kumpul mata XP & unlock pencapaian' },
                { icon: 'ð¨âð©âð§', title: 'Laporan Ibu Bapa', desc: 'Ibu bapa boleh pantau kemajuan' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-white font-medium">{item.title}</div>
                    <div className="text-gray-400 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartPath}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
          >
            Mula Belajar Sekarang â
          </button>
          <button
            onClick={handleReset}
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
          <p className="text-gray-400">3 langkah mudah untuk bina laluan kamu</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/30 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: progressWidth + '%' }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {['Umur', 'Minat', 'Personaliti'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ' +
                (i < step ? 'bg-amber-500 text-gray-900' :
                 i === step ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' :
                 'bg-gray-700 text-gray-500')
              }>
                {i < step ? 'â' : i + 1}
              </div>
              <span className={'text-sm hidden sm:inline ' + (i === step ? 'text-amber-400' : 'text-gray-500')}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 0: Age Group */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Berapa umur kamu?</h2>
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.id}
                onClick={() => handleSelectAge(ag.id)}
                className={
                  'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ' +
                  (profile.ageGroup === ag.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800')
                }
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

        {/* Step 1: Interests (from DB) */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-2">Apa minat kamu?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Pilih sehingga 3 minat</p>
            <div className="grid grid-cols-2 gap-3">
              {dbInterests.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggleInterest(item.id)}
                  className={
                    'p-4 rounded-2xl border-2 transition-all duration-200 text-center ' +
                    (profile.interests.includes(item.id)
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-500')
                  }
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-white font-medium text-sm">{item.name}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.category}</div>
                </button>
              ))}
            </div>
            {profile.interests.length > 0 && (
              <button
                onClick={handleConfirmInterests}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Seterusnya ({profile.interests.length}/3 dipilih) â
              </button>
            )}
          </div>
        )}

        {/* Step 2: Personality */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">Personaliti kamu?</h2>
            {PERSONALITIES.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectPersonality(item.id)}
                disabled={saving}
                className={
                  'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ' +
                  (saving ? 'opacity-50 cursor-not-allowed ' : '') +
                  (profile.personality === item.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500')
                }
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
            {saving && (
              <div className="text-center text-amber-400 text-sm mt-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-400 mx-auto mb-2"></div>
                Menyimpan profil kamu...
              </div>
            )}
          </div>
        )}

        {step > 0 && !saving && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-gray-400 hover:text-white text-sm flex items-center gap-1 mx-auto transition-colors"
          >
            â Kembali
          </button>
        )}
      </div>
    </div>
  );
};

export default StartHerePage;
