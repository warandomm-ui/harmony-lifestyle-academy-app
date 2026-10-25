#!/usr/bin/env node
/**
 * HLA · Modul Al-Quran · Import sekali sahaja (idempotent)
 * ---------------------------------------------------------------
 * Lapisan "Malaikat": agen automasi yang menulis rekod, sekali dan tepat.
 *
 * Guna:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/import-quran.mjs \
 *     --arabic ./data/quran-uthmani.txt \
 *     --translation ./data/ms.basmeih.txt --translation-key ms_basmeih \
 *     --audio-qari Husary_128kbps \
 *     --surah-meta ./data/surahs.json
 *
 * Format fail Tanzil (pipe-delimited, satu ayat satu baris):
 *   1|1|بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
 *
 * PENTING: skrip ini menulis dengan service_role. Jangan sekali-kali
 * dedahkan kunci itu ke sisi pelayar.
 */

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';

const { values: args } = parseArgs({
  options: {
    arabic: { type: 'string' },
    'arabic-key': { type: 'string', default: 'tanzil_uthmani' },
    translation: { type: 'string' },
    'translation-key': { type: 'string' },
    'surah-meta': { type: 'string' },
    'audio-qari': { type: 'string' },
    'audio-base': { type: 'string', default: 'https://everyayah.com/data' },
    'dry-run': { type: 'boolean', default: false },
  },
});

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dahulu.');
  process.exit(1);
}

const db = createClient(url, key, { db: { schema: 'quran' } });
const CHUNK = 500;

// ── Utiliti ───────────────────────────────────────────────────

const DIACRITICS =
  /[\u{064B}-\u{065F}\u{0670}\u{06D6}-\u{06ED}\u{0610}-\u{061A}\u{06DF}-\u{06E8}\u{06EA}-\u{06ED}\u{0640}\u{06DD}]/gu;

/** Versi tanpa baris untuk carian & padanan guardrail. */
function toPlain(s) {
  return s.replace(DIACRITICS, '').replace(/\s+/g, ' ').trim();
}

function parsePipeFile(path) {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [s, a, ...rest] = t.split('|');
    const surah = Number(s);
    const ayah = Number(a);
    const text = rest.join('|').trim();
    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || !text) continue;
    rows.push({ surah, ayah, text });
  }
  return rows;
}

