#!/usr/bin/env node
// Validates content/modules/*.json: structure, coverage of every topic title the app
// shows, quiz integrity, and reference sanity. Exits non-zero on any error.
//
//   node scripts/validate-module-content.mjs            offline checks
//   node scripts/validate-module-content.mjs --online   also confirms every Quran
//                                                       reference resolves on api.quran.com
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadModules } from './module-content-lib.mjs';

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const words = (s) => s.trim().split(/\s+/).length;
const isText = (v, min = 1) => typeof v === 'string' && v.trim().length >= min;

// ── What the app actually shows ───────────────────────────────────────────────
// Topic titles and icons are read from the page components so that content can
// never silently drift from the UI that requests it.
const DIM = 'components/dashboard/pages/dimensions';
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const iconTitlePairs = (src) =>
  [...src.matchAll(/icon:\s*'([^']+)',\s*title:\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)")/g)].map((m) => ({
    icon: m[1],
    title: (m[2] ?? m[3]).replace(/\\'/g, "'"),
  }));

function appTopics() {
  const out = {};
  for (const [id, file] of [
    ['physical', 'PhysicalPage.tsx'],
    ['social', 'SocialPage.tsx'],
    ['intellectual', 'IntellectualPage.tsx'],
    ['emotional', 'EmotionalPage.tsx'],
    ['environmental', 'EnvironmentalPage.tsx'],
    ['vocational', 'VocationalPage.tsx'],
  ]) {
    out[id] = iconTitlePairs(read(`${DIM}/${file}`));
  }
  const spiritual = read(`${DIM}/SpiritualPage.tsx`);
  const islamicBlock = spiritual.slice(
    spiritual.indexOf('const islamicSpiritualTopics'),
    spiritual.indexOf('];', spiritual.indexOf('const islamicSpiritualTopics')),
  );
  out['spiritual-islamic'] = iconTitlePairs(islamicBlock);
  const pathwayBlock = spiritual.slice(spiritual.indexOf('const MINDFULNESS_PATHWAYS'));
  out.spiritual = [...pathwayBlock.matchAll(/^ {4}icon:\s*'([^']+)',\n {4}title:\s*'([^']+)'/gm)].map((m) => ({
    icon: m[1],
    title: m[2],
  }));
  return out;
}

// ── Quran reference table (surah → ayat count) from the app's own index ───────
const ayatCount = Object.fromEntries(
  [...read('constants/surahIndex.ts').matchAll(/number:\s*(\d+),[^}]*?totalAyat:\s*(\d+)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]),
);
const quranRefs = [];
function checkSources(where, sources) {
  if (!Array.isArray(sources) || sources.length === 0) return err(where, 'sources must be a non-empty array');
  for (const s of sources) {
    if (!isText(s, 5)) { err(where, `empty source entry`); continue; }
    const q = s.match(/^Quran (\d+):(\d+)(?:-(\d+))?$/);
    if (s.startsWith('Quran')) {
      if (!q) { err(where, `malformed Quran reference "${s}"`); continue; }
      const [surah, from, to] = [Number(q[1]), Number(q[2]), Number(q[3] ?? q[2])];
      if (!ayatCount[surah]) err(where, `no such surah in "${s}"`);
      else if (from < 1 || to > ayatCount[surah] || from > to) err(where, `ayah out of range in "${s}"`);
      else quranRefs.push({ where, surah, from, to });
    } else if (!/(Sahih al-Bukhari|Sahih Muslim|Jami' at-Tirmidhi|Sunan Abi Dawud|Musnad Ahmad|Sirah)/.test(s)) {
      err(where, `source "${s}" is not a recognised collection`);
    } else if (/(Tirmidhi|Abi Dawud|Ahmad)/.test(s) && !/\((?:[^)]*\b)?(sahih|hasan)[^)]*\)/.test(s)) {
      err(where, `"${s}" is outside the two Sahihs and must state its grading`);
    }
  }
}

// ── Structural validation ─────────────────────────────────────────────────────
const modules = loadModules();
const expected = appTopics();
const seenModuleIds = new Set();
const allQuestions = [];

