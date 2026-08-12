import type { HarmonyDimensionId, HarmonyDimensionMeta, SkillCategoryId } from '../types';

// ═══════════════════════════════════════════════════════════════════
// HARMONY 5-DIMENSION MODEL
//
// The Student 360° survey collects DISC, MBTI, Enneagram, Big Five,
// HEXACO, temperament, social styles and multiple intelligences.
// Those are useful but abstract for a 13-17 year old. This file maps
// them onto five dimensions parents and students already talk about:
//
//   SQ      — kecerdasan rohani (meaning, reflection, purpose)
//   IQ      — kecerdasan intelek (reasoning, focus, learning)
//   EQ      — kecerdasan emosi (self-regulation, empathy)
//   Kinetic — kecerdasan kinestetik (body, energy, hands-on doing)
//   Akhlak  — nilai moral, integriti, adab
//
// Every skill in the four catalogues is then tagged with the
// dimensions it *leans on* and the dimensions it *grows*, so a
// recommendation can always explain itself.
// ═══════════════════════════════════════════════════════════════════

export const HARMONY_DIMENSION_ORDER: HarmonyDimensionId[] = ['sq', 'iq', 'eq', 'kinetic', 'akhlak'];

export const HARMONY_DIMENSIONS: Record<HarmonyDimensionId, HarmonyDimensionMeta> = {
  sq: {
    id: 'sq',
    code: 'SQ',
    label: 'Kecerdasan Rohani',
    labelEn: 'Spiritual Intelligence',
    icon: '🌌',
    description: 'Keupayaan mencari makna, muhasabah diri, dan menghubungkan tindakan harian dengan tujuan hidup.',
    descriptionEn: 'Finding meaning, reflecting inwardly, and connecting daily actions to a bigger purpose.',
  },
  iq: {
    id: 'iq',
    code: 'IQ',
    label: 'Kecerdasan Intelek',
    labelEn: 'Intellectual Intelligence',
    icon: '🧠',
    description: 'Keupayaan menaakul, fokus, menyelesaikan masalah dan menguasai perkara baharu.',
    descriptionEn: 'Reasoning, focus, problem-solving, and picking up new material quickly.',
  },
  eq: {
    id: 'eq',
    code: 'EQ',
    label: 'Kecerdasan Emosi',
    labelEn: 'Emotional Intelligence',
    icon: '💗',
    description: 'Keupayaan mengenal dan mengurus emosi sendiri serta memahami perasaan orang lain.',
    descriptionEn: 'Recognising and managing your own emotions, and reading other people well.',
  },
  kinetic: {
    id: 'kinetic',
    code: 'KQ',
    label: 'Kecerdasan Kinestetik',
    labelEn: 'Kinetic Intelligence',
    icon: '🤸',
    description: 'Keupayaan belajar melalui pergerakan, tangan, latihan fizikal dan praktikal.',
    descriptionEn: 'Learning through movement, hands-on practice, and physical training.',
  },
  akhlak: {
    id: 'akhlak',
    code: 'AQ',
    label: 'Akhlak & Nilai Moral',
    labelEn: 'Character & Moral Values',
    icon: '🕊️',
    description: 'Kejujuran, amanah, sabar, memaafkan dan adab dalam berhubung dengan orang lain.',
    descriptionEn: 'Honesty, trustworthiness, patience, forgiveness, and how you treat other people.',
  },
};

// Alternative wording for Muslim students, who see the same dimensions
// framed with the vocabulary already used elsewhere in their dashboard.
export const HARMONY_DIMENSION_LABELS_MUSLIM: Partial<Record<HarmonyDimensionId, { label: string; description: string }>> = {
  sq: {
    label: 'Kecerdasan Rohani (Ruhiyyah)',
    description: 'Kekuatan hubungan dengan Allah, muhasabah diri, dan meletakkan niat di sebalik setiap amalan harian.',
  },
  akhlak: {
    label: 'Akhlak & Adab',
    description: 'Sifat amanah, sabar, syukur, pemaaf dan adab terhadap ibu bapa, guru serta rakan.',
  },
};

export const SKILL_CATEGORY_META: Record<SkillCategoryId, { title: string; titleEn: string; icon: string }> = {
  technical: { title: 'Kemahiran Teknikal', titleEn: 'Technical Skills', icon: '💻' },
  professional: { title: 'Kemahiran Profesional', titleEn: 'Professional Skills', icon: '👔' },
  life: { title: 'Pengurusan Kehidupan', titleEn: 'Life Management', icon: '💪' },
  creative: { title: 'Kemahiran Kreatif', titleEn: 'Creative Skills', icon: '🎨' },
};

