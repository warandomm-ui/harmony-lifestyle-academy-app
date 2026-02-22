import React, { useState, useRef, useEffect, useCallback } from 'react';
import { extractTextFromPDF, askTutor, generateSmartNotes, generateExamQuestions, checkAnswer } from '../../../../services/studyHubService';
import { useGamification } from '../../../../contexts/GamificationContext';
import { useToast } from '../../../../contexts/ToastContext';

type ActiveTab = 'tutor' | 'notes' | 'exam';
type NoteType = 'summary' | 'keypoints' | 'flashcards' | 'mindmap';
type QuestionType = 'objective' | 'subjective' | 'mixed';
type Difficulty = 'easy' | 'medium' | 'hard';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface UploadedDoc {
  name: string;
  content: string;
  uploadedAt: number;
  pageCount?: number;
}

const STORAGE_KEY = 'harmony_study_hub_docs';

const AIStudyHub: React.FC = () => {
  const { addPoints } = useGamification();
  const { addToast } = useToast();

  // Document state
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<UploadedDoc | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutor');

  // Tutor state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notes state
  const [activeNoteType, setActiveNoteType] = useState<NoteType>('summary');
  const [generatedNotes, setGeneratedNotes] = useState<Record<string, string>>({});
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  // Exam state
  const [questionType, setQuestionType] = useState<QuestionType>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [generatedExam, setGeneratedExam] = useState('');
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);

  // Load saved docs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: UploadedDoc[] = JSON.parse(saved);
        setDocuments(parsed);
        if (parsed.length > 0) setActiveDoc(parsed[0]);
      }
    } catch {}
  }, []);

  // Save docs
  const saveDocs = useCallback((docs: UploadedDoc[]) => {
    try {
      // Only save metadata, not full content (too large for localStorage)
      // Content stays in memory during session
      const toSave = docs.map(d => ({ ...d, content: d.content.slice(0, 500) + '...[truncated]' }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle PDF upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      addToast('Sila upload fail PDF sahaja.', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      addToast('Fail terlalu besar. Maximum 20MB.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Membaca PDF...');

    try {
      setUploadProgress('AI sedang baca nota kamu... 📖');
      const content = await extractTextFromPDF(file);

      const newDoc: UploadedDoc = {
        name: file.name.replace('.pdf', ''),
        content,
        uploadedAt: Date.now(),
      };

      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      setActiveDoc(newDoc);
      saveDocs(updatedDocs);
      
      // Reset states for new doc
      setChatHistory([]);
      setGeneratedNotes({});
      setGeneratedExam('');

      addPoints(15, `uploading study material: ${newDoc.name}`);
      addToast(`"${newDoc.name}" berjaya dimuat naik! 📚`, 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      addToast('Gagal membaca PDF. Sila cuba lagi.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, []);

  // Tutor chat
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeDoc || isTutorLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput.trim(), timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTutorLoading(true);

    try {
      const historyForAPI = chatHistory.map(m => ({ role: m.role, text: m.text }));
      const response = await askTutor(activeDoc.content, userMsg.text, historyForAPI);
      
      const aiMsg: ChatMessage = { role: 'model', text: response, timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiMsg]);
      addPoints(5, 'asking tutor a question');
    } catch {
      const errorMsg: ChatMessage = { role: 'model', text: 'Maaf, ada masalah. Cuba tanya lagi! 🙏', timestamp: Date.now() };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Generate notes
  const handleGenerateNotes = async (type: NoteType) => {
    if (!activeDoc || isGeneratingNotes) return;
    
    const cacheKey = `${activeDoc.name}_${type}`;
    if (generatedNotes[cacheKey]) {
      setActiveNoteType(type);
      return;
    }

    setActiveNoteType(type);
    setIsGeneratingNotes(true);

    try {
      const result = await generateSmartNotes(activeDoc.content, type);
      setGeneratedNotes(prev => ({ ...prev, [cacheKey]: result }));
      addPoints(10, `generating ${type} notes`);
      addToast(`${type === 'summary' ? 'Ringkasan' : type === 'keypoints' ? 'Key Points' : type === 'flashcards' ? 'Flashcards' : 'Mind Map'} siap! ✨`, 'success');
    } catch {
      addToast('Gagal generate nota. Cuba lagi.', 'error');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Generate exam
  const handleGenerateExam = async () => {
    if (!activeDoc || isGeneratingExam) return;
    setIsGeneratingExam(true);
    setAnswerFeedback('');

    try {
      const result = await generateExamQuestions(activeDoc.content, questionType, difficulty, questionCount);
      setGeneratedExam(result);
      addPoints(10, 'generating exam practice');
      addToast('Soalan latihan siap! Selamat menjawab! 📝', 'success');
    } catch {
      addToast('Gagal generate soalan. Cuba lagi.', 'error');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Check student answer
  const handleCheckAnswer = async () => {
    if (!activeDoc || !studentAnswer.trim() || !selectedQuestion.trim() || isCheckingAnswer) return;
    setIsCheckingAnswer(true);

    try {
      const result = await checkAnswer(activeDoc.content, selectedQuestion, studentAnswer);
      setAnswerFeedback(result);
      addPoints(10, 'submitting answer for checking');
    } catch {
      addToast('Tak dapat check jawapan. Cuba lagi.', 'error');
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  // Delete document
  const handleDeleteDoc = (docName: string) => {
    const updated = documents.filter(d => d.name !== docName);
    setDocuments(updated);
    saveDocs(updated);
    if (activeDoc?.name === docName) {
      setActiveDoc(updated[0] || null);
      setChatHistory([]);
      setGeneratedNotes({});
      setGeneratedExam('');
    }
    addToast('Dokumen dipadam.', 'info');
  };

  // Format AI text with basic markdown
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-[var(--foreground)]">$1</h3>')
      .replace(/^### (.*$)/gm, '<h4 class="text-md font-bold mt-3 mb-1 text-[var(--foreground)]">$1</h4>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^---$/gm, '<hr class="my-4 border-[var(--border)]"/>')
      .replace(/\n/g, '<br/>');
  };

  // ========== RENDER ==========

  // No document uploaded - show upload screen
  if (!activeDoc) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">📚 AI Study Hub</h1>
          <p className="text-[var(--muted)]">Upload nota atau textbook, AI jadi tutor peribadi kamu</p>
        </div>

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group"
        >
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          
          {isUploading ? (
            <div className="animate-pulse">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-lg font-bold text-[var(--primary)]">{uploadProgress}</p>
              <p className="text-sm text-[var(--muted)] mt-2">Tunggu sekejap...</p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
              <p className="text-lg font-bold text-[var(--foreground)] mb-2">Drag & Drop PDF di sini</p>
              <p className="text-[var(--muted)] text-sm mb-4">atau klik untuk pilih fail</p>
              <span className="inline-block bg-[var(--primary)] text-white px-6 py-2 rounded-full font-bold text-sm">
                Upload PDF
              </span>
              <p className="text-xs text-[var(--muted)] mt-4">Supports: PDF (max 20MB) · Textbook, nota, latihan</p>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🎓', title: 'AI Tutor', desc: 'Tanya apa-apa, AI explain' },
            { icon: '📝', title: 'Smart Notes', desc: 'Auto-generate ringkasan' },
            { icon: '📋', title: 'Exam Practice', desc: 'AI buat soalan latihan' },
          ].map(f => (
            <div key={f.title} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-bold text-sm text-[var(--foreground)]">{f.title}</p>
              <p className="text-xs text-[var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main study interface
  const currentNoteCache = `${activeDoc.name}_${activeNoteType}`;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">📚 AI Study Hub</h1>
          <p className="text-sm text-[var(--muted)]">Powered by Gemini AI · FREE</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95"
        >
          + Upload PDF
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Document Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {documents.map(doc => (
          <div
            key={doc.name}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all ${
              activeDoc.name === doc.name
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--secondary)] text-[var(--muted)] hover:bg-[var(--primary)]/10'
            }`}
          >
            <span onClick={() => {
              setActiveDoc(doc);
              setChatHistory([]);
              setGeneratedNotes({});
              setGeneratedExam('');
            }}>
              📄 {doc.name.length > 25 ? doc.name.slice(0, 25) + '...' : doc.name}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.name); }}
              className="ml-1 opacity-60 hover:opacity-100 text-xs"
              title="Padam"
            >✕</button>
          </div>
        ))}
      </div>

      {/* Loading overlay for upload */}
      {isUploading && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-4 text-center animate-pulse">
          <p className="text-lg font-bold text-[var(--primary)]">{uploadProgress}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-[var(--secondary)] rounded-xl p-1 mb-6">
        {([
          { key: 'tutor' as ActiveTab, icon: '🎓', label: 'AI Tutor' },
          { key: 'notes' as ActiveTab, icon: '📝', label: 'Smart Notes' },
          { key: 'exam' as ActiveTab, icon: '📋', label: 'Latihan Exam' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: AI TUTOR ===== */}
      {activeTab === 'tutor' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {/* Chat messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎓</div>
                <p className="font-bold text-[var(--foreground)] mb-2">AI Tutor Ready!</p>
                <p className="text-sm text-[var(--muted)] mb-4">Tanya apa-apa pasal "{activeDoc.name}"</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Terangkan topik utama', 'Buat contoh mudah', 'Apa yang penting untuk exam?'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="text-xs bg-[var(--secondary)] px-3 py-1.5 rounded-full text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[var(--primary)] text-white rounded-br-md'
                    : 'bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-md'
                }`}>
                  {msg.role === 'model' ? (
                    <div 
                      className="text-sm leading-relaxed prose-sm"
                      dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} 
                    />
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {isTutorLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--secondary)] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-[var(--border)] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tanya AI Tutor..."
                className="flex-1 bg-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                disabled={isTutorLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isTutorLoading}
                className="bg-[var(--primary)] text-white px-5 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40"
              >
                Hantar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: SMART NOTES ===== */}
      {activeTab === 'notes' && (
        <div>
          {/* Note type selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {([
              { key: 'summary' as NoteType, icon: '📋', label: 'Ringkasan' },
              { key: 'keypoints' as NoteType, icon: '🔑', label: 'Key Points' },
              { key: 'flashcards' as NoteType, icon: '🃏', label: 'Flashcards' },
              { key: 'mindmap' as NoteType, icon: '🗺️', label: 'Mind Map' },
            ]).map(nt => (
              <button
                key={nt.key}
                onClick={() => handleGenerateNotes(nt.key)}
                disabled={isGeneratingNotes}
                className={`p-4 rounded-xl border text-center font-bold text-sm transition-all active:scale-95 ${
                  activeNoteType === nt.key
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="text-2xl mb-1">{nt.icon}</div>
                {nt.label}
                {generatedNotes[`${activeDoc.name}_${nt.key}`] && (
                  <div className="text-xs text-green-500 mt-1">✅ Siap</div>
                )}
              </button>
            ))}
          </div>

          {/* Generated notes display */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 min-h-[300px]">
            {isGeneratingNotes ? (
              <div className="text-center py-12 animate-pulse">
                <div className="text-5xl mb-4">🤖</div>
                <p className="font-bold text-[var(--primary)]">AI sedang generate {activeNoteType}...</p>
                <p className="text-sm text-[var(--muted)] mt-2">Tunggu 10-30 saat</p>
              </div>
            ) : generatedNotes[currentNoteCache] ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--foreground)]">
                    {activeNoteType === 'summary' ? '📋 Ringkasan' : activeNoteType === 'keypoints' ? '🔑 Key Points' : activeNoteType === 'flashcards' ? '🃏 Flashcards' : '🗺️ Mind Map'}
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedNotes[currentNoteCache]);
                      addToast('Nota disalin ke clipboard!', 'success');
                    }}
                    className="text-xs bg-[var(--secondary)] px-3 py-1.5 rounded-full text-[var(--muted)] hover:text-[var(--primary)] transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
                <div 
                  className="text-sm leading-relaxed text-[var(--foreground)] prose-sm"
                  dangerouslySetInnerHTML={{ __html: formatText(generatedNotes[currentNoteCache]) }} 
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="font-bold text-[var(--foreground)] mb-2">Pilih jenis nota di atas</p>
                <p className="text-sm text-[var(--muted)]">AI akan generate dari "{activeDoc.name}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: EXAM PRACTICE ===== */}
      {activeTab === 'exam' && (
        <div>
          {/* Exam settings */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-[var(--foreground)] mb-4">⚙️ Tetapan Soalan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Question type */}
              <div>
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">Jenis Soalan</label>
                <div className="flex flex-col gap-2">
                  {([
                    { key: 'objective' as QuestionType, label: 'Objektif (A/B/C/D)' },
                    { key: 'subjective' as QuestionType, label: 'Subjektif (Essay)' },
                    { key: 'mixed' as QuestionType, label: 'Campuran' },
                  ]).map(qt => (
                    <button
                      key={qt.key}
                      onClick={() => setQuestionType(qt.key)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        questionType === qt.key
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]'
                          : 'bg-[var(--secondary)] text-[var(--muted)] border border-transparent'
                      }`}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">Tahap Kesukaran</label>
                <div className="flex flex-col gap-2">
                  {([
                    { key: 'easy' as Difficulty, label: '🟢 Senang (Form 1-2)' },
                    { key: 'medium' as Difficulty, label: '🟡 Sederhana (PT3/Form 4)' },
                    { key: 'hard' as Difficulty, label: '🔴 Susah (SPM/KBAT)' },
                  ]).map(d => (
                    <button
                      key={d.key}
                      onClick={() => setDifficulty(d.key)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        difficulty === d.key
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]'
                          : 'bg-[var(--secondary)] text-[var(--muted)] border border-transparent'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">Bilangan Soalan</label>
                <div className="flex flex-col gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        questionCount === n
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]'
                          : 'bg-[var(--secondary)] text-[var(--muted)] border border-transparent'
                      }`}
                    >
                      {n} soalan
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateExam}
              disabled={isGeneratingExam}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isGeneratingExam ? '🤖 Sedang generate soalan...' : '📋 Generate Soalan Latihan'}
            </button>
          </div>

          {/* Generated exam */}
          {generatedExam && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--foreground)]">📋 Soalan Latihan</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedExam);
                    addToast('Soalan disalin ke clipboard!', 'success');
                  }}
                  className="text-xs bg-[var(--secondary)] px-3 py-1.5 rounded-full text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  📋 Copy
                </button>
              </div>
              <div 
                className="text-sm leading-relaxed text-[var(--foreground)] prose-sm max-h-[500px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: formatText(generatedExam) }} 
              />
            </div>
          )}

          {/* Answer checker */}
          {generatedExam && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--foreground)] mb-4">✍️ Semak Jawapan</h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">Copy soalan yang kamu nak jawab:</label>
                  <textarea
                    value={selectedQuestion}
                    onChange={e => setSelectedQuestion(e.target.value)}
                    placeholder="Paste soalan di sini..."
                    className="w-full bg-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none h-20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">Jawapan kamu:</label>
                  <textarea
                    value={studentAnswer}
                    onChange={e => setStudentAnswer(e.target.value)}
                    placeholder="Tulis jawapan kamu di sini..."
                    className="w-full bg-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none h-24"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckAnswer}
                disabled={!studentAnswer.trim() || !selectedQuestion.trim() || isCheckingAnswer}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {isCheckingAnswer ? '🤖 Sedang semak...' : '✅ Semak Jawapan'}
              </button>

              {answerFeedback && (
                <div className="mt-4 bg-[var(--secondary)] rounded-xl p-4">
                  <div 
                    className="text-sm leading-relaxed text-[var(--foreground)] prose-sm"
                    dangerouslySetInnerHTML={{ __html: formatText(answerFeedback) }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIStudyHub;
