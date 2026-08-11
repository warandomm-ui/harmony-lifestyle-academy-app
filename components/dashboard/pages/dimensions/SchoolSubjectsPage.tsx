import React, { useState, useCallback } from 'react';
import type { DashboardMode, DashboardView, UserProfile, AnalysisResult } from '../../../../types';
import { generateContent } from '../../../../services/aiProxyService';
import {
  SUBJECTS,
  TINGKATAN,
  TINGKATAN_LABELS,
  TRACK_ORDER,
  TRACK_LABELS,
  type Subject,
  type Chapter,
  type TingkatanKey,
} from '../../../../constants/curriculum';

// ───────────────────────────────────────────────────────────
// SCHOOL SUBJECTS PAGE — Akademi Sekolah / School Academy
//
// 22 subjects x Tingkatan 1-5, KSSM-aligned, bilingual EN/BM.
// Syllabus data lives in constants/curriculum.ts so the public
// landing page and this page render the same catalogue.
//
// Subjects are grouped by track (core / elective / islamic).
// Nothing is hidden by religion: the Islamic Studies track is
// offered to every student alongside the academic subjects.
// AI-generated lessons via the aiProxyService.
// ───────────────────────────────────────────────────────────

interface GeneratedLesson {
  title: string;
  explanation: string;
  keyPoints: string[];
  example: string;
  practiceQuestion: string;
  practiceAnswer: string;
}


// ── AI Lesson Generator ──
const generateLesson = async (subject: string, chapter: string, tingkatan: string, isMuslim: boolean, userProfile: any, userResults: any, difficulty: string): Promise<GeneratedLesson> => {
  const lang = isMuslim ? "Bahasa Malaysia" : "English";

  // Build personalized context from user profile
  let personalContext = "";
  if (userProfile) {
    personalContext += "STUDENT PROFILE:\n";
    personalContext += "- Name: " + userProfile.name + "\n";
    if (userProfile.age) personalContext += "- Age: " + userProfile.age + " years old\n";
    if (userProfile.religion) personalContext += "- Religion: " + userProfile.religion + "\n";
    if (userProfile.state) personalContext += "- State: " + userProfile.state + "\n";
  }

  if (userResults) {
    personalContext += "PERSONALITY & LEARNING STYLE:\n";
    personalContext += "- Personality Type: " + (userResults.personalityType || "") + "\n";
    if (userResults.studentProfile?.mbti?.type) personalContext += "- MBTI: " + userResults.studentProfile.mbti.type + "\n";
    if (userResults.studentProfile?.disc?.style) personalContext += "- DISC Style: " + userResults.studentProfile.disc.style + "\n";
    if (userResults.studentProfile?.temperament?.type) personalContext += "- Temperament: " + userResults.studentProfile.temperament.type + "\n";
    if (userResults.studentProfile?.multipleIntelligences?.topIntelligences) {
      personalContext += "- Top Intelligences: " + userResults.studentProfile.multipleIntelligences.topIntelligences.join(", ") + "\n";
    }
    if (userResults.studentProfile?.enneagram?.type) personalContext += "- Enneagram: " + userResults.studentProfile.enneagram.type + "\n";
    if (userResults.overallSummary) personalContext += "- Summary: " + userResults.overallSummary + "\n";
  }

  const baseContext = isMuslim
    ? "You are a Malaysian school tutor. Explain in Bahasa Malaysia. Use simple BM that Form 1-5 students understand. Give Malaysian context examples (RM for money, local places, SPM format)."
    : "You are a Malaysian school tutor. Explain in English. Use simple English that Form 1-5 students understand. Give Malaysian context examples where relevant.";

  const personalizationInstructions = personalContext
    ? "\n\nIMPORTANT - PERSONALIZE the lesson for this specific student:\n" + personalContext + "\nAdapt your teaching style to match their personality and learning preferences. For example:\n- If they are Visual learner (Spatial intelligence): use diagrams, charts, visual descriptions\n- If they are Kinesthetic (Bodily-Kinesthetic): use hands-on examples, real-world applications\n- If they are Linguistic: use storytelling, word-based explanations\n- If they are Logical-Mathematical: use step-by-step logic, patterns\n- Match their temperament: Sanguine=fun examples, Melancholic=detailed/thorough, Choleric=goal-oriented, Phlegmatic=calm/supportive\n"
    : "";

  const prompt = baseContext + personalizationInstructions + "\n\nSubject: " + subject + "\nTopic: " + chapter + "\nLevel: " + tingkatan + "\nCurriculum: KSSM Malaysia\n\nGenerate a lesson in this EXACT JSON format (no markdown, no backticks):\n{\n  \"title\": \"" + chapter + "\",\n  \"explanation\": \"Clear explanation of the topic in 3-4 paragraphs in " + lang + "\",\n  \"keyPoints\": [\"point 1\", \"point 2\", \"point 3\", \"point 4\", \"point 5\"],\n  \"example\": \"One worked example with step-by-step solution\",\n  \"practiceQuestion\": \"One practice question for the student\",\n  \"practiceAnswer\": \"The answer with explanation\"\n}\n\nDifficulty Level: " + difficulty + "\nAdjust complexity: easy=simple language with more examples, medium=standard KSSM level, hard=advanced challenging concepts.\n\nAfter the main lesson, also include a Quiz Section with 5 multiple-choice questions in HTML format using this structure:\n<div class=\"quiz-section\"><h3>Quiz Time!</h3><div class=\"quiz-q\"><p><strong>Q1:</strong> question</p><label><input type=\"radio\" name=\"q1\" value=\"a\"> A) option</label><br><label><input type=\"radio\" name=\"q1\" value=\"b\"> B) option</label><br><label><input type=\"radio\" name=\"q1\" value=\"c\"> C) option</label><br><label><input type=\"radio\" name=\"q1\" value=\"d\"> D) option</label><p class=\"answer\" style=\"display:none\">Answer: A</p></div></div>\nRepeat for all 5 questions. Make quiz appropriate for the difficulty level.";

  try {
    const text = await generateContent(prompt, { jsonMode: true });
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("AI lesson generation failed:", err);
    return {
      title: chapter,
      explanation: isMuslim ? "Maaf, gagal menjana pelajaran. Sila cuba lagi." : "Sorry, failed to generate lesson. Please try again.",
      keyPoints: [],
      example: "",
      practiceQuestion: "",
      practiceAnswer: "",
    };
  }
};