export interface SkillDimensionProfile {
  skill: string;
  category: SkillCategoryId;
  /**
   * Dimensions the skill draws on. A student already strong here will
   * find the skill natural — weight 0-1.
   */
  leverages: Partial<Record<HarmonyDimensionId, number>>;
  /**
   * Dimensions the skill actively trains. Used to recommend skills that
   * close a gap, not only skills that echo existing strengths — weight 0-1.
   */
  builds: Partial<Record<HarmonyDimensionId, number>>;
  /** One-line rationale in Bahasa Malaysia, shown with the recommendation. */
  note: string;
}

// ─── TECHNICAL ───────────────────────────────────────────────────────
const TECHNICAL: SkillDimensionProfile[] = [
  {
    skill: 'Python Programming',
    category: 'technical',
    leverages: { iq: 1.0 },
    builds: { iq: 0.6, akhlak: 0.2 },
    note: 'Melatih pemikiran logik langkah demi langkah — sesuai jika anda suka menyelesaikan teka-teki.',
  },
  {
    skill: 'Data Analysis',
    category: 'technical',
    leverages: { iq: 1.0, sq: 0.2 },
    builds: { iq: 0.6 },
    note: 'Mengasah keupayaan membaca corak dan membuat keputusan berdasarkan bukti, bukan andaian.',
  },
  {
    skill: 'Web Development',
    category: 'technical',
    leverages: { iq: 0.8, kinetic: 0.4 },
    builds: { iq: 0.5, kinetic: 0.3 },
    note: 'Belajar sambil membina — setiap baris kod memberi hasil yang boleh dilihat serta-merta.',
  },
  {
    skill: 'Mobile App Development',
    category: 'technical',
    leverages: { iq: 0.8, eq: 0.3 },
    builds: { iq: 0.5, eq: 0.2 },
    note: 'Menggabungkan logik pengaturcaraan dengan memahami keperluan sebenar pengguna.',
  },
  {
    skill: 'Artificial Intelligence & Machine Learning',
    category: 'technical',
    leverages: { iq: 1.0, sq: 0.3 },
    builds: { iq: 0.7, akhlak: 0.4 },
    note: 'Bidang berintensiti tinggi yang menuntut penaakulan tajam dan pertimbangan etika penggunaan AI.',
  },
  {
    skill: 'Cybersecurity',
    category: 'technical',
    leverages: { iq: 0.9, akhlak: 0.6 },
    builds: { iq: 0.5, akhlak: 0.6 },
    note: 'Kemahiran yang bergantung pada integriti — kuasa teknikal mesti diseimbangkan dengan amanah.',
  },
  {
    skill: 'Cloud Computing',
    category: 'technical',
    leverages: { iq: 0.9 },
    builds: { iq: 0.5 },
    note: 'Sesuai untuk minda sistematik yang gemar menyusun infrastruktur secara teratur.',
  },
  {
    skill: 'Game Development',
    category: 'technical',
    leverages: { iq: 0.7, kinetic: 0.5, eq: 0.3 },
    builds: { iq: 0.4, kinetic: 0.3 },
    note: 'Gabungan logik, reka bentuk dan pengulangan cepat — memuaskan bagi pelajar praktikal.',
  },
  {
    skill: '3D Design & Animation',
    category: 'technical',
    leverages: { kinetic: 0.7, iq: 0.5 },
    builds: { kinetic: 0.4, iq: 0.3 },
    note: 'Kemahiran visual-ruang yang melatih tangan dan mata bekerja serentak.',
  },
  {
    skill: 'Video Editing',
    category: 'technical',
    leverages: { kinetic: 0.6, eq: 0.4 },
    builds: { kinetic: 0.3, eq: 0.3 },
    note: 'Menyusun cerita melalui imej dan rentak — hasil kelihatan dalam masa singkat.',
  },
  {
    skill: 'Graphic Design',
    category: 'technical',
    leverages: { kinetic: 0.5, eq: 0.4, iq: 0.3 },
    builds: { kinetic: 0.3, eq: 0.2 },
    note: 'Menterjemah idea dan perasaan kepada bentuk visual yang mudah difahami.',
  },
  {
    skill: 'Digital Marketing',
    category: 'technical',
    leverages: { eq: 0.8, iq: 0.5 },
    builds: { eq: 0.4, iq: 0.3, akhlak: 0.3 },
    note: 'Memerlukan kepekaan terhadap orang lain, dan kejujuran dalam menyampaikan mesej.',
  },
];

