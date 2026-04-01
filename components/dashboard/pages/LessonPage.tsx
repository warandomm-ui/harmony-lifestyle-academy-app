import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../supabase/client';

interface LessonPageProps {
  lessonId?: string;
  onNavigate?: (view: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LessonPage: React.FC<LessonPageProps> = ({ lessonId, onNavigate }) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<'learn' | 'do' | 'share'>('learn');
  const [taskResponse, setTaskResponse] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState<any>(null);

  // AI Tutor state
  const [showTutor, setShowTutor] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const resolvedLessonId = lessonId || localStorage.getItem('hla_current_lesson_id') || '';

  useEffect(() => {
    if (!resolvedLessonId || !user) return;
    loadLesson();
    loadProfile();
  }, [resolvedLessonId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const loadLesson = async () => {
    if (!user) return;
    setLoading(true);

    const { data: lessonData } = await supabase
      .from('lp_lessons')
      .select('*, learning_paths(*)')
      .eq('id', resolvedLessonId)
      .single();

    if (lessonData) {
      setLesson(lessonData);
      setLearningPath(lessonData.learning_paths);
    }
    // Load progress
    const { data: prog } = await supabase
      .from('lp_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', resolvedLessonId)
      .single();

    if (prog) {
      setProgress(prog);
      if (prog.status === 'completed') {
        setCompleted(true);
        setActiveStep('share');
      } else if (prog.status === 'in_progress') {
        setActiveStep('do');
      }
    }

    // Load existing submission
    const { data: submission } = await supabase
      .from('lesson_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', resolvedLessonId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (submission) {
      setTaskResponse(submission.task_response || '');
      setUploadUrl(submission.file_url || '');
    }
    // Load tutor messages
    const { data: tutorMsgs } = await supabase
      .from('ai_tutor_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', resolvedLessonId)
      .order('created_at', { ascending: true });

    if (tutorMsgs && tutorMsgs.length > 0) {
      setMessages(tutorMsgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    }

    setLoading(false);
  };

  const markInProgress = async () => {
    if (!user || !lesson) return;
    if (!progress) {
      await supabase.from('lp_progress').insert({
        user_id: user.id,
        lesson_id: lesson.id,
        learning_path_id: lesson.learning_path_id,
        status: 'in_progress',
      });
    }
  };

  const handleStartTask = () => {
    markInProgress();
    setActiveStep('do');
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${resolvedLessonId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('lesson-uploads')
      .upload(fileName, file, { upsert: true });

    if (data && !error) {
      const { data: urlData } = supabase.storage.from('lesson-uploads').getPublicUrl(data.path);
      setUploadUrl(urlData.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmitTask = async () => {
    if (!user || !lesson) return;
    setCompleting(true);

    // Save submission
    await supabase.from('lesson_submissions').upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      task_response: taskResponse,
      file_url: uploadUrl || null,
      status: 'submitted',
    }, { onConflict: 'user_id,lesson_id' }).select();
    // If no onConflict works, just insert
    if (!taskResponse && !uploadUrl) {
      setCompleting(false);
      return;
    }

    // Update progress to completed
    const { data: existingProgress } = await supabase
      .from('lp_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .single();

    if (existingProgress) {
      await supabase.from('lp_progress').update({
        status: 'completed',
        xp_earned: lesson.xp_reward,
        completed_at: new Date().toISOString(),
      }).eq('id', existingProgress.id);
    } else {
      await supabase.from('lp_progress').insert({
        user_id: user.id,
        lesson_id: lesson.id,
        learning_path_id: lesson.learning_path_id,
        status: 'completed',
        xp_earned: lesson.xp_reward,
        completed_at: new Date().toISOString(),
      });
    }
    // Award badge for first lesson
    const { data: allProgress } = await supabase
      .from('lp_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (allProgress && allProgress.length === 1) {
      await supabase.from('badges_earned').insert({
        user_id: user.id,
        badge_name: 'Pelajar Pertama',
        badge_icon: '🌟',
        lesson_id: lesson.id,
      });
    }

    setCompleted(true);
    setActiveStep('share');
    setCompleting(false);
  };

  // AI Tutor
  const sendTutorMessage = async () => {
    if (!tutorInput.trim() || !user || !lesson) return;
    const userMsg = tutorInput.trim();
    setTutorInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTutorLoading(true);
    // Save user message to DB
    await supabase.from('ai_tutor_messages').insert({
      user_id: user.id,
      lesson_id: lesson.id,
      role: 'user',
      content: userMsg,
      age_group: profile?.age_group,
      personality: profile?.personality_data?.type,
    });

    // Call AI tutor (Supabase Edge Function or fallback)
    try {
      const response = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: userMsg,
          lessonTitle: lesson.title,
          lessonContent: lesson.content?.substring(0, 500),
          ageGroup: profile?.age_group || '13-17',
          personality: profile?.personality_data?.type || 'curious',
          history: messages.slice(-6),
        },
      });

      const aiReply = response.data?.reply || 'Maaf, saya tidak dapat menjawab sekarang. Cuba lagi ya!';
      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);

      // Save assistant message
      await supabase.from('ai_tutor_messages').insert({
        user_id: user.id,
        lesson_id: lesson.id,
        role: 'assistant',
        content: aiReply,
        age_group: profile?.age_group,
        personality: profile?.personality_data?.type,
      });    } catch (err) {
      // Fallback response if edge function not deployed yet
      const fallback = getFallbackResponse(userMsg, lesson, profile);
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);

      await supabase.from('ai_tutor_messages').insert({
        user_id: user.id,
        lesson_id: lesson.id,
        role: 'assistant',
        content: fallback,
      });
    }

    setTutorLoading(false);
  };

  const getFallbackResponse = (msg: string, lesson: any, profile: any): string => {
    const isYoung = profile?.age_group === '7-12';
    const greeting = isYoung ? 'Hai! 😊' : 'Hey! 👋';
    const lessonTitle = lesson?.title || 'pelajaran ini';

    if (msg.toLowerCase().includes('tak faham') || msg.toLowerCase().includes('susah')) {
      return `${greeting} Tak apa, jangan risau! "${lessonTitle}" memang perlukan masa untuk faham. Cuba baca semula bahagian yang susah tu, dan kalau masih tak faham, tulis bahagian mana yang kamu stuck. Saya akan cuba bantu! 💪`;
    }
    if (msg.toLowerCase().includes('contoh')) {
      return `${greeting} Contoh yang baik untuk "${lessonTitle}" — cuba fikir tentang pengalaman harian kamu sendiri. Apa situasi yang berkaitan dengan topik ini yang pernah kamu alami? Berkongsi pengalaman sendiri adalah cara terbaik untuk belajar! ✨`;
    }
    if (msg.toLowerCase().includes('tugasan') || msg.toLowerCase().includes('task')) {
      return `${greeting} Untuk tugasan "${lessonTitle}", yang penting adalah kamu CUBA dulu. Tak perlu sempurna! Tulis apa yang kamu fikir dan rasa. Setiap usaha itu bernilai. ${isYoung ? 'Minta bantuan ibu/ayah kalau perlu ya! 🌟' : 'Go for it! 🚀'}`;
    }
    return `${greeting} Soalan bagus! Untuk topik "${lessonTitle}", ingat — belajar itu proses. Tak perlu rush. Cuba explore satu langkah pada satu masa. Ada apa-apa lagi yang kamu nak tanya? 😊`;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Memuatkan pelajaran...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 text-center py-20">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-gray-400">Pelajaran tidak dijumpai.</p>
        <button onClick={() => onNavigate?.('my-path')} className="mt-4 text-amber-400 hover:text-amber-300">
          ← Kembali ke Laluan
        </button>
      </div>
    );
  }

  const steps = [
    { id: 'learn' as const, label: 'Belajar', emoji: '📖', desc: 'Baca & faham' },
    { id: 'do' as const, label: 'Buat', emoji: '✍️', desc: 'Siapkan tugasan' },
    { id: 'share' as const, label: 'Kongsi', emoji: '🎉', desc: 'Hantar & kongsi' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => onNavigate?.('my-path')}
          className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          ← Kembali ke Laluan
        </button>

        {/* Lesson header */}
        <div className="mb-6">
          <div className="text-xs text-amber-400/60 font-medium mb-1">
            {learningPath?.title} — Pelajaran #{lesson.order_index}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full">⭐ {lesson.xp_reward} XP</span>
            {lesson.duration_minutes && (
              <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full">⏱ {lesson.duration_minutes} min</span>
            )}
          </div>
        </div>
        {/* Step tabs */}
        <div className="flex gap-2 mb-6 bg-gray-800/50 rounded-xl p-1">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                if (s.id === 'learn') setActiveStep('learn');
                if (s.id === 'do' && (activeStep === 'do' || activeStep === 'share' || progress)) setActiveStep('do');
                if (s.id === 'share' && completed) setActiveStep('share');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeStep === s.id
                  ? 'bg-amber-500/20 text-amber-400'
                  : completed || (s.id === 'learn') || (s.id === 'do' && progress)
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <span>{s.emoji}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        {/* STEP 1: Learn */}
        {activeStep === 'learn' && (
          <div>
            {/* Video */}
            {lesson.video_url && (
              <div className="mb-6 rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <a
                    href={lesson.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-3xl">▶️</span>
                    </div>
                    <span className="text-sm">Tonton Video</span>
                  </a>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 sm:p-6 mb-6">
              <div className="prose prose-invert prose-sm max-w-none">
                {lesson.content?.split('\n').map((line: string, i: number) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-amber-400 mt-3 mb-1">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split('**');                    return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-amber-400">•</span><span className="text-gray-300"><strong className="text-white">{parts[0]}</strong>{parts[1]}</span></div>;
                  }
                  if (line.startsWith('- ')) return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-amber-400">•</span><span className="text-gray-300">{line.replace('- ', '')}</span></div>;
                  if (line.match(/^\d+\.\s\*\*/)) {
                    const parts = line.replace(/^\d+\.\s\*\*/, '').split('**');
                    return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-amber-400">{line.match(/^\d+/)?.[0]}.</span><span className="text-gray-300"><strong className="text-white">{parts[0]}</strong>{parts[1]}</span></div>;
                  }
                  if (line.match(/^\d+\.\s/)) return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-amber-400">{line.match(/^\d+/)?.[0]}.</span><span className="text-gray-300">{line.replace(/^\d+\.\s/, '')}</span></div>;
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return <p key={i} className="text-gray-300 mb-2">{line}</p>;
                })}
              </div>
            </div>

            <button
              onClick={handleStartTask}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
            >
              Saya Dah Faham — Mula Tugasan ✍️
            </button>
          </div>
        )}
        {/* STEP 2: Do */}
        {activeStep === 'do' && (
          <div>
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-amber-500/30 p-5 sm:p-6 mb-6">
              <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                <span>✍️</span> Tugasan Kamu
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap">{lesson.task_instruction}</p>
            </div>

            {/* Text response */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Jawapan / Refleksi Kamu</label>
              <textarea
                value={taskResponse}
                onChange={(e) => setTaskResponse(e.target.value)}
                placeholder="Tulis jawapan kamu di sini..."
                rows={6}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
              />
            </div>
            {/* File upload */}
            {lesson.requires_upload && (
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">📸 Upload Bukti (gambar/dokumen)</label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-gray-500 transition-colors">
                  {uploadUrl ? (
                    <div>
                      <span className="text-green-400 text-sm">✅ Fail telah dimuat naik</span>
                      <p className="text-xs text-gray-500 mt-1 break-all">{uploadUrl.split('/').pop()}</p>
                    </div>
                  ) : uploading ? (
                    <span className="text-amber-400 text-sm animate-pulse">Memuat naik...</span>
                  ) : (
                    <label className="cursor-pointer">
                      <span className="text-gray-400 text-sm">Klik atau seret fail ke sini</span>
                      <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitTask}
              disabled={completing || (!taskResponse.trim() && !uploadUrl)}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                completing || (!taskResponse.trim() && !uploadUrl)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-green-500/25'
              }`}
            >
              {completing ? 'Menghantar...' : 'Hantar Tugasan & Selesai ✅'}
            </button>
          </div>
        )}
        {/* STEP 3: Share / Completed */}
        {activeStep === 'share' && completed && (
          <div className="text-center">
            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-green-500/30 p-8 mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Tahniah!</h2>
              <p className="text-gray-400 mb-4">Kamu telah selesaikan "{lesson.title}"</p>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full">
                <span className="text-amber-400 font-bold">+{lesson.xp_reward} XP</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.('my-path')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
            >
              Teruskan ke Pelajaran Seterusnya →
            </button>
          </div>
        )}
      </div>

      {/* Floating AI Tutor Button */}
      {!showTutor && (
        <button
          onClick={() => setShowTutor(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50"
          title="Tanya Tutor AI"
        >
          🤖
        </button>
      )}
      {/* AI Tutor Chat Panel */}
      {showTutor && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[70vh] sm:h-[500px] bg-gray-900 border border-gray-700 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col z-50">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-white font-medium text-sm">HLA Tutor AI</h3>
                <p className="text-gray-500 text-xs">Tanya apa sahaja tentang pelajaran ini</p>
              </div>
            </div>
            <button
              onClick={() => setShowTutor(false)}
              className="text-gray-500 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">👋</div>
                <p className="text-gray-400 text-sm">Hai! Saya tutor AI kamu.</p>
                <p className="text-gray-500 text-xs mt-1">Tanya apa sahaja tentang "{lesson.title}"</p>
                <div className="mt-4 space-y-2">
                  {['Saya tak faham pelajaran ini', 'Bagi contoh?', 'Macam mana nak buat tugasan?'].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setTutorInput(q); }}
                      className="block w-full text-left text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 text-amber-100 rounded-br-none'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {tutorLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendTutorMessage()}
                placeholder="Tanya soalan..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              <button
                onClick={sendTutorMessage}
                disabled={!tutorInput.trim() || tutorLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium disabled:opacity-50 hover:from-purple-400 hover:to-indigo-500 transition-all"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPage;
