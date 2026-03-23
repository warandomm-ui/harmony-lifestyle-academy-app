import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

interface ParentDashboardPageProps {
  onNavigate?: (view: string) => void;
}

interface ChildInfo {
  id: string;
  full_name: string;
  email: string;
  age_group: string | null;
  onboarding_completed: boolean;
  lessonsCompleted: number;
  totalLessons: number;
  totalXp: number;
}

const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [isParent, setIsParent] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    if (!user) { setLoading(false); return; }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData?.role === 'parent') {
        setIsParent(true);

        const { data: childLinks } = await supabase
          .from('parent_children')
          .select('child_id')
          .eq('parent_id', user.id);

        if (childLinks && childLinks.length > 0) {
          const childIds = childLinks.map(c => c.child_id);

          const { data: childProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, age_group, onboarding_completed')
            .in('id', childIds);

          if (childProfiles) {
            const childInfos: ChildInfo[] = [];

            for (const child of childProfiles) {
              const { data: progressData } = await supabase
                .from('lp_progress')
                .select('status, xp_earned')
                .eq('user_id', child.id);

              const lessonsCompleted = progressData?.filter(p => p.status === 'completed').length || 0;
              const totalXp = progressData?.reduce((acc, p) => acc + (p.xp_earned || 0), 0) || 0;

              const { count } = await supabase
                .from('lp_lessons')
                .select('id', { count: 'exact', head: true });

              childInfos.push({
                id: child.id,
                full_name: child.full_name || 'Pelajar',
                email: child.email || '',
                age_group: child.age_group,
                onboarding_completed: child.onboarding_completed || false,
                lessonsCompleted,
                totalLessons: count || 5,
                totalXp
              });
            }

            setChildren(childInfos);
          }
        }
      }
    } catch (e) {
      console.error('Error loading parent data:', e);
    } finally {
      setLoading(false);
    }
  };

  const becomeParent = async () => {
    if (!user) return;
    setLinking(true);

    try {
      await supabase
        .from('profiles')
        .update({ role: 'parent' })
        .eq('id', user.id);

      setIsParent(true);
    } catch (e) {
      console.error('Error setting parent role:', e);
    } finally {
      setLinking(false);
    }
  };

  const linkChild = async () => {
    if (!user || !childEmail.trim()) return;
    setLinking(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      const { data: childProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', childEmail.trim().toLowerCase())
        .single();

      if (!childProfile) {
        setLinkError('Email pelajar tidak dijumpai. Pastikan anak kamu sudah daftar akaun.');
        setLinking(false);
        return;
      }

      const { data: existing } = await supabase
        .from('parent_children')
        .select('id')
        .eq('parent_id', user.id)
        .eq('child_id', childProfile.id)
        .single();

      if (existing) {
        setLinkError('Anak ini sudah dipautkan ke akaun kamu.');
        setLinking(false);
        return;
      }

      await supabase
        .from('parent_children')
        .insert({ parent_id: user.id, child_id: childProfile.id });

      setLinkSuccess(`Berjaya! ${childProfile.full_name || childProfile.email} telah dipautkan.`);
      setChildEmail('');
      loadParentData();
    } catch (e) {
      setLinkError('Ralat semasa memautkan. Sila cuba lagi.');
    } finally {
      setLinking(false);
    }
  };

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

  if (!isParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <h1 className="text-2xl font-bold text-white mb-3">Mode Ibu Bapa</h1>
          <p className="text-gray-400 mb-6">
            Pantau kemajuan anak kamu dalam pembelajaran. Lihat pelajaran yang disiapkan, XP dikumpul, dan pencapaian mereka.
          </p>
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 mb-6 text-left">
            <h3 className="text-white font-bold mb-3">Apa yang kamu boleh buat:</h3>
            <div className="space-y-2">
              {[
                { icon: '📊', text: 'Lihat kemajuan pembelajaran anak' },
                { icon: '🏆', text: 'Lihat lencana & pencapaian' },
                { icon: '📝', text: 'Lihat tugasan yang disiapkan' },
                { icon: '🔗', text: 'Pautkan akaun anak dengan mudah' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={becomeParent}
            disabled={linking}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            {linking ? 'Mengaktifkan...' : 'Aktifkan Mode Ibu Bapa'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 mb-6">
          <h1 className="text-xl font-bold text-white mb-1">👨‍👩‍👧‍👦 Dashboard Ibu Bapa</h1>
          <p className="text-gray-400 text-sm">Pantau kemajuan anak-anak kamu</p>
        </div>

        {children.length > 0 ? (
          <div className="space-y-4 mb-6">
            {children.map(child => {
              const pct = child.totalLessons > 0
                ? Math.round((child.lessonsCompleted / child.totalLessons) * 100)
                : 0;

              return (
                <div key={child.id} className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">
                        👦
                      </div>
                      <div>
                        <div className="text-white font-bold">{child.full_name}</div>
                        <div className="text-gray-500 text-xs">{child.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-400">{child.totalXp}</div>
                      <div className="text-gray-500 text-xs">XP</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={
                      'text-xs px-2 py-1 rounded-full ' +
                      (child.age_group
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-700 text-gray-500')
                    }>
                      {child.age_group ? `Umur ${child.age_group}` : 'Belum set umur'}
                    </span>
                    <span className={
                      'text-xs px-2 py-1 rounded-full ' +
                      (child.onboarding_completed
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400')
                    }>
                      {child.onboarding_completed ? '✓ Onboarding selesai' : '⏳ Belum onboard'}
                    </span>
                  </div>

                  <div className="w-full bg-gray-700/30 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all"
                      style={{ width: pct + '%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{child.lessonsCompleted}/{child.totalLessons} pelajaran selesai</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-8 mb-6 text-center">
            <div className="text-4xl mb-3">👶</div>
            <p className="text-gray-400 mb-2">Belum ada anak dipautkan</p>
            <p className="text-gray-500 text-sm">Pautkan akaun anak kamu di bawah</p>
          </div>
        )}

        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5">
          <h3 className="text-lg font-bold text-white mb-3">🔗 Pautkan Anak</h3>
          <p className="text-gray-400 text-sm mb-4">Masukkan email akaun anak kamu untuk memautkan</p>

          <div className="flex gap-2">
            <input
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              placeholder="Email anak (cth: anak@gmail.com)"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={linkChild}
              disabled={linking || !childEmail.trim()}
              className={
                'px-6 py-3 rounded-xl font-bold transition-all ' +
                (linking || !childEmail.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 hover:from-amber-400 hover:to-amber-500')
              }
            >
              {linking ? '...' : 'Paut'}
            </button>
          </div>

          {linkError && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {linkError}
            </div>
          )}
          {linkSuccess && (
            <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {linkSuccess}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
