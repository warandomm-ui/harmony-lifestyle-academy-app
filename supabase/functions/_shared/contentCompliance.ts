// ═══════════════════════════════════════════════════════════════════
// Ejen Pematuhan Kandungan AI — Harmony Lifestyle Academy
// (AI Content Compliance Agent for Islamic Education)
//
// Every piece of AI-generated text passes through `evaluateContent()`
// BEFORE it reaches a learner. The engine is pure TypeScript with no
// imports, so the same file runs in the Supabase Edge runtime (Deno,
// authoritative gate) and in the browser (types + UI messages).
//
// Five guarded objectives (maqasid), each a rule family:
//   din       — Hifz al-Din   : sahih aqidah, verified Quran/hadith citations
//   aql       — Hifz al-Aql   : critical thinking, no intellectual short-cuts
//   karamah   — Hifz al-'Ird  : human dignity, no insults / takfir / indecency
//   nafs      — Hifz al-Nafs  : physical & emotional safety
//   data      — Amanah data   : PII and secrets never leak
//   competence— Had kompetensi: fatwa / medical / legal rulings → human scholar
//
// Verdict ladder (most severe wins):
//   block   > hold (human review) > redact (masked, delivered) > notice > allow
//
// Fail-closed: any internal error yields `hold`, never `allow`.
// ═══════════════════════════════════════════════════════════════════

export type Maqsad = 'din' | 'aql' | 'karamah' | 'nafs' | 'data' | 'competence';
export type Severity = 'block' | 'hold' | 'redact' | 'notice';
export type Verdict = 'allow' | 'notice' | 'redact' | 'hold' | 'block';

export interface ComplianceFinding {
  code: string;          // stable machine id, e.g. DIN_QURAN_CITATION_INVALID
  maqsad: Maqsad;
  severity: Severity;
  reason: string;        // Malay explanation for reviewers / users
  excerpt?: string;      // short, already-redacted snippet (never raw PII)
}

export interface ComplianceReport {
  verdict: Verdict;
  findings: ComplianceFinding[];
  /** Text safe to deliver. Empty string when verdict is hold/block. */
  safeText: string;
  /** Original text with PII/secrets masked — what a human reviewer sees. */
  reviewText: string;
  /** Learner-facing explanation (Malay first, English second). */
  userMessage: string;
  engineVersion: string;
}

export const COMPLIANCE_ENGINE_VERSION = '1.0.0';

const SEVERITY_RANK: Record<Severity, number> = { notice: 1, redact: 2, hold: 3, block: 4 };
const VERDICT_BY_RANK: Verdict[] = ['allow', 'notice', 'redact', 'hold', 'block'];

// ─── Quran reference data (Hafs, 114 surah, 6,236 ayat) ────────────
// Kept in sync with constants/surahIndex.ts (verified by the test script).
export const SURAH_AYAT_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

const SURAH_NAMES_MALAY = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta Ha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadalah", "Al-Hasyr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghasyiyah", "Al-Fajr", "Al-Balad",
  "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas",
];

// Common English / alternative transliterations → surah number.
const SURAH_ALIASES: Record<string, number> = {
  fatiha: 1, baqara: 2, imran: 3, aliimran: 3, nisa: 4, maidah: 5, maida: 5, anam: 6, araf: 7,
  tawbah: 9, tawba: 9, taubah: 9, isra: 17, israa: 17, kahf: 18, taha: 20, anbiya: 21,
  muminun: 23, muminoon: 23, shuara: 26, syuara: 26, ankabut: 29, yasin: 36, yaseen: 36,
  saffat: 37, shura: 42, syura: 42, zukhruf: 43, jathiyah: 45, jasiyah: 45, dhariyat: 51,
  zariyat: 51, rahman: 55, waqiah: 56, hashr: 59, hasyr: 59, jumuah: 62, jumua: 62, munafiqun: 63,
  mulk: 67, muddaththir: 74, muddassir: 74, insan: 76, dahr: 76, naba: 78, naziat: 79, abasa: 80,
  inshiqaq: 84, insyiqaq: 84, ghashiyah: 88, ghasyiyah: 88, shams: 91, syams: 91, layl: 92, lail: 92,
  duha: 93, sharh: 94, syarh: 94, inshirah: 94, alaq: 96, zalzalah: 99, zilzal: 99, adiyat: 100,
  qariah: 101, takathur: 102, takasur: 102, asr: 103, humazah: 104, quraish: 106, quraisy: 106,
  maun: 107, kawthar: 108, kausar: 108, kafirun: 109, kafiroon: 109, masad: 111, lahab: 111,
  ikhlas: 112, falaq: 113, nas: 114,
};

