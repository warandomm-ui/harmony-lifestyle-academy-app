import React, { useState, useCallback } from 'react';
import type { DashboardMode } from '../../../types';

// ═══════════════════════════════════════════════════════════
// SCHOOL SUBJECTS PAGE — Akademi Sekolah / School Academy
// 
// 8 subjects × 5 tingkatan × KSSM syllabus chapters
// AI-generated lessons via Gemini
// Muslim → sees Pendidikan Islam
// Universal → sees Pendidikan Moral
// ═══════════════════════════════════════════════════════════

// ── Types ──
interface Chapter {
  id: string;
  title: string;
  titleBM: string;
}

interface SubjectData {
  id: string;
  icon: string;
  name: string;
  nameBM: string;
  color: string;
  forMode: 'both' | 'muslim' | 'universal';
  chapters: Record<string, Chapter[]>; // key = "T1" | "T2" | "T3" | "T4" | "T5"
}

interface GeneratedLesson {
  title: string;
  explanation: string;
  keyPoints: string[];
  example: string;
  practiceQuestion: string;
  practiceAnswer: string;
}

// ── KSSM Syllabus Data ──
const SUBJECTS: SubjectData[] = [
  {
    id: 'add-math',
    icon: '📊',
    name: 'Additional Mathematics',
    nameBM: 'Matematik Tambahan',
    color: '#6366f1',
    forMode: 'both',
    chapters: {
      T1: [], T2: [], T3: [],
      T4: [
        { id: 'am4-1', title: 'Functions', titleBM: 'Fungsi' },
        { id: 'am4-2', title: 'Quadratic Functions', titleBM: 'Fungsi Kuadratik' },
        { id: 'am4-3', title: 'Systems of Equations', titleBM: 'Sistem Persamaan' },
        { id: 'am4-4', title: 'Indices, Surds & Logarithms', titleBM: 'Indeks, Surd & Logaritma' },
        { id: 'am4-5', title: 'Progressions', titleBM: 'Janjang' },
        { id: 'am4-6', title: 'Linear Law', titleBM: 'Hukum Linear' },
        { id: 'am4-7', title: 'Coordinate Geometry', titleBM: 'Geometri Koordinat' },
        { id: 'am4-8', title: 'Vectors', titleBM: 'Vektor' },
        { id: 'am4-9', title: 'Solution of Triangles', titleBM: 'Penyelesaian Segitiga' },
        { id: 'am4-10', title: 'Index Numbers', titleBM: 'Nombor Indeks' },
      ],
      T5: [
        { id: 'am5-1', title: 'Circular Measure', titleBM: 'Sukatan Membulat' },
        { id: 'am5-2', title: 'Differentiation', titleBM: 'Pembezaan' },
        { id: 'am5-3', title: 'Integration', titleBM: 'Pengamiran' },
        { id: 'am5-4', title: 'Permutations & Combinations', titleBM: 'Pilih Atur & Gabungan' },
        { id: 'am5-5', title: 'Probability Distribution', titleBM: 'Taburan Kebarangkalian' },
        { id: 'am5-6', title: 'Trigonometric Functions', titleBM: 'Fungsi Trigonometri' },
        { id: 'am5-7', title: 'Linear Programming', titleBM: 'Pengaturcaraan Linear' },
        { id: 'am5-8', title: 'Kinematics of Linear Motion', titleBM: 'Kinematik Gerakan Linear' },
      ],
    },
  },
  {
    id: 'physics',
    icon: '⚡',
    name: 'Physics',
    nameBM: 'Fizik',
    color: '#f59e0b',
    forMode: 'both',
    chapters: {
      T1: [], T2: [], T3: [],
      T4: [
        { id: 'ph4-1', title: 'Measurement', titleBM: 'Pengukuran' },
        { id: 'ph4-2', title: 'Force and Motion I', titleBM: 'Daya dan Gerakan I' },
        { id: 'ph4-3', title: 'Gravitation', titleBM: 'Graviti' },
        { id: 'ph4-4', title: 'Heat', titleBM: 'Haba' },
        { id: 'ph4-5', title: 'Waves', titleBM: 'Gelombang' },
        { id: 'ph4-6', title: 'Light and Optics', titleBM: 'Cahaya dan Optik' },
      ],
      T5: [
        { id: 'ph5-1', title: 'Force and Motion II', titleBM: 'Daya dan Gerakan II' },
        { id: 'ph5-2', title: 'Pressure', titleBM: 'Tekanan' },
        { id: 'ph5-3', title: 'Electricity', titleBM: 'Elektrik' },
        { id: 'ph5-4', title: 'Electromagnetism', titleBM: 'Elektromagnet' },
        { id: 'ph5-5', title: 'Electronics', titleBM: 'Elektronik' },
        { id: 'ph5-6', title: 'Nuclear Physics', titleBM: 'Fizik Nuklear' },
        { id: 'ph5-7', title: 'Quantum Physics', titleBM: 'Fizik Kuantum' },
      ],
    },
  },
  {
    id: 'chemistry',
    icon: '🧪',
    name: 'Chemistry',
    nameBM: 'Kimia',
    color: '#10b981',
    forMode: 'both',
    chapters: {
      T1: [], T2: [], T3: [],
      T4: [
        { id: 'ch4-1', title: 'Matter & Atomic Structure', titleBM: 'Jirim & Struktur Atom' },
        { id: 'ch4-2', title: 'The Periodic Table', titleBM: 'Jadual Berkala' },
        { id: 'ch4-3', title: 'Chemical Formulae & Equations', titleBM: 'Formula & Persamaan Kimia' },
        { id: 'ch4-4', title: 'The Mole Concept', titleBM: 'Konsep Mol' },
        { id: 'ch4-5', title: 'Chemical Bonds', titleBM: 'Ikatan Kimia' },
        { id: 'ch4-6', title: 'Acids, Bases, and Salts', titleBM: 'Asid, Bes, dan Garam' },
        { id: 'ch4-7', title: 'Rate of Reaction', titleBM: 'Kadar Tindak Balas' },
      ],
      T5: [
        { id: 'ch5-1', title: 'Oxidation & Reduction', titleBM: 'Pengoksidaan & Penurunan' },
        { id: 'ch5-2', title: 'Thermochemistry', titleBM: 'Termokimia' },
        { id: 'ch5-3', title: 'Carbon Compounds', titleBM: 'Sebatian Karbon' },
        { id: 'ch5-4', title: 'Manufactured Substances', titleBM: 'Bahan Buatan dalam Industri' },
        { id: 'ch5-5', title: 'Electrochemistry', titleBM: 'Elektrokimia' },
      ],
    },
  },
  {
    id: 'biology',
    icon: '🧬',
    name: 'Biology',
    nameBM: 'Biologi',
    color: '#22c55e',
    forMode: 'both',
    chapters: {
      T1: [], T2: [], T3: [],
      T4: [
        { id: 'bi4-1', title: 'Cell Biology & Organisation', titleBM: 'Biologi Sel & Organisasi' },
        { id: 'bi4-2', title: 'Movement of Substances', titleBM: 'Pergerakan Bahan' },
        { id: 'bi4-3', title: 'Chemical Composition in Cell', titleBM: 'Komposisi Kimia dalam Sel' },
        { id: 'bi4-4', title: 'Cell Division', titleBM: 'Pembahagian Sel' },
        { id: 'bi4-5', title: 'Nutrition', titleBM: 'Nutrisi' },
        { id: 'bi4-6', title: 'Respiration', titleBM: 'Respirasi' },
        { id: 'bi4-7', title: 'Transportation', titleBM: 'Pengangkutan' },
      ],
      T5: [
        { id: 'bi5-1', title: 'Homeostasis', titleBM: 'Homeostasis' },
        { id: 'bi5-2', title: 'Support & Locomotion', titleBM: 'Sokongan & Gerakan' },
        { id: 'bi5-3', title: 'Coordination & Response', titleBM: 'Koordinasi & Gerak Balas' },
        { id: 'bi5-4', title: 'Reproduction', titleBM: 'Pembiakan' },
        { id: 'bi5-5', title: 'Inheritance', titleBM: 'Pewarisan' },
        { id: 'bi5-6', title: 'Variation', titleBM: 'Variasi' },
      ],
    },
  },
  {
    id: 'geography',
    icon: '🌍',
    name: 'Geography',
    nameBM: 'Geografi',
    color: '#0ea5e9',
    forMode: 'both',
    chapters: {
      T1: [
        { id: 'ge1-1', title: 'Introduction to Geography', titleBM: 'Pengenalan Geografi' },
        { id: 'ge1-2', title: 'The Earth', titleBM: 'Planet Bumi' },
        { id: 'ge1-3', title: 'Maps and Directions', titleBM: 'Peta dan Arah' },
      ],
      T2: [
        { id: 'ge2-1', title: 'Weather and Climate', titleBM: 'Cuaca dan Iklim' },
        { id: 'ge2-2', title: 'Landforms', titleBM: 'Bentuk Muka Bumi' },
        { id: 'ge2-3', title: 'Population', titleBM: 'Penduduk' },
      ],
      T3: [
        { id: 'ge3-1', title: 'Resources and Economic Activities', titleBM: 'Sumber dan Aktiviti Ekonomi' },
        { id: 'ge3-2', title: 'Urbanisation', titleBM: 'Pembandaran' },
        { id: 'ge3-3', title: 'Transportation', titleBM: 'Pengangkutan' },
      ],
      T4: [], T5: [],
    },
  },
  {
    id: 'economics',
    icon: '💰',
    name: 'Basic Economics',
    nameBM: 'Ekonomi Asas',
    color: '#f97316',
    forMode: 'both',
    chapters: {
      T1: [], T2: [], T3: [],
      T4: [
        { id: 'ec4-1', title: 'Introduction to Economics', titleBM: 'Pengenalan Ekonomi' },
        { id: 'ec4-2', title: 'Scarcity and Choice', titleBM: 'Kekurangan dan Pilihan' },
        { id: 'ec4-3', title: 'Demand and Supply', titleBM: 'Permintaan dan Penawaran' },
        { id: 'ec4-4', title: 'Market Structure', titleBM: 'Struktur Pasaran' },
        { id: 'ec4-5', title: 'Elasticity', titleBM: 'Keanjalan' },
      ],
      T5: [
        { id: 'ec5-1', title: 'National Income', titleBM: 'Pendapatan Negara' },
        { id: 'ec5-2', title: 'Money and Banking', titleBM: 'Wang dan Perbankan' },
        { id: 'ec5-3', title: 'Government Fiscal Policy', titleBM: 'Dasar Fiskal Kerajaan' },
        { id: 'ec5-4', title: 'International Trade', titleBM: 'Perdagangan Antarabangsa' },
        { id: 'ec5-5', title: 'Economic Development', titleBM: 'Pembangunan Ekonomi' },
      ],
    },
  },
  {
    id: 'pend-islam',
    icon: '🕌',
    name: 'Pendidikan Islam',
    nameBM: 'Pendidikan Islam',
    color: '#c9a84c',
    forMode: 'muslim', // ═══ MUSLIM ONLY ═══
    chapters: {
      T1: [
        { id: 'pi1-1', title: 'Aqidah — Beriman kepada Allah', titleBM: 'Aqidah — Beriman kepada Allah' },
        { id: 'pi1-2', title: 'Ibadah — Solat Fardhu', titleBM: 'Ibadah — Solat Fardhu' },
        { id: 'pi1-3', title: 'Sirah — Rasulullah SAW', titleBM: 'Sirah — Rasulullah SAW' },
        { id: 'pi1-4', title: 'Akhlak — Adab Mulia', titleBM: 'Akhlak — Adab Mulia' },
        { id: 'pi1-5', title: 'Tilawah al-Quran', titleBM: 'Tilawah al-Quran' },
      ],
      T2: [
        { id: 'pi2-1', title: 'Aqidah — Sifat Allah', titleBM: 'Aqidah — Sifat Allah' },
        { id: 'pi2-2', title: 'Ibadah — Puasa & Zakat', titleBM: 'Ibadah — Puasa & Zakat' },
        { id: 'pi2-3', title: 'Sirah — Khulafa al-Rasyidin', titleBM: 'Sirah — Khulafa al-Rasyidin' },
        { id: 'pi2-4', title: 'Akhlak — Adab Bermasyarakat', titleBM: 'Akhlak — Adab Bermasyarakat' },
      ],
      T3: [
        { id: 'pi3-1', title: 'Aqidah — Iman kepada Hari Akhirat', titleBM: 'Aqidah — Iman kepada Hari Akhirat' },
        { id: 'pi3-2', title: 'Ibadah — Haji & Korban', titleBM: 'Ibadah — Haji & Korban' },
        { id: 'pi3-3', title: 'Muamalat — Jual Beli Islam', titleBM: 'Muamalat — Jual Beli Islam' },
      ],
      T4: [
        { id: 'pi4-1', title: 'Aqidah — Qada & Qadar', titleBM: 'Aqidah — Qada & Qadar' },
        { id: 'pi4-2', title: 'Fiqh Munakahat', titleBM: 'Fiqh Munakahat' },
        { id: 'pi4-3', title: 'Tamadun Islam', titleBM: 'Tamadun Islam' },
        { id: 'pi4-4', title: 'Hadis — 40 Hadis Pilihan', titleBM: 'Hadis — 40 Hadis Pilihan' },
      ],
      T5: [
        { id: 'pi5-1', title: 'Aqidah — Islam & Sains', titleBM: 'Aqidah — Islam & Sains' },
        { id: 'pi5-2', title: 'Fiqh Jenayah & Kekeluargaan', titleBM: 'Fiqh Jenayah & Kekeluargaan' },
        { id: 'pi5-3', title: 'Dakwah & Kepimpinan Islam', titleBM: 'Dakwah & Kepimpinan Islam' },
      ],
    },
  },
  {
    id: 'pend-moral',
    icon: '🤝',
    name: 'Moral Education',
    nameBM: 'Pendidikan Moral',
    color: '#a855f7',
    forMode: 'universal', // ═══ NON-MUSLIM ONLY ═══
    chapters: {
      T1: [
        { id: 'pm1-1', title: 'Self-development & Responsibility', titleBM: 'Pembangunan Diri & Tanggungjawab' },
        { id: 'pm1-2', title: 'Family Values', titleBM: 'Nilai Kekeluargaan' },
        { id: 'pm1-3', title: 'Respect & Tolerance', titleBM: 'Hormat & Toleransi' },
      ],
      T2: [
        { id: 'pm2-1', title: 'Integrity & Honesty', titleBM: 'Integriti & Kejujuran' },
        { id: 'pm2-2', title: 'Compassion & Empathy', titleBM: 'Belas Kasihan & Empati' },
        { id: 'pm2-3', title: 'National Unity', titleBM: 'Perpaduan Nasional' },
      ],
      T3: [
        { id: 'pm3-1', title: 'Environmental Ethics', titleBM: 'Etika Alam Sekitar' },
        { id: 'pm3-2', title: 'Digital Citizenship', titleBM: 'Kewarganegaraan Digital' },
        { id: 'pm3-3', title: 'Community Service', titleBM: 'Khidmat Masyarakat' },
      ],
      T4: [
        { id: 'pm4-1', title: 'Human Rights & Justice', titleBM: 'Hak Asasi & Keadilan' },
        { id: 'pm4-2', title: 'Ethical Decision Making', titleBM: 'Membuat Keputusan Beretika' },
        { id: 'pm4-3', title: 'Global Citizenship', titleBM: 'Kewarganegaraan Global' },
      ],
      T5: [
        { id: 'pm5-1', title: 'Moral Philosophy', titleBM: 'Falsafah Moral' },
        { id: 'pm5-2', title: 'Social Responsibility', titleBM: 'Tanggungjawab Sosial' },
        { id: 'pm5-3', title: 'Leadership & Ethics', titleBM: 'Kepimpinan & Etika' },
      ],
    },
  },
];

