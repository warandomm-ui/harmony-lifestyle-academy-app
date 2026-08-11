// constants/curriculum.ts
//
// Single source of truth for the Harmony Lifestyle Academy course structure.
// Read by both the public landing page (components/landing/*) and the in-app
// School Academy page (components/dashboard/pages/dimensions/SchoolSubjectsPage.tsx),
// so the marketed catalogue and the delivered catalogue can never drift apart.
//
// Coverage: Tingkatan 1-5 (Form 1-5), KSSM-aligned, bilingual EN/BM throughout.
//
// Tracks:
//   core     — taken by every student
//   elective — STEM / commerce / IT streams, mostly T4-T5
//   islamic  — Islamic Studies, offered ALONGSIDE the academic subjects and
//              available to any student who opts in (not gated by religion)

import type { DashboardView } from '../types';

export type SubjectTrack = 'core' | 'elective' | 'islamic';
export type TingkatanKey = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export interface Chapter {
  id: string;
  title: string;   // English
  titleBM: string; // Bahasa Melayu
}

export interface Subject {
  id: string;
  icon: string;
  name: string;   // English
  nameBM: string; // Bahasa Melayu
  color: string;
  track: SubjectTrack;
  /** Optional: open a dedicated in-app module instead of the AI lesson generator. */
  linkedView?: DashboardView;
  /** Short bilingual blurb used on the landing page catalogue cards. */
  blurb?: string;
  blurbBM?: string;
  chapters: Partial<Record<TingkatanKey, Chapter[]>>;
}

export const TINGKATAN: TingkatanKey[] = ['T1', 'T2', 'T3', 'T4', 'T5'];

export const TINGKATAN_LABELS: Record<string, Record<TingkatanKey, string>> = {
  muslim: { T1: 'Tingkatan 1', T2: 'Tingkatan 2', T3: 'Tingkatan 3', T4: 'Tingkatan 4', T5: 'Tingkatan 5' },
  universal: { T1: 'Form 1', T2: 'Form 2', T3: 'Form 3', T4: 'Form 4', T5: 'Form 5' },
};

export const TRACK_LABELS: Record<SubjectTrack, { en: string; bm: string; description: string; descriptionBM: string }> = {
  core: {
    en: 'Core Subjects',
    bm: 'Subjek Teras',
    description: 'Taken by every student from Form 1 through Form 5.',
    descriptionBM: 'Diambil oleh semua pelajar dari Tingkatan 1 hingga Tingkatan 5.',
  },
  elective: {
    en: 'Elective & Stream Subjects',
    bm: 'Subjek Elektif & Aliran',
    description: 'Science, commerce and IT streams, mostly Form 4 and Form 5.',
    descriptionBM: 'Aliran sains, perdagangan dan IT, kebanyakannya Tingkatan 4 dan 5.',
  },
  islamic: {
    en: 'Islamic Studies',
    bm: 'Pengajian Islam',
    description: 'Optional modules, open to any student, taught alongside the academic syllabus.',
    descriptionBM: 'Modul pilihan, terbuka kepada semua pelajar, diajar bersama sukatan akademik.',
  },
};

