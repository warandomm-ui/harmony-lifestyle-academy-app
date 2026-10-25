import type { DiagnosticSubject } from '../types';

// ─────────────────────────────────────────────────────────────
// KSSM diagnostic — 5 multiple-choice questions per subject, tagged by
// subtopic. Rendered as plain UI: ZERO AI token cost. The result feeds
// the "Student Win" (Haiku praise + targeted lesson) and the "Parent Win"
// (WhatsApp summary) within the first 15 minutes of onboarding.
// ─────────────────────────────────────────────────────────────

export const KSSM_DIAGNOSTICS: Record<string, DiagnosticSubject> = {
  matematik_t4: {
    subject: 'Matematik',
    level: 'Tingkatan 4',
    questions: [
      {
        id: 'm1',
        subtopic: 'Algebra',
        question: 'Permudahkan: 3x + 5x − 2x',
        options: ['6x', '10x', '8x', '4x'],
        correctIndex: 0,
      },
      {
        id: 'm2',
        subtopic: 'Algebra',
        question: 'Jika 2(x + 3) = 14, maka x = ?',
        options: ['4', '5', '7', '11'],
        correctIndex: 0,
      },
      {
        id: 'm3',
        subtopic: 'Persamaan Linear',
        question: 'Selesaikan: 3x − 7 = 11',
        options: ['x = 4', 'x = 6', 'x = 3', 'x = 9'],
        correctIndex: 1,
      },
      {
        id: 'm4',
        subtopic: 'Persamaan Linear',
        question: 'Kecerunan garis 2y = 4x + 6 ialah?',
        options: ['1', '2', '3', '4'],
        correctIndex: 1,
      },
      {
        id: 'm5',
        subtopic: 'Nisbah & Kadar',
        question: 'Nisbah 12 : 18 dalam bentuk termudah ialah?',
        options: ['2 : 3', '3 : 4', '4 : 6', '1 : 2'],
        correctIndex: 0,
      },
    ],
  },
  sains_t3: {
    subject: 'Sains',
    level: 'Tingkatan 3',
    questions: [
      {
        id: 's1',
        subtopic: 'Daya & Gerakan',
        question: 'Unit SI bagi daya ialah?',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'],
        correctIndex: 1,
      },
      {
        id: 's2',
        subtopic: 'Daya & Gerakan',
        question: 'Apakah yang berlaku kepada objek apabila daya seimbang bertindak ke atasnya?',
        options: ['Memecut', 'Kekal pegun atau halaju malar', 'Berhenti serta-merta', 'Berpusing'],
        correctIndex: 1,
      },
      {
        id: 's3',
        subtopic: 'Tenaga',
        question: 'Tenaga yang tersimpan dalam objek kerana kedudukannya dipanggil tenaga?',
        options: ['Kinetik', 'Keupayaan', 'Haba', 'Bunyi'],
        correctIndex: 1,
      },
      {
        id: 's4',
        subtopic: 'Sel',
        question: 'Struktur yang mengawal aktiviti sel ialah?',
        options: ['Sitoplasma', 'Membran sel', 'Nukleus', 'Vakuol'],
        correctIndex: 2,
      },
      {
        id: 's5',
        subtopic: 'Sel',
        question: 'Sel tumbuhan mempunyai struktur ini yang tiada pada sel haiwan:',
        options: ['Nukleus', 'Dinding sel', 'Mitokondria', 'Membran sel'],
        correctIndex: 1,
      },
    ],
  },
};

export const DEFAULT_DIAGNOSTIC_KEY = 'matematik_t4';
