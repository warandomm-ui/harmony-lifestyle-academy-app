import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

interface LessonPageProps {
  lessonId?: string;
  onNavigate?: (view: string) => void;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  content: string | null;
  task_instruction: string;
  requires_upload: boolean;
  order_index: number;
  xp_reward: number;
  duration_minutes: number;
  learning_path_id: string;
}

interface ProgressData {
  status: string;
  upload_url: string | null;
  xp_earned: number;
  completed_at: string | null;
}

const LessonPage: React.FC<LessonPageProps> = ({ lessonId, onNavigate }) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskResponse, setTaskResponse] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [currentStep, setCurrentStep] = useState<'learn' | 'do' | 'share'>('learn');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && lessonId) {
      loadLesson();
    } else if (user && !lessonId) {
      loadCurrentLesson();
    }
  }, [user, lessonId]);

  const loadCurrentLesson = async () => {
    if (!user) return;
    try {
      // Find the user's current lesson (first incomplete)
      const { data: progressData } = await supabase
        .from('lp_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const completedIds = (progressData || [])
        .filter(p => p.status === 'completed')
        .map(p => p.lesson_id);

      // Get all lessons
      const { data: lessons } = await supabase
        .from('lp_lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (lessons && lessons.length > 0) {
        const nextLesson = lessons.find(l => !completedIds.includes(l.id)) || lessons[0];
        setLesson(nextLesson);
        await loadProgress(nextLesson.id);
      }
    } catch (err) {
      console.error('Error loading current lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async () => {
    if (!user || !lessonId) return;
    try {
      const { data } = await supabase
        .from('lp_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (data) {
        setLesson(data);
        await loadProgress(data.id);
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (lid: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('lp_progress')
      .select('status, upload_url, xp_earned, completed_at')
      .eq('user_id', user.id)
      .eq('lesson_id', lid)
      .single();

    if (data) {
      setProgress(data);
      if (data.status === 'completed') {
        setCompleted(true);
        setCurrentStep('share');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !lesson) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${lesson.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('lesson-uploads')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('lesson-uploads')
        .getPublicUrl(fileName);

      setUploadedUrl(urlData.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal muat naik. Cuba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !lesson) return;
    setCompleting(true);

    try {
      // Upsert progress
      const { error: progError } = await supabase
        .from('lp_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          learning_path_id: lesson.learning_path_id,
          status: 'completed',
          upload_url: uploadedUrl,
          xp_earned: lesson.xp_reward,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (progError) {
        // If upsert fails due to no unique constraint, try insert
        await supabase.from('lp_progress').insert({
          user_id: user.id,
          lesson_id: lesson.id,
          learning_path_id: lesson.learning_path_id,
          status: 'completed',
          upload_url: uploadedUrl,
          xp_earned: lesson.xp_reward,
          completed_at: new Date().toISOString()
        });
      }

      // Save submission
      if (taskResponse || uploadedUrl) {
        await supabase.from('lesson_submissions').insert({
          user_id: user.id,
          lesson_id: lesson.id,
          task_response: taskResponse,
          file_url: uploadedUrl,
          status: 'submitted'
        });
      }

      // Check for badge
      const { data: completedCount } = await supabase
        .from('lp_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const count = completedCount?.length || 0;

      // Badge milestones
      const badges: Record<number, string> = {
        1: 'Langkah Pertama',
        3: 'Pelajar Rajin',
        5: 'Anak Berdisiplin'
      };

      if (badges[count]) {
        try {
          await supabase.from('badges_earned').insert({
            user_id: user.id,
            badge_name: badges[count],
            badge_icon: count === 1 ? 'â­' : count === 3 ? 'ð' : 'ð',
            lesson_id: lesson.id
          });
          setBadgeEarned(badges[count]);
        } catch {} // Ignore if badge already exists
      }

      // Check level up (every 5 lessons)
      if (count > 0 && count % 5 === 0) {
        setLevelUp(true);
      }

      setCompleted(true);
    } catch (err) {
      console.error('Error completing lesson:', err);
      alert('Ralat. Cuba lagi.');
    } finally {
      setCompleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>ð</div>
          <p style={{ color: '#d4af37' }}>Memuatkan pelajaran...</p>
        </div>
      </div>
    );
  }

  // No lesson found
  if (!lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>ð</div>
        <h2 style={{ color: '#d4af37', marginBottom: '12px' }}>Tiada Pelajaran</h2>
        <p style={{ color: '#999', marginBottom: '24px' }}>Mulakan laluan pembelajaran anda dahulu.</p>
        <button
          onClick={() => onNavigate?.('start-here')}
          style={{
            background: 'linear-gradient(135deg, #d4af37, #b8962e)',
            color: '#1a1a2e',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Mula Di Sini
        </button>
      </div>
    );
  }

  // Badge / Level Up celebration overlay
  if (badgeEarned || levelUp) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '500px', textAlign: 'center', padding: '40px 20px',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
          {badgeEarned ? 'ð' : 'ð'}
        </div>
        <h1 style={{ color: '#d4af37', fontSize: '2rem', marginBottom: '12px' }}>
          {badgeEarned ? 'Tahniah! Badge Diperoleh!' : 'Naik Level!'}
        </h1>
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
          border: '2px solid #d4af37',
          borderRadius: '20px',
          padding: '30px 40px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
            {badgeEarned ? 'â­' : 'ð'}
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '8px' }}>
            {badgeEarned ? `"${badgeEarned}"` : 'Level Baru Dibuka!'}
          </h2>
          <p style={{ color: '#ccc' }}>
            {badgeEarned
              ? 'Kamu telah menunjukkan usaha yang hebat!'
              : 'Teruskan perjalanan pembelajaran kamu!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setBadgeEarned(null); setLevelUp(false); }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Lihat Pelajaran
          </button>
          <button
            onClick={() => onNavigate?.('my-path')}
            style={{
              background: 'linear-gradient(135deg, #d4af37, #b8962e)',
              color: '#1a1a2e',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            Pelajaran Seterusnya â
          </button>
        </div>
      </div>
    );
  }

  // Main Lesson View
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      {/* Lesson Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ color: '#999', fontSize: '0.85rem' }}>
            Pelajaran {lesson.order_index}
          </span>
          <span style={{ color: '#555' }}>â¢</span>
          <span style={{ color: '#d4af37', fontSize: '0.85rem' }}>
            +{lesson.xp_reward} XP
          </span>
          <span style={{ color: '#555' }}>â¢</span>
          <span style={{ color: '#999', fontSize: '0.85rem' }}>
            {lesson.duration_minutes} min
          </span>
        </div>
        <h1 style={{ color: '#fff', fontSize: '1.6rem', margin: 0, lineHeight: 1.3 }}>
          {lesson.title}
        </h1>
        {lesson.description && (
          <p style={{ color: '#aaa', marginTop: '8px', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {lesson.description}
          </p>
        )}
      </div>

      {/* Step Tabs: Learn â Do â Share */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px'
      }}>
        {(['learn', 'do', 'share'] as const).map((step, i) => {
          const labels = ['ð Belajar', 'ð ï¸ Buat', 'ð¤ Kongsi'];
          const isActive = currentStep === step;
          const isDone = (step === 'learn' && (currentStep === 'do' || currentStep === 'share')) ||
                         (step === 'do' && currentStep === 'share');
          return (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              style={{
                flex: 1,
                padding: '10px 8px',
                background: isActive
                  ? 'linear-gradient(135deg, #d4af37, #b8962e)'
                  : 'transparent',
                color: isActive ? '#1a1a2e' : isDone ? '#d4af37' : '#888',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {isDone ? 'â ' : ''}{labels[i]}
            </button>
          );
        })}
      </div>

      {/* STEP 1: Learn */}
      {currentStep === 'learn' && (
        <div>
          {/* Video Section */}
          {lesson.video_url ? (
            <div style={{
              background: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '20px',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <iframe
                src={lesson.video_url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(26,26,46,0.9))',
              borderRadius: '16px',
              padding: '40px 24px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(212,175,55,0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>ð¥</div>
              <p style={{ color: '#d4af37', fontWeight: 600, marginBottom: '8px' }}>
                Video akan datang
              </p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                Baca kandungan di bawah untuk memulakan pelajaran ini
              </p>
            </div>
          )}

          {/* Content Section */}
          {lesson.content && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              lineHeight: 1.7,
              color: '#ddd',
              fontSize: '0.95rem'
            }}>
              {lesson.content}
            </div>
          )}

          <button
            onClick={() => setCurrentStep('do')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #d4af37, #b8962e)',
              color: '#1a1a2e',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Saya Faham â Buat Tugasan
          </button>
        </div>
      )}

      {/* STEP 2: Do Task */}
      {currentStep === 'do' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(26,26,46,0.9))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.5rem' }}>ð ï¸</span>
              <h3 style={{ color: '#d4af37', margin: 0 }}>Tugasan Kamu</h3>
            </div>
            <p style={{ color: '#ddd', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
              {lesson.task_instruction}
            </p>
          </div>

          {/* Text Response */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
              âï¸ Jawapan / Catatan Kamu:
            </label>
            <textarea
              value={taskResponse}
              onChange={(e) => setTaskResponse(e.target.value)}
              placeholder="Tulis jawapan atau cerita kamu di sini..."
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                fontSize: '0.95rem',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* File Upload */}
          {lesson.requires_upload && (
            <div style={{
              border: '2px dashed rgba(212,175,55,0.3)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {uploading ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>â³</div>
                  <p style={{ color: '#d4af37' }}>Memuat naik...</p>
                </div>
              ) : uploadedUrl ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>â</div>
                  <p style={{ color: '#4ade80', fontWeight: 600 }}>Fail dimuat naik!</p>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>Klik untuk tukar fail</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>ð¤</div>
                  <p style={{ color: '#ccc', fontWeight: 600 }}>Muat Naik Gambar / Fail</p>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>
                    Klik di sini untuk pilih fail (JPG, PNG, PDF)
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setCurrentStep('share')}
            disabled={!taskResponse && !uploadedUrl}
            style={{
              width: '100%',
              background: (taskResponse || uploadedUrl)
                ? 'linear-gradient(135deg, #d4af37, #b8962e)'
                : 'rgba(255,255,255,0.1)',
              color: (taskResponse || uploadedUrl) ? '#1a1a2e' : '#666',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: (taskResponse || uploadedUrl) ? 'pointer' : 'not-allowed'
            }}
          >
            Seterusnya â Selesai & Kongsi
          </button>
        </div>
      )}

      {/* STEP 3: Share / Complete */}
      {currentStep === 'share' && (
        <div>
          {completed ? (
            /* Already completed view */
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>ð</div>
              <h2 style={{ color: '#4ade80', marginBottom: '12px' }}>Pelajaran Selesai!</h2>
              <p style={{ color: '#ccc', marginBottom: '8px' }}>
                Kamu dapat <strong style={{ color: '#d4af37' }}>+{lesson.xp_reward} XP</strong>
              </p>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '32px' }}>
                Teruskan usaha, setiap langkah kecil membawa perubahan besar.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate?.('my-path')}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #b8962e)',
                    color: '#1a1a2e',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Pelajaran Seterusnya â
                </button>
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Confirm & complete */
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#d4af37', marginTop: 0, marginBottom: '16px' }}>
                  ð Ringkasan Tugasan Kamu
                </h3>
                {taskResponse && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 4px' }}>Jawapan:</p>
                    <p style={{ color: '#ddd', margin: 0, lineHeight: 1.6 }}>{taskResponse}</p>
                  </div>
                )}
                {uploadedUrl && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 4px' }}>Fail dimuat naik:</p>
                    <p style={{ color: '#4ade80', margin: 0 }}>â Berjaya dimuat naik</p>
                  </div>
                )}
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'rgba(212,175,55,0.1)',
                  borderRadius: '10px',
                  borderLeft: '3px solid #d4af37'
                }}>
                  <p style={{ color: '#d4af37', margin: 0, fontSize: '0.9rem' }}>
                    ð Kamu akan dapat <strong>+{lesson.xp_reward} XP</strong> selepas selesai
                  </p>
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={completing}
                style={{
                  width: '100%',
                  background: completing
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg, #4ade80, #22c55e)',
                  color: completing ? '#888' : '#1a1a2e',
                  border: 'none',
                  padding: '18px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: completing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {completing ? 'â³ Menyimpan...' : 'â Tandakan Selesai'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back to My Path */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={() => onNavigate?.('my-path')}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          â Kembali ke Laluan Saya
        </button>
      </div>
    </div>
  );
};

export default LessonPage;