const ARTICLE_PREFIX = /^(al|an|ar|as|asy|ash|at|ad|az|ath)(?=[a-z]{2,})/;
const surahKey = (raw: string) => {
  const k = raw.toLowerCase().replace(/[^a-z]/g, '');
  return k.replace(ARTICLE_PREFIX, '');
};

const SURAH_LOOKUP: Map<string, number> = (() => {
  const m = new Map<string, number>();
  SURAH_NAMES_MALAY.forEach((name, i) => {
    m.set(name.toLowerCase().replace(/[^a-z]/g, ''), i + 1);
    m.set(surahKey(name), i + 1);
  });
  for (const [k, v] of Object.entries(SURAH_ALIASES)) m.set(k, v);
  return m;
})();

export const resolveSurah = (name: string): number | null => {
  const cleaned = name.replace(/\b(ayat|ayah|verse|verses|ay)\b.*$/i, '').trim();
  if (!cleaned) return null;
  const full = cleaned.toLowerCase().replace(/[^a-z]/g, '');
  return SURAH_LOOKUP.get(full) ?? SURAH_LOOKUP.get(surahKey(cleaned)) ?? null;
};

export const isValidAyah = (surah: number, ayah: number): boolean =>
  Number.isInteger(surah) && surah >= 1 && surah <= 114 &&
  Number.isInteger(ayah) && ayah >= 1 && ayah <= SURAH_AYAT_COUNTS[surah - 1];

// ─── Helpers ──────────────────────────────────────────────────────
const normalize = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')       // strip Latin diacritics (not Arabic harakat)
    .replace(/[​-‏⁠﻿]/g, '') // zero-width characters used for evasion
    .replace(/\\n/g, ' ')                   // JSON-escaped newlines
    .toLowerCase()
    .replace(/\s+/g, ' ');

const clip = (s: string, n = 120) => (s.length > n ? s.slice(0, n) + '…' : s);

const excerptAround = (text: string, index: number, len: number) =>
  clip(text.slice(Math.max(0, index - 30), index + len + 30).replace(/\s+/g, ' ').trim());

interface PatternRule {
  code: string;
  maqsad: Maqsad;
  severity: Severity;
  reason: string;
  patterns: RegExp[];
  /** If any of these match the whole text, the rule is suppressed (e.g. supportive context). */
  unless?: RegExp[];
}

