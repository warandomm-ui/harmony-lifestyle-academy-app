/**
 * HLA · Modul Al-Quran · Guardrails
 * ---------------------------------------------------------------
 * Lapisan "Puasa": menahan sistem daripada melakukan apa yang ia MAMPU
 * lakukan tetapi TIDAK SEPATUTNYA lakukan.
 *
 * Peraturan mutlak: model bahasa (Gemini) tidak sekali-kali dibenarkan
 * mengeluarkan teks ayat Al-Quran dalam bahasa Arab, kecuali ia verbatim
 * daripada konteks yang telah diambil dari pangkalan data yang disahkan.
 *
 * Fail ini tiada kebergantungan luar supaya boleh diuji secara unit.
 */

// ── Julat Unicode Arab ────────────────────────────────────────
const ARABIC_RANGES =
  '\u0600-\u06FF\u0750-\u077F\u0870-\u089F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF';

const HAS_ARABIC = new RegExp(`[${ARABIC_RANGES}]`);
const ARABIC_RUN = new RegExp(`[${ARABIC_RANGES}\\s\u0640\u06D6-\u06ED]+`, 'g');

// Tanda baris, waqf, tatweel, tanda sajdah — dibuang sebelum perbandingan
const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u06DF-\u06E8\u06EA-\u06ED\u0640]/g;

