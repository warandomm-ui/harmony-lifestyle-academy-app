import React, { useState, useEffect } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';
import { isMuslim } from '../../../utils/religionUtils';

// --- Types ---
interface DimensionBenefit {
  ruh: string;
  aql: string;
  qalb: string;
  nafs: string;
  jasad: string;
}

interface RoutineTask {
  id: string;
  time: string;
  task: string;
  category: 'solat' | 'ibadah' | 'health' | 'study' | 'life' | 'social';
  sunnahNote: string;
  scienceNote: string;
  dimensions: DimensionBenefit;
  isFixed: boolean;
}

interface RoutineLog {
  [taskId: string]: boolean;
}

// --- Config ---
const CATEGORY_CONFIG: Record<string, { emoji: string; label: string }> = {
  solat:  { emoji: '🕌', label: 'Solat' },
  ibadah: { emoji: '📿', label: 'Ibadah' },
  health: { emoji: '💪', label: 'Health' },
  study:  { emoji: '📚', label: 'Learning' },
  life:   { emoji: '🌙', label: 'Lifestyle' },
  social: { emoji: '👨‍👩‍👧‍👦', label: 'Social' },
};

const ISLAMIC_DIMENSION_CONFIG: Record<string, { emoji: string; label: string; desc: string }> = {
  ruh:   { emoji: '🕊️', label: 'Ruh',   desc: 'Kesedaran Spiritual' },
  aql:   { emoji: '🧠', label: 'Aql',   desc: 'Akal & Pemikiran' },
  qalb:  { emoji: '❤️', label: 'Qalb',  desc: 'Hati & Emosi' },
  nafs:  { emoji: '⚔️', label: 'Nafs',  desc: 'Disiplin Diri' },
  jasad: { emoji: '💪', label: 'Jasad', desc: 'Fizikal & Badan' },
};

const UNIVERSAL_DIMENSION_CONFIG: Record<string, { emoji: string; label: string; desc: string }> = {
  ruh:   { emoji: '✨', label: 'Soul',  desc: 'Spirit & Purpose' },
  aql:   { emoji: '🧠', label: 'Mind',  desc: 'Intellect & Clarity' },
  qalb:  { emoji: '❤️', label: 'Heart', desc: 'Emotions & Connection' },
  nafs:  { emoji: '⚔️', label: 'Self',  desc: 'Discipline & Character' },
  jasad: { emoji: '💪', label: 'Body',  desc: 'Physical Wellbeing' },
};