// ─── Rule families ────────────────────────────────────────────────
// Patterns run against normalized (lower-case, diacritic-free) text.
// Bilingual: Bahasa Melayu + English, the two languages of the app.
const PATTERN_RULES: PatternRule[] = [
  // ── HIFZ AL-DIN: akidah ──────────────────────────────────────
  {
    code: 'DIN_AQIDAH_PROPHETHOOD',
    maqsad: 'din',
    severity: 'block',
    reason: 'Menafikan kedudukan Nabi Muhammad ﷺ sebagai Khatamun Nabiyyin (bercanggah dengan Al-Ahzab: 40).',
    patterns: [
      /\b(ada|terdapat|wujud) (seorang )?nabi (baru )?(selepas|sesudah) nabi muhammad\b/,
      /\bnabi muhammad (saw |s\.a\.w\.? )?bukan(lah)? (nabi|rasul) (yang )?terakhir\b/,
      /\bmuhammad (\(saw\) |pbuh )?(was|is) not the (last|final) (prophet|messenger)\b/,
      /\b(a|another) (new )?prophet (came|was sent|has come) after (the prophet )?muhammad\b/,
    ],
    unless: [/\b(dakwaan|ajaran sesat|kesesatan|ditolak|false claim|heretical|deviant|qadiani|ahmadiyya)\b/],
  },
  {
    code: 'DIN_AQIDAH_TAWHID',
    maqsad: 'din',
    severity: 'block',
    reason: 'Kenyataan yang mencemarkan tauhid (menyekutukan atau menyamakan Allah dengan makhluk).',
    patterns: [
      /\ballah (mempunyai|ada(lah)?|memiliki) (seorang )?anak\b/,
      /\ballah (has|had|begot) a son\b/,
      /\b(tuhan|allah) (adalah|ialah) (salah satu )?(daripada )?(tiga|triniti)\b/,
      /\ballah (berjasad|bertempat di|tidur|letih|lupa)\b/,
    ],
    unless: [/\b(al-?ikhlas|lam yalid|tidak beranak|neither begets|dakwaan|kepercayaan (agama )?lain|other religions? (believe|claim)|ditolak|menolak)\b/],
  },
  {
    code: 'DIN_QURAN_INTEGRITY',
    maqsad: 'din',
    severity: 'block',
    reason: 'Menafikan pemeliharaan Al-Quran (bercanggah dengan Al-Hijr: 9).',
    patterns: [
      /\b(al-?quran|quran) (telah|sudah) (diubah|dipinda|dipalsukan|diselewengkan)\b/,
      /\b(the )?(qur'?an|koran) (has been|was) (altered|corrupted|changed|edited) (by|over|through)\b/,
    ],
    unless: [/\b(orientalis|dakwaan|tuduhan|claim(s|ed)? that|allegation|dijawab|refut)/],
  },
  {
    code: 'DIN_MOCKERY',
    maqsad: 'din',
    severity: 'block',
    reason: 'Memperolok-olokkan Allah, Rasul ﷺ, Al-Quran atau syiar Islam (At-Taubah: 65-66).',
    patterns: [
      /\b(lawak|jenaka|kelakar|ejek|perli)\w* (tentang |pasal )?(allah|nabi muhammad|rasulullah|al-?quran|solat)\b/,
      /\b(joke|mock|ridicul)\w* (about |of )?(allah|the prophet|prophet muhammad|the qur'?an)\b/,
    ],
    unless: [/\b(dilarang|haram|jangan|tidak boleh|forbidden|must not|should not)\b/],
  },
  {
    code: 'DIN_PLURALISM_CLAIM',
    maqsad: 'din',
    severity: 'hold',
    reason: 'Dakwaan pluralisme agama memerlukan semakan pendidik (rujuk Ali \'Imran: 19, 85).',
    patterns: [
      /\bsemua agama (adalah )?sama( sahaja| saja)?\b/,
      /\ball religions are (the same|equally true|equally valid)\b/,
    ],
    unless: [/\b(bukan|tidak|not)\b.{0,20}\bsama\b|\bnot (the same|equally)/],
  },

  // ── HAD KOMPETENSI: fatwa / perubatan / undang-undang ─────────
  {
    code: 'COMPETENCE_FATWA_PERSONAL',
    maqsad: 'competence',
    severity: 'hold',
    reason: 'Hukum khusus (talak, faraid, nikah, murtad, kafir) melebihi kompetensi AI — mesti dirujuk kepada mufti/ustaz bertauliah.',
    patterns: [
      /\b(talak|cerai)\w* (anda|awak|kamu|you|dia)? ?(telah |sudah )?(jatuh|sah|gugur)\b/,
      /\b(your|the) (talaq|divorce) (is|has become) (valid|effective|binding)\b/,
      /\b(bahagian|hak) faraid (anda|awak|kamu|ibu|bapa|isteri|suami|anak)\w* (ialah|adalah|=)\s*\d/,
      /\b(nikah|perkahwinan) (anda|awak|kamu|mereka) (tidak sah|batal|terbatal|fasakh)\b/,
      /\b(your|their) (nikah|marriage) is (invalid|void|annulled)\b/,
      /\b(anda|awak|kamu|dia|beliau|you|he|she) (telah |sudah |is |has )?(menjadi |become )?(murtad|kafir|apostate)\b/,
      /\b(kawan|rakan|sahabat|ibu|bapa|ayah|emak|suami|isteri|adik|abang|kakak|jiran|orang itu)\b[a-z' ]{0,20}\b(sudah|telah|dah|adalah|kini) (pun )?(menjadi |jadi )?(murtad|kafir)\b/,
      /\b(your|his|her|their) (friend|father|mother|husband|wife|brother|sister|neighbou?r)\b[a-z' ]{0,20}\b(is|has become|became) (now )?(an? )?(apostate|kafir|disbeliever|murtad)\b/,
    ],
  },
  {
    code: 'COMPETENCE_TAKFIR_GROUP',
    maqsad: 'competence',
    severity: 'hold',
    reason: 'Menghukum kafir/sesat ke atas individu atau kumpulan (takfir) adalah wewenang ulama, bukan AI.',
    patterns: [
      /\b(golongan|puak|kumpulan|pengikut|mazhab) [a-z'\- ]{2,30} (adalah |ialah )?(kafir|sesat|murtad|terkeluar dari(pada)? islam)\b/,
      /\b(followers of|the) [a-z'\- ]{2,30} (are|is) (kafir|disbelievers|apostates|outside (the fold of )?islam)\b/,
    ],
    unless: [/\b(ajaran sesat yang (telah )?diwartakan|diwartakan oleh|fatwa (jakim|majlis))/],
  },
  {
    code: 'COMPETENCE_MEDICAL',
    maqsad: 'competence',
    severity: 'hold',
    reason: 'Diagnosis atau dos ubat melebihi kompetensi AI — perlu pengamal perubatan.',
    patterns: [
      /\b(anda|awak|kamu|you) (menghidap|mengalami penyakit|have|are suffering from) (kemurungan klinikal|clinical depression|kanser|cancer|diabetes|bipolar|skizofrenia|schizophrenia|adhd)\b/,
      /\b(ambil|makan|take) \d{2,4} ?(mg|miligram|milligrams?)\b/,
      /\b(berhenti|stop) (mengambil |taking )?(ubat|medication|insulin|antidepressants?)\w*( anda| awak| your)?\b/,
    ],
    unless: [/\b(rujuk|berjumpa|jumpa|consult|see|speak (to|with)) (doktor|doctor|pakar|physician|pharmacist|ahli farmasi)/],
  },

  // ── HIFZ AL-AQL: pemikiran kritis & integriti akademik ────────
  {
    code: 'AQL_ACADEMIC_DISHONESTY',
    maqsad: 'aql',
    severity: 'hold',
    reason: 'Menggalakkan meniru/menghantar kerja AI tanpa faham — bercanggah dengan pembinaan akal dan amanah ilmu.',
    patterns: [
      /\b(salin|copy)( dan| and|\/)? (tampal|paste|hantar|submit)\w*( terus| sahaja| saja| directly| as is)\b/,
      /\b(just|simply) (copy|submit|hand in) (this|it)\b.{0,40}\b(teacher|lecturer|cikgu|pensyarah|assignment|tugasan|homework)\b/,
      /\btidak perlu (faham|berfikir|baca)\b|\bno need to (understand|think|read)\b/,
      /\b(cikgu|guru|pensyarah|teacher|lecturer) (tidak akan|takkan|won'?t|will not) (tahu|perasan|notice|know)\b/,
    ],
  },
  {
    code: 'AQL_INTOXICANTS',
    maqsad: 'aql',
    severity: 'block',
    reason: 'Panduan menghasilkan/menggunakan bahan memabukkan atau dadah (Al-Ma\'idah: 90).',
    patterns: [
      /\b(cara|langkah|how to) (membuat|menghasilkan|buat|make|brew|cook|produce) (arak|todi|tuak|alcohol|wine|beer|methamphetamine|meth|syabu|ganja|cannabis edibles|dadah)\b/,
      /\b(cara|how to) (menghisap|guna|use|smoke|inject) (dadah|syabu|ganja|heroin|meth)\b/,
    ],
    unless: [/\b(bahaya|kesan buruk|dangers?|harms?|haram|elak|avoid|pencegahan|prevention|aadk)\b/],
  },

  // ── HIFZ AL-'IRD / KARAMAH: maruah insan ──────────────────────
  {
    code: 'KARAMAH_INSULT',
    maqsad: 'karamah',
    severity: 'block',
    reason: 'Penghinaan peribadi terhadap pelajar (Al-Hujurat: 11).',
    patterns: [
      /\b(kau|awak|kamu|engkau|anda) (memang |sangat |ni )?(bodoh|bangang|bebal|dungu|sial|tolol|lembap otak)\b/,
      /\byou( are|'re) (so |really |such an? )?(stupid|idiot|moron|retard(ed)?|worthless|pathetic|dumb)\b/,
    ],
  },
  {
    code: 'KARAMAH_SLUR',
    maqsad: 'karamah',
    severity: 'block',
    reason: 'Bahasa kesat bersifat perkauman/diskriminasi (Al-Hujurat: 13).',
    patterns: [
      /\b(keling|nigger|nigga|faggot|tranny|chink|pariah)\b/,
      /\b(bangsa|kaum|race|people) [a-z]{3,15} (memang |semuanya |are all |are )?(malas|pengotor|penipu|lazy|dirty|liars|inferior|rendah)\b/,
    ],
  },
  {
    code: 'KARAMAH_SEXUAL',
    maqsad: 'karamah',
    severity: 'block',
    reason: 'Kandungan lucah tidak sesuai untuk platform pendidikan (An-Nur: 30-31; Al-Isra\': 32).',
    patterns: [
      /\b(porn|pornografi|pornography|lucah|bogel|naked|nude|erotic|erotik|sexting|onlyfans)\b/,
      /\b(hubungan seks|sexual intercourse|have sex|make love)\b.{0,40}\b(cara|teknik|how|steps|position|kedudukan)\b/,
    ],
    unless: [/\b(bahaya|kesan|ketagihan|addiction|dangers?|elak|avoid|jauhi|zina|haram|perlindungan|protect|lapor|report)\b/],
  },

  // ── HIFZ AL-NAFS: keselamatan ─────────────────────────────────
  {
    code: 'NAFS_SELF_HARM',
    maqsad: 'nafs',
    severity: 'block',
    reason: 'Arahan atau galakan mencederakan diri (An-Nisa\': 29).',
    patterns: [
      /\b(cara|kaedah|langkah|teknik) (terbaik |paling (mudah|cepat|kurang sakit) )?(untuk )?(bunuh diri|membunuh diri|mencederakan diri|kelar)\b/,
      /\b(how to|ways to|best way to|painless way to) (kill yourself|commit suicide|end your life|cut yourself|self[- ]harm)\b/,
      /\b(you should|kamu patut|awak patut|anda patut) (just )?(kill yourself|die|mati( sahaja| saja)?|bunuh diri)\b/,
    ],
  },
  {
    code: 'NAFS_VIOLENCE_WEAPONS',
    maqsad: 'nafs',
    severity: 'block',
    reason: 'Arahan membuat senjata/bahan letupan atau mencederakan orang lain (Al-Ma\'idah: 32).',
    patterns: [
      /\b(cara|langkah|resipi|how to|steps to|recipe for) (membuat|buat|memasang|make|build|assemble) (a |an |sebuah |satu )?(bom|bahan letupan|bomb|explosives?|pipe bomb|molotov|senjata api|firearm|ghost gun|racun|poison)\b/,
      /\b(cara|how to) (membunuh|bunuh|meracun|kill|poison|stab) (seseorang|orang|someone|a person|people)\b/,
    ],
    unless: [/\b(sejarah|history|polis|police|lapor|report|keselamatan awam|public safety)\b.{0,40}\b(bahaya|dangers?|elak|avoid)\b/],
  },
  {
    code: 'NAFS_EXTREMISM',
    maqsad: 'nafs',
    severity: 'block',
    reason: 'Menyelewengkan makna jihad kepada keganasan terhadap orang awam (Al-Baqarah: 190; Al-Ma\'idah: 32).',
    patterns: [
      /\b(serang|bunuh|bom|letupkan)\w* (orang )?(kafir|bukan islam|awam|non-?muslims?)\b.{0,40}\b(jihad|syahid|pahala|wajib)\b/,
      /\b(jihad|martyrdom|syahid)\b.{0,40}\b(attack|kill|bomb|blow up)\w* (the )?(civilians?|non-?muslims?|kuffar|disbelievers)\b/,
      /\b(bom berani mati|suicide bomb(ing|er)?)\b.{0,30}\b(dibenarkan|harus|syahid|permissible|justified|reward)\b/,
    ],
  },
  {
    code: 'NAFS_DANGEROUS_CHALLENGE',
    maqsad: 'nafs',
    severity: 'hold',
    reason: 'Aktiviti fizikal berisiko (puasa ekstrem, cabaran berbahaya) perlu disemak sebelum disyorkan kepada remaja.',
    patterns: [
      /\b(tidak makan|tanpa makan|no food|water fast(ing)?|dry fast(ing)?) (selama |for )?([3-9]|\d{2,}) (hari|days)\b/,
      /\b(blackout|choking|tide pod|skull ?breaker) challenge\b/,
    ],
  },
];

// ─── Data integrity: PII & secrets (masked, never stored raw) ─────
interface RedactRule { code: string; reason: string; pattern: RegExp; mask: string; validate?: (m: string) => boolean; }

const luhn = (digits: string) => {
  const d = digits.replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
};

const REDACT_RULES: RedactRule[] = [
  { code: 'DATA_SECRET_KEY', reason: 'Kunci API/rahsia sistem dikesan dan disembunyikan.', mask: '[KUNCI-DISEMBUNYIKAN]',
    pattern: /\b(sk-ant-[a-zA-Z0-9_\-]{10,}|sk-(proj-)?[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z_\-]{30,}|ghp_[A-Za-z0-9]{30,}|xox[abpr]-[A-Za-z0-9\-]{10,}|eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,})\b/g },
  { code: 'DATA_PRIVATE_KEY', reason: 'Kunci peribadi kriptografi dikesan.', mask: '[KUNCI-PERIBADI-DISEMBUNYIKAN]',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(-----END [A-Z ]*PRIVATE KEY-----|$)/g },
  { code: 'DATA_NRIC_MY', reason: 'Nombor MyKad dikesan dan disembunyikan.', mask: '[MYKAD-DISEMBUNYIKAN]',
    pattern: /\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])-?\d{2}-?\d{4}\b/g },
  { code: 'DATA_CARD', reason: 'Nombor kad pembayaran dikesan dan disembunyikan.', mask: '[KAD-DISEMBUNYIKAN]',
    pattern: /\b(?:\d[ -]?){13,19}\b/g, validate: luhn },
  { code: 'DATA_EMAIL', reason: 'Alamat e-mel peribadi dikesan dan disembunyikan.', mask: '[EMEL-DISEMBUNYIKAN]',
    pattern: /\b[A-Za-z0-9._%+\-]+@(?!example\.(com|org|net)\b)[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g },
  { code: 'DATA_PHONE_MY', reason: 'Nombor telefon peribadi dikesan dan disembunyikan.', mask: '[TELEFON-DISEMBUNYIKAN]',
    // Mobile numbers only; public hotlines (15999, 03-7627 2929 Befrienders) stay visible.
    pattern: /(?<![\d-])(\+?60|0)1[0-46-9][ -]?\d{3,4}[ -]?\d{4}(?![\d-])/g },
];

// Public helplines that must never be redacted (digits only).
const HELPLINE_DIGITS = new Set(['15999', '0192615999', '60192615999', '0376272929', '999']);

// ─── Citation integrity (Hifz al-Din) ─────────────────────────────
const NUMERIC_QURAN_REF =
  /\b(?:surah|surat|sura|qs|q\.s\.|al-?qur'?an|qur'?an)\s*[:.]?\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/gi;
const NAMED_QURAN_REF =
  /\b(?:surah|surat|sura)\s+([a-z'\-]+(?:[\s\-][a-z']+)?)[\s,:]*\(?(?:(?:ayat|ayah|verses?|ay)\.?\s*)?(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/gi;

const HADITH_CLAIM =
  /\b(hadis|hadith|hadeeth|sabda (nabi|rasulullah)|rasulullah (saw |s\.a\.w\.? |ﷺ )?(bersabda|telah bersabda)|the prophet (\(pbuh\) |ﷺ |\(saw\) )?(said|stated)|narrated by|diriwayatkan oleh)\b/i;
// Unambiguous collection names, or common names (Muslim, Ahmad, Malik, Hakim)
// only when they clearly refer to the compiler ("riwayat Muslim", "Muslim no. 2564").
const HADITH_SOURCE = new RegExp(
  "\\b(bukhari|tirmidhi|tirmizi|abu dawud|abu daud|nasa'?i|ibnu? majah|muwatta'?|darimi|baihaqi|bayhaqi|" +
  "tabrani|tabarani|ibnu? hibban|riyadh?us? sh?alihin|riyad as-salihin|bulugh(ul)? maram|mishkat|musnad)\\b" +
  "|\\b(riwayat|hr\\.?|narrated by|reported by|recorded by|diriwayatkan oleh|sahih|imam|al-)\\s*(imam\\s+)?(muslim|ahmad|malik|hakim)\\b" +
  "|\\b(muslim|ahmad|malik|hakim)\\s*[,(]?\\s*(no\\.?|hadith|hadis|#)?\\s*\\d{1,5}\\b",
  'i',
);
const FABRICATED_HADITH_MARKERS =
  /\b(tuntutlah ilmu (walau(pun)? )?(sampai |hingga )?ke negeri china|seek knowledge even (if it is )?(as far as|unto) china|syurga di bawah telapak kaki ibu)\b/i;
const FABRICATION_DISCLAIMER = /\b(palsu|maudhu'?|mawdu'?|dha?if|da'?if|fabricated|weak|tidak sahih|lemah)\b/i;

// Arabic script run (letters + harakat), ignoring short words like "ﷺ".
const ARABIC_RUN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿\s]{40,}/g;
const ARABIC_LETTER = /[ء-يٱ-ۓ]/g;

function checkCitations(raw: string, findings: ComplianceFinding[]) {
  const checkRange = (surah: number, a1: number, a2: number | undefined, idx: number, len: number) => {
    const bad = !isValidAyah(surah, a1) || (a2 !== undefined && (!isValidAyah(surah, a2) || a2 < a1));
    if (bad) {
      const max = surah >= 1 && surah <= 114 ? SURAH_AYAT_COUNTS[surah - 1] : null;
      findings.push({
        code: 'DIN_QURAN_CITATION_INVALID',
        maqsad: 'din',
        severity: 'hold',
        reason: max
          ? `Rujukan ayat tidak wujud: Surah ${surah} hanya mempunyai ${max} ayat. Kemungkinan rujukan rekaan.`
          : `Nombor surah ${surah} tidak wujud (Al-Quran mempunyai 114 surah). Kemungkinan rujukan rekaan.`,
        excerpt: excerptAround(raw, idx, len),
      });
    }
  };

  for (const m of raw.matchAll(NUMERIC_QURAN_REF)) {
    checkRange(+m[1], +m[2], m[3] ? +m[3] : undefined, m.index ?? 0, m[0].length);
  }
  for (const m of raw.matchAll(NAMED_QURAN_REF)) {
    const surah = resolveSurah(m[1]);
    if (surah === null) continue; // unknown spelling: not judged, avoids false holds
    checkRange(surah, +m[2], m[3] ? +m[3] : undefined, m.index ?? 0, m[0].length);
  }

  // Hadith attribution: every "the Prophet said" needs a named collection.
  const hadithMatch = HADITH_CLAIM.exec(raw);
  if (hadithMatch) {
    const window = raw.slice(Math.max(0, hadithMatch.index - 200), hadithMatch.index + 600);
    if (!HADITH_SOURCE.test(window)) {
      findings.push({
        code: 'DIN_HADITH_UNSOURCED',
        maqsad: 'din',
        severity: 'hold',
        reason: 'Hadis dinyatakan tanpa sumber (perawi/kitab). Menyandarkan kata-kata kepada Rasulullah ﷺ tanpa sanad memerlukan pengesahan (Sahih al-Bukhari, 110).',
        excerpt: excerptAround(raw, hadithMatch.index, hadithMatch[0].length),
      });
    } else {
      findings.push({
        code: 'DIN_HADITH_VERIFY',
        maqsad: 'din',
        severity: 'notice',
        reason: 'Hadis disertakan dengan sumber — sila semak nombor dan darjat hadis dengan kitab asal.',
      });
    }
  }

  const fab = FABRICATED_HADITH_MARKERS.exec(raw);
  if (fab && !FABRICATION_DISCLAIMER.test(raw)) {
    findings.push({
      code: 'DIN_HADITH_KNOWN_WEAK',
      maqsad: 'din',
      severity: 'hold',
      reason: 'Teks ini lazim disebut sebagai hadis tetapi dinilai palsu/lemah oleh ulama hadis; ia tidak boleh dikemukakan sebagai sabda Nabi ﷺ.',
      excerpt: excerptAround(raw, fab.index, fab[0].length),
    });
  }

  // Generated Arabic (ayat/du'a) — a single wrong harakah changes meaning.
  for (const m of raw.matchAll(ARABIC_RUN)) {
    const letters = (m[0].match(ARABIC_LETTER) || []).length;
    if (letters >= 30) {
      findings.push({
        code: 'DIN_ARABIC_TEXT_VERIFY',
        maqsad: 'din',
        severity: 'hold',
        reason: 'Teks Arab (ayat/hadis/doa) yang dijana AI mesti disemak dengan mushaf atau kitab asal sebelum dipaparkan.',
        excerpt: clip(m[0].trim(), 60),
      });
      break;
    }
  }
}

function applyRedactions(text: string, findings: ComplianceFinding[]): string {
  let out = text;
  for (const rule of REDACT_RULES) {
    let hit = false;
    out = out.replace(rule.pattern, (m) => {
      if (rule.code === 'DATA_PHONE_MY' && HELPLINE_DIGITS.has(m.replace(/\D/g, ''))) return m;
      if (rule.validate && !rule.validate(m)) return m;
      hit = true;
      return rule.mask;
    });
    if (hit) findings.push({ code: rule.code, maqsad: 'data', severity: 'redact', reason: rule.reason });
  }
  return out;
}

function runPatternRules(norm: string, findings: ComplianceFinding[]) {
  for (const rule of PATTERN_RULES) {
    if (rule.unless?.some((u) => u.test(norm))) continue;
    for (const p of rule.patterns) {
      const m = p.exec(norm);
      if (m) {
        findings.push({
          code: rule.code,
          maqsad: rule.maqsad,
          severity: rule.severity,
          reason: rule.reason,
          excerpt: excerptAround(norm, m.index, m[0].length),
        });
        break;
      }
    }
  }
}

// ─── Learner-facing messages ──────────────────────────────────────
const HELPLINE_MSG =
  'Jika anda atau rakan sedang bergelut, anda tidak bersendirian. Hubungi Talian Kasih 15999 / WhatsApp 019-261 5999, ' +
  'Befrienders 03-7627 2929, atau 999 untuk kecemasan. ' +
  '(If you are struggling, please reach out: Talian Kasih 15999, Befrienders 03-7627 2929, emergency 999.)';

export function buildUserMessage(verdict: Verdict, findings: ComplianceFinding[]): string {
  const hasNafs = findings.some((f) => f.maqsad === 'nafs' && f.severity === 'block');
  switch (verdict) {
    case 'block':
      return (
        'Kandungan ini disekat kerana tidak menepati prinsip keselamatan, akidah atau maruah insan platform ini. ' +
        'This content was blocked because it does not meet our safety, faith or dignity standards.' +
        (hasNafs ? '\n\n' + HELPLINE_MSG : '')
      );
    case 'hold':
      return (
        'Jawapan ini memerlukan pengesahan pendidik/ustaz bertauliah sebelum dipaparkan, kerana ia menyentuh perkara yang ' +
        'melebihi kompetensi AI atau rujukannya belum dapat disahkan. Ia telah dihantar untuk semakan manusia. ' +
        'This answer needs verification by a qualified teacher before it can be shown and has been sent for human review.'
      );
    case 'redact':
      return 'Maklumat peribadi atau rahsia telah disembunyikan demi amanah data. Personal or secret data was masked.';
    case 'notice':
      return 'Sila semak rujukan dengan sumber asal dan bincangkan dengan guru anda. Please verify references with the original sources.';
    default:
      return '';
  }
}

// ─── Public API ───────────────────────────────────────────────────
export interface EvaluateOptions {
  /** Max characters scanned; longer text is held rather than partially scanned. */
  maxLength?: number;
}

export function evaluateContent(text: string, opts: EvaluateOptions = {}): ComplianceReport {
  const maxLength = opts.maxLength ?? 200_000;
  try {
    const raw = typeof text === 'string' ? text : String(text ?? '');
    const findings: ComplianceFinding[] = [];

    if (raw.length > maxLength) {
      findings.push({
        code: 'SYSTEM_TOO_LONG',
        maqsad: 'data',
        severity: 'hold',
        reason: `Output melebihi had imbasan (${maxLength} aksara) dan tidak dapat disahkan sepenuhnya.`,
      });
    }

    // 1. Data integrity first, so no later excerpt can carry raw PII.
    const redacted = applyRedactions(raw, findings);
    const norm = normalize(redacted);

    // 2. Maqasid rule families.
    runPatternRules(norm, findings);
    checkCitations(redacted, findings);

    const rank = findings.reduce((r, f) => Math.max(r, SEVERITY_RANK[f.severity]), 0);
    const verdict = VERDICT_BY_RANK[rank];
    const deliverable = verdict === 'allow' || verdict === 'notice' || verdict === 'redact';

    return {
      verdict,
      findings,
      safeText: deliverable ? redacted : '',
      reviewText: redacted,
      userMessage: buildUserMessage(verdict, findings),
      engineVersion: COMPLIANCE_ENGINE_VERSION,
    };
  } catch (err) {
    // Fail closed: an engine fault must never let unverified content through.
    const findings: ComplianceFinding[] = [{
      code: 'SYSTEM_ENGINE_ERROR',
      maqsad: 'data',
      severity: 'hold',
      reason: 'Enjin pematuhan gagal memproses kandungan; ditahan untuk semakan manusia.',
      excerpt: clip(String((err as Error)?.message ?? err), 80),
    }];
    return {
      verdict: 'hold',
      findings,
      safeText: '',
      reviewText: '',
      userMessage: buildUserMessage('hold', findings),
      engineVersion: COMPLIANCE_ENGINE_VERSION,
    };
  }
}

/** Shape returned to the browser — no excerpts of held content leak to the learner. */
export interface PublicComplianceInfo {
  verdict: Verdict;
  codes: string[];
  maqasid: Maqsad[];
  message: string;
  reviewId?: string | null;
  engineVersion: string;
}

export const toPublicInfo = (r: ComplianceReport, reviewId?: string | null): PublicComplianceInfo => ({
  verdict: r.verdict,
  codes: [...new Set(r.findings.map((f) => f.code))],
  maqasid: [...new Set(r.findings.map((f) => f.maqsad))],
  message: r.userMessage,
  reviewId: reviewId ?? null,
  engineVersion: r.engineVersion,
});
