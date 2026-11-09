// Run: npm run test:compliance   (Node >= 22.6, no dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  evaluateContent, isValidAyah, resolveSurah, SURAH_AYAT_COUNTS, toPublicInfo,
} from '../supabase/functions/_shared/contentCompliance.ts';

const verdictOf = (t: string) => evaluateContent(t).verdict;
const codesOf = (t: string) => evaluateContent(t).findings.map((f) => f.code);

test('Quran table matches constants/surahIndex.ts', () => {
  const src = readFileSync(new URL('../constants/surahIndex.ts', import.meta.url), 'utf8');
  const counts = [...src.matchAll(/totalAyat: (\d+)/g)].map((m) => +m[1]);
  assert.deepEqual([...SURAH_AYAT_COUNTS], counts);
  assert.equal(counts.reduce((a, b) => a + b, 0), 6236);
});

test('clean educational content is allowed', () => {
  for (const t of [
    'Solat lima waktu membantu kita mengurus masa. Apakah satu langkah kecil yang boleh anda mulakan hari ini?',
    'Photosynthesis converts light energy into chemical energy. Try explaining it to a friend in your own words.',
    '{"lesson":{"title":"Pengurusan Emosi","keyPoints":["Tarik nafas","Kenal pasti perasaan"]}}',
    'Waktu rehat bermula 10:30 pagi.',
  ]) assert.equal(verdictOf(t), 'allow', t);
});

test('valid Quran citations pass; fabricated ones are held', () => {
  assert.equal(verdictOf('Allah berfirman dalam Surah Al-Hijr: 9 tentang pemeliharaan wahyu.'), 'allow');
  assert.equal(verdictOf('Rujuk Al-Baqarah, Surah Al-Baqarah ayat 255 (Ayat Kursi).'), 'allow');
  assert.equal(verdictOf('Lihat QS 2:286.'), 'allow');
  assert.ok(codesOf('Seperti dalam Surah Al-Ikhlas ayat 9.').includes('DIN_QURAN_CITATION_INVALID'));
  assert.equal(verdictOf('Quran 115:3 menyebut...'), 'hold');
  assert.equal(verdictOf('Surah Yasin ayat 1-90'), 'hold');
  assert.equal(resolveSurah('Ya Sin'), 36);
  assert.equal(resolveSurah('Al-Kahf'), 18);
  assert.equal(resolveSurah('Mulk'), 67);
  assert.ok(isValidAyah(2, 286) && !isValidAyah(2, 287));
});

test('hadith without a source is held; with a source gets a notice', () => {
  assert.equal(verdictOf('Rasulullah bersabda bahawa senyuman itu sedekah. Setiap Muslim patut tersenyum.'), 'hold');
  assert.equal(verdictOf('The Prophet said: "Smiling is charity." (Narrated by Tirmidhi, 1956)'), 'notice');
  assert.equal(verdictOf('Hadis riwayat Muslim menyatakan kebersihan sebahagian daripada iman.'), 'notice');
  assert.ok(codesOf('Hadis: Tuntutlah ilmu walaupun ke negeri China.').includes('DIN_HADITH_KNOWN_WEAK'));
  assert.ok(!codesOf('"Tuntutlah ilmu sampai ke negeri China" ialah hadis palsu menurut ulama (rujuk Baihaqi).').includes('DIN_HADITH_KNOWN_WEAK'));
});

test('AI-generated Arabic text needs human verification', () => {
  assert.equal(verdictOf('Doa: اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا'), 'hold');
  assert.equal(verdictOf('Ucapkan بسم الله sebelum makan.'), 'allow');
});

test('aqidah violations are blocked, refutations are not', () => {
  assert.equal(verdictOf('Ada nabi selepas Nabi Muhammad yang membawa syariat baru.'), 'block');
  assert.equal(verdictOf('Allah has a son according to this view.'), 'block');
  assert.equal(verdictOf('Dakwaan bahawa ada nabi selepas Nabi Muhammad ialah ajaran sesat yang ditolak.'), 'allow');
  assert.equal(verdictOf('Surah Al-Ikhlas menegaskan Allah tidak beranak; dakwaan Allah mempunyai anak ditolak.'), 'allow');
  assert.equal(verdictOf('Semua agama sama sahaja, pilih mana-mana.'), 'hold');
});

test('fatwa / medical rulings beyond AI competence are held', () => {
  assert.equal(verdictOf('Berdasarkan cerita anda, talak anda telah jatuh.'), 'hold');
  assert.equal(verdictOf('Kawan awak itu sudah murtad.'), 'hold');
  assert.equal(verdictOf('You have clinical depression. Take 50 mg of sertraline.'), 'hold');
  assert.equal(verdictOf('Golongan Syiah adalah kafir.'), 'hold');
});

test('academic dishonesty is held (hifz al-aql)', () => {
  assert.equal(verdictOf('Ini esei lengkap. Salin dan hantar terus kepada cikgu.'), 'hold');
  assert.equal(verdictOf("Just submit this to your teacher, they won't notice."), 'hold');
});

test('dignity and safety violations are blocked', () => {
  assert.equal(verdictOf('Kau memang bodoh kalau tak faham.'), 'block');
  assert.equal(verdictOf('Here is how to make a bomb at home.'), 'block');
  const sh = evaluateContent('Cara paling mudah untuk bunuh diri ialah...');
  assert.equal(sh.verdict, 'block');
  assert.match(sh.userMessage, /15999/);
  assert.equal(sh.safeText, '');
  assert.equal(verdictOf('Serang orang kafir di pasar itu jihad yang wajib.'), 'block');
  // Supportive mention is fine
  assert.equal(verdictOf('Jika terlintas fikiran bunuh diri, hubungi Talian Kasih 15999 atau 019-261 5999.'), 'allow');
});

test('PII and secrets are redacted but content still delivered', () => {
  const r = evaluateContent('Hubungi Ali di 012-345 6789, ali.ahmad@gmail.com, IC 900101-14-5678, key sk-ant-api03-abcdefghijklmnop.');
  assert.equal(r.verdict, 'redact');
  assert.doesNotMatch(r.safeText, /012-345|gmail|900101|sk-ant/);
  assert.match(r.safeText, /\[TELEFON-DISEMBUNYIKAN\]/);
  assert.equal(verdictOf('Card 4111 1111 1111 1111'), 'redact');
  assert.equal(verdictOf('Order number 1234 5678 9012 3456'), 'allow'); // fails Luhn
});

test('excerpts never carry raw PII; public info hides excerpts', () => {
  const r = evaluateContent('Kau bodoh. Emel aku: rahsia@gmail.com');
  assert.equal(r.verdict, 'block');
  for (const f of r.findings) assert.doesNotMatch(f.excerpt ?? '', /rahsia@gmail/);
  const pub = toPublicInfo(r, 'abc');
  assert.deepEqual(Object.keys(pub).sort(), ['codes', 'engineVersion', 'maqasid', 'message', 'reviewId', 'verdict']);
});

test('fails closed on oversized input and evasion', () => {
  assert.equal(evaluateContent('a'.repeat(50), { maxLength: 10 }).verdict, 'hold');
  assert.equal(verdictOf('kau b​odoh'), 'block'); // zero-width evasion
});