const TINGKATAN = ['T1', 'T2', 'T3', 'T4', 'T5'];
const TINGKATAN_LABELS: Record<string, Record<string, string>> = {
  muslim: { T1: 'Tingkatan 1', T2: 'Tingkatan 2', T3: 'Tingkatan 3', T4: 'Tingkatan 4', T5: 'Tingkatan 5' },
  universal: { T1: 'Form 1', T2: 'Form 2', T3: 'Form 3', T4: 'Form 4', T5: 'Form 5' },
};

// ── AI Lesson Generator ──
const generateLesson = async (subject: string, chapter: string, tingkatan: string, isMuslim: boolean): Promise<GeneratedLesson> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    return {
      title: chapter,
      explanation: isMuslim 
        ? 'API key tidak dikonfigurasi. Sila hubungi admin.' 
        : 'API key not configured. Please contact admin.',
      keyPoints: [],
      example: '',
      practiceQuestion: '',
      practiceAnswer: '',
    };
  }

  const lang = isMuslim ? 'Bahasa Malaysia' : 'English';
  const context = isMuslim 
    ? 'You are a Malaysian school tutor. Explain in Bahasa Malaysia. Use simple BM that Form 1-5 students understand. Give Malaysian context examples (RM for money, local places, SPM format).'
    : 'You are a Malaysian school tutor. Explain in English. Use simple English that Form 1-5 students understand. Give Malaysian context examples where relevant.';

  const prompt = `${context}

Subject: ${subject}
Topic: ${chapter}
Level: ${tingkatan}
Curriculum: KSSM Malaysia

Generate a lesson in this EXACT JSON format (no markdown, no backticks):
{
  "title": "${chapter}",
  "explanation": "Clear explanation of the topic in 3-4 paragraphs in ${lang}",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "example": "One worked example with step-by-step solution",
  "practiceQuestion": "One practice question for the student",
  "practiceAnswer": "The answer with explanation"
}`;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    const text = response.text || '';
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini lesson generation failed:', err);
    return {
      title: chapter,
      explanation: isMuslim 
        ? 'Maaf, gagal menjana pelajaran. Sila cuba lagi.' 
        : 'Sorry, failed to generate lesson. Please try again.',
      keyPoints: [],
      example: '',
      practiceQuestion: '',
      practiceAnswer: '',
    };
  }
};