// ========================================
// UNIVERSAL PRODUCTIVE ROUTINE
// ========================================
const UNIVERSAL_ROUTINE: RoutineTask[] = [
  {
    id: 'morning-meditation',
    time: '5:30 AM',
    task: 'Morning Meditation (10 min)',
    category: 'life',
    sunnahNote: 'Ancient wisdom across every tradition recommends beginning the day in stillness. The Stoics, Buddhists, and Transcendentalists all shared this practice.',
    scienceNote: '🔬 Harvard study: 8 weeks of mindfulness increases grey matter in self-awareness regions. Morning meditation reduces cortisol by up to 20% for the entire day.',
    dimensions: {
      ruh: 'Connecting with something greater — whether nature, the universe, or your deeper purpose',
      aql: 'Meditation strengthens the prefrontal cortex — better decisions, clearer thinking all day',
      qalb: 'Calms the emotional brain — sets a positive emotional baseline from the very start',
      nafs: 'Sitting still for 10 minutes when your mind wants to scroll — the ultimate daily discipline',
      jasad: 'Lowers cortisol, reduces blood pressure, activates the parasympathetic nervous system',
    },
    isFixed: false,
  },
  {
    id: 'gratitude',
    time: '5:45 AM',
    task: 'Gratitude Journaling (5 min)',
    category: 'life',
    sunnahNote: 'Marcus Aurelius began every morning by reflecting on what he was grateful for. This practice appears in Stoicism, Buddhism, Positive Psychology and every wisdom tradition.',
    scienceNote: '🔬 2022 study (J American College Health, 132 students, 8 weeks): Gratitude journaling increased life satisfaction, resilience and reduced depression, anxiety and stress significantly.',
    dimensions: {
      ruh: 'Recognising the gifts in your life shifts your perspective from scarcity to abundance',
      aql: 'Writing clarifies thoughts — journaling processes emotions and organises your mental models',
      qalb: 'Gratitude rewires the brain for positivity — the most evidence-based antidepressant available',
      nafs: 'Focusing on what you have over what you lack trains contentment and self-sufficiency',
      jasad: 'Gratitude practice lowers inflammation markers and measurably improves immune function',
    },
    isFixed: false,
  },
  {
    id: 'exercise',
    time: '6:00 AM',
    task: 'Exercise / Movement (30 min)',
    category: 'health',
    sunnahNote: 'The ancient Greeks believed a sound mind requires a sound body. Every wisdom tradition recognises physical movement as essential to human flourishing.',
    scienceNote: '🔬 Morning exercise raises BDNF (brain growth factor) — improves memory and learning (Biomolecules, 2021). 30 min/day reduces depression risk by 26% (Harvard, 2019).',
    dimensions: {
      ruh: 'Caring for your body is an act of gratitude for the gift of life',
      aql: 'BDNF surge after exercise grows new neurons — physical movement literally makes you smarter',
      qalb: 'Endorphins released during exercise create natural, lasting mood elevation',
      nafs: 'Pushing through workout discomfort builds the mental resilience to handle all challenges',
      jasad: 'Strong muscles, healthy heart, dense bones, better posture, higher sustained energy',
    },
    isFixed: false,
  },
  {
    id: 'breakfast',
    time: '7:30 AM',
    task: 'Healthy Breakfast',
    category: 'health',
    sunnahNote: 'Hippocrates: "Let food be thy medicine." Every culture emphasises a nourishing morning meal to fuel the body and mind for the day ahead.',
    scienceNote: '🔬 The brain uses 20% of the body\'s energy — a proper breakfast provides stable glucose for 4-5 hours of peak focus. Skipping breakfast is linked to 20% lower cognitive performance.',
    dimensions: {
      ruh: 'Eating mindfully and appreciating where your food came from is itself a spiritual practice',
      aql: 'Stable blood sugar = stable energy for the prefrontal cortex — the seat of rational thought',
      qalb: 'Eating with intention creates a positive, nourishing relationship with food',
      nafs: 'Eating until satisfied (not stuffed) — practising moderation and self-awareness at every meal',
      jasad: 'Balanced nutrition fuels metabolism, supports immunity and maintains hormonal balance',
    },
    isFixed: false,
  },
  {
    id: 'deep-work',
    time: '8:00 AM',
    task: 'Deep Focus Study / Work (2-3 hrs)',
    category: 'study',
    sunnahNote: 'Every great philosopher, scientist and creator has uninterrupted morning deep work as their cornerstone habit. The Stoics called this simply "doing the work."',
    scienceNote: '🔬 Cortisol peaks 8-11 AM — the brain is most alert for complex information processing. "Deep work" in the morning is 2-4x more productive than afternoon sessions (Cal Newport, MIT).',
    dimensions: {
      ruh: 'Mastery in your craft is a form of service — developing your gifts benefits the world',
      aql: 'Morning is the golden hour for learning — cortisol peak = sharpest focus and retention',
      qalb: 'Flow state during deep work brings profound fulfilment and a deep sense of purpose',
      nafs: 'Resisting all distractions for 2-3 hours = the ultimate training of sustained self-discipline',
      jasad: 'The brain is a muscle — deep work is its most demanding and rewarding daily workout',
    },
    isFixed: false,
  },
  {
    id: 'mindful-break',
    time: '10:30 AM',
    task: 'Mindful Break (5 min walk)',
    category: 'health',
    sunnahNote: 'Aristotle did his best thinking while walking. The Peripatetic school of philosophy was literally built around walking and thinking together.',
    scienceNote: '🔬 Short walking breaks improve creative thinking by 81% (Stanford, 2014). Five-minute movement breaks every 90 minutes prevent cognitive fatigue and maintain sustained performance.',
    dimensions: {
      ruh: 'Nature walks naturally induce awe — a reminder of the vastness of existence beyond your screen',
      aql: 'The Default Mode Network activates during walks — crucial for insight and creative breakthroughs',
      qalb: 'Brief breaks prevent emotional burnout and restore mental equilibrium between focus sessions',
      nafs: 'Strategic rest is not laziness — it is intelligent recovery for sustained peak performance',
      jasad: 'Prevents repetitive strain, improves circulation, reduces eye fatigue from prolonged screen use',
    },
    isFixed: false,
  },
  {
    id: 'lunch',
    time: '1:00 PM',
    task: 'Mindful Lunch',
    category: 'health',
    sunnahNote: 'The Japanese "hara hachi bu" — eating until 80% full — comes from Okinawa, home to one of the world\'s longest-living populations. A universal wisdom on moderation.',
    scienceNote: '🔬 Mindful eating increases satiety signals by 25% (Harvard Health). Eating without screens reduces overeating and significantly improves digestion and nutrient absorption.',
    dimensions: {
      ruh: 'Appreciating your meal as nourishment shifts eating from automatic to intentional and sacred',
      aql: 'Moderate lunch prevents afternoon brain fog — overeating diverts blood from brain to digestion',
      qalb: 'Sharing a meal with others boosts oxytocin, lowers cortisol and deepens social bonds',
      nafs: 'Stopping at satisfied, not stuffed — a daily practice of restraint and genuine self-awareness',
      jasad: 'Eating slowly and seated maximises nutrient absorption and supports healthy digestion',
    },
    isFixed: false,
  },
  {
    id: 'power-nap',
    time: '2:00 PM',
    task: 'Power Nap (20 min)',
    category: 'health',
    sunnahNote: 'Churchill, Einstein, Da Vinci and Tesla were all famous nappers. NASA, Google, Nike and the US Military all have official nap policies. Rest is a performance tool.',
    scienceNote: '🔬 Meta-analysis 2022 (Sleep Medicine Reviews, 54 studies): 20-min nap improves vigilance +61%, procedural memory +49%, declarative memory +38%. Must be under 30 min to avoid grogginess.',
    dimensions: {
      ruh: 'Rest is not weakness — it is restoration. Honouring your body\'s rhythms is its own wisdom',
      aql: 'Memory consolidation during nap — what you learnt this morning is being stored permanently',
      qalb: 'Refreshed emotional state after nap — less reactive, more patient for the entire afternoon',
      nafs: 'Exactly 20 minutes, then up — not 2 hours. Discipline in rest is as important as in work',
      jasad: 'Heart rate drops, muscles recover, cortisol decreases — a complete physiological reset',
    },
    isFixed: false,
  },
  {
    id: 'skill-dev',
    time: '3:00 PM',
    task: 'Skill Development / Side Project',
    category: 'study',
    sunnahNote: 'Leonardo da Vinci, Benjamin Franklin and Marcus Aurelius all dedicated specific afternoon hours to practising their craft every single day without exception.',
    scienceNote: '🔬 Deliberate practice 1 hour/day = expert in any field (Ericsson, 1993). Afternoon is ideal for creative and repetitive practice tasks — the brain is warmed up but not yet fatigued.',
    dimensions: {
      ruh: 'Developing a skill that serves others is a contribution to the world beyond yourself',
      aql: 'Deliberate practice builds new neural pathways — the brain literally rewires to become more capable',
      qalb: '"I can build something" — competence and mastery are among the deepest sources of self-worth',
      nafs: 'Choosing skill-building over entertainment every day — discipline compounds into mastery over years',
      jasad: 'Fine motor skills, hand-eye coordination, posture discipline all develop through regular craft practice',
    },
    isFixed: false,
  },
  {
    id: 'evening-walk',
    time: '5:30 PM',
    task: 'Evening Walk in Nature (20 min)',
    category: 'health',
    sunnahNote: 'Thoreau, Rousseau and Nietzsche all attributed their greatest ideas to walking in nature. Every major contemplative tradition prescribes time outdoors for mental clarity.',
    scienceNote: '🔬 20 minutes in nature reduces cortisol by 21.3% and deactivates the stress response (Frontiers in Psychology, 2019). Regular nature exposure is linked to lower rates of anxiety and depression.',
    dimensions: {
      ruh: 'Nature inspires awe and perspective — the antidote to the narrow concerns of daily life',
      aql: 'Walking in nature allows the mind to wander productively — solving problems without trying',
      qalb: 'Natural settings restore emotional balance disrupted by urban and digital overstimulation',
      nafs: 'Choosing a walk over scrolling — training your attention toward the real and the meaningful',
      jasad: 'Sunlight, fresh air, movement — the most natural and effective medicine for human physiology',
    },
    isFixed: false,
  },
  {
    id: 'family-time',
    time: '7:00 PM',
    task: 'Family & Quality Time',
    category: 'social',
    sunnahNote: 'The Harvard Study of Adult Development (75+ years, 724 participants) found quality relationships are the single greatest predictor of happiness and longevity — above wealth, fame or IQ.',
    scienceNote: '🔬 Harvard study: relationship satisfaction at 50 was the strongest predictor of health and happiness at 80. Loneliness is as damaging as smoking 15 cigarettes per day (Brigham Young, 2015).',
    dimensions: {
      ruh: 'Love and genuine connection are the deepest expressions of our shared humanity',
      aql: 'Family conversations develop communication, empathy, perspective-taking and social intelligence',
      qalb: 'Secure attachment and belonging are the bedrock of emotional health and long-term wellbeing',
      nafs: 'Being fully present — phone away, ego down — is the hardest and most rewarding daily practice',
      jasad: 'Oxytocin from connection lowers blood pressure, strengthens immunity and promotes deep sleep',
    },
    isFixed: false,
  },
  {
    id: 'evening-reflection',
    time: '9:00 PM',
    task: 'Evening Reflection (10 min)',
    category: 'life',
    sunnahNote: 'The Stoic "evening review" — asking "what did I do well? what could I improve?" — was practised nightly by Marcus Aurelius, Seneca and Epictetus without exception.',
    scienceNote: '🔬 Meta-analysis 2020 (J Occupational Health, 9 RCTs): Self-reflection practices significantly reduce stress and depression. Eight weeks of journaling increased resilience by 23% (2022).',
    dimensions: {
      ruh: 'Reviewing your day with honest eyes — celebrating growth and acknowledging lessons learned',
      aql: 'Metacognition — thinking about your thinking — is the highest level of intellectual development',
      qalb: 'Releasing the day\'s emotions through reflection prevents them accumulating as chronic stress',
      nafs: 'Holding yourself accountable without self-punishment — the path to genuine, lasting growth',
      jasad: 'Brain dump before sleep clears working memory so the brain does not rehearse worries at night',
    },
    isFixed: false,
  },
  {
    id: 'reading',
    time: '9:30 PM',
    task: 'Reading (30 min)',
    category: 'study',
    sunnahNote: 'Bill Gates reads 50 books per year. Warren Buffett reads 500 pages per day. "Not all readers are leaders, but all leaders are readers." — Harry S. Truman.',
    scienceNote: '🔬 Reading fiction increases empathy by 23% (Science, 2013). 30 minutes of reading before bed reduces stress by 68% — more effective than music or tea (University of Sussex, 2009).',
    dimensions: {
      ruh: 'Great books connect you to the greatest minds across centuries — expanding your inner world',
      aql: 'Reading builds vocabulary, analytical thinking, and knowledge that compounds across a lifetime',
      qalb: 'Stories develop emotional intelligence and empathy — you live a thousand lives through books',
      nafs: 'Choosing a book over a screen — training attention, patience and depth over distraction',
      jasad: 'Reduces cortisol, lowers heart rate, relaxes muscles — the ideal preparation for deep sleep',
    },
    isFixed: false,
  },
  {
    id: 'sleep',
    time: '10:00 PM',
    task: 'Sleep (7-8 hours)',
    category: 'life',
    sunnahNote: 'Benjamin Franklin: "Early to bed and early to rise makes a man healthy, wealthy and wise." Sleep is the universal medicine — revered across every culture in human history.',
    scienceNote: '🔬 Sleep is when the brain\'s glymphatic system flushes toxins including Alzheimer\'s proteins — only active during deep sleep (Science, 2013). Chronic sleep deprivation reduces IQ by 10-15 points.',
    dimensions: {
      ruh: 'Surrendering to sleep is trusting the process of restoration — letting go of control',
      aql: 'Sleep consolidates all learning — without it, memories do not form and nothing is truly retained',
      qalb: 'Emotional regulation depends entirely on sleep — the sleep-deprived are 60% more emotionally reactive',
      nafs: 'Sleeping at 10 PM despite wanting to scroll — victory over the modern world\'s most powerful addiction',
      jasad: 'HGH release, cellular repair, immune strengthening, cardiovascular restoration all happen during sleep',
    },
    isFixed: false,
  },
];