// ═══ MAIN COMPONENT ═══
interface SchoolSubjectsPageProps {
  dashboardMode: DashboardMode;
  userProfile?: UserProfile;
  userResults?: AnalysisResult;
  /**
   * Opens a dedicated in-app module: subjects carrying a `linkedView`
   * (Tilawah, Hadis) and the Chemistry periodic-table shortcut.
   */
  onNavigate?: (view: DashboardView) => void;
}

const SchoolSubjectsPage: React.FC<SchoolSubjectsPageProps> = ({ dashboardMode, userProfile, userResults, onNavigate }) => {
  const isMuslim = dashboardMode === 'muslim';
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTingkatan, setSelectedTingkatan] = useState<TingkatanKey>('T1');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hla_completed_chapters') || '[]'); } catch { return []; }
  });

  const markChapterComplete = (chapterKey: string) => {
    const updated = [...new Set([...completedChapters, chapterKey])];
    setCompletedChapters(updated);
    localStorage.setItem('hla_completed_chapters', JSON.stringify(updated));
  };

  // Subjects are grouped by track, never filtered by religion — the Islamic
  // Studies track is offered to every student alongside the academic subjects.
  // Muslim-mode students simply see that track first.
  const trackOrder = isMuslim
    ? (['islamic', 'core', 'elective'] as typeof TRACK_ORDER)
    : TRACK_ORDER;

  const handleSubjectClick = (subject: Subject) => {
    if (subject.linkedView && onNavigate) {
      onNavigate(subject.linkedView);
      return;
    }
    // Land on the first form level that actually has chapters — Add Math and
    // the STEM electives start at T4, so defaulting to T1 showed an empty list.
    setSelectedTingkatan(TINGKATAN.find(t => (subject.chapters[t] || []).length > 0) ?? 'T1');
    setSelectedSubject(subject);
  };

  const handleGenerateLesson = useCallback(async (subject: Subject, chapter: Chapter) => {
    setIsGenerating(true);
    setLesson(null);
    setShowAnswer(false);
    const result = await generateLesson(
      isMuslim ? subject.nameBM : subject.name,
      isMuslim ? chapter.titleBM : chapter.title,
      selectedTingkatan,
      isMuslim,
      userProfile,
      userResults,
    difficulty
      );
    setLesson(result);
    setIsGenerating(false);
  }, [isMuslim, selectedTingkatan]);

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    if (selectedSubject) {
      handleGenerateLesson(selectedSubject, chapter);
    }
  };

  // ── SUBJECT GRID VIEW ──
  if (!selectedSubject) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {isMuslim ? '🏫 Akademi Sekolah' : '🏫 School Academy'}
          </h2>
          <p className="text-[var(--muted)] mt-2 text-sm">
            {isMuslim
              ? 'Pilih subjek untuk mula belajar. Pelajaran dijana oleh AI mengikut silibus KSSM.'
              : 'Pick a subject to start learning. Lessons are AI-generated based on the KSSM syllabus.'}
          </p>
        </div>

        {/* Subjects grouped by track */}
        {trackOrder.map(track => {
          const subjects = SUBJECTS.filter(s => s.track === track);
          if (subjects.length === 0) return null;
          const label = TRACK_LABELS[track];

          return (
            <section key={track} className="space-y-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {isMuslim ? label.bm : label.en}
                </h3>
                <span className="text-xs text-[var(--muted)]">
                  {isMuslim ? label.descriptionBM : label.description}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="group relative p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-opacity-60 transition-all duration-300 text-left"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = subject.color;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${subject.color}15`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '';
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                    }}
                  >
                    <span className="text-3xl block mb-3">{subject.icon}</span>
                    <h4 className="font-bold text-sm text-[var(--foreground)]">
                      {isMuslim ? subject.nameBM : subject.name}
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {isMuslim ? subject.name : subject.nameBM}
                    </p>
                    {/* Form-level badges */}
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {TINGKATAN.map(t => {
                        const count = (subject.chapters[t] || []).length;
                        if (count === 0) return null;
                        return (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                            background: `${subject.color}15`, color: subject.color
                          }}>
                            {TINGKATAN_LABELS[dashboardMode][t]}
                          </span>
                        );
                      })}
                    </div>
                    {subject.linkedView && (
                      <span className="mt-3 block text-[10px] font-semibold" style={{ color: subject.color }}>
                        {isMuslim ? 'Modul khas →' : 'Dedicated module →'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // ── CHAPTER LIST VIEW ──
  if (!selectedChapter) {
    const chapters = selectedSubject.chapters[selectedTingkatan] || [];
    
    return (
      <div className="space-y-6">
        {/* Back + Subject Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="p-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--border)] transition-colors"
          >
            <svg className="h-5 w-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <span>{selectedSubject.icon}</span>
              {isMuslim ? selectedSubject.nameBM : selectedSubject.name}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {isMuslim ? selectedSubject.name : selectedSubject.nameBM}
            </p>
          </div>
        </div>

        {/* Tingkatan Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TINGKATAN.map(t => {
            const hasChapters = (selectedSubject.chapters[t] || []).length > 0;
            return (
              <button
                key={t}
                onClick={() => setSelectedTingkatan(t)}
                disabled={!hasChapters}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={selectedTingkatan === t ? {
                  background: selectedSubject.color,
                  color: '#fff',
                } : {
                  background: hasChapters ? 'var(--secondary)' : 'transparent',
                  color: hasChapters ? 'var(--foreground)' : 'var(--muted)',
                  opacity: hasChapters ? 1 : 0.4,
                }}
              >
                {TINGKATAN_LABELS[dashboardMode][t]}
              </button>
            );
          })}
        </div>

        {/* Periodic Table shortcut for Chemistry */}
        {selectedSubject.id === 'chemistry' && onNavigate && (
          <button
            onClick={() => onNavigate('periodic-table')}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-teal-500/60 bg-teal-500/5 hover:bg-teal-500/10 transition-colors text-left"
          >
            <span className="text-2xl">⚗</span>
            <div>
              <p className="text-sm font-semibold text-teal-400">Interactive Periodic Table</p>
              <p className="text-xs text-gray-500">KSSM-linked element facts · click to explore</p>
            </div>
            <span className="ml-auto text-teal-400 text-xs font-bold">Open →</span>
          </button>
        )}

        {/* Chapter List */}
        {chapters.length > 0 ? (
          <div className="space-y-2">
            {chapters.map((chapter, idx) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter)}
                className="w-full text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-opacity-60 transition-all group"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = selectedSubject.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                }}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: selectedSubject.color }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">
                      {isMuslim ? chapter.titleBM : chapter.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      {isMuslim ? chapter.title : chapter.titleBM}
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-[var(--muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--muted)]">
            <p className="text-lg mb-2">
              {isMuslim ? '📚 Tiada bab untuk tingkatan ini' : '📚 No chapters for this form level'}
            </p>
            <p className="text-sm">
              {isMuslim 
                ? `${selectedSubject.nameBM} bermula di tingkatan yang lebih tinggi.`
                : `${selectedSubject.name} starts at a higher form level.`}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── LESSON VIEW (AI-generated) ──
  return (
    <div className="space-y-6">
      {/* Back + Chapter Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { setSelectedChapter(null); setLesson(null); }}
          className="p-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--border)] transition-colors"
        >
          <svg className="h-5 w-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {isMuslim ? selectedChapter.titleBM : selectedChapter.title}
          </h2>
          <p className="text-xs text-[var(--muted)]">
            {selectedSubject.icon} {isMuslim ? selectedSubject.nameBM : selectedSubject.name} · {TINGKATAN_LABELS[dashboardMode][selectedTingkatan]}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--secondary)]">
            <svg className="animate-spin h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {isMuslim ? 'Menjana pelajaran AI...' : 'Generating AI lesson...'}
            </span>
          </div>
        </div>
      )}

      {/* Lesson Content */}
      {lesson && !isGenerating && (
        <div className="space-y-5">
          {/* Explanation */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <span className="text-lg">📖</span>
              {isMuslim ? 'Penerangan' : 'Explanation'}
            </h3>
            <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
              {lesson.explanation}
            </div>
          </div>

          {/* Key Points */}
          {lesson.keyPoints && lesson.keyPoints.length > 0 && (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <h3 className="font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <span className="text-lg">⭐</span>
                {isMuslim ? 'Poin Penting' : 'Key Points'}
              </h3>
              <ul className="space-y-2">
                {lesson.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--foreground)]">
                    <span style={{ color: selectedSubject.color }} className="font-bold">{i + 1}.</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Example */}
          {lesson.example && (
            <div className="p-5 rounded-2xl border border-[var(--border)]" style={{ background: `${selectedSubject.color}08` }}>
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: selectedSubject.color }}>
                <span className="text-lg">✏️</span>
                {isMuslim ? 'Contoh' : 'Worked Example'}
              </h3>
              <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                {lesson.example}
              </div>
            </div>
          )}

          {/* Practice Question */}
          {lesson.practiceQuestion && (
            <div className="p-5 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)]">
              <h3 className="font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <span className="text-lg">🧠</span>
                {isMuslim ? 'Soalan Latihan' : 'Practice Question'}
              </h3>
              <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap mb-4">
                {lesson.practiceQuestion}
              </div>
              
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: selectedSubject.color }}
                >
                  {isMuslim ? 'Tunjuk Jawapan' : 'Show Answer'}
                </button>
              ) : (
                <div className="mt-3 p-4 rounded-xl bg-[var(--secondary)]">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
                    {isMuslim ? 'Jawapan' : 'Answer'}
                  </h4>
                  <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                    {lesson.practiceAnswer}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regenerate Button */}
          <div className="flex justify-center pt-4">
            {/* Difficulty Selector */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty:</span>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          difficulty === level
                            ? level === 'easy' ? 'bg-green-500 text-white shadow-md' : level === 'medium' ? 'bg-amber-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {level === 'easy' ? '😊 Easy' : level === 'medium' ? '📚 Medium' : '🔥 Hard'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
              onClick={() => handleGenerateLesson(selectedSubject, selectedChapter)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all"
            >
              {isMuslim ? '🔄 Jana Pelajaran Baru' : '🔄 Generate New Lesson'}
            </button>
                <button
                  onClick={() => {
                    if (selectedSubject && selectedChapter) {
                      markChapterComplete(selectedSubject + '_' + selectedChapter);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  ✅ Mark Chapter Complete
                </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSubjectsPage;
