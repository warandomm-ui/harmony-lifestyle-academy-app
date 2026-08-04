import React, { useState, useCallback } from 'react';
import type { DashboardMode, UserProfile, AnalysisResult } from '../../../../types';
import { generateContent } from '../../../../services/aiProxyService';

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SCHOOL SUBJECTS PAGE â Akademi Sekolah / School Academy
// 
// 8 subjects Ã 5 tingkatan Ã KSSM syllabus chapters
// AI-generated lessons via Gemini
// Muslim â sees Pendidikan Islam
// Universal â sees Pendidikan Moral
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ââ Types ââ
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

// ââ KSSM Syllabus Data ââ
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// COMPLETE KSSM SUBJECTS DATA â Tingkatan 1-5
// 
// DROP-IN REPLACEMENT for the SUBJECTS array in SchoolSubjectsPage.tsx
// 
// Instructions:
// 1. Open SchoolSubjectsPage.tsx
// 2. Replace the entire SUBJECTS array (line ~40 to ~282) with this data
// 3. Commit to GitHub
// 
// Subjects included:
//   CORE (all students): Matematik, Sains, Bahasa Melayu, English, Sejarah
//   STEM (T4-T5): Add Math, Physics, Chemistry, Biology
//   HUMANITIES: Geography, Economics
//   RELIGION: Pendidikan Islam (muslim), Pendidikan Moral (universal)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const SUBJECTS: SubjectData[] = [
  // ââââââââââââââââââââââââââââââââââââââ
  // 1. MATEMATIK (CORE â Semua pelajar T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'matematik',
    icon: 'ð¢',
    name: 'Mathematics',
    nameBM: 'Matematik',
    color: '#3b82f6',
    forMode: 'both',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 2. SAINS (CORE â Semua pelajar T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'sains',
    icon: 'ð¬',
    name: 'Science',
    nameBM: 'Sains',
    color: '#14b8a6',
    forMode: 'both',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 3. BAHASA MELAYU (CORE â Semua pelajar T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'bahasa-melayu',
    icon: 'ð',
    name: 'Bahasa Melayu',
    nameBM: 'Bahasa Melayu',
    color: '#ef4444',
    forMode: 'both',
    chapters: {
      T1: [
        { id: 'bm1-1', title: 'Comprehension Skills', titleBM: 'Kemahiran Membaca dan Memahami' },
        { id: 'bm1-2', title: 'Essay Writing â Narrative', titleBM: 'Penulisan Karangan â Naratif' },
        { id: 'bm1-3', title: 'Grammar â Word Classes', titleBM: 'Tatabahasa â Golongan Kata' },
        { id: 'bm1-4', title: 'KOMSAS â Poems & Short Stories', titleBM: 'KOMSAS â Sajak & Cerpen' },
        { id: 'bm1-5', title: 'Summary Writing', titleBM: 'Penulisan Rumusan' },
      ],
      T2: [
        { id: 'bm2-1', title: 'Essay Writing â Descriptive', titleBM: 'Penulisan Karangan â Deskriptif' },
        { id: 'bm2-2', title: 'Grammar â Sentence Structure', titleBM: 'Tatabahasa â Ayat Tunggal & Ayat Majmuk' },
        { id: 'bm2-3', title: 'KOMSAS â Drama & Pantun', titleBM: 'KOMSAS â Drama & Pantun' },
        { id: 'bm2-4', title: 'Formal Letter Writing', titleBM: 'Penulisan Surat Rasmi' },
        { id: 'bm2-5', title: 'Idioms & Proverbs', titleBM: 'Peribahasa & Simpulan Bahasa' },
      ],
      T3: [
        { id: 'bm3-1', title: 'Essay Writing â Argumentative', titleBM: 'Penulisan Karangan â Perbahasan' },
        { id: 'bm3-2', title: 'Grammar â Morphology', titleBM: 'Tatabahasa â Morfologi (Imbuhan)' },
        { id: 'bm3-3', title: 'KOMSAS â Novel', titleBM: 'KOMSAS â Novel' },
        { id: 'bm3-4', title: 'Report Writing', titleBM: 'Penulisan Laporan' },
        { id: 'bm3-5', title: 'Listening & Speaking Skills', titleBM: 'Kemahiran Mendengar & Bertutur' },
      ],
      T4: [
        { id: 'bm4-1', title: 'SPM Essay â Section A (Directed)', titleBM: 'Karangan SPM â Bahagian A (Berpandu)' },
        { id: 'bm4-2', title: 'SPM Essay â Section B (Open)', titleBM: 'Karangan SPM â Bahagian B (Terbuka)' },
        { id: 'bm4-3', title: 'Advanced Grammar & Error Correction', titleBM: 'Tatabahasa Lanjutan & Pembetulan Kesalahan' },
        { id: 'bm4-4', title: 'KOMSAS SPM â Anthology', titleBM: 'KOMSAS SPM â Antologi' },
        { id: 'bm4-5', title: 'SPM Summary Techniques', titleBM: 'Teknik Rumusan SPM' },
        { id: 'bm4-6', title: 'Comprehension â SPM Format', titleBM: 'Pemahaman â Format SPM' },
      ],
      T5: [
        { id: 'bm5-1', title: 'SPM Essay Mastery', titleBM: 'Penguasaan Karangan SPM' },
        { id: 'bm5-2', title: 'KOMSAS SPM â Novel & Anthology Revision', titleBM: 'KOMSAS SPM â Ulangkaji Novel & Antologi' },
        { id: 'bm5-3', title: 'Grammar Intensive Review', titleBM: 'Ulangkaji Intensif Tatabahasa' },
        { id: 'bm5-4', title: 'Oral Test Preparation', titleBM: 'Persediaan Ujian Lisan' },
        { id: 'bm5-5', title: 'SPM Full Paper Practice', titleBM: 'Latihan Kertas Penuh SPM' },
      ],
    },
  },

  // ââââââââââââââââââââââââââââââââââââââ
  // 4. BAHASA INGGERIS (CORE â Semua pelajar T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'english',
    icon: 'ð¬ð§',
    name: 'English',
    nameBM: 'Bahasa Inggeris',
    color: '#8b5cf6',
    forMode: 'both',
    chapters: {
      T1: [
        { id: 'en1-1', title: 'Reading Comprehension â Fiction & Non-Fiction', titleBM: 'Pemahaman Bacaan â Fiksyen & Bukan Fiksyen' },
        { id: 'en1-2', title: 'Grammar â Tenses (Present & Past)', titleBM: 'Tatabahasa â Kala (Kini & Lampau)' },
        { id: 'en1-3', title: 'Writing â Descriptive Paragraph', titleBM: 'Penulisan â Perenggan Deskriptif' },
        { id: 'en1-4', title: 'Literature â Short Stories', titleBM: 'Kesusasteraan â Cerpen' },
        { id: 'en1-5', title: 'Vocabulary Building', titleBM: 'Pembinaan Kosa Kata' },
      ],
      T2: [
        { id: 'en2-1', title: 'Grammar â Continuous & Perfect Tenses', titleBM: 'Tatabahasa â Kala Berterusan & Sempurna' },
        { id: 'en2-2', title: 'Writing â Narrative Essay', titleBM: 'Penulisan â Karangan Naratif' },
        { id: 'en2-3', title: 'Literature â Poems', titleBM: 'Kesusasteraan â Puisi' },
        { id: 'en2-4', title: 'Informal Letter & Email Writing', titleBM: 'Penulisan Surat Tak Rasmi & E-mel' },
        { id: 'en2-5', title: 'Speaking â Conversations & Discussions', titleBM: 'Pertuturan â Perbualan & Perbincangan' },
      ],
      T3: [
        { id: 'en3-1', title: 'Grammar â Conditionals & Passive Voice', titleBM: 'Tatabahasa â Ayat Bersyarat & Ayat Pasif' },
        { id: 'en3-2', title: 'Writing â Formal Letter & Report', titleBM: 'Penulisan â Surat Rasmi & Laporan' },
        { id: 'en3-3', title: 'Literature â Drama & Novel', titleBM: 'Kesusasteraan â Drama & Novel' },
        { id: 'en3-4', title: 'Reading â Critical Thinking', titleBM: 'Bacaan â Pemikiran Kritis' },
        { id: 'en3-5', title: 'Summary Writing Skills', titleBM: 'Kemahiran Penulisan Rumusan' },
      ],
      T4: [
        { id: 'en4-1', title: 'SPM Writing â Directed & Continuous', titleBM: 'Penulisan SPM â Berpandu & Berterusan' },
        { id: 'en4-2', title: 'SPM Literature Component', titleBM: 'Komponen Kesusasteraan SPM' },
        { id: 'en4-3', title: 'Advanced Grammar â Complex Sentences', titleBM: 'Tatabahasa Lanjutan â Ayat Kompleks' },
        { id: 'en4-4', title: 'Comprehension â SPM Format', titleBM: 'Pemahaman â Format SPM' },
        { id: 'en4-5', title: 'Summary â SPM Techniques', titleBM: 'Rumusan â Teknik SPM' },
      ],
      T5: [
        { id: 'en5-1', title: 'SPM Essay Mastery â All Formats', titleBM: 'Penguasaan Karangan SPM â Semua Format' },
        { id: 'en5-2', title: 'Literature Revision â Poems, Stories, Drama, Novel', titleBM: 'Ulangkaji Sastera â Puisi, Cerpen, Drama, Novel' },
        { id: 'en5-3', title: 'Grammar Intensive Review', titleBM: 'Ulangkaji Intensif Tatabahasa' },
        { id: 'en5-4', title: 'Speaking Test Preparation', titleBM: 'Persediaan Ujian Lisan' },
        { id: 'en5-5', title: 'SPM Full Paper Practice', titleBM: 'Latihan Kertas Penuh SPM' },
      ],
    },
  },

  // ââââââââââââââââââââââââââââââââââââââ
  // 5. SEJARAH (CORE â Semua pelajar T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'sejarah',
    icon: 'ð',
    name: 'History',
    nameBM: 'Sejarah',
    color: '#d97706',
    forMode: 'both',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 6. MATEMATIK TAMBAHAN (STEM â T4-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'add-math',
    icon: 'ð',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 7. FIZIK (STEM â T4-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'physics',
    icon: 'â¡',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 8. KIMIA (STEM â T4-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'chemistry',
    icon: 'ð§ª',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 9. BIOLOGI (STEM â T4-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'biology',
    icon: 'ð§¬',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 10. GEOGRAFI (T1-T3 + elective T4-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'geography',
    icon: 'ð',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 11. EKONOMI ASAS (Elektif T4-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'economics',
    icon: 'ð°',
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

  // ââââââââââââââââââââââââââââââââââââââ
  // 12. PENDIDIKAN ISLAM (Muslim Only â T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'pend-islam',
    icon: 'ð',
    name: 'Pendidikan Islam',
    nameBM: 'Pendidikan Islam',
    color: '#c9a84c',
    forMode: 'muslim',
    chapters: {
      T1: [
        { id: 'pi1-1', title: 'Aqidah â Beriman kepada Allah', titleBM: 'Aqidah â Beriman kepada Allah' },
        { id: 'pi1-2', title: 'Ibadah â Solat Fardhu', titleBM: 'Ibadah â Solat Fardhu' },
        { id: 'pi1-3', title: 'Sirah â Rasulullah SAW', titleBM: 'Sirah â Rasulullah SAW' },
        { id: 'pi1-4', title: 'Akhlak â Adab Mulia', titleBM: 'Akhlak â Adab Mulia' },
        { id: 'pi1-5', title: 'Tilawah al-Quran', titleBM: 'Tilawah al-Quran' },
      ],
      T2: [
        { id: 'pi2-1', title: 'Aqidah â Sifat Allah', titleBM: 'Aqidah â Sifat Allah' },
        { id: 'pi2-2', title: 'Ibadah â Puasa & Zakat', titleBM: 'Ibadah â Puasa & Zakat' },
        { id: 'pi2-3', title: 'Sirah â Khulafa al-Rasyidin', titleBM: 'Sirah â Khulafa al-Rasyidin' },
        { id: 'pi2-4', title: 'Akhlak â Adab Bermasyarakat', titleBM: 'Akhlak â Adab Bermasyarakat' },
      ],
      T3: [
        { id: 'pi3-1', title: 'Aqidah â Iman kepada Hari Akhirat', titleBM: 'Aqidah â Iman kepada Hari Akhirat' },
        { id: 'pi3-2', title: 'Ibadah â Haji & Korban', titleBM: 'Ibadah â Haji & Korban' },
        { id: 'pi3-3', title: 'Muamalat â Jual Beli Islam', titleBM: 'Muamalat â Jual Beli Islam' },
      ],
      T4: [
        { id: 'pi4-1', title: 'Aqidah â Qada & Qadar', titleBM: 'Aqidah â Qada & Qadar' },
        { id: 'pi4-2', title: 'Fiqh Munakahat', titleBM: 'Fiqh Munakahat' },
        { id: 'pi4-3', title: 'Tamadun Islam', titleBM: 'Tamadun Islam' },
        { id: 'pi4-4', title: 'Hadis â 40 Hadis Pilihan', titleBM: 'Hadis â 40 Hadis Pilihan' },
      ],
      T5: [
        { id: 'pi5-1', title: 'Aqidah â Islam & Sains', titleBM: 'Aqidah â Islam & Sains' },
        { id: 'pi5-2', title: 'Fiqh Jenayah & Kekeluargaan', titleBM: 'Fiqh Jenayah & Kekeluargaan' },
        { id: 'pi5-3', title: 'Dakwah & Kepimpinan Islam', titleBM: 'Dakwah & Kepimpinan Islam' },
      ],
    },
  },

  // ââââââââââââââââââââââââââââââââââââââ
  // 13. PENDIDIKAN MORAL (Universal Only â T1-T5)
  // ââââââââââââââââââââââââââââââââââââââ
  {
    id: 'pend-moral',
    icon: 'ð¤',
    name: 'Moral Education',
    nameBM: 'Pendidikan Moral',
    color: '#a855f7',
    forMode: 'universal',
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

  {
    id: 'perakaunan',
    icon: '📊',
    name: 'Principles of Accounting',
    nameBM: 'Prinsip Perakaunan',
    color: '#0891b2',
    forMode: 'universal',
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
  {
    id: 'sains-komputer',
    icon: '💻',
    name: 'Computer Science',
    nameBM: 'Sains Komputer',
    color: '#6366f1',
    forMode: 'universal',
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
];
const TINGKATAN = ['T1', 'T2', 'T3', 'T4', 'T5'];
const TINGKATAN_LABELS: Record<string, Record<string, string>> = {
  muslim: { T1: 'Tingkatan 1', T2: 'Tingkatan 2', T3: 'Tingkatan 3', T4: 'Tingkatan 4', T5: 'Tingkatan 5' },
  universal: { T1: 'Form 1', T2: 'Form 2', T3: 'Form 3', T4: 'Form 4', T5: 'Form 5' },
};

// ââ AI Lesson Generator ââ
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

// âââ MAIN COMPONENT âââ
interface SchoolSubjectsPageProps {
  dashboardMode: DashboardMode;
  onNavigate?: (view: string) => void;
  userProfile?: UserProfile;
  userResults?: AnalysisResult;
}

const SchoolSubjectsPage: React.FC<SchoolSubjectsPageProps> = ({ dashboardMode, userProfile, userResults, onNavigate }) => {
  const isMuslim = dashboardMode === 'muslim';
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>('T1');
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

  // ââ SUBJECT GRID VIEW ââ
  if (!selectedSubject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {isMuslim ? 'ð« Akademi Sekolah' : 'ð« School Academy'}
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

  // ââ CHAPTER LIST VIEW ââ
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
              {isMuslim ? 'ð Tiada bab untuk tingkatan ini' : 'ð No chapters for this form level'}
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

  // ââ LESSON VIEW (AI-generated) ââ
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
            {selectedSubject.icon} {isMuslim ? selectedSubject.nameBM : selectedSubject.name} Â· {TINGKATAN_LABELS[dashboardMode][selectedTingkatan]}
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
              <span className="text-lg">ð</span>
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
                <span className="text-lg">â­</span>
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
                <span className="text-lg">âï¸</span>
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
                <span className="text-lg">ð§ </span>
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
                        {level === 'easy' ? 'ð Easy' : level === 'medium' ? 'ð Medium' : 'ð¥ Hard'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
              onClick={() => handleGenerateLesson(selectedSubject, selectedChapter)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all"
            >
              {isMuslim ? 'ð Jana Pelajaran Baru' : 'ð Generate New Lesson'}
            </button>
                <button
                  onClick={() => {
                    if (selectedSubject && selectedChapter) {
                      markChapterComplete(selectedSubject + '_' + selectedChapter);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  â Mark Chapter Complete
                </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSubjectsPage;