// ========================================
// DEFAULT PROPHETIC ROUTINE
// ========================================
const DEFAULT_ROUTINE: RoutineTask[] = [
  {
    id: 'tahajjud',
    time: '4:30 AM',
    task: 'Qiyamullail / Tahajjud',
    category: 'ibadah',
    sunnahNote: 'Nabi ﷺ bangun sepertiga malam terakhir untuk solat malam. "Doa paling dimakbulkan ialah di sepertiga akhir malam" (HR Tirmizi). Baginda tidak pernah tinggalkan tahajjud walau dalam musafir.',
    scienceNote: '🔬 Kajian 2025 (Kufa Journal, 210 peserta Indonesia, 4 minggu): Bangun 4-5 pagi → cortisol naik +45%, gen BMAL1 & PER2 naik 1.5x. Kesan: metabolisme aktif, gula darah stabil, badan cergas.',
    dimensions: {
      ruh: 'Masa paling dekat dengan Allah — doa dimakbulkan, hati disambung terus kepada Pencipta',
      aql: 'Prefrontal cortex paling tenang — sesuai berfikir jernih, buat keputusan & rancang hari',
      qalb: 'Hati dilembut dengan munajat — rasa takut, harap & cinta pada Allah paling mendalam',
      nafs: 'Latihan ULTIMATE lawan nafs — bangun masa orang tidur = bukti kau serius berubah',
      jasad: 'Cortisol naik +45% semulajadi — badan "switch on" awal, metabolisme aktif',
    },
    isFixed: false,
  },
  {
    id: 'subuh',
    time: '5:30 AM',
    task: 'Solat Subuh',
    category: 'solat',
    sunnahNote: '"Dua rakaat Subuh lebih baik dari dunia dan seisinya" (HR Muslim). Nabi ﷺ solat berjemaah & duduk berzikir sehingga syuruk.',
    scienceNote: '🔬 Kajian 2021 (Medical J Malaysia, review 1966-2020): Solat = kesan positif pada neurologi, kardiovaskular & muskuloskeletal. Kajian 2025 (IJABSS): Sujud = "grounding therapy" — sentuhan dahi ke tanah stabilkan sistem saraf & tingkatkan emotional regulation.',
    dimensions: {
      ruh: 'Tiang agama — berdiri di hadapan Allah = mengaku kita hamba, Dia Tuhan',
      aql: 'Sujud tingkatkan aliran darah ke otak — lebih oksigen, lebih fokus sepanjang pagi',
      qalb: 'Al-Fatihah setiap rakaat = "perbualan" dengan Allah — hati tenang & terpimpin',
      nafs: 'Bangun awal untuk Subuh lawan kemalasan — disiplin paling asas yang bina semua disiplin lain',
      jasad: 'Rukuk, sujud, duduk = senaman ringan teratur yang aktifkan hampir semua sendi & otot utama',
    },
    isFixed: true,
  },
  {
    id: 'azkar-pagi',
    time: '5:50 AM',
    task: 'Zikir & Doa Pagi',
    category: 'ibadah',
    sunnahNote: 'Nabi ﷺ duduk berzikir dari Subuh sampai syuruk. Amalan: Ayatul Kursi, 3 Qul 3x, SubhanAllah 33x, Alhamdulillah 33x, Allahuakbar 33x. "Siapa baca ini, dilindungi dari segala keburukan" (HR Abu Dawud).',
    scienceNote: '🔬 Systematic Review 2025 (Iranian J Psychiatry, 22 kajian EEG): Zikir/Quran naikkan gelombang alpha & theta otak = relaxation & emotional regulation. Kajian 2023: Zikir kurangkan anxiety, stress & depression secara signifikan.',
    dimensions: {
      ruh: 'Perisai rohani — perlindungan dari gangguan syaitan & keburukan sepanjang hari',
      aql: 'Gelombang alpha naik = "fokus tenang" — otak masuk state optimal untuk belajar',
      qalb: 'SubhanAllah, Alhamdulillah, Allahuakbar = reset emosi. Hati jadi positif & tenang',
      nafs: 'Istiqamah zikir setiap pagi = latihan konsistensi. Nafs belajar ikut jadual, bukan ikut mood',
      jasad: 'Cortisol turun — tekanan darah stabil, immune system lebih kuat',
    },
    isFixed: false,
  },
  {
    id: 'isyraq',
    time: '6:30 AM',
    task: 'Solat Dhuha / Isyraq',
    category: 'ibadah',
    sunnahNote: '"Setiap pagi, setiap sendi kamu ada sedekah. Dua rakaat Dhuha sudah cukup untuk sedekah 360 sendi" (HR Muslim). Nabi ﷺ solat Dhuha 2-8 rakaat.',
    scienceNote: '🔬 Kajian 2020 (Narrative Review): Solat = aktiviti fizikal ringan sama kesan seperti yoga — tingkatkan fleksibiliti & sistem immune. Muslim pengamal solat punya range of motion 139.5° vs 102.5° bukan pengamal.',
    dimensions: {
      ruh: 'Sedekah untuk setiap sendi = bersyukur dengan badan yang Allah beri',
      aql: 'Pergerakan ringan pagi bantu otak "warm up" untuk deep focus',
      qalb: 'Solat sunat = bukti cinta pada Allah tanpa dipaksa — hati jadi lebih ikhlas',
      nafs: 'Nafs kata "tak wajib, skip lah" — lawan tu = upgrade disiplin ke level seterusnya',
      jasad: 'Senaman ringan aktifkan sendi, lancarkan peredaran darah, tingkatkan flexibility',
    },
    isFixed: false,
  },
  {
    id: 'workout',
    time: '6:45 AM',
    task: 'Senaman / Workout (30 min)',
    category: 'health',
    sunnahNote: '"Mukmin yang kuat lebih baik dan lebih dicintai Allah dari mukmin yang lemah" (HR Muslim). Nabi ﷺ galakkan memanah, berkuda, berenang.',
    scienceNote: '🔬 Senaman pagi naikkan BDNF (brain growth factor) — tingkatkan memory & learning (Biomolecules, 2021). 30 min/hari kurangkan risiko depression 26% (Harvard, 2019).',
    dimensions: {
      ruh: 'Badan kuat = ibadah lebih khusyuk, boleh puasa, bangun tahajjud tanpa penat',
      aql: 'BDNF naik = otak grow new neurons — literally jadi lebih pandai lepas senaman',
      qalb: 'Endorphin release = mood positif sepanjang hari. Exercise = anti-depressant semulajadi',
      nafs: 'Workout paksa nafs tahan tak selesa — belajar tahan sakit — transfer ke semua cabaran hidup',
      jasad: 'Otot kuat, jantung sihat, tulang padat, postur baik, stamina tinggi',
    },
    isFixed: false,
  },
  {
    id: 'breakfast',
    time: '7:30 AM',
    task: 'Sarapan Sihat (Sunnah Food)',
    category: 'health',
    sunnahNote: 'Nabi ﷺ makan kurma, madu, zaitun, roti barli, susu. Prinsip: 1/3 makanan, 1/3 air, 1/3 udara (HR Tirmizi). Makan tangan kanan, sebut Bismillah, duduk.',
    scienceNote: '🔬 Madu: Antibakteria, lawan 60+ jenis bakteria (Saudi J Bio Sci, 2020, 240 citations). Kurma: GI rendah 42-55. Prinsip 1/3: Kurangkan insulin spike & risiko diabetes type 2.',
    dimensions: {
      ruh: 'Bismillah sebelum makan = ingat Allah Pemberi rezeki. Makanan halal & tayyib bersihkan ruh',
      aql: 'Otak guna 20% tenaga badan — sarapan betul beri glucose stabil untuk fokus 4-5 jam',
      qalb: 'Makan bersyukur = hati gembira. Makan berlebihan = hati berat & gelap',
      nafs: 'Prinsip 1/3 = latihan kawal nafsu. Nafs nak penuh — kau stop 1/3 = kau menang',
      jasad: 'Nutrisi seimbang pagi = tenaga stabil, pencernaan lancar, berat badan terkawal',
    },
    isFixed: false,
  },
  {
    id: 'study-1',
    time: '8:00 AM',
    task: 'Belajar / Sekolah (Deep Focus)',
    category: 'study',
    sunnahNote: '"Ya Allah, aku mohon ilmu yang bermanfaat, rezeki yang halal, dan amalan yang diterima" (HR Ibn Majah). Wahyu pertama: "Iqra — Bacalah!" (Al-Alaq: 1).',
    scienceNote: '🔬 Cortisol peak 8-11 pagi — otak paling alert & mampu proses info kompleks. "Deep work" pagi 2-4x lebih produktif dari petang (Cal Newport, MIT).',
    dimensions: {
      ruh: 'Menuntut ilmu = ibadah. "Siapa keluar menuntut ilmu, dia di jalan Allah sehingga pulang" (HR Tirmizi)',
      aql: 'Pagi = golden hour otak. Cortisol peak = fokus & ingatan paling tajam',
      qalb: 'Ilmu yang diamalkan buat hati tenang — tahu apa patut buat = kurang anxiety',
      nafs: 'Fokus 2-3 jam tanpa phone = latihan tahan godaan. Nafs nak scroll — kau belajar',
      jasad: 'Otak = otot. Semakin dilatih semakin kuat. Belajar pagi = senaman otak waktu peak',
    },
    isFixed: false,
  },
  {
    id: 'zohor',
    time: '1:00 PM',
    task: 'Solat Zohor',
    category: 'solat',
    sunnahNote: '"Amalan paling dicintai Allah ialah solat pada waktunya" (HR Bukhari). 12 rakaat sunat rawatib (4 sebelum + 2 selepas Zohor) = rumah di syurga.',
    scienceNote: '🔬 5x solat/hari = 5x "movement break" kurangkan risiko penyakit jantung & sakit belakang (Medical J Malaysia, 2021). Wudhu kurangkan bakteria hidung ~70% (Kajian Taif 2018).',
    dimensions: {
      ruh: 'Solat tengah hari = reset spiritual. Dunia buat kau lupa Allah — Zohor ingatkan balik',
      aql: 'Break dari belajar beri otak masa proses maklumat — memory consolidation lebih kukuh',
      qalb: 'Wudhu + solat = "emotional reset button". Masuk stres, keluar tenang',
      nafs: 'Solat tepat waktu walau sibuk = latihan prioriti. Allah > semua',
      jasad: 'Wudhu bersihkan bakteria. Gerakan solat kurangkan risiko DVT akibat duduk lama',
    },
    isFixed: true,
  },
  {
    id: 'lunch',
    time: '1:30 PM',
    task: 'Makan Tengahari',
    category: 'health',
    sunnahNote: 'Nabi ﷺ makan perlahan, tangan kanan, Bismillah, duduk. Tidak pernah mencela makanan. "Berkumpullah makan, nescaya diberkati" (HR Abu Dawud).',
    scienceNote: '🔬 Mindful eating tingkatkan rasa kenyang 25% lebih awal — kurangkan makan berlebihan (Harvard Health). Makan bersama tingkatkan oxytocin & kurangkan cortisol.',
    dimensions: {
      ruh: 'Bismillah + bersyukur = setiap suapan jadi ibadah',
      aql: 'Makan sederhana = tak ngantuk. Otak masih boleh function untuk sesi petang',
      qalb: 'Makan bersama = bonding. Tidak mencela makanan = hati bersyukur',
      nafs: 'Stop sebelum kenyang = latihan kawal diri paling basic. Master ini = master nafsu lain',
      jasad: 'Pencernaan efisien bila makan duduk & perlahan. Nutrisi diserap lebih baik',
    },
    isFixed: false,
  },
  {
    id: 'qailulah',
    time: '2:00 PM',
    task: 'Qailulah (Power Nap 20 min)',
    category: 'health',
    sunnahNote: '"Tidur sianglah (qailulah), kerana syaitan tidak tidur siang" (HR Al-Tabarani). Sahabat amalkan tidur siang sebentar untuk bertenaga menjelang malam.',
    scienceNote: '🔬 Meta-analysis 2022 (Sleep Medicine Reviews, 54 kajian): Power nap tingkatkan vigilance +61%, procedural memory +49%, declarative memory +38%.',
    dimensions: {
      ruh: 'Ikut Sunnah dalam perkara "kecil" = tanda cinta pada Nabi ﷺ',
      aql: 'Memory consolidation semasa nap — apa belajar pagi "disimpan" dalam long-term memory',
      qalb: 'Rehat tengah hari reset emosi — kurang irritable, lebih sabar petang',
      nafs: 'Nap 20 min je bukan 2 jam = latihan disiplin masa. Set alarm, bangun = nafs terkawal',
      jasad: 'Badan recovery dari pagi. Heart rate turun, otot relax, tenaga recharge',
    },
    isFixed: false,
  },
  {
    id: 'asar',
    time: '4:00 PM',
    task: 'Solat Asar',
    category: 'solat',
    sunnahNote: '"Siapa tinggalkan solat Asar, amalannya terhapus" (HR Bukhari). Asar = solat wusta: "Hafizuu alas solawaat was solatil wusta" (Al-Baqarah: 238).',
    scienceNote: '🔬 2-4 PM = "afternoon slump" — adenosine terkumpul. Movement break (solat) counteract dengan tingkatkan blood flow & alertness. Wudhu air sejuk aktifkan "dive reflex".',
    dimensions: {
      ruh: 'Asar = ujian paling susah — semua sibuk. Tinggal semua & solat = bukti iman sebenar',
      aql: 'Break dari afternoon slump — otak reset untuk 2-3 jam productive petang',
      qalb: 'Hati yang jaga Asar = hati yang prioritikan Allah atas dunia',
      nafs: 'Nafs kata "nanti lah" — kau solat jugak = nafs kalah, iman menang',
      jasad: 'Wudhu + solat = physical reset. Kurangkan kesan duduk lama sepanjang hari',
    },
    isFixed: true,
  },
  {
    id: 'quran',
    time: '4:30 PM',
    task: 'Baca Al-Quran (10-30 min)',
    category: 'ibadah',
    sunnahNote: '"Setiap huruf 10 pahala — Alif satu huruf, Lam satu huruf, Mim satu huruf" (HR Tirmizi). "Quran itu penyembuh bagi apa yang ada dalam dada" (Al-Isra: 82).',
    scienceNote: '🔬 EEG Review 2025 (22 kajian): Baca/dengar Quran naikkan alpha & theta = relaxation & fokus mendalam. Systematic Review 2022 (20 kajian): Quran perbaiki depression, anxiety, kualiti tidur & naikkan IQ.',
    dimensions: {
      ruh: 'Quran = kalam Allah langsung. Baca = ruh "minum air" — tanpa Quran, ruh dahaga & mati perlahan',
      aql: 'Hafalan Quran tingkatkan IQ & memory. Theta otak = state "super learning"',
      qalb: '"Dengan zikrullah, hati jadi tenang" (Ar-Rad: 28) — penyembuh paling mujarab untuk hati',
      nafs: 'Quran ajar apa betul & salah — nafs jadi terdidik, tahu had & limit',
      jasad: 'Cortisol turun, blood pressure stabil, immune system kuat',
    },
    isFixed: false,
  },
  {
    id: 'skill',
    time: '5:00 PM',
    task: 'Latih Skill / Side Project',
    category: 'study',
    sunnahNote: '"Tangan yang di atas (memberi) lebih baik dari tangan yang di bawah" (HR Bukhari & Muslim). Abu Bakar = ahli perniagaan, Ali = ahli ilmu, Khadijah = usahawan.',
    scienceNote: '🔬 Deliberate practice 1 jam/hari = pakar dalam bidang (Ericsson, 1993). Petang = waktu baik untuk latihan kreatif — idea lebih mengalir (Wieth & Zacks, 2011).',
    dimensions: {
      ruh: 'Skill bermanfaat = sedekah jariah. Buat app, ajar orang — pahala mengalir',
      aql: 'Deliberate practice bina neural pathways baru — otak "rewire" jadi lebih capable',
      qalb: 'Rasa "aku boleh buat sesuatu" = confidence naik, self-worth naik',
      nafs: 'Pilih skill practice > Netflix/TikTok = nafs kalah lagi satu round',
      jasad: 'Typing, coding, menulis = fine motor skill. Drawing = hand-eye coordination',
    },
    isFixed: false,
  },
  {
    id: 'maghrib',
    time: '7:15 PM',
    task: 'Solat Maghrib',
    category: 'solat',
    sunnahNote: 'Nabi ﷺ segera solat Maghrib sebaik azan — tidak bertangguh. Maghrib = peralihan siang ke malam, masa syaitan berkeliaran — solat jadi perisai.',
    scienceNote: '🔬 Kajian 2025 (IJABSS): Ibadah petang bantu transisi dari sympathetic (fight-or-flight) ke parasympathetic (rest-and-digest). Penting untuk pemulihan otot & persiapan tidur.',
    dimensions: {
      ruh: 'Peralihan siang-malam = tanda kebesaran Allah. Maghrib = syukur atas hari yang selamat',
      aql: 'Transisi ke mode "wind down" — otak proses & simpan semua input hari ini',
      qalb: 'Maghrib = refleksi. Apa baik hari ini? Apa perlu diperbaiki? Hati jadi sedar',
      nafs: 'Segera solat = lawan tangguh. Nafs nak "nanti, nak habis tengok ni" — kau solat',
      jasad: 'Parasympathetic aktif = badan masuk "repair mode". Otot relax, pencernaan lancar',
    },
    isFixed: true,
  },
  {
    id: 'family',
    time: '7:45 PM',
    task: 'Masa Keluarga / Silaturahim',
    category: 'social',
    sunnahNote: '"Sebaik-baik kamu ialah yang terbaik terhadap keluarganya" (HR Tirmizi). Nabi ﷺ bermain, bergurau, berbual dengan keluarga setiap malam.',
    scienceNote: '🔬 Harvard Study (75+ tahun, 724 peserta): Hubungan sosial berkualiti = faktor #1 kebahagiaan & umur panjang. Masa keluarga tingkatkan oxytocin & turunkan cortisol.',
    dimensions: {
      ruh: '"Siapa nak dimurahkan rezeki & dipanjangkan umur, sambunglah silaturahim" (HR Bukhari)',
      aql: 'Berbual dengan keluarga = latihan communication, empathy & problem-solving',
      qalb: 'Rasa "ada orang sayang aku" = hati kuat. Loneliness bunuh — connection sembuh',
      nafs: 'Dengar orang lain, sabar dengan kerenah mereka = latihan tahan ego',
      jasad: 'Oxytocin naik, cortisol turun = immune kuat, tekanan darah rendah, tidur nyenyak',
    },
    isFixed: false,
  },
  {
    id: 'isyak',
    time: '8:30 PM',
    task: 'Solat Isyak',
    category: 'solat',
    sunnahNote: '"Siapa solat Isyak berjemaah, seolah-olah dia qiam separuh malam" (HR Muslim). Nabi ﷺ tidak suka bergadang selepas Isyak kecuali untuk kebaikan.',
    scienceNote: '🔬 Melatonin mula naik ~8-9 PM — signal tidur (British J Pharmacology, 2018, 655 citations). Rutin malam konsisten stabilkan circadian rhythm. Skrin phone suppress melatonin.',
    dimensions: {
      ruh: 'Isyak = solat terakhir. "Tutup" hari dengan ibadah — apa sahaja berlaku, akhiri dengan Allah',
      aql: 'Letak phone, solat, zikir = digital detox malam yang bagi otak rehat dari overstimulation',
      qalb: 'Malam = hati paling vulnerable. Solat Isyak jadi "anchor" — hati ada pegangan',
      nafs: 'Tidak bergadang = lawan budaya scroll sampai 2 AM. Disiplin malam tentukan kualiti esok',
      jasad: 'Melatonin naik semulajadi. Tak ganggu phone = tidur lebih cepat & berkualiti',
    },
    isFixed: true,
  },
  {
    id: 'azkar-malam',
    time: '9:00 PM',
    task: 'Zikir Malam & Muhasabah',
    category: 'ibadah',
    sunnahNote: 'Umar al-Khattab: "Hisablah dirimu sebelum kamu dihisab." Amalan: Istighfar 100x, selawat, Surah Al-Mulk (pelindung azab kubur — HR Tirmizi), Ayatul Kursi.',
    scienceNote: '🔬 Meta-analysis 2020 (J Occupational Health, 9 RCT): Self-reflection & gratitude kurangkan stress & depression secara signifikan. Kajian 2022: 8 minggu gratitude practice naikkan resilience.',
    dimensions: {
      ruh: 'Muhasabah = "audit" ruh harian. Apa jauh dari Allah? Apa dekatkan? Istighfar bersihkan',
      aql: 'Self-reflection aktifkan metacognition — "berfikir tentang cara berfikir" = level aql tertinggi',
      qalb: 'Istighfar bersihkan hati dari dosa. "Setiap dosa = titik hitam. Istighfar = polish balik" (HR Tirmizi)',
      nafs: 'Muhasabah paksa nafs mengaku salah — ego paling tak suka ini. Tapi ini yang buat kau grow',
      jasad: 'Zikir malam turunkan cortisol & heart rate — badan masuk deep relaxation mode',
    },
    isFixed: false,
  },
  {
    id: 'journal',
    time: '9:15 PM',
    task: 'Tulis Journal / Gratitude',
    category: 'life',
    sunnahNote: '"Siapa bersyukur, nescaya Aku tambah nikmatnya" (Ibrahim: 7). 3 soalan: Apa yang baik? Apa perlu diperbaiki? Apa target esok?',
    scienceNote: '🔬 Kajian 2022 (J American College Health, 132 mahasiswa, 8 minggu): Gratitude journaling naikkan life satisfaction, happiness, resilience & turunkan depression, anxiety & stress.',
    dimensions: {
      ruh: 'Tulis nikmat Allah = syukur bertulis. Semakin syukur, semakin nampak nikmat — ruh jadi kaya',
      aql: 'Menulis = proses fikiran jadi teratur. Tak boleh tulis = belum faham. Journaling perjelas pemikiran',
      qalb: 'Gratitude journal turunkan anxiety & depression. Hati bersyukur = hati gembira',
      nafs: 'Tulis 3 benda bersyukur paksa nafs fokus positif — lawan "negativity bias"',
      jasad: 'Brain dump sebelum tidur = otak tak overactive — tidur datang lebih cepat & dalam',
    },
    isFixed: false,
  },
  {
    id: 'sleep',
    time: '10:00 PM',
    task: 'Tidur Awal (Wudhu + Doa + Kanan)',
    category: 'life',
    sunnahNote: 'Nabi ﷺ wudhu sebelum tidur, baring kanan, tangan kanan bawah pipi. Baca Ayatul Kursi, 3 Qul (tiup tangan sapu badan 3x), doa: "Bismika Allahumma amutu wa ahya."',
    scienceNote: '🔬 Tidur kanan: Tingkatkan fungsi jantung — LVOT TVI & TAPSE lebih baik (Echocardiography, 2018). Tidur awal + bangun awal: Gen BMAL1 naik 1.5x (Kajian 2025, 210 peserta). 7-8 jam = sweet spot.',
    dimensions: {
      ruh: 'Tidur dalam wudhu = mati dalam keadaan suci. Tak bangun = ruh bersih. Bangun = start fresh',
      aql: 'Tidur 7-8 jam = otak proses semua pembelajaran (memory consolidation). Kurang tidur = IQ turun 10-15 points',
      qalb: 'Doa tidur serahkan diri pada Allah = hati tenang. "Ya Allah, dengan namaMu aku mati & hidup"',
      nafs: 'Tidur awal 10 PM = lawan budaya bergadang. Nafs nak scroll — kau letak phone, pejam mata = menang',
      jasad: 'Tidur kanan = jantung tak tertekan, pencernaan lancar. Gen BMAL1 naik = badan repair optimum',
    },
    isFixed: false,
  },
];