async function upsert(table, rows, conflict) {
  if (args['dry-run']) {
    console.log(`  [dry-run] ${table}: ${rows.length} baris`);
    return;
  }
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await db.from(table).upsert(slice, { onConflict: conflict });
    if (error) throw new Error(`${table} @${i}: ${error.message}`);
    process.stdout.write(`\r  ${table}: ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  process.stdout.write('\n');
}

// ── 1. Edisi + metadata lesen ─────────────────────────────────

const EDITIONS = {
  tanzil_uthmani: {
    key: 'tanzil_uthmani',
    kind: 'arabic',
    lang: 'ar',
    display_name: 'Teks Uthmani (Tanzil)',
    source_url: 'https://tanzil.net/download/',
    license: 'CC BY 3.0',
    attribution_text: 'Teks Al-Quran daripada Tanzil.net (CC BY 3.0). Pengubahan tidak dibenarkan.',
    commercial_ok: true,
    modification_ok: false,
    approval_status: 'pending',
    notes: 'Paparan awam di Malaysia masih memerlukan Perakuan Betul Pruf Akhir KDN (Akta 326).',
  },
  ms_basmeih: {
    key: 'ms_basmeih',
    kind: 'translation',
    lang: 'ms',
    display_name: 'Tafsir Pimpinan Ar-Rahman (Basmeih)',
    source_url: 'https://www.islam.gov.my/',
    license: 'Hak cipta JAKIM — lesen bertulis diperlukan',
    attribution_text: 'Terjemahan: Tafsir Pimpinan Ar-Rahman, JAKIM.',
    commercial_ok: false,
    modification_ok: false,
    approval_status: 'pending',
    notes: 'JANGAN aktifkan untuk paparan awam sebelum kelulusan JAKIM diperoleh.',
  },
  audio_hafs: {
    key: 'audio_hafs',
    kind: 'audio',
    lang: 'ar',
    display_name: 'Bacaan riwayat Hafs an Asim',
    source_url: 'https://everyayah.com/',
    license: 'Kegunaan bebas dengan attribution',
    attribution_text: 'Audio: everyayah.com',
    commercial_ok: true,
    modification_ok: false,
    approval_status: 'pending',
  },
};

async function seedEditions(keys) {
  const rows = keys.map((k) => EDITIONS[k]).filter(Boolean);
  console.log('· Edisi');
  await upsert('editions', rows, 'key');
}

// ── 2. Surah ──────────────────────────────────────────────────

async function importSurahs(metaPath, ayahRows) {
  console.log('· Surah');
  let rows;
  if (metaPath) {
    rows = JSON.parse(readFileSync(metaPath, 'utf8'));
  } else {
    // Derive minimum viable metadata dari fail ayat.
    const counts = new Map();
    for (const r of ayahRows) counts.set(r.surah, Math.max(counts.get(r.surah) ?? 0, r.ayah));
    rows = [...counts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([id, ayah_count]) => ({
        id,
        name_arabic: '',
        name_rumi: `Surah ${id}`,
        ayah_count,
      }));
    console.warn('  ! Tiada --surah-meta: nama surah perlu dikemas kini kemudian.');
  }
  await upsert('surahs', rows, 'id');
}

// ── 3. Ayah ───────────────────────────────────────────────────

function globalId(surahOffsets, surah, ayah) {
  return surahOffsets.get(surah) + ayah;
}

async function importAyahs(rows, editionKey) {
  console.log('· Ayah');
  // Offset kumulatif → id global 1..6236
  const bySurah = new Map();
  for (const r of rows) bySurah.set(r.surah, Math.max(bySurah.get(r.surah) ?? 0, r.ayah));
  const offsets = new Map();
  let running = 0;
  for (const s of [...bySurah.keys()].sort((a, b) => a - b)) {
    offsets.set(s, running);
    running += bySurah.get(s);
  }

  const payload = rows.map((r) => ({
    id: globalId(offsets, r.surah, r.ayah),
    surah_id: r.surah,
    ayah_number: r.ayah,
    text_uthmani: r.text,
    text_plain: toPlain(r.text),
    edition_key: editionKey,
  }));

  await upsert('ayahs', payload, 'id');
  return offsets;
}

// ── 4. Terjemahan ─────────────────────────────────────────────

async function importTranslation(path, editionKey, offsets) {
  console.log(`· Terjemahan (${editionKey})`);
  const rows = parsePipeFile(path).map((r) => ({
    ayah_id: globalId(offsets, r.surah, r.ayah),
    edition_key: editionKey,
    text: r.text,
  }));
  await upsert('translations', rows, 'ayah_id,edition_key');
}

// ── 5. Audio ──────────────────────────────────────────────────

async function importAudio(qari, base, offsets) {
  console.log(`· Audio (${qari})`);
  const rows = [];
  for (const [surah, offset] of offsets) {
    const count = (() => {
      const next = [...offsets.entries()].find(([s]) => s === surah + 1);
      return next ? next[1] - offset : 6236 - offset;
    })();
    for (let a = 1; a <= count; a++) {
      const file = `${String(surah).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`;
      rows.push({
        ayah_id: offset + a,
        edition_key: 'audio_hafs',
        qari,
        riwayah: 'Hafs an Asim',
        audio_url: `${base}/${qari}/${file}`,
      });
    }
  }
  await upsert('recitations', rows, 'ayah_id,edition_key');
}

// ── Main ──────────────────────────────────────────────────────

(async () => {
  if (!args.arabic) {
    console.error('Wajib: --arabic <fail teks Tanzil>');
    process.exit(1);
  }

  const editionKeys = ['tanzil_uthmani'];
  if (args['translation-key']) editionKeys.push(args['translation-key']);
  if (args['audio-qari']) editionKeys.push('audio_hafs');

  await seedEditions(editionKeys);

  const arabicRows = parsePipeFile(args.arabic);
  console.log(`  ${arabicRows.length} ayat dibaca dari ${args.arabic}`);
  if (arabicRows.length !== 6236) {
    console.warn(`  ! Dijangka 6236 ayat, dapat ${arabicRows.length}. Sahkan fail sumber.`);
  }

  await importSurahs(args['surah-meta'], arabicRows);
  const offsets = await importAyahs(arabicRows, args['arabic-key']);

  if (args.translation && args['translation-key']) {
    await importTranslation(args.translation, args['translation-key'], offsets);
  }
  if (args['audio-qari']) {
    await importAudio(args['audio-qari'], args['audio-base'], offsets);
  }

  console.log('\nSelesai. Gate pematuhan masih "locked" secara lalai —');
  console.log('buka hanya selepas Perakuan KDN dan kelulusan JAKIM diperoleh.');
})().catch((e) => {
  console.error('\nGagal:', e.message);
  process.exit(1);
});