export const SUBJECTS: Subject[] = [
  // 1. MATEMATIK (CORE — Semua pelajar T1-T5)
  {
    id: 'matematik',
    icon: '🔢',
    name: 'Mathematics',
    nameBM: 'Matematik',
    color: '#3b82f6',
    track: 'core',
    chapters: {
      T1: [
        { id: 'mt1-1', title: 'Rational Numbers', titleBM: 'Nombor Nisbah' },
        { id: 'mt1-2', title: 'Factors and Multiples', titleBM: 'Faktor dan Gandaan' },
        { id: 'mt1-3', title: 'Squares, Square Roots, Cubes & Cube Roots', titleBM: 'Kuasa Dua, Punca Kuasa Dua, Kuasa Tiga & Punca Kuasa Tiga' },
        { id: 'mt1-4', title: 'Ratios, Rates and Proportions', titleBM: 'Nisbah, Kadar dan Kadaran' },
        { id: 'mt1-5', title: 'Algebraic Expressions', titleBM: 'Ungkapan Algebra' },
        { id: 'mt1-6', title: 'Linear Equations', titleBM: 'Persamaan Linear' },
        { id: 'mt1-7', title: 'Linear Inequalities', titleBM: 'Ketaksamaan Linear' },
        { id: 'mt1-8', title: 'Lines and Angles', titleBM: 'Garis dan Sudut' },
        { id: 'mt1-9', title: 'Basic Polygons', titleBM: 'Poligon Asas' },
        { id: 'mt1-10', title: 'Perimeter and Area', titleBM: 'Perimeter dan Luas' },
        { id: 'mt1-11', title: 'Introduction to Set', titleBM: 'Pengenalan Set' },
        { id: 'mt1-12', title: 'Data Handling', titleBM: 'Pengendalian Data' },
        { id: 'mt1-13', title: 'The Pythagoras Theorem', titleBM: 'Teorem Pythagoras' },
      ],
      T2: [
        { id: 'mt2-1', title: 'Patterns and Sequences', titleBM: 'Pola dan Jujukan' },
        { id: 'mt2-2', title: 'Factorisation and Algebraic Fractions', titleBM: 'Pemfaktoran dan Pecahan Algebra' },
        { id: 'mt2-3', title: 'Algebraic Formulae', titleBM: 'Formula Algebra' },
        { id: 'mt2-4', title: 'Polygon', titleBM: 'Poligon' },
        { id: 'mt2-5', title: 'Circles', titleBM: 'Bulatan' },
        { id: 'mt2-6', title: 'Three-Dimensional Geometric Shapes', titleBM: 'Bentuk Geometri Tiga Dimensi' },
        { id: 'mt2-7', title: 'Coordinates', titleBM: 'Koordinat' },
        { id: 'mt2-8', title: 'Graphs of Functions', titleBM: 'Graf Fungsi' },
        { id: 'mt2-9', title: 'Speed and Acceleration', titleBM: 'Laju dan Pecutan' },
        { id: 'mt2-10', title: 'Gradient of a Straight Line', titleBM: 'Kecerunan Garis Lurus' },
        { id: 'mt2-11', title: 'Isometric Transformations', titleBM: 'Transformasi Isometri' },
        { id: 'mt2-12', title: 'Measures of Central Tendencies', titleBM: 'Sukatan Kecenderungan Memusat' },
        { id: 'mt2-13', title: 'Simple Probability', titleBM: 'Kebarangkalian Mudah' },
      ],
      T3: [
        { id: 'mt3-1', title: 'Indices', titleBM: 'Indeks' },
        { id: 'mt3-2', title: 'Standard Form', titleBM: 'Bentuk Piawai' },
        { id: 'mt3-3', title: 'Consumer Mathematics: Savings, Investments, Credit & Debt', titleBM: 'Matematik Pengguna: Simpanan, Pelaburan, Kredit & Hutang' },
        { id: 'mt3-4', title: 'Scale Drawings', titleBM: 'Lukisan Berskala' },
        { id: 'mt3-5', title: 'Trigonometric Ratios', titleBM: 'Nisbah Trigonometri' },
        { id: 'mt3-6', title: 'Angles and Tangents of Circles', titleBM: 'Sudut dan Tangen Bulatan' },
        { id: 'mt3-7', title: 'Plans and Elevations', titleBM: 'Pelan dan Dongakan' },
        { id: 'mt3-8', title: 'Loci in Two Dimensions', titleBM: 'Lokus dalam Dua Dimensi' },
        { id: 'mt3-9', title: 'Straight Lines', titleBM: 'Garis Lurus' },
      ],
      T4: [
        { id: 'mt4-1', title: 'Quadratic Functions & Equations in One Variable', titleBM: 'Fungsi Kuadratik & Persamaan dalam Satu Pemboleh Ubah' },
        { id: 'mt4-2', title: 'Number Bases', titleBM: 'Asas Nombor' },
        { id: 'mt4-3', title: 'Logical Reasoning', titleBM: 'Penaakulan Logik' },
        { id: 'mt4-4', title: 'Operations on Sets', titleBM: 'Operasi ke atas Set' },
        { id: 'mt4-5', title: 'Network in Graph Theory', titleBM: 'Rangkaian dalam Teori Graf' },
        { id: 'mt4-6', title: 'Linear Inequalities in Two Variables', titleBM: 'Ketaksamaan Linear dalam Dua Pemboleh Ubah' },
        { id: 'mt4-7', title: 'Graphs of Motion', titleBM: 'Graf Gerakan' },
        { id: 'mt4-8', title: 'Measures of Dispersion for Ungrouped Data', titleBM: 'Sukatan Serakan bagi Data Tak Terkumpul' },
        { id: 'mt4-9', title: 'Probability of Combined Events', titleBM: 'Kebarangkalian Peristiwa Bergabung' },
        { id: 'mt4-10', title: 'Consumer Mathematics: Financial Management', titleBM: 'Matematik Pengguna: Pengurusan Kewangan' },
      ],
      T5: [
        { id: 'mt5-1', title: 'Variation', titleBM: 'Ubahan' },
        { id: 'mt5-2', title: 'Matrices', titleBM: 'Matriks' },
        { id: 'mt5-3', title: 'Consumer Mathematics: Insurance & Takaful', titleBM: 'Matematik Pengguna: Insurans & Takaful' },
        { id: 'mt5-4', title: 'Consumer Mathematics: Taxation', titleBM: 'Matematik Pengguna: Percukaian' },
        { id: 'mt5-5', title: 'Congruency, Enlargement & Combined Transformations', titleBM: 'Kekongruenan, Pembesaran & Gabungan Transformasi' },
        { id: 'mt5-6', title: 'Ratios & Graphs of Trigonometric Functions', titleBM: 'Nisbah & Graf Fungsi Trigonometri' },
        { id: 'mt5-7', title: 'Measures of Dispersion for Grouped Data', titleBM: 'Sukatan Serakan bagi Data Terkumpul' },
        { id: 'mt5-8', title: 'Mathematical Modeling', titleBM: 'Pemodelan Matematik' },
      ],
    },
  },

  // 2. SAINS (CORE — Semua pelajar T1-T5)
  {
    id: 'sains',
    icon: '🔬',
    name: 'Science',
    nameBM: 'Sains',
    color: '#14b8a6',
    track: 'core',
    chapters: {
      T1: [
        { id: 'sc1-1', title: 'Introduction to Science', titleBM: 'Pengenalan kepada Sains' },
        { id: 'sc1-2', title: 'Cell as a Unit of Life', titleBM: 'Sel sebagai Unit Kehidupan' },
        { id: 'sc1-3', title: 'Matter', titleBM: 'Jirim' },
        { id: 'sc1-4', title: 'Atomic Structure', titleBM: 'Struktur Atom' },
        { id: 'sc1-5', title: 'The Periodic Table', titleBM: 'Jadual Berkala' },
        { id: 'sc1-6', title: 'Density', titleBM: 'Ketumpatan' },
        { id: 'sc1-7', title: 'The Variety of Resources on Earth', titleBM: 'Kepelbagaian Sumber di Bumi' },
      ],
      T2: [
        { id: 'sc2-1', title: 'Biodiversity', titleBM: 'Biodiversiti' },
        { id: 'sc2-2', title: 'Nutrition', titleBM: 'Nutrisi' },
        { id: 'sc2-3', title: 'Ecosystem', titleBM: 'Ekosistem' },
        { id: 'sc2-4', title: 'Water and Solution', titleBM: 'Air dan Larutan' },
        { id: 'sc2-5', title: 'Acids and Bases', titleBM: 'Asid dan Bes' },
        { id: 'sc2-6', title: 'Force and Motion', titleBM: 'Daya dan Gerakan' },
        { id: 'sc2-7', title: 'Heat', titleBM: 'Haba' },
        { id: 'sc2-8', title: 'Electricity and Magnetism', titleBM: 'Elektrik dan Kemagnetan' },
      ],
      T3: [
        { id: 'sc3-1', title: 'Respiration', titleBM: 'Respirasi' },
        { id: 'sc3-2', title: 'Blood Circulation and Transport', titleBM: 'Peredaran Darah dan Pengangkutan' },
        { id: 'sc3-3', title: 'Excretion', titleBM: 'Perkumuhan' },
        { id: 'sc3-4', title: 'Reproduction', titleBM: 'Pembiakan' },
        { id: 'sc3-5', title: 'Growth', titleBM: 'Pertumbuhan' },
        { id: 'sc3-6', title: 'Land and its Resources', titleBM: 'Tanah dan Sumbernya' },
        { id: 'sc3-7', title: 'Electricity & Magnetism', titleBM: 'Elektrik & Kemagnetan' },
        { id: 'sc3-8', title: 'Light & Optics', titleBM: 'Cahaya & Optik' },
        { id: 'sc3-9', title: 'Sound', titleBM: 'Bunyi' },
        { id: 'sc3-10', title: 'Space Exploration', titleBM: 'Penerokaan Angkasa' },
      ],
      T4: [
        { id: 'sc4-1', title: 'Stimuli and Responses', titleBM: 'Rangsangan dan Tindak Balas' },
        { id: 'sc4-2', title: 'Homeostasis in Humans', titleBM: 'Homeostasis dalam Manusia' },
        { id: 'sc4-3', title: 'Inheritance', titleBM: 'Pewarisan' },
        { id: 'sc4-4', title: 'Waves, Light and Sound', titleBM: 'Gelombang, Cahaya dan Bunyi' },
        { id: 'sc4-5', title: 'Electricity and Electronics', titleBM: 'Elektrik dan Elektronik' },
      ],
      T5: [
        { id: 'sc5-1', title: 'Microorganisms and Their Effects on Living Things', titleBM: 'Mikroorganisma dan Kesannya kepada Hidupan' },
        { id: 'sc5-2', title: 'Nutrition and Food Production', titleBM: 'Nutrisi dan Pengeluaran Makanan' },
        { id: 'sc5-3', title: 'Endangered Ecosystem', titleBM: 'Ekosistem Terancam' },
        { id: 'sc5-4', title: 'Energy & Chemical Changes', titleBM: 'Tenaga & Perubahan Kimia' },
        { id: 'sc5-5', title: 'Nuclear Energy', titleBM: 'Tenaga Nuklear' },
        { id: 'sc5-6', title: 'Consumer & Industrial Technology', titleBM: 'Teknologi Pengguna & Industri' },
      ],
    },
  },

  // 3. BAHASA MELAYU (CORE — Semua pelajar T1-T5)
  {
    id: 'bahasa-melayu',
    icon: '📝',
    name: 'Bahasa Melayu',
    nameBM: 'Bahasa Melayu',
    color: '#ef4444',
    track: 'core',
    chapters: {
      T1: [
        { id: 'bm1-1', title: 'Comprehension Skills', titleBM: 'Kemahiran Membaca dan Memahami' },
        { id: 'bm1-2', title: 'Essay Writing — Narrative', titleBM: 'Penulisan Karangan — Naratif' },
        { id: 'bm1-3', title: 'Grammar — Word Classes', titleBM: 'Tatabahasa — Golongan Kata' },
        { id: 'bm1-4', title: 'KOMSAS — Poems & Short Stories', titleBM: 'KOMSAS — Sajak & Cerpen' },
        { id: 'bm1-5', title: 'Summary Writing', titleBM: 'Penulisan Rumusan' },
      ],
      T2: [
        { id: 'bm2-1', title: 'Essay Writing — Descriptive', titleBM: 'Penulisan Karangan — Deskriptif' },
        { id: 'bm2-2', title: 'Grammar — Sentence Structure', titleBM: 'Tatabahasa — Ayat Tunggal & Ayat Majmuk' },
        { id: 'bm2-3', title: 'KOMSAS — Drama & Pantun', titleBM: 'KOMSAS — Drama & Pantun' },
        { id: 'bm2-4', title: 'Formal Letter Writing', titleBM: 'Penulisan Surat Rasmi' },
        { id: 'bm2-5', title: 'Idioms & Proverbs', titleBM: 'Peribahasa & Simpulan Bahasa' },
      ],
      T3: [
        { id: 'bm3-1', title: 'Essay Writing — Argumentative', titleBM: 'Penulisan Karangan — Perbahasan' },
        { id: 'bm3-2', title: 'Grammar — Morphology', titleBM: 'Tatabahasa — Morfologi (Imbuhan)' },
        { id: 'bm3-3', title: 'KOMSAS — Novel', titleBM: 'KOMSAS — Novel' },
        { id: 'bm3-4', title: 'Report Writing', titleBM: 'Penulisan Laporan' },
        { id: 'bm3-5', title: 'Listening & Speaking Skills', titleBM: 'Kemahiran Mendengar & Bertutur' },
      ],
      T4: [
        { id: 'bm4-1', title: 'SPM Essay — Section A (Directed)', titleBM: 'Karangan SPM — Bahagian A (Berpandu)' },
        { id: 'bm4-2', title: 'SPM Essay — Section B (Open)', titleBM: 'Karangan SPM — Bahagian B (Terbuka)' },
        { id: 'bm4-3', title: 'Advanced Grammar & Error Correction', titleBM: 'Tatabahasa Lanjutan & Pembetulan Kesalahan' },
        { id: 'bm4-4', title: 'KOMSAS SPM — Anthology', titleBM: 'KOMSAS SPM — Antologi' },
        { id: 'bm4-5', title: 'SPM Summary Techniques', titleBM: 'Teknik Rumusan SPM' },
        { id: 'bm4-6', title: 'Comprehension — SPM Format', titleBM: 'Pemahaman — Format SPM' },
      ],
      T5: [
        { id: 'bm5-1', title: 'SPM Essay Mastery', titleBM: 'Penguasaan Karangan SPM' },
        { id: 'bm5-2', title: 'KOMSAS SPM — Novel & Anthology Revision', titleBM: 'KOMSAS SPM — Ulangkaji Novel & Antologi' },
        { id: 'bm5-3', title: 'Grammar Intensive Review', titleBM: 'Ulangkaji Intensif Tatabahasa' },
        { id: 'bm5-4', title: 'Oral Test Preparation', titleBM: 'Persediaan Ujian Lisan' },
        { id: 'bm5-5', title: 'SPM Full Paper Practice', titleBM: 'Latihan Kertas Penuh SPM' },
      ],
    },
  },

  // 4. BAHASA INGGERIS (CORE — Semua pelajar T1-T5)
  {
    id: 'english',
    icon: '🇬🇧',
    name: 'English',
    nameBM: 'Bahasa Inggeris',
    color: '#8b5cf6',
    track: 'core',
    chapters: {
      T1: [
        { id: 'en1-1', title: 'Reading Comprehension — Fiction & Non-Fiction', titleBM: 'Pemahaman Bacaan — Fiksyen & Bukan Fiksyen' },
        { id: 'en1-2', title: 'Grammar — Tenses (Present & Past)', titleBM: 'Tatabahasa — Kala (Kini & Lampau)' },
        { id: 'en1-3', title: 'Writing — Descriptive Paragraph', titleBM: 'Penulisan — Perenggan Deskriptif' },
        { id: 'en1-4', title: 'Literature — Short Stories', titleBM: 'Kesusasteraan — Cerpen' },
        { id: 'en1-5', title: 'Vocabulary Building', titleBM: 'Pembinaan Kosa Kata' },
      ],
      T2: [
        { id: 'en2-1', title: 'Grammar — Continuous & Perfect Tenses', titleBM: 'Tatabahasa — Kala Berterusan & Sempurna' },
        { id: 'en2-2', title: 'Writing — Narrative Essay', titleBM: 'Penulisan — Karangan Naratif' },
        { id: 'en2-3', title: 'Literature — Poems', titleBM: 'Kesusasteraan — Puisi' },
        { id: 'en2-4', title: 'Informal Letter & Email Writing', titleBM: 'Penulisan Surat Tak Rasmi & E-mel' },
        { id: 'en2-5', title: 'Speaking — Conversations & Discussions', titleBM: 'Pertuturan — Perbualan & Perbincangan' },
      ],
      T3: [
        { id: 'en3-1', title: 'Grammar — Conditionals & Passive Voice', titleBM: 'Tatabahasa — Ayat Bersyarat & Ayat Pasif' },
        { id: 'en3-2', title: 'Writing — Formal Letter & Report', titleBM: 'Penulisan — Surat Rasmi & Laporan' },
        { id: 'en3-3', title: 'Literature — Drama & Novel', titleBM: 'Kesusasteraan — Drama & Novel' },
        { id: 'en3-4', title: 'Reading — Critical Thinking', titleBM: 'Bacaan — Pemikiran Kritis' },
        { id: 'en3-5', title: 'Summary Writing Skills', titleBM: 'Kemahiran Penulisan Rumusan' },
      ],
      T4: [
        { id: 'en4-1', title: 'SPM Writing — Directed & Continuous', titleBM: 'Penulisan SPM — Berpandu & Berterusan' },
        { id: 'en4-2', title: 'SPM Literature Component', titleBM: 'Komponen Kesusasteraan SPM' },
        { id: 'en4-3', title: 'Advanced Grammar — Complex Sentences', titleBM: 'Tatabahasa Lanjutan — Ayat Kompleks' },
        { id: 'en4-4', title: 'Comprehension — SPM Format', titleBM: 'Pemahaman — Format SPM' },
        { id: 'en4-5', title: 'Summary — SPM Techniques', titleBM: 'Rumusan — Teknik SPM' },
      ],
      T5: [
        { id: 'en5-1', title: 'SPM Essay Mastery — All Formats', titleBM: 'Penguasaan Karangan SPM — Semua Format' },
        { id: 'en5-2', title: 'Literature Revision — Poems, Stories, Drama, Novel', titleBM: 'Ulangkaji Sastera — Puisi, Cerpen, Drama, Novel' },
        { id: 'en5-3', title: 'Grammar Intensive Review', titleBM: 'Ulangkaji Intensif Tatabahasa' },
        { id: 'en5-4', title: 'Speaking Test Preparation', titleBM: 'Persediaan Ujian Lisan' },
        { id: 'en5-5', title: 'SPM Full Paper Practice', titleBM: 'Latihan Kertas Penuh SPM' },
      ],
    },
  },

  // 5. SEJARAH (CORE — Semua pelajar T1-T5)
  {
    id: 'sejarah',
    icon: '📜',
    name: 'History',
    nameBM: 'Sejarah',
    color: '#d97706',
    track: 'core',
    chapters: {
      T1: [
        { id: 'sj1-1', title: 'How to Study History', titleBM: 'Cara Belajar Sejarah' },
        { id: 'sj1-2', title: 'Early Malay Government System', titleBM: 'Sistem Pemerintahan Melayu Awal' },
        { id: 'sj1-3', title: 'The Malay Sultanate of Melaka', titleBM: 'Kesultanan Melayu Melaka' },
        { id: 'sj1-4', title: 'Malay Sultanate Administration System', titleBM: 'Sistem Pentadbiran Kesultanan Melayu' },
        { id: 'sj1-5', title: 'Trade & Economy of the Malay Sultanate', titleBM: 'Perdagangan & Ekonomi Kesultanan Melayu' },
        { id: 'sj1-6', title: 'Society & Culture of the Malay Sultanate', titleBM: 'Masyarakat & Kebudayaan Kesultanan Melayu' },
      ],
      T2: [
        { id: 'sj2-1', title: 'European Powers in Southeast Asia', titleBM: 'Kuasa Eropah di Asia Tenggara' },
        { id: 'sj2-2', title: 'Colonial Era in Malaya', titleBM: 'Zaman Penjajahan di Tanah Melayu' },
        { id: 'sj2-3', title: 'British Colonisation of Sabah & Sarawak', titleBM: 'Penjajahan British di Sabah & Sarawak' },
        { id: 'sj2-4', title: 'Rise of Nationalism', titleBM: 'Kebangkitan Nasionalisme' },
        { id: 'sj2-5', title: 'Japanese Occupation', titleBM: 'Pendudukan Jepun' },
        { id: 'sj2-6', title: 'Path to Independence', titleBM: 'Jalan ke Arah Kemerdekaan' },
      ],
      T3: [
        { id: 'sj3-1', title: 'Government & Country Administration', titleBM: 'Pemerintahan & Pentadbiran Negara' },
        { id: 'sj3-2', title: 'Federal Constitution', titleBM: 'Perlembagaan Persekutuan' },
        { id: 'sj3-3', title: 'Formation of Malaysia', titleBM: 'Pembentukan Malaysia' },
        { id: 'sj3-4', title: 'National Development', titleBM: 'Pembangunan Negara' },
        { id: 'sj3-5', title: 'National Unity & Integration', titleBM: 'Perpaduan & Integrasi Nasional' },
      ],
      T4: [
        { id: 'sj4-1', title: 'Early Civilisations of the World', titleBM: 'Tamadun Awal Dunia' },
        { id: 'sj4-2', title: 'The Malay World Before the Arrival of Islam', titleBM: 'Dunia Melayu Sebelum Kedatangan Islam' },
        { id: 'sj4-3', title: 'Islam and its Spread in the Malay World', titleBM: 'Islam dan Penyebarannya di Alam Melayu' },
        { id: 'sj4-4', title: 'The Malay Sultanate of Melaka (Advanced)', titleBM: 'Kesultanan Melayu Melaka (Lanjutan)' },
        { id: 'sj4-5', title: 'Threats to Malay Sovereignty', titleBM: 'Ancaman kepada Kedaulatan Melayu' },
        { id: 'sj4-6', title: 'British Intervention & Impact', titleBM: 'Campur Tangan & Kesan Penjajahan British' },
        { id: 'sj4-7', title: 'National Awakening in Malaya', titleBM: 'Kebangkitan Kebangsaan di Tanah Melayu' },
      ],
      T5: [
        { id: 'sj5-1', title: 'Malayan Union & Independence Struggle', titleBM: 'Malayan Union & Perjuangan Kemerdekaan' },
        { id: 'sj5-2', title: 'Formation of Malaysia', titleBM: 'Pembentukan Malaysia' },
        { id: 'sj5-3', title: 'Building a Sovereign Nation', titleBM: 'Membina Negara Berdaulat' },
        { id: 'sj5-4', title: 'Malaysia in the International Arena', titleBM: 'Malaysia di Persada Antarabangsa' },
        { id: 'sj5-5', title: 'National Development & Vision 2020', titleBM: 'Pembangunan Negara & Wawasan 2020' },
        { id: 'sj5-6', title: 'Patriotism & National Identity', titleBM: 'Patriotisme & Identiti Kebangsaan' },
      ],
    },
  },

  // 6. MATEMATIK TAMBAHAN (STEM — T4-T5)
  {
    id: 'add-math',
    icon: '📐',
    name: 'Additional Mathematics',
    nameBM: 'Matematik Tambahan',
    color: '#6366f1',
    track: 'elective',
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

  // 7. FIZIK (STEM — T4-T5)
  {
    id: 'physics',
    icon: '⚡',
    name: 'Physics',
    nameBM: 'Fizik',
    color: '#f59e0b',
    track: 'elective',
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

  // 8. KIMIA (STEM — T4-T5)
  {
    id: 'chemistry',
    icon: '🧪',
    name: 'Chemistry',
    nameBM: 'Kimia',
    color: '#10b981',
    track: 'elective',
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

  // 9. BIOLOGI (STEM — T4-T5)
  {
    id: 'biology',
    icon: '🧬',
    name: 'Biology',
    nameBM: 'Biologi',
    color: '#22c55e',
    track: 'elective',
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

  // 10. GEOGRAFI (T1-T3 + elective T4-T5)
  {
    id: 'geography',
    icon: '🌍',
    name: 'Geography',
    nameBM: 'Geografi',
    color: '#0ea5e9',
    track: 'elective',
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

  // 11. EKONOMI ASAS (Elektif T4-T5)
  {
    id: 'economics',
    icon: '💰',
    name: 'Basic Economics',
    nameBM: 'Ekonomi Asas',
    color: '#f97316',
    track: 'elective',
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

  // 12. PENDIDIKAN ISLAM (Islamic Studies — T1-T5)
  {
    id: 'pend-islam',
    icon: '🕌',
    name: 'Pendidikan Islam',
    nameBM: 'Pendidikan Islam',
    color: '#c9a84c',
    track: 'islamic',
    blurb: 'The KSSM Pendidikan Islam syllabus: aqidah, ibadah, sirah, akhlak and tilawah.',
    blurbBM: 'Sukatan Pendidikan Islam KSSM: aqidah, ibadah, sirah, akhlak dan tilawah.',
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

  // 13. PENDIDIKAN MORAL (CORE — T1-T5)
  {
    id: 'pend-moral',
    icon: '🤝',
    name: 'Moral Education',
    nameBM: 'Pendidikan Moral',
    color: '#a855f7',
    track: 'core',
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

  // 14. PRINSIP PERAKAUNAN (Elektif T4-T5)
  {
    id: 'perakaunan',
    icon: '📊',
    name: 'Principles of Accounting',
    nameBM: 'Prinsip Perakaunan',
    color: '#0891b2',
    track: 'elective',
    chapters: {
      T4: [
        { id: 'pa4-1', title: 'Introduction to Accounting', titleBM: 'Pengenalan Perakaunan' },
        { id: 'pa4-2', title: 'Classification of Accounts', titleBM: 'Pengelasan Akaun' },
        { id: 'pa4-3', title: 'Documents as Source of Information', titleBM: 'Dokumen Sebagai Sumber Maklumat' },
        { id: 'pa4-4', title: 'Journals', titleBM: 'Jurnal' },
        { id: 'pa4-5', title: 'Ledger', titleBM: 'Lejar' },
        { id: 'pa4-6', title: 'Trial Balance', titleBM: 'Imbangan Duga' },
        { id: 'pa4-7', title: 'Financial Statements of Sole Proprietorship', titleBM: 'Penyata Kewangan Milikan Tunggal' },
      ],
      T5: [
        { id: 'pa5-1', title: 'Adjustments in Financial Statements', titleBM: 'Pelarasan Penyata Kewangan' },
        { id: 'pa5-2', title: 'Financial Statements of Partnership', titleBM: 'Penyata Kewangan Perkongsian' },
        { id: 'pa5-3', title: 'Company Accounts', titleBM: 'Akaun Syarikat' },
        { id: 'pa5-4', title: 'Cash Flow Statement', titleBM: 'Penyata Aliran Tunai' },
        { id: 'pa5-5', title: 'Financial Ratios', titleBM: 'Nisbah Kewangan' },
        { id: 'pa5-6', title: 'Cost Accounting', titleBM: 'Perakaunan Kos' },
      ],
    },
  },
  // 15. SAINS KOMPUTER (Elektif T1-T5)
  {
    id: 'sains-komputer',
    icon: '💻',
    name: 'Computer Science',
    nameBM: 'Sains Komputer',
    color: '#6366f1',
    track: 'elective',
    chapters: {
      T1: [
        { id: 'sk1-1', title: 'Computational Thinking', titleBM: 'Pemikiran Komputasional' },
        { id: 'sk1-2', title: 'Representation of Data', titleBM: 'Perwakilan Data' },
        { id: 'sk1-3', title: 'Algorithms', titleBM: 'Algoritma' },
      ],
      T2: [
        { id: 'sk2-1', title: 'Data & Information', titleBM: 'Data dan Maklumat' },
        { id: 'sk2-2', title: 'Introduction to Programming', titleBM: 'Pengenalan Pengaturcaraan' },
        { id: 'sk2-3', title: 'Flowcharts & Pseudocode', titleBM: 'Carta Alir dan Pseudokod' },
      ],
      T3: [
        { id: 'sk3-1', title: 'Computer System', titleBM: 'Sistem Komputer' },
        { id: 'sk3-2', title: 'Computer Networking', titleBM: 'Rangkaian Komputer' },
        { id: 'sk3-3', title: 'Interactive Application Development', titleBM: 'Pembangunan Aplikasi Interaktif' },
      ],
      T4: [
        { id: 'sk4-1', title: 'Database Management', titleBM: 'Pengurusan Pangkalan Data' },
        { id: 'sk4-2', title: 'Programming Fundamentals', titleBM: 'Asas Pengaturcaraan' },
        { id: 'sk4-3', title: 'Web Application Development', titleBM: 'Pembangunan Aplikasi Web' },
      ],
      T5: [
        { id: 'sk5-1', title: 'Emerging Technologies', titleBM: 'Teknologi Baharu Muncul' },
        { id: 'sk5-2', title: 'Advanced Programming', titleBM: 'Pengaturcaraan Lanjutan' },
        { id: 'sk5-3', title: 'Innovation & Entrepreneurship in IT', titleBM: 'Inovasi dan Keusahawanan dalam IT' },
      ],
    },
  },

  // 16. TILAWAH & TAJWID AL-QURAN (Islamic Studies — T1-T5)
  {
    id: 'tilawah-quran',
    icon: '📖',
    name: 'Quran Recitation & Tajwid',
    nameBM: 'Tilawah & Tajwid al-Quran',
    color: '#c9a84c',
    track: 'islamic',
    linkedView: 'spiritual',
    blurb: 'Recitation rules from makhraj to tadabbur, with a verse-by-verse reader.',
    blurbBM: 'Hukum bacaan dari makhraj hingga tadabbur, dengan pembaca ayat demi ayat.',
    chapters: {
      T1: [
        { id: 'tq1-1', title: 'Articulation Points of Letters (Makhraj)', titleBM: 'Makhraj Huruf' },
        { id: 'tq1-2', title: 'Characteristics of Letters (Sifat)', titleBM: 'Sifat Huruf' },
        { id: 'tq1-3', title: 'Rules of Nun Sakinah & Tanwin', titleBM: 'Hukum Nun Sakinah & Tanwin' },
        { id: 'tq1-4', title: 'Rules of Mim Sakinah', titleBM: 'Hukum Mim Sakinah' },
      ],
      T2: [
        { id: 'tq2-1', title: 'Natural and Derived Elongation (Mad)', titleBM: 'Mad Asli & Mad Far\'i' },
        { id: 'tq2-2', title: 'Qalqalah', titleBM: 'Qalqalah' },
        { id: 'tq2-3', title: 'Rules of Ra', titleBM: 'Hukum Ra' },
        { id: 'tq2-4', title: 'Lam Jalalah', titleBM: 'Lam Jalalah' },
      ],
      T3: [
        { id: 'tq3-1', title: 'Stopping and Starting (Waqaf & Ibtida)', titleBM: 'Waqaf & Ibtida' },
        { id: 'tq3-2', title: 'Nasalisation (Ghunnah)', titleBM: 'Ghunnah' },
        { id: 'tq3-3', title: 'Types of Idgham', titleBM: 'Jenis-jenis Idgham' },
        { id: 'tq3-4', title: 'Reciting Juz Amma', titleBM: 'Tilawah Juz Amma' },
      ],
      T4: [
        { id: 'tq4-1', title: 'Tartil and Reflective Reading (Tadabbur)', titleBM: 'Tartil & Tadabbur' },
        { id: 'tq4-2', title: 'Memorisation of Selected Surahs', titleBM: 'Hafazan Surah Pilihan' },
        { id: 'tq4-3', title: 'Advanced Tajwid Rules', titleBM: 'Hukum Tajwid Lanjutan' },
      ],
      T5: [
        { id: 'tq5-1', title: 'Brief Exegesis of Selected Verses', titleBM: 'Tafsir Ringkas Ayat Pilihan' },
        { id: 'tq5-2', title: 'Introduction to Quranic Sciences', titleBM: 'Pengenalan Ulum al-Quran' },
        { id: 'tq5-3', title: 'Recitation Practice for SPM', titleBM: 'Latihan Tilawah untuk SPM' },
      ],
    },
  },

  // 17. HADIS & SUNNAH (Islamic Studies — T1-T5)
  {
    id: 'hadis-sunnah',
    icon: '🌙',
    name: 'Hadith & Sunnah',
    nameBM: 'Hadis & Sunnah',
    color: '#c9a84c',
    track: 'islamic',
    linkedView: 'sunnah-module',
    blurb: 'Daily sunnah practices and the 40 Hadith, every entry with its narrator and source.',
    blurbBM: 'Amalan sunnah harian dan 40 Hadis, setiap satu dengan perawi dan sumbernya.',
    chapters: {
      T1: [
        { id: 'hs1-1', title: 'Introduction to Hadith Studies', titleBM: 'Pengenalan Ilmu Hadis' },
        { id: 'hs1-2', title: 'Daily Manners from the Sunnah', titleBM: 'Adab Harian daripada Sunnah' },
        { id: 'hs1-3', title: 'Daily Supplications', titleBM: 'Doa Harian' },
        { id: 'hs1-4', title: 'Sunnah of Eating and Drinking', titleBM: 'Sunnah Makan & Minum' },
      ],
      T2: [
        { id: 'hs2-1', title: 'Sunnah of Sleeping and Waking', titleBM: 'Sunnah Tidur & Bangun' },
        { id: 'hs2-2', title: 'Manners of Travelling', titleBM: 'Adab Bermusafir' },
        { id: 'hs2-3', title: 'Cleanliness in the Sunnah', titleBM: 'Kebersihan dalam Sunnah' },
        { id: 'hs2-4', title: 'Sunnah of Dressing', titleBM: 'Sunnah Berpakaian' },
      ],
      T3: [
        { id: 'hs3-1', title: '40 Hadith of Imam Nawawi (1-10)', titleBM: '40 Hadis Imam Nawawi (1-10)' },
        { id: 'hs3-2', title: 'Classification: Sahih, Hasan, Daif', titleBM: 'Klasifikasi: Sahih, Hasan, Daif' },
        { id: 'hs3-3', title: 'Chain and Text (Sanad & Matan)', titleBM: 'Sanad & Matan' },
      ],
      T4: [
        { id: 'hs4-1', title: '40 Hadith of Imam Nawawi (11-25)', titleBM: '40 Hadis Imam Nawawi (11-25)' },
        { id: 'hs4-2', title: 'Hadith on Trade and Transactions', titleBM: 'Hadis tentang Muamalat' },
        { id: 'hs4-3', title: 'Hadith on Character', titleBM: 'Hadis tentang Akhlak' },
      ],
      T5: [
        { id: 'hs5-1', title: '40 Hadith of Imam Nawawi (26-40)', titleBM: '40 Hadis Imam Nawawi (26-40)' },
        { id: 'hs5-2', title: 'Basic Hadith Verification (Takhrij)', titleBM: 'Takhrij Hadis Asas' },
        { id: 'hs5-3', title: 'Applying the Sunnah in Modern Life', titleBM: 'Aplikasi Sunnah dalam Kehidupan Moden' },
      ],
    },
  },

  // 18. AQIDAH (Islamic Studies — T1-T5)
  {
    id: 'aqidah',
    icon: '💎',
    name: 'Islamic Creed (Aqidah)',
    nameBM: 'Aqidah',
    color: '#c9a84c',
    track: 'islamic',
    blurb: 'The six articles of faith, worked through carefully from Form 1 to Form 5.',
    blurbBM: 'Enam rukun iman, dihuraikan dengan teliti dari Tingkatan 1 hingga 5.',
    chapters: {
      T1: [
        { id: 'aq1-1', title: 'The Pillars of Faith', titleBM: 'Rukun Iman' },
        { id: 'aq1-2', title: 'Belief in Allah', titleBM: 'Beriman kepada Allah' },
        { id: 'aq1-3', title: 'The Names and Attributes of Allah', titleBM: 'Nama & Sifat Allah' },
        { id: 'aq1-4', title: 'Shirk and Its Dangers', titleBM: 'Syirik & Bahayanya' },
      ],
      T2: [
        { id: 'aq2-1', title: 'Belief in the Angels', titleBM: 'Beriman kepada Malaikat' },
        { id: 'aq2-2', title: 'Belief in the Revealed Books', titleBM: 'Beriman kepada Kitab' },
        { id: 'aq2-3', title: 'Belief in the Messengers', titleBM: 'Beriman kepada Rasul' },
      ],
      T3: [
        { id: 'aq3-1', title: 'Belief in the Last Day', titleBM: 'Beriman kepada Hari Akhirat' },
        { id: 'aq3-2', title: 'The Intermediate Realm (Barzakh)', titleBM: 'Alam Barzakh' },
        { id: 'aq3-3', title: 'Intercession and Reckoning', titleBM: 'Syafaat & Hisab' },
      ],
      T4: [
        { id: 'aq4-1', title: 'Divine Decree (Qada & Qadar)', titleBM: 'Qada & Qadar' },
        { id: 'aq4-2', title: 'The Categories of Tawhid', titleBM: 'Pembahagian Tauhid' },
        { id: 'aq4-3', title: 'Disbelief, Hypocrisy and Innovation', titleBM: 'Kufur, Nifaq & Bidaah' },
      ],
      T5: [
        { id: 'aq5-1', title: 'Faith and Modern Science', titleBM: 'Aqidah & Sains Moden' },
        { id: 'aq5-2', title: 'Answering Contemporary Doubts', titleBM: 'Menjawab Keraguan Kontemporari' },
        { id: 'aq5-3', title: 'Schools of Islamic Thought', titleBM: 'Aliran Pemikiran dalam Islam' },
      ],
    },
  },

  // 19. FIQH IBADAH (Islamic Studies — T1-T5)
  {
    id: 'fiqh-ibadah',
    icon: '🤲',
    name: 'Islamic Jurisprudence (Fiqh)',
    nameBM: 'Fiqh Ibadah',
    color: '#c9a84c',
    track: 'islamic',
    blurb: 'Purification, prayer, fasting, zakat and hajj, then transactions and family law.',
    blurbBM: 'Thaharah, solat, puasa, zakat dan haji, kemudian muamalat dan kekeluargaan.',
    chapters: {
      T1: [
        { id: 'fi1-1', title: 'Purification (Thaharah)', titleBM: 'Thaharah' },
        { id: 'fi1-2', title: 'Ablution and Dry Ablution', titleBM: 'Wudhu & Tayammum' },
        { id: 'fi1-3', title: 'The Obligatory Prayers', titleBM: 'Solat Fardhu' },
        { id: 'fi1-4', title: 'Manners in the Mosque', titleBM: 'Adab di Masjid' },
      ],
      T2: [
        { id: 'fi2-1', title: 'Congregational Prayer', titleBM: 'Solat Berjemaah' },
        { id: 'fi2-2', title: 'Voluntary Prayers', titleBM: 'Solat Sunat' },
        { id: 'fi2-3', title: 'Combining and Shortening Prayers', titleBM: 'Solat Jamak & Qasar' },
        { id: 'fi2-4', title: 'Fasting in Ramadan', titleBM: 'Puasa Ramadan' },
      ],
      T3: [
        { id: 'fi3-1', title: 'Zakat al-Fitr and Zakat on Wealth', titleBM: 'Zakat Fitrah & Zakat Harta' },
        { id: 'fi3-2', title: 'Hajj and Umrah', titleBM: 'Haji & Umrah' },
        { id: 'fi3-3', title: 'Sacrifice and Aqiqah', titleBM: 'Korban & Aqiqah' },
      ],
      T4: [
        { id: 'fi4-1', title: 'Transactions: Trade and Sale', titleBM: 'Muamalat: Jual Beli' },
        { id: 'fi4-2', title: 'Riba and Shariah-Compliant Alternatives', titleBM: 'Riba & Alternatif Patuh Syariah' },
        { id: 'fi4-3', title: 'Marriage Law (Munakahat)', titleBM: 'Fiqh Munakahat' },
      ],
      T5: [
        { id: 'fi5-1', title: 'Criminal Law (Jinayat)', titleBM: 'Fiqh Jenayah' },
        { id: 'fi5-2', title: 'Basic Inheritance Law (Faraid)', titleBM: 'Faraid Asas' },
        { id: 'fi5-3', title: 'Legal Theory and Objectives of Shariah', titleBM: 'Usul Fiqh & Maqasid Syariah' },
      ],
    },
  },

  // 20. SIRAH & TAMADUN ISLAM (Islamic Studies — T1-T5)
  {
    id: 'sirah-tamadun',
    icon: '🏛️',
    name: 'Prophetic Biography & Islamic Civilisation',
    nameBM: 'Sirah & Tamadun Islam',
    color: '#c9a84c',
    track: 'islamic',
    blurb: 'From pre-Islamic Arabia to the scholars of Baghdad and Islam in the Nusantara.',
    blurbBM: 'Dari Arab pra-Islam hingga sarjana Baghdad dan Islam di Nusantara.',
    chapters: {
      T1: [
        { id: 'st1-1', title: 'Arabia Before Islam', titleBM: 'Arab Sebelum Islam' },
        { id: 'st1-2', title: 'The Birth and Early Life of the Prophet', titleBM: 'Kelahiran & Zaman Awal Rasulullah SAW' },
        { id: 'st1-3', title: 'The Beginning of Revelation', titleBM: 'Permulaan Wahyu' },
      ],
      T2: [
        { id: 'st2-1', title: 'The Meccan Call', titleBM: 'Dakwah di Mekah' },
        { id: 'st2-2', title: 'Migration to Abyssinia and Taif', titleBM: 'Hijrah ke Habsyah & Taif' },
        { id: 'st2-3', title: 'The Night Journey and Ascension', titleBM: 'Israk & Mikraj' },
      ],
      T3: [
        { id: 'st3-1', title: 'Migration to Madinah', titleBM: 'Hijrah ke Madinah' },
        { id: 'st3-2', title: 'The Constitution of Madinah', titleBM: 'Piagam Madinah' },
        { id: 'st3-3', title: 'Badr, Uhud and the Trench', titleBM: 'Perang Badar, Uhud & Khandaq' },
      ],
      T4: [
        { id: 'st4-1', title: 'The Opening of Mecca', titleBM: 'Pembukaan Kota Mekah' },
        { id: 'st4-2', title: 'The Farewell Pilgrimage', titleBM: 'Haji Wida' },
        { id: 'st4-3', title: 'The Rightly Guided Caliphs', titleBM: 'Khulafa al-Rasyidin' },
      ],
      T5: [
        { id: 'st5-1', title: 'The Umayyad and Abbasid Civilisations', titleBM: 'Tamadun Umayyah & Abbasiyah' },
        { id: 'st5-2', title: 'Muslim Contributions to Science', titleBM: 'Sumbangan Sarjana Islam kepada Sains' },
        { id: 'st5-3', title: 'Melaka Sultanate and Islam in the Nusantara', titleBM: 'Kesultanan Melaka & Islam di Nusantara' },
      ],
    },
  },

  // 21. AKHLAK & ADAB (Islamic Studies — T1-T5)
  {
    id: 'akhlak-adab',
    icon: '🌸',
    name: 'Character & Etiquette',
    nameBM: 'Akhlak & Adab',
    color: '#c9a84c',
    track: 'islamic',
    blurb: 'Character formation, from manners at home to ethical leadership.',
    blurbBM: 'Pembentukan akhlak, dari adab di rumah hingga kepimpinan beretika.',
    chapters: {
      T1: [
        { id: 'ak1-1', title: 'Manners Towards Parents', titleBM: 'Adab kepada Ibu Bapa' },
        { id: 'ak1-2', title: 'Manners of Seeking Knowledge', titleBM: 'Adab Menuntut Ilmu' },
        { id: 'ak1-3', title: 'Manners Towards Teachers', titleBM: 'Adab dengan Guru' },
        { id: 'ak1-4', title: 'Personal Cleanliness', titleBM: 'Kebersihan Diri' },
      ],
      T2: [
        { id: 'ak2-1', title: 'Manners of Friendship', titleBM: 'Adab Berkawan' },
        { id: 'ak2-2', title: 'Guarding the Tongue', titleBM: 'Menjaga Lisan' },
        { id: 'ak2-3', title: 'Trustworthiness and Honesty', titleBM: 'Amanah & Kejujuran' },
      ],
      T3: [
        { id: 'ak3-1', title: 'Manners on Social Media', titleBM: 'Adab Bermedia Sosial' },
        { id: 'ak3-2', title: 'Respecting Diversity', titleBM: 'Menghormati Kepelbagaian' },
        { id: 'ak3-3', title: 'Community Service', titleBM: 'Khidmat Masyarakat' },
      ],
      T4: [
        { id: 'ak4-1', title: 'Patience, Gratitude and Trust in God', titleBM: 'Sabar, Syukur & Tawakal' },
        { id: 'ak4-2', title: 'Managing Anger and Resentment', titleBM: 'Menangani Marah & Dendam' },
        { id: 'ak4-3', title: 'Manners Towards Neighbours', titleBM: 'Adab Berjiran' },
      ],
      T5: [
        { id: 'ak5-1', title: 'Ethical Leadership in Islam', titleBM: 'Kepimpinan Beretika dalam Islam' },
        { id: 'ak5-2', title: 'Social Justice', titleBM: 'Keadilan Sosial' },
        { id: 'ak5-3', title: 'Civic Responsibility', titleBM: 'Tanggungjawab Warganegara' },
      ],
    },
  },

  // 22. BAHASA ARAB (Islamic Studies — T1-T5)
  {
    id: 'bahasa-arab',
    icon: '🔤',
    name: 'Arabic Language',
    nameBM: 'Bahasa Arab',
    color: '#c9a84c',
    track: 'islamic',
    blurb: 'Arabic from the alphabet to grammar, comprehension and translation.',
    blurbBM: 'Bahasa Arab dari huruf hijaiyah hingga nahu, kefahaman dan terjemahan.',
    chapters: {
      T1: [
        { id: 'ba1-1', title: 'The Arabic Alphabet and Pronunciation', titleBM: 'Huruf Hijaiyah & Sebutan' },
        { id: 'ba1-2', title: 'Basic Vocabulary', titleBM: 'Perbendaharaan Kata Asas' },
        { id: 'ba1-3', title: 'Pronouns', titleBM: 'Kata Ganti Nama' },
        { id: 'ba1-4', title: 'Introducing Yourself', titleBM: 'Memperkenalkan Diri' },
      ],
      T2: [
        { id: 'ba2-1', title: 'Nominal Sentences', titleBM: 'Jumlah Ismiyyah' },
        { id: 'ba2-2', title: 'Verbal Sentences', titleBM: 'Jumlah Filiyyah' },
        { id: 'ba2-3', title: 'Masculine and Feminine', titleBM: 'Mudhakkar & Muannath' },
        { id: 'ba2-4', title: 'Numbers', titleBM: 'Bilangan' },
      ],
      T3: [
        { id: 'ba3-1', title: 'Past and Present Tense Verbs', titleBM: 'Kata Kerja Madhi & Mudhari' },
        { id: 'ba3-2', title: 'Possessive Construction (Idhafah)', titleBM: 'Idhafah' },
        { id: 'ba3-3', title: 'Adjective and Noun Agreement', titleBM: 'Sifat & Mawsuf' },
      ],
      T4: [
        { id: 'ba4-1', title: 'Grammar: Basic Case Endings', titleBM: 'Nahu: Irab Asas' },
        { id: 'ba4-2', title: 'Morphology: Verb Patterns', titleBM: 'Sarf: Wazan Kata Kerja' },
        { id: 'ba4-3', title: 'Short Composition', titleBM: 'Karangan Pendek' },
      ],
      T5: [
        { id: 'ba5-1', title: 'Arabic Text Comprehension', titleBM: 'Kefahaman Teks Arab' },
        { id: 'ba5-2', title: 'Conversation and Writing', titleBM: 'Perbualan & Penulisan' },
        { id: 'ba5-3', title: 'Arabic-Malay Translation', titleBM: 'Terjemahan Arab-Melayu' },
      ],
    },
  },
];

/* ── Derived helpers ───────────────────────────────────────────────
   Used by the landing page so counts are never hardcoded, and by the
   dashboard so both surfaces group subjects identically.            */

export const getSubjectsByTrack = (track: SubjectTrack): Subject[] =>
  SUBJECTS.filter(s => s.track === track);

export const getChapterCount = (subject: Subject, tingkatan?: TingkatanKey): number =>
  tingkatan
    ? (subject.chapters[tingkatan]?.length ?? 0)
    : TINGKATAN.reduce((sum, t) => sum + (subject.chapters[t]?.length ?? 0), 0);

/** Subjects that teach anything at the given form level. */
export const getSubjectsForTingkatan = (tingkatan: TingkatanKey): Subject[] =>
  SUBJECTS.filter(s => (s.chapters[tingkatan]?.length ?? 0) > 0);

export const TOTAL_SUBJECTS = SUBJECTS.length;

export const TOTAL_CHAPTERS = SUBJECTS.reduce((sum, s) => sum + getChapterCount(s), 0);

export const TRACK_ORDER: SubjectTrack[] = ['core', 'elective', 'islamic'];
