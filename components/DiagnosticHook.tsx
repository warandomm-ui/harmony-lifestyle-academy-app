import React, { useMemo, useState } from 'react';
import type { DiagnosticResult, DiagnosticSubject } from '../types';
import { KSSM_DIAGNOSTICS, DEFAULT_DIAGNOSTIC_KEY } from '../constants/diagnostic';
import { generateWithClaude } from '../services/aiProxyService';
import { notifyParent } from '../services/parentNotifyService';

// ─────────────────────────────────────────────────────────────
// DiagnosticHook — the first-15-minutes onboarding sequence.
//   Min 1-5 : Diagnostic Hook   → 5-question MCQ, ZERO AI cost
//   Min ~10 : Student Win        → one small Haiku call praises + targets weakness
//   Min ~15 : Parent Win         → WhatsApp summary to the parent (the buyer)
// ─────────────────────────────────────────────────────────────

type Phase = 'quiz' | 'analyzing' | 'studentWin' | 'parentWin' | 'sending';

interface DiagnosticHookProps {
  studentName: string;
  diagnosticKey?: string;
  onComplete: (result: DiagnosticResult) => void;
  onSkip: () => void;
}

const scoreDiagnostic = (
  subject: DiagnosticSubject,
  answers: Record<string, number>,
): DiagnosticResult => {
  const tally = new Map<string, { correct: number; total: number }>();
  let correct = 0;
  for (const q of subject.questions) {
    const t = tally.get(q.subtopic) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (answers[q.id] === q.correctIndex) {
      t.correct += 1;
      correct += 1;
    }
    tally.set(q.subtopic, t);
  }
  const perSubtopic = [...tally.entries()].map(([subtopic, v]) => ({ subtopic, ...v }));
  const acc = (s: { correct: number; total: number }) => s.correct / s.total;
  const sorted = [...perSubtopic].sort((a, b) => acc(b) - acc(a));
  return {
    subject: subject.subject,
    level: subject.level,
    correct,
    total: subject.questions.length,
    strongest: sorted[0]?.subtopic ?? '',
    weakest: sorted[sorted.length - 1]?.subtopic ?? '',
    perSubtopic,
  };
};