// ─── PROFESSIONAL ────────────────────────────────────────────────────
const PROFESSIONAL: SkillDimensionProfile[] = [
  {
    skill: 'Project Management',
    category: 'professional',
    leverages: { iq: 0.7, eq: 0.6 },
    builds: { iq: 0.4, eq: 0.5, akhlak: 0.3 },
    note: 'Melatih anda memegang amanah, menepati janji dan menyelaraskan kerja orang lain.',
  },
  {
    skill: 'Communication Skills',
    category: 'professional',
    leverages: { eq: 0.9 },
    builds: { eq: 0.7, akhlak: 0.4 },
    note: 'Asas kepada semua kemahiran lain — cara anda bercakap menentukan cara anda dipercayai.',
  },
  {
    skill: 'Leadership & Teamwork',
    category: 'professional',
    leverages: { eq: 0.8, akhlak: 0.6, kinetic: 0.3 },
    builds: { eq: 0.6, akhlak: 0.6 },
    note: 'Kepimpinan sebenar dinilai melalui akhlak, bukan jawatan.',
  },
  {
    skill: 'Critical Thinking',
    category: 'professional',
    leverages: { iq: 1.0, sq: 0.3 },
    builds: { iq: 0.7, sq: 0.3 },
    note: 'Melatih anda bertanya "kenapa" sebelum menerima sesuatu maklumat.',
  },
  {
    skill: 'Time Management',
    category: 'professional',
    leverages: { iq: 0.5, akhlak: 0.4 },
    builds: { iq: 0.5, akhlak: 0.4, sq: 0.3 },
    note: 'Menguruskan masa bermakna menghormati amanah masa yang diberikan kepada anda.',
  },
  {
    skill: 'Public Speaking',
    category: 'professional',
    leverages: { eq: 0.7, kinetic: 0.5 },
    builds: { eq: 0.6, kinetic: 0.4 },
    note: 'Melatih keberanian, kawalan nafas dan bahasa badan di hadapan orang ramai.',
  },
  {
    skill: 'Negotiation',
    category: 'professional',
    leverages: { eq: 0.8, iq: 0.5, akhlak: 0.4 },
    builds: { eq: 0.5, akhlak: 0.5 },
    note: 'Belajar mencari penyelesaian adil tanpa menzalimi pihak lain.',
  },
  {
    skill: 'Entrepreneurship',
    category: 'professional',
    leverages: { iq: 0.6, eq: 0.6, kinetic: 0.5, akhlak: 0.4 },
    builds: { eq: 0.4, akhlak: 0.5, sq: 0.3 },
    note: 'Menuntut keberanian mencuba, ketahanan menerima kegagalan dan integriti berniaga.',
  },
];

// ─── LIFE MANAGEMENT ─────────────────────────────────────────────────
const LIFE: SkillDimensionProfile[] = [
  {
    skill: 'Mental Wellness',
    category: 'life',
    leverages: { eq: 0.8, sq: 0.6 },
    builds: { eq: 0.9, sq: 0.6 },
    note: 'Asas kepada semua yang lain — minda yang tenang belajar dengan lebih baik.',
  },
  {
    skill: 'Health & Fitness',
    category: 'life',
    leverages: { kinetic: 1.0 },
    builds: { kinetic: 0.9, eq: 0.3, akhlak: 0.3 },
    note: 'Menjaga tubuh badan adalah tanggungjawab, bukan sekadar hobi.',
  },
  {
    skill: 'Stress Management',
    category: 'life',
    leverages: { eq: 0.8, sq: 0.5 },
    builds: { eq: 0.9, sq: 0.4 },
    note: 'Teknik praktikal untuk kekal tenang ketika tekanan peperiksaan memuncak.',
  },
  {
    skill: 'Emotional Intelligence (EQ)',
    category: 'life',
    leverages: { eq: 1.0 },
    builds: { eq: 1.0, akhlak: 0.5 },
    note: 'Melatih anda mengenal emosi sebelum emosi mengawal tindakan anda.',
  },
  {
    skill: 'Goal Setting',
    category: 'life',
    leverages: { iq: 0.5, sq: 0.6 },
    builds: { sq: 0.6, iq: 0.4 },
    note: 'Menghubungkan usaha harian dengan gambaran besar hidup anda.',
  },
  {
    skill: 'Habit Building',
    category: 'life',
    leverages: { akhlak: 0.5, kinetic: 0.4 },
    builds: { akhlak: 0.6, kinetic: 0.4, iq: 0.3 },
    note: 'Perubahan kecil yang konsisten membentuk peribadi jangka panjang.',
  },
  {
    skill: 'Focus Management',
    category: 'life',
    leverages: { iq: 0.9 },
    builds: { iq: 0.8, sq: 0.3 },
    note: 'Melatih daya tumpuan yang panjang dalam dunia penuh gangguan skrin.',
  },
  {
    skill: 'Adaptability & Resilience',
    category: 'life',
    leverages: { eq: 0.7, kinetic: 0.3 },
    builds: { eq: 0.7, sq: 0.4, akhlak: 0.3 },
    note: 'Kemahiran bangkit semula selepas kegagalan — sabar yang dilatih.',
  },
  {
    skill: 'Financial Literacy',
    category: 'life',
    leverages: { iq: 0.7, akhlak: 0.4 },
    builds: { iq: 0.4, akhlak: 0.5 },
    note: 'Memahami wang sebelum wang memahami anda — termasuk amanah berbelanja.',
  },
  {
    skill: 'Personal Finance',
    category: 'life',
    leverages: { iq: 0.6, akhlak: 0.5 },
    builds: { akhlak: 0.5, iq: 0.3 },
    note: 'Belanjawan, simpanan dan sedekah — disiplin kecil yang membina keyakinan.',
  },
  {
    skill: 'Cooking & Nutrition',
    category: 'life',
    leverages: { kinetic: 0.9 },
    builds: { kinetic: 0.6, eq: 0.3 },
    note: 'Kemahiran tangan yang berguna setiap hari dan menjaga kesihatan keluarga.',
  },
  {
    skill: 'Sustainable Living',
    category: 'life',
    leverages: { sq: 0.7, akhlak: 0.5 },
    builds: { sq: 0.5, akhlak: 0.5 },
    note: 'Menjaga alam sebagai amanah bersama, bermula dari tabiat kecil di rumah.',
  },
  {
    skill: 'AI Literacy',
    category: 'life',
    leverages: { iq: 0.8 },
    builds: { iq: 0.5, akhlak: 0.5 },
    note: 'Tahu bila AI membantu dan bila ia menipu — kemahiran wajib generasi anda.',
  },
  {
    skill: 'Digital Wellbeing',
    category: 'life',
    leverages: { eq: 0.6, sq: 0.5 },
    builds: { eq: 0.6, sq: 0.5, akhlak: 0.3 },
    note: 'Mengawal skrin supaya skrin tidak mengawal tidur, fokus dan emosi anda.',
  },
  {
    skill: 'Media Literacy',
    category: 'life',
    leverages: { iq: 0.8, akhlak: 0.4 },
    builds: { iq: 0.5, akhlak: 0.5 },
    note: 'Menapis berita palsu sebelum berkongsi — tanggungjawab moral dalam talian.',
  },
  {
    skill: 'Personal Branding',
    category: 'life',
    leverages: { eq: 0.7, sq: 0.4 },
    builds: { eq: 0.4, akhlak: 0.4, sq: 0.3 },
    note: 'Membina reputasi yang jujur — apa yang orang kata tentang anda tanpa kehadiran anda.',
  },
];