for (const m of modules) {
  const M = m.file;
  if (!/^[a-z][a-z-]*$/.test(m.id ?? '')) err(M, 'id must be kebab-case');
  if (`${m.id}.json` !== m.file) err(M, `file name must match id "${m.id}"`);
  if (seenModuleIds.has(m.id)) err(M, 'duplicate module id');
  seenModuleIds.add(m.id);
  for (const k of ['name', 'icon', 'description']) if (!isText(m[k])) err(M, `missing ${k}`);
  if (!['universal', 'muslim'].includes(m.audience)) err(M, 'audience must be "universal" or "muslim"');
  if (!Number.isInteger(m.order)) err(M, 'order must be an integer');
  if (!Array.isArray(m.topics) || m.topics.length === 0) { err(M, 'no topics'); continue; }

  // Coverage: exactly the titles (and icons, in order) that the page renders.
  const want = expected[m.id];
  if (!want) err(M, 'module id is not used anywhere in the app');
  else {
    const got = m.topics.map((t) => t.title);
    for (const w of want) if (!got.includes(w.title)) err(M, `missing topic for app title "${w.title}"`);
    for (const g of got) if (!want.some((w) => w.title === g)) err(M, `topic "${g}" has no matching title in the app`);
    m.topics.forEach((t, i) => {
      if (want[i] && want[i].title !== t.title) err(M, `topic ${i + 1} is out of order (app has "${want[i].title}")`);
      const w = want.find((x) => x.title === t.title);
      if (w && w.icon !== t.icon) err(M, `icon for "${t.title}" differs from the app (${w.icon})`);
    });
  }

  const slugs = new Set();
  for (const t of m.topics) {
    const T = `${m.id}/${t.slug ?? '?'}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug ?? '')) err(T, 'slug must be kebab-case');
    if (slugs.has(t.slug)) err(T, 'duplicate slug');
    slugs.add(t.slug);
    for (const k of ['title', 'icon', 'summary']) if (!isText(t[k])) err(T, `missing ${k}`);
    if (!Number.isInteger(t.durationMinutes) || t.durationMinutes < 5 || t.durationMinutes > 30) err(T, 'durationMinutes out of range');
    if (!Number.isInteger(t.xpReward) || t.xpReward < 5 || t.xpReward > 50) err(T, 'xpReward out of range');
    if (!Array.isArray(t.objectives) || t.objectives.length !== 3 || !t.objectives.every((o) => isText(o, 15))) err(T, 'needs exactly 3 objectives');

    const L = t.lesson ?? {};
    for (const k of ['title', 'explanation', 'practicalTip', 'deeperInsight']) if (!isText(L[k])) err(T, `lesson.${k} missing`);
    if (isText(L.explanation)) {
      const n = words(L.explanation);
      if (n < 170 || n > 340) err(T, `lesson.explanation is ${n} words (expected 170-340)`);
      if (L.explanation.split('\n\n').length < 3) err(T, 'lesson.explanation should have at least 3 paragraphs');
    }
    if (!Array.isArray(L.keyPoints) || L.keyPoints.length !== 4 || !L.keyPoints.every((k) => isText(k, 15))) err(T, 'needs exactly 4 keyPoints');
    if (!Array.isArray(L.examples) || L.examples.length < 2) err(T, 'needs at least 2 worked examples');
    else for (const e of L.examples) for (const k of ['title', 'scenario', 'takeaway']) if (!isText(e[k], 5)) err(T, `example.${k} missing`);
    if (isText(L.practicalTip) && words(L.practicalTip) < 15) err(T, 'practicalTip too thin');
    if (isText(L.deeperInsight) && words(L.deeperInsight) < 25) err(T, 'deeperInsight too thin');

    // Quiz
    if (!Array.isArray(t.quiz) || t.quiz.length < 3) err(T, 'needs at least 3 quiz questions');
    else {
      t.quiz.forEach((q, i) => {
        const Q = `${T} q${i + 1}`;
        if (!isText(q.question, 15)) err(Q, 'question missing');
        if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every((o) => isText(o))) return err(Q, 'needs exactly 4 options');
        if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) err(Q, 'options must be distinct');
        if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) return err(Q, 'correctIndex must be 0-3');
        if (!isText(q.explanation, 30)) err(Q, 'explanation missing or too short');
        if (q.options.some((o) => /\b(all|none) of the above\b/i.test(o))) err(Q, 'avoid "all/none of the above" options');
        allQuestions.push({ Q, q });
      });
      const idx = t.quiz.map((q) => q.correctIndex);
      if (new Set(idx).size === 1) err(T, 'every question has the same correct position');
    }

    const R = t.reflection ?? {};
    if (!isText(R.prompt, 20)) err(T, 'reflection.prompt missing');
    if (!Array.isArray(R.guidingQuestions) || R.guidingQuestions.length !== 3 || !R.guidingQuestions.every((g) => isText(g, 10))) err(T, 'needs exactly 3 guidingQuestions');

    // Faith grounding. The app shows the secular "spiritual" pathways to learners who
    // did not select Islam, so that module deliberately carries no faith lens.
    if (m.audience === 'muslim') {
      checkSources(`${T} lesson.sources`, L.sources);
      if (t.faithLens) err(T, 'muslim-audience topics cite in lesson.sources, not faithLens');
    } else if (m.id === 'spiritual') {
      if (t.faithLens) err(T, 'the secular mindfulness module must not carry a faithLens');
    } else {
      if (!t.faithLens || !isText(t.faithLens.text, 80)) err(T, 'faithLens.text missing');
      else checkSources(`${T} faithLens.sources`, t.faithLens.sources);
    }
  }
}
for (const id of Object.keys(expected)) if (!seenModuleIds.has(id)) err('coverage', `no content file for app module "${id}"`);

// ── Quiz quality across the whole set ─────────────────────────────────────────
const pos = [0, 0, 0, 0];
let longestIsCorrect = 0;
for (const { q } of allQuestions) {
  pos[q.correctIndex]++;
  const lens = q.options.map((o) => o.length);
  if (lens[q.correctIndex] === Math.max(...lens) && lens.filter((l) => l === Math.max(...lens)).length === 1) longestIsCorrect++;
}
const total = allQuestions.length;
pos.forEach((n, i) => {
  const share = n / total;
  if (share < 0.18 || share > 0.32) err('quiz balance', `option ${'ABCD'[i]} is correct in ${(share * 100).toFixed(0)}% of questions (expected 18-32%)`);
});
const longestShare = longestIsCorrect / total;
if (longestShare > 0.5) err('quiz balance', `the longest option is the correct one in ${(longestShare * 100).toFixed(0)}% of questions`);
else if (longestShare > 0.4) warn('quiz balance', `the longest option is the correct one in ${(longestShare * 100).toFixed(0)}% of questions`);

// ── Optional: confirm every Quran reference resolves ──────────────────────────
if (process.argv.includes('--online')) {
  const keys = [...new Set(quranRefs.flatMap((r) => Array.from({ length: r.to - r.from + 1 }, (_, i) => `${r.surah}:${r.from + i}`)))];
  for (const key of keys) {
    try {
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${key}`);
      const body = res.ok ? await res.json() : null;
      if (body?.verse?.verse_key !== key) err('online', `Quran ${key} did not resolve (HTTP ${res.status})`);
    } catch (e) {
      err('online', `Quran ${key} lookup failed: ${e.message}`);
    }
  }
  console.log(`online: checked ${keys.length} ayat against api.quran.com`);
}

// ── Report ────────────────────────────────────────────────────────────────────
const topics = modules.reduce((n, m) => n + m.topics.length, 0);
console.log(`${modules.length} modules, ${topics} topics, ${total} quiz questions`);
console.log(`correct-answer positions A/B/C/D: ${pos.join('/')}; longest option correct: ${(longestShare * 100).toFixed(0)}%`);
for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`ERROR    ${e}`);
if (errors.length) {
  console.log(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log('content is valid');