// ──────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────
const DailyRoutineTable: React.FC<{ religion?: string }> = ({ religion = '' }) => {
  const muslim = isMuslim(religion);
  const BASE_ROUTINE = muslim ? DEFAULT_ROUTINE : UNIVERSAL_ROUTINE;
  const DIMENSION_CONFIG = muslim ? ISLAMIC_DIMENSION_CONFIG : UNIVERSAL_DIMENSION_CONFIG;

  const today = new Date().toISOString().split('T')[0];
  const STORAGE_KEY = muslim ? 'harmony_daily_routine_v2' : 'harmony_daily_routine_universal';
  const LOG_KEY = `harmony_routine_log_${muslim ? 'islamic' : 'universal'}_${today}`;

  const { addPoints } = useGamification();
  const { addToast } = useToast();

  const [routine, setRoutine] = useState<RoutineTask[]>([]);
  const [log, setLog] = useState<RoutineLog>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<RoutineTask['category']>('life');
  const [activeTab, setActiveTab] = useState<'sunnah' | 'science' | 'dimensions'>('dimensions');

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].dimensions) {
          setRoutine(parsed);
        } else {
          setRoutine(BASE_ROUTINE);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(BASE_ROUTINE));
        }
      } catch {
        setRoutine(BASE_ROUTINE);
      }
    } else {
      setRoutine(BASE_ROUTINE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BASE_ROUTINE));
    }
    const savedLog = localStorage.getItem(LOG_KEY);
    if (savedLog) {
      try { setLog(JSON.parse(savedLog)); } catch { setLog({}); }
    }
  }, []);

  // Save
  useEffect(() => {
    if (Object.keys(log).length > 0) {
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    }
  }, [log]);

  useEffect(() => {
    if (routine.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routine));
    }
  }, [routine]);

  // Toggle
  const toggleTask = (taskId: string) => {
    const wasDone = log[taskId];
    setLog(prev => ({ ...prev, [taskId]: !prev[taskId] }));

    if (!wasDone) {
      addPoints(5, 'completing routine task');
      const task = routine.find(t => t.id === taskId);
      if (task?.category === 'solat') {
        addPoints(10, `praying ${task.task}`);
      }
    }
  };

  // Stats
  const completedCount = Object.values(log).filter(Boolean).length;
  const totalCount = routine.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const prayersDone = routine.filter(t => t.category === 'solat' && log[t.id]).length;
  const totalPrayers = routine.filter(t => t.category === 'solat').length;

  // Edit
  const startEdit = (task: RoutineTask) => {
    if (task.isFixed) return;
    setEditingTask(task.id);
    setEditTime(task.time);
    setEditName(task.task);
  };

  const saveEdit = (taskId: string) => {
    setRoutine(prev => prev.map(t =>
      t.id === taskId ? { ...t, time: editTime, task: editName } : t
    ));
    setEditingTask(null);
    addToast(muslim ? 'Rutin dikemaskini ✅' : 'Routine updated ✅', 'success');
  };

  const deleteTask = (taskId: string) => {
    const task = routine.find(t => t.id === taskId);
    if (task?.isFixed) return;
    setRoutine(prev => prev.filter(t => t.id !== taskId));
    addToast(muslim ? 'Rutin dipadam' : 'Routine deleted', 'info');
  };

  const addTask = () => {
    if (!newTask.trim() || !newTime.trim()) return;
    const t: RoutineTask = {
      id: `custom-${Date.now()}`,
      time: newTime,
      task: newTask,
      category: newCategory,
      sunnahNote: muslim
        ? 'Tambahan peribadi — niatkan kerana Allah'
        : 'Personal addition — set with clear intention and purpose',
      scienceNote: muslim
        ? 'Konsistensi amalan positif bina neural pathways baru dalam otak'
        : 'Consistent positive habits build new neural pathways in the brain',
      dimensions: muslim ? {
        ruh: 'Amalan baik diniatkan kerana Allah = ibadah',
        aql: 'Tabiat baru bina sambungan neuron baru',
        qalb: 'Komitmen pada routine = hati stabil',
        nafs: 'Tambah amalan = nafs makin terlatih',
        jasad: 'Rutin konsisten stabilkan circadian rhythm',
      } : {
        ruh: 'Intentional habits align your actions with your deeper purpose',
        aql: 'New habits build new neural connections in the brain',
        qalb: 'Commitment to routine creates emotional stability and confidence',
        nafs: 'Every new discipline trains your capacity for self-mastery',
        jasad: 'Consistent routines regulate your circadian rhythm and energy',
      },
      isFixed: false,
    };
    setRoutine(prev => [...prev, t].sort((a, b) => a.time.localeCompare(b.time)));
    setNewTask('');
    setNewTime('');
    setShowAddForm(false);
    addToast(muslim ? 'Rutin baru ditambah ✅' : 'New routine added ✅', 'success');
  };

  const resetToDefault = () => {
    setRoutine(BASE_ROUTINE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(BASE_ROUTINE));
    setLog({});
    localStorage.removeItem(LOG_KEY);
    addToast(muslim ? 'Rutin direset ke Sunnah default' : 'Routine reset to defaults', 'info');
  };

  // Colors
  const getCatColor = (cat: string): string => {
    const c: Record<string, string> = {
      solat: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      ibadah: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      health: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      study: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      life: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      social: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    };
    return c[cat] || 'bg-gray-500/15 text-gray-400';
  };

  const getDimColor = (dim: string): string => {
    const c: Record<string, string> = {
      ruh: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      aql: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      qalb: 'bg-red-500/10 border-red-500/30 text-red-300',
      nafs: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
      jasad: 'bg-green-500/10 border-green-500/30 text-green-300',
    };
    return c[dim] || '';
  };

  // Gold-themed helpers
  const isSolat = (cat: string) => cat === 'solat';

  return (
    <div
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #0a0f1a 100%)',
        border: '1px solid rgba(201,168,76,0.22)',
        boxShadow: '0 0 40px rgba(201,168,76,0.04)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2
            className="text-xl font-bold flex items-center gap-2 flex-wrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f5f0e8' }}
          >
            <span style={{ color: '#c9a84c' }}>✦</span>
            {muslim ? 'Rutin Harian Nabi ﷺ' : 'Daily Routine'}
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', fontFamily: "'DM Sans', sans-serif" }}
            >
              {muslim ? 'Sunnah + Sains + 5 Dimensi' : 'Science + 5 Dimensions'}
            </span>
          </h2>
          <p className="text-xs mt-1" style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}>
            {muslim
              ? '🕊️Ruh 🧠Aql ❤️Qalb ⚔️Nafs 💪Jasad — setiap rutin level up semua dimensi kamu'
              : '✨Soul 🧠Mind ❤️Heart ⚔️Self 💪Body — every routine levels up all your dimensions'}
          </p>
        </div>
        <button
          onClick={resetToDefault}
          className="text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
          style={{ background: 'rgba(201,168,76,0.06)', color: '#8a8a9a', border: '1px solid rgba(201,168,76,0.15)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a84c'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9a'; }}
        >
          {muslim ? '🔄 Reset Sunnah' : '🔄 Reset Defaults'}
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs" style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}>
          <span>
            {muslim ? 'Hari ini' : 'Today'}:{' '}
            <span className="font-bold" style={{ color: '#f5f0e8' }}>{completedCount}/{totalCount}</span>
          </span>
          {muslim && (
            <span>
              Solat:{' '}
              <span className="font-bold" style={{ color: '#c9a84c' }}>{prayersDone}/{totalPrayers}</span>
            </span>
          )}
          <span className="font-black" style={{ color: progress === 100 ? '#e8c97a' : '#f5f0e8' }}>
            {progress}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201,168,76,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg, #c9a84c, #e8c97a, #c9a84c)'
                : 'linear-gradient(90deg, #c9a84c, #e8c97a)',
              boxShadow: '0 0 8px rgba(201,168,76,0.4)',
            }}
          />
        </div>
        {progress === 100 && (
          <div
            className="text-center py-2 rounded-xl"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <span className="font-black text-sm" style={{ color: '#e8c97a' }}>
              {muslim
                ? '✦ MasyaAllah! Semua siap! Ruh, Aql, Qalb, Nafs & Jasad kamu naik hari ini! ✦'
                : '✦ Outstanding! All done! Soul, Mind, Heart, Self & Body levelled up today! ✦'}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
              <th className="text-left text-xs py-2 px-2 w-8" style={{ color: 'rgba(201,168,76,0.6)', fontFamily: "'DM Sans', sans-serif" }}>✓</th>
              <th className="text-left text-xs py-2 px-2 w-20" style={{ color: 'rgba(201,168,76,0.6)', fontFamily: "'DM Sans', sans-serif" }}>{muslim ? 'Masa' : 'Time'}</th>
              <th className="text-left text-xs py-2 px-2" style={{ color: 'rgba(201,168,76,0.6)', fontFamily: "'DM Sans', sans-serif" }}>{muslim ? 'Rutin' : 'Routine'}</th>
              <th className="text-left text-xs py-2 px-2 w-20 hidden sm:table-cell" style={{ color: 'rgba(201,168,76,0.6)', fontFamily: "'DM Sans', sans-serif" }}>{muslim ? 'Jenis' : 'Type'}</th>
              <th className="text-right text-xs py-2 px-2 w-24" style={{ color: 'rgba(201,168,76,0.6)', fontFamily: "'DM Sans', sans-serif" }}>Info</th>
            </tr>
          </thead>
          <tbody>
            {routine.map((task) => (
              <React.Fragment key={task.id}>
                <tr
                  className="transition-all duration-150"
                  style={{
                    borderBottom: '1px solid rgba(201,168,76,0.06)',
                    background: isSolat(task.category)
                      ? 'rgba(201,168,76,0.04)'
                      : 'transparent',
                    opacity: log[task.id] ? 0.55 : 1,
                    borderLeft: isSolat(task.category) ? '2px solid rgba(201,168,76,0.35)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.07)'; }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = isSolat(task.category)
                      ? 'rgba(201,168,76,0.04)'
                      : 'transparent';
                  }}
                >
                  {/* Checkbox */}
                  <td className="py-2.5 px-2">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={log[task.id] ? {
                        background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
                        border: '2px solid #c9a84c',
                        color: '#0a0a0f',
                      } : {
                        border: '2px solid rgba(201,168,76,0.3)',
                      }}
                    >
                      {log[task.id] && <span className="text-xs font-black">✓</span>}
                    </button>
                  </td>

                  {/* Time */}
                  <td className="py-2.5 px-2">
                    {editingTask === task.id ? (
                      <input
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-20 text-xs px-2 py-1 rounded"
                        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', color: '#f5f0e8' }}
                      />
                    ) : (
                      <span
                        className="text-xs font-mono"
                        style={{ color: log[task.id] ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.7)', textDecoration: log[task.id] ? 'line-through' : 'none' }}
                      >
                        {task.time}
                      </span>
                    )}
                  </td>

                  {/* Task */}
                  <td className="py-2.5 px-2">
                    {editingTask === task.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 text-sm px-2 py-1 rounded"
                          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', color: '#f5f0e8' }}
                        />
                        <button onClick={() => saveEdit(task.id)} className="text-xs" style={{ color: '#c9a84c' }}>💾</button>
                        <button onClick={() => setEditingTask(null)} className="text-xs text-red-400">✖</button>
                      </div>
                    ) : (
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: log[task.id] ? 'rgba(245,240,232,0.35)' : '#f5f0e8',
                          textDecoration: log[task.id] ? 'line-through' : 'none',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {task.task}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-2 hidden sm:table-cell">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCatColor(task.category)}`}>
                      {CATEGORY_CONFIG[task.category]?.emoji} {CATEGORY_CONFIG[task.category]?.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="text-xs px-2 py-1 rounded-lg transition-colors"
                        style={expandedTask === task.id ? {
                          background: 'rgba(201,168,76,0.15)',
                          color: '#c9a84c',
                        } : {
                          background: 'rgba(201,168,76,0.05)',
                          color: '#8a8a9a',
                        }}
                      >
                        {expandedTask === task.id ? '🔽' : '📖'}
                      </button>
                      {!task.isFixed && (
                        <>
                          <button
                            onClick={() => startEdit(task)}
                            className="text-xs px-1.5 py-1 rounded-lg"
                            style={{ background: 'rgba(201,168,76,0.05)', color: '#8a8a9a' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-xs px-1.5 py-1 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.06)', color: 'rgba(252,165,165,0.6)' }}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Panel */}
                {expandedTask === task.id && (
                  <tr>
                    <td colSpan={5} className="px-2 py-3">
                      <div className="space-y-3">
                        {/* Tabs */}
                        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(201,168,76,0.06)' }}>
                          {(['dimensions', 'sunnah', 'science'] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className="flex-1 text-xs py-1.5 rounded-lg font-bold transition-colors"
                              style={activeTab === tab ? {
                                background: 'rgba(201,168,76,0.2)',
                                color: '#e8c97a',
                              } : {
                                color: '#8a8a9a',
                              }}
                            >
                              {tab === 'dimensions'
                                ? (muslim ? '🕊️🧠❤️⚔️💪 5 Dimensi' : '✨🧠❤️⚔️💪 5 Dimensions')
                                : tab === 'sunnah'
                                ? (muslim ? '☀️ Sunnah Nabi' : '📜 Ancient Wisdom')
                                : '🧬 Science'}
                            </button>
                          ))}
                        </div>

                        {/* Sunnah */}
                        {activeTab === 'sunnah' && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                            <span className="text-2xl mt-0.5">☀️</span>
                            <div>
                              <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5">
                                {muslim ? 'Amalan Nabi ﷺ' : 'Ancient Wisdom'}
                              </p>
                              <p className="text-sm text-amber-200/80 leading-relaxed">
                                {task.sunnahNote}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Science */}
                        {activeTab === 'science' && (
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
                            <span className="text-2xl mt-0.5">🧬</span>
                            <div>
                              <p className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-1.5">
                                {muslim ? 'Bukti Sains & Kajian' : 'Science & Research'}
                              </p>
                              <p className="text-sm text-cyan-200/80 leading-relaxed">
                                {task.scienceNote}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 5 Dimensions */}
                        {activeTab === 'dimensions' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                            {(
                              Object.entries(task.dimensions) as [keyof DimensionBenefit, string][]
                            ).map(([dim, text]) => (
                              <div key={dim} className={`rounded-xl p-3 border ${getDimColor(dim)}`}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span className="text-lg">{DIMENSION_CONFIG[dim].emoji}</span>
                                  <div>
                                    <span className="text-xs font-black uppercase tracking-wider block">
                                      {DIMENSION_CONFIG[dim].label}
                                    </span>
                                    <span className="text-[9px] opacity-50">
                                      {DIMENSION_CONFIG[dim].desc}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] leading-relaxed opacity-80">{text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Task */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
        {showAddForm ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder={muslim ? 'Masa (cth: 3:00 PM)' : 'Time (e.g. 3:00 PM)'}
              className="w-full sm:w-28 text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8' }}
            />
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={muslim ? 'Nama rutin...' : 'Routine name...'}
              className="flex-1 w-full text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8' }}
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as RoutineTask['category'])}
              className="w-full sm:w-32 text-xs px-3 py-2 rounded-lg"
              style={{ background: '#0d1b2a', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8' }}
            >
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.emoji} {v.label}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                onClick={addTask}
                className="text-xs px-3 py-2 rounded-lg transition-all"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                {muslim ? '✅ Tambah' : '✅ Add'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(201,168,76,0.05)', color: '#8a8a9a' }}
              >
                ✖
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full text-center text-xs py-2 rounded-xl transition-all"
            style={{ color: 'rgba(201,168,76,0.5)', border: '1px dashed rgba(201,168,76,0.2)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#c9a84c';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(201,168,76,0.5)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)';
            }}
          >
            {muslim ? '✦ Tambah Rutin Sendiri' : '✦ Add Custom Routine'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyRoutineTable;