// ─── CREATIVE ────────────────────────────────────────────────────────
const CREATIVE: SkillDimensionProfile[] = [
  {
    skill: 'Game Design',
    category: 'creative',
    leverages: { iq: 0.6, kinetic: 0.5, eq: 0.4 },
    builds: { iq: 0.4, eq: 0.3 },
    note: 'Mereka pengalaman yang dinikmati orang lain — logik bertemu empati.',
  },
  {
    skill: 'Music Production',
    category: 'creative',
    leverages: { kinetic: 0.7, eq: 0.6, sq: 0.4 },
    builds: { kinetic: 0.4, eq: 0.4 },
    note: 'Melatih pendengaran, rentak dan ketekunan mengulang sehingga sempurna.',
  },
  {
    skill: 'Photography',
    category: 'creative',
    leverages: { kinetic: 0.6, sq: 0.5 },
    builds: { kinetic: 0.4, sq: 0.4 },
    note: 'Melatih mata memerhati keindahan yang selalu terlepas pandang.',
  },
  {
    skill: 'Content Creation',
    category: 'creative',
    leverages: { eq: 0.8, kinetic: 0.4 },
    builds: { eq: 0.4, akhlak: 0.4, kinetic: 0.3 },
    note: 'Bercakap kepada audiens sebenar — pengaruh datang bersama tanggungjawab.',
  },
  {
    skill: 'Animation',
    category: 'creative',
    leverages: { kinetic: 0.7, iq: 0.4 },
    builds: { kinetic: 0.5, iq: 0.3 },
    note: 'Kerja halus dan berulang yang membina kesabaran serta ketelitian.',
  },
  {
    skill: 'Creative Writing',
    category: 'creative',
    leverages: { sq: 0.7, eq: 0.7, iq: 0.5 },
    builds: { sq: 0.6, eq: 0.5 },
    note: 'Menulis memaksa anda memahami perasaan sendiri sebelum menceritakannya.',
  },
];

export const SKILL_DIMENSION_PROFILES: SkillDimensionProfile[] = [
  ...TECHNICAL,
  ...PROFESSIONAL,
  ...LIFE,
  ...CREATIVE,
];

export const SKILL_DIMENSION_PROFILE_BY_NAME: Record<string, SkillDimensionProfile> =
  SKILL_DIMENSION_PROFILES.reduce((acc, profile) => {
    acc[profile.skill] = profile;
    return acc;
  }, {} as Record<string, SkillDimensionProfile>);