const DiagnosticHook: React.FC<DiagnosticHookProps> = ({
  studentName,
  diagnosticKey = DEFAULT_DIAGNOSTIC_KEY,
  onComplete,
  onSkip,
}) => {
  const subject = KSSM_DIAGNOSTICS[diagnosticKey] ?? KSSM_DIAGNOSTICS[DEFAULT_DIAGNOSTIC_KEY];
  const [phase, setPhase] = useState<Phase>('quiz');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [praise, setPraise] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentNote, setParentNote] = useState('');

  const question = subject.questions[index];
  const progress = (index / subject.questions.length) * 100;

  const handleAnswer = async (optionIndex: number) => {
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);

    if (index < subject.questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    // ─── Last question answered → Student Win ───
    const res = scoreDiagnostic(subject, next);
    setResult(res);
    setPhase('analyzing');
    try {
      const text = await generateWithClaude({
        model: 'claude-haiku-4-5-20251001',
        cacheSystem: true,
        maxTokens: 160,
        system:
          'You are HLA Tutor AI, a warm, encouraging tutor for Malaysian students. ' +
          'Reply ONLY in Bahasa Malaysia, in 2-3 short sentences, with at most one emoji.',
        messages: [
          {
            role: 'user',
            content:
              `Pelajar bernama ${studentName} baru selesai ujian diagnostik ${res.subject} ${res.level} ` +
              `(${res.correct}/${res.total} betul). Dia kuat dalam "${res.strongest}" tetapi perlu bantuan dalam "${res.weakest}". ` +
              `Puji usahanya dan beritahu laluan pembelajarannya kini akan fokus pada "${res.weakest}".`,
          },
        ],
      });
      setPraise(text.trim());
    } catch {
      setPraise(
        `Syabas ${studentName}! 🎉 Kamu kuat dalam ${res.strongest}. ` +
          `Jangan risau tentang ${res.weakest} — laluan pembelajaran kamu kini akan fokus di situ.`,
      );
    }
    setPhase('studentWin');
  };

  const handleSendParent = async () => {
    if (!result) return;
    setPhase('sending');
    try {
      if (parentPhone.trim()) {
        const r = await notifyParent({
          phone: parentPhone.trim(),
          studentName,
          strongest: result.strongest,
          weakest: result.weakest,
        });
        setParentNote(
          r.simulated
            ? 'Mesej demo dihantar (sediakan WhatsApp API untuk penghantaran sebenar).'
            : 'Laporan WhatsApp telah dihantar kepada ibu bapa anda. ✅',
        );
      }
    } catch {
      setParentNote('Mesej WhatsApp tidak dapat dihantar sekarang, tetapi kemajuan anda disimpan.');
    }
    onComplete(result);
  };

  // ─── RENDER ───
  if (phase === 'quiz') {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-green-700 dark:text-green-500">
              Ujian Diagnostik {subject.subject} {subject.level}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {index + 1} / {subject.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full"
              style={{ width: `${progress}%`, transition: 'width 0.4s ease-in-out' }}
            />
          </div>
        </div>

        <div key={question.id} className="animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-2">
            {question.subtopic}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-5">
            {question.question}
          </h2>
          <div className="space-y-3">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full text-left p-4 border-2 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white border-gray-200 hover:border-green-400 hover:bg-green-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-gray-600"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 pt-6 border-t dark:border-gray-700">
          <button onClick={onSkip} className="text-gray-500 dark:text-gray-400 font-medium hover:underline">
            Langkau buat masa ini
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'analyzing' || phase === 'sending') {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          {phase === 'analyzing' ? 'Menganalisis jawapan anda...' : 'Menghantar laporan...'}
        </h2>
      </div>
    );
  }

  if (phase === 'studentWin' && result) {
    return (
      <div className="text-center py-8 animate-fade-in-up max-w-lg mx-auto">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Syabas, {studentName}!</h2>
        <div className="grid grid-cols-2 gap-3 my-6 text-left">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Kekuatan</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{result.strongest}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Fokus seterusnya</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{result.weakest}</p>
          </div>
        </div>
        <p className="text-[var(--muted-foreground)] mb-8">{praise}</p>
        <button
          onClick={() => setPhase('parentWin')}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all hover:scale-105"
        >
          Teruskan →
        </button>
      </div>
    );
  }

  // parentWin
  return (
    <div className="py-8 animate-fade-in-up max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📲</div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Kongsi kemajuan dengan ibu bapa</h2>
        <p className="text-[var(--muted-foreground)] mt-2 text-sm">
          Kami akan hantar ringkasan ujian diagnostik {studentName} melalui WhatsApp. (Pilihan)
        </p>
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-[var(--secondary)] text-sm text-[var(--foreground)] mb-5">
          “{studentName} baru sahaja menyelesaikan ujian diagnostik pertamanya. Dia mahir dalam{' '}
          <strong>{result.strongest}</strong> tetapi perlukan bantuan dalam <strong>{result.weakest}</strong>.
          HLA telah melaraskan laluan pembelajarannya secara automatik.”
        </div>
      )}

      <label htmlFor="parentPhone" className="block text-sm font-bold text-[var(--muted)] mb-1">
        Nombor WhatsApp ibu bapa
      </label>
      <input
        id="parentPhone"
        type="tel"
        inputMode="tel"
        value={parentPhone}
        onChange={(e) => setParentPhone(e.target.value)}
        placeholder="+60 12-345 6789"
        className="block w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none transition text-sm mb-6"
      />

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
        <button
          onClick={() => result && onComplete(result)}
          className="px-6 py-2.5 rounded-full font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition"
        >
          Langkau
        </button>
        <button
          onClick={handleSendParent}
          disabled={!parentPhone.trim()}
          className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-full hover:bg-green-700 transition disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Hantar & Mula Belajar
        </button>
      </div>
      {parentNote && <p className="text-center text-sm text-green-600 mt-4">{parentNote}</p>}
    </div>
  );
};

export default DiagnosticHook;