// ═══ MAIN COMPONENT ═══
interface SchoolSubjectsPageProps {
  dashboardMode: DashboardMode;
}

const SchoolSubjectsPage: React.FC<SchoolSubjectsPageProps> = ({ dashboardMode }) => {
  const isMuslim = dashboardMode === 'muslim';
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>('T4');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Filter subjects based on dashboard mode
  const filteredSubjects = SUBJECTS.filter(s => 
    s.forMode === 'both' || s.forMode === dashboardMode
  );

  const handleGenerateLesson = useCallback(async (subject: SubjectData, chapter: Chapter) => {
    setIsGenerating(true);
    setLesson(null);
    setShowAnswer(false);
    const result = await generateLesson(
      isMuslim ? subject.nameBM : subject.name,
      isMuslim ? chapter.titleBM : chapter.title,
      selectedTingkatan,
      isMuslim
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
      <div className="space-y-6">
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

        {/* Subject Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSubjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className="group relative p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-opacity-60 transition-all duration-300 text-left"
              style={{ 
                '--hover-color': subject.color,
              } as React.CSSProperties}
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
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                {isMuslim ? subject.nameBM : subject.name}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isMuslim ? subject.name : subject.nameBM}
              </p>
              {/* Chapter count badge */}
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
            </button>
          ))}
        </div>
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
            <button
              onClick={() => handleGenerateLesson(selectedSubject, selectedChapter)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all"
            >
              {isMuslim ? '🔄 Jana Pelajaran Baru' : '🔄 Generate New Lesson'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSubjectsPage;