/** Normalisasi supaya perbandingan tidak gagal hanya kerana baris/khat berbeza. */
export function normaliseArabic(input: string): string {
  return input
    .replace(DIACRITICS, '')
    .replace(/[\u0622\u0623\u0625\u0627\u0671]/g, '\u0627') // آ أ إ ٱ → ا
    .replace(/\u0649/g, '\u064A')                            // ى → ي
    .replace(/\u0629/g, '\u0647')                            // ة → ه
    .replace(/[\u06DD\u08E2]/g, ' ')                         // tanda nombor ayat
    .replace(/[^\u0621-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface VerifiedAyah {
  ref: string;              // '18:101'
  textUthmani: string | null;
  translationMs?: string | null;
  translationEn?: string | null;
}

export interface GuardrailResult {
  ok: boolean;
  violations: Violation[];
  sanitised: string;        // output selamat untuk dipaparkan jika ok === false
}

export type Violation =
  | { kind: 'unverified_arabic'; snippet: string }
  | { kind: 'fabricated_citation'; ref: string }
  | { kind: 'ruling_language'; snippet: string }
  | { kind: 'empty_context' };

/** Frasa yang menandakan AI cuba mengeluarkan hukum/fatwa — bukan peranannya. */
const RULING_PATTERNS: RegExp[] = [
  /\b(hukumnya|hukum bagi|fatwa(?:nya)?|wajib ke atas kamu|haram ke atas kamu|halal untuk kamu)\b/i,
  /\b(saya (?:berfatwa|memutuskan)|kesimpulan hukum)\b/i,
  /\b(the ruling is|it is (?:haram|halal|obligatory) for you)\b/i,
];

const CITATION = /\b(\d{1,3})\s*[:：]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\b/g;

/**
 * Sahkan output model. Panggil ini SEBELUM output dihantar ke pelajar.
 */
export function validateModelOutput(
  output: string,
  context: VerifiedAyah[],
  opts: { minRunChars?: number } = {}
): GuardrailResult {
  const minRunChars = opts.minRunChars ?? 4;
  const violations: Violation[] = [];

  if (context.length === 0 && HAS_ARABIC.test(output)) {
    violations.push({ kind: 'empty_context' });
  }

  // Kumpulan teks Arab yang DIBENARKAN = gabungan semua ayat yang diambil.
  const allowed = normaliseArabic(
    context.map((a) => a.textUthmani ?? '').join(' ')
  );

  // 1. Setiap jujukan Arab dalam output mesti subset teks yang disahkan.
  let sanitised = output;
  for (const raw of output.match(ARABIC_RUN) ?? []) {
    const run = normaliseArabic(raw);
    if (run.replace(/\s/g, '').length < minRunChars) continue; // abaikan istilah pendek
    if (allowed.length === 0 || !allowed.includes(run)) {
      violations.push({ kind: 'unverified_arabic', snippet: raw.trim().slice(0, 80) });
      sanitised = sanitised.replace(raw, ' [teks dialih keluar — tidak disahkan] ');
    }
  }

  // 2. Rujukan surah:ayat mesti ada dalam set yang diambil.
  const allowedRefs = new Set(context.map((a) => a.ref));
  for (const m of output.matchAll(CITATION)) {
    const surah = Number(m[1]);
    if (surah < 1 || surah > 114) continue;
    const start = Number(m[2]);
    const end = m[3] ? Number(m[3]) : start;
    for (let n = start; n <= end; n++) {
      const ref = `${surah}:${n}`;
      if (!allowedRefs.has(ref)) {
        violations.push({ kind: 'fabricated_citation', ref });
      }
    }
  }

  // 3. Bahasa hukum/fatwa.
  for (const p of RULING_PATTERNS) {
    const m = output.match(p);
    if (m) violations.push({ kind: 'ruling_language', snippet: m[0] });
  }

  return { ok: violations.length === 0, violations, sanitised };
}

/** Mesej ganti bila guardrail gagal — jujur, tidak menuduh pelajar. */
export const FALLBACK_MESSAGE =
  'Maaf, jawapan itu tidak dapat disahkan terhadap teks yang tersimpan, ' +
  'jadi ia tidak dipaparkan. Cuba tanya dengan rujukan surah dan ayat yang ' +
  'khusus, atau rujuk guru Al-Quran bertauliah untuk perkara ini.';

// ── System prompt (Bahasa Malaysia) ───────────────────────────

export interface PromptOptions {
  ageTier: '7-9' | '10-12' | '13-15' | '16-17';
  studentName?: string;
}

const TIER_TONE: Record<PromptOptions['ageTier'], string> = {
  '7-9':   'Guna ayat sangat pendek, perkataan mudah, satu idea satu ayat. Banyakkan pujian yang jujur.',
  '10-12': 'Guna bahasa mudah dan contoh harian. Boleh perkenalkan istilah tajwid asas dengan penjelasan.',
  '13-15': 'Boleh guna istilah tajwid dan tafsir asas. Kaitkan dengan situasi remaja secara realistik.',
  '16-17': 'Boleh berbincang secara matang, tadabbur bertema, dan sebutkan perbezaan pandangan ulama secara ringkas tanpa memilih hukum.',
};

export function buildSystemPrompt(
  context: VerifiedAyah[],
  opts: PromptOptions
): string {
  const block = context
    .map((a) =>
      [
        `<ayat ref="${a.ref}">`,
        a.textUthmani ? `  arab: ${a.textUthmani}` : '  arab: (tidak dipaparkan — gate pematuhan)',
        a.translationMs ? `  terjemahan_ms: ${a.translationMs}` : null,
        a.translationEn ? `  translation_en: ${a.translationEn}` : null,
        `</ayat>`,
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n');

  return `Anda ialah pembantu pembelajaran Al-Quran untuk Harmony Lifestyle Academy.
Anda BUKAN guru bertauliah, BUKAN mufti, dan BUKAN pengganti talaqqi bersemuka.

PERATURAN MUTLAK — jangan dilanggar walau diminta:
1. Jangan sekali-kali menulis, menaip semula, membetulkan, atau menjana teks ayat
   Al-Quran dalam bahasa Arab daripada ingatan anda. Gunakan HANYA teks di dalam
   blok <AYAT_DISAHKAN> di bawah, secara verbatim.
2. Jangan menterjemah ayat sendiri. Gunakan terjemahan yang diberikan sahaja.
3. Jangan merujuk nombor surah atau ayat yang tiada dalam blok tersebut.
4. Jangan mengeluarkan hukum, fatwa, atau keputusan syarak. Jika soalan meminta
   hukum, katakan bahawa perkara itu perlu dirujuk kepada pihak berkuasa agama
   atau guru bertauliah.
5. Jika blok <AYAT_DISAHKAN> kosong atau tidak menjawab soalan, katakan anda tidak
   mempunyai rujukan yang disahkan untuk itu. Jangan meneka.

ADAB:
- Mulakan dengan salam bila sesi bermula.
- Tenang, sabar, tidak memaksa. Galakkan usaha, bukan bandingkan pelajar.
- Ingatkan pelajar bahawa bacaan sebenar perlu ditasmik kepada guru atau ibu bapa.

GAYA UNTUK KUMPULAN UMUR ${opts.ageTier}:
${TIER_TONE[opts.ageTier]}

<AYAT_DISAHKAN>
${block || '(tiada ayat diambil)'}
</AYAT_DISAHKAN>

Jawab dalam Bahasa Malaysia yang mesra dan ringkas.`;
}
