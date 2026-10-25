-- ═══════════════════════════════════════════════════════════════════
-- HLA · Modul Al-Quran · 004: Kurikulum Bertingkat
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- Requires 001 AND 001b to have run first — modules below reference
-- quran.surahs(id) via foreign key, which needs 001b's data present.
--
-- Dipetakan ke model chapter HLA sedia ada, dimensi Ruh.
-- Selari KSSR/j-QAF (rendah) dan KSSM Tilawah (menengah).
-- ═══════════════════════════════════════════════════════════════════

create table if not exists quran.tracks (
  key         text primary key,          -- 'tier1_asas'
  age_from    int not null,
  age_to      int not null,
  title       text not null,
  objective   text not null,
  kssm_ref    text,                      -- rujukan silibus kebangsaan
  sort_order  int not null
);

create table if not exists quran.modules (
  key           text primary key,        -- 'tier1_m01_hijaiyyah'
  track_key     text not null references quran.tracks(key) on delete cascade,
  title         text not null,
  focus         text not null check (focus in ('iqra','tajwid','hafazan','tadabbur','tafsir')),
  surah_id      int references quran.surahs(id),
  ayah_from     int,
  ayah_to       int,
  outcome       text not null,           -- hasil pembelajaran yang boleh diukur
  est_sessions  int not null default 4,
  requires_tasmik boolean not null default true,
  sort_order    int not null
);

create index if not exists modules_track_idx on quran.modules (track_key, sort_order);

alter table quran.tracks  enable row level security;
alter table quran.modules enable row level security;

drop policy if exists "tracks_read" on quran.tracks;
create policy "tracks_read" on quran.tracks for select to authenticated using (true);
drop policy if exists "modules_read" on quran.modules;
create policy "modules_read" on quran.modules for select to authenticated using (true);

-- ------------------------------------------------------------
-- Track
-- ------------------------------------------------------------
insert into quran.tracks (key, age_from, age_to, title, objective, kssm_ref, sort_order) values
('tier1_asas',    7,  9,  'Asas Bacaan',
 'Kenal huruf hijaiyyah berbaris, bunyi yang betul, dan hafaz surah lazim pendek.',
 'KSSR / j-QAF — Asuhan Tilawah', 1),
('tier2_tajwid', 10, 12,  'Tajwid & Surah Pendek',
 'Baca lancar dengan hukum tajwid asas; hafaz separuh Juz Amma; faham maksud ringkas.',
 'KSSR Tahap 2 — Tilawah & Hafazan', 2),
('tier3_juzamma',13, 15,  'Khatam Juz Amma',
 'Kukuhkan tajwid penuh, lengkapkan hafazan Juz 30, mula memahami konteks ayat.',
 'KSSM Tingkatan 1–3 — Tilawah Al-Quran', 3),
('tier4_tadabbur',16, 17, 'Tadabbur & Kajian Tema',
 'Tadabbur mendalam, kajian bertema, dan kaitan ayat dengan lapan dimensi HLA.',
 'KSSM Tingkatan 4–5 — Tilawah & Hafazan', 4)
on conflict (key) do update
  set title = excluded.title, objective = excluded.objective;

-- ------------------------------------------------------------
-- Modul · Tier 1 (7–9): asas + surah lazim terpendek
-- ------------------------------------------------------------
insert into quran.modules
  (key, track_key, title, focus, surah_id, ayah_from, ayah_to, outcome, est_sessions, sort_order) values
('t1_m01_hijaiyyah', 'tier1_asas', 'Huruf hijaiyyah berbaris satu', 'iqra',  null, null, null,
 'Sebut 28 huruf dengan baris fathah, kasrah, dammah tanpa bantuan.', 8, 1),
('t1_m02_sambung',   'tier1_asas', 'Menyambung dua dan tiga huruf', 'iqra',  null, null, null,
 'Baca gabungan huruf pendek dengan sebutan makhraj yang boleh diterima.', 6, 2),
('t1_m03_fatihah',   'tier1_asas', 'Surah Al-Fatihah',              'hafazan',   1, 1, 7,
 'Hafaz Al-Fatihah dan boleh baca dalam solat tanpa bantuan.', 6, 3),
('t1_m04_nas',       'tier1_asas', 'Surah An-Nas',                  'hafazan', 114, 1, 6,
 'Hafaz An-Nas dengan sebutan yang betul.', 3, 4),
('t1_m05_falaq',     'tier1_asas', 'Surah Al-Falaq',                'hafazan', 113, 1, 5,
 'Hafaz Al-Falaq dengan sebutan yang betul.', 3, 5),
('t1_m06_ikhlas',    'tier1_asas', 'Surah Al-Ikhlas',               'hafazan', 112, 1, 4,
 'Hafaz Al-Ikhlas dan faham maksud tauhid secara ringkas.', 3, 6),
('t1_m07_kauthar',   'tier1_asas', 'Surah Al-Kauthar',              'hafazan', 108, 1, 3,
 'Hafaz Al-Kauthar.', 2, 7)
on conflict (key) do update set title = excluded.title, outcome = excluded.outcome;

-- ------------------------------------------------------------
-- Modul · Tier 2 (10–12): tajwid asas + Juz Amma bawah
-- ------------------------------------------------------------
insert into quran.modules
  (key, track_key, title, focus, surah_id, ayah_from, ayah_to, outcome, est_sessions, sort_order) values
('t2_m01_nunsakinah','tier2_tajwid','Nun sakinah & tanwin',        'tajwid', null, null, null,
 'Kenal dan laksanakan izhar, idgham, iqlab, ikhfa dalam bacaan.', 8, 1),
('t2_m02_mad',       'tier2_tajwid','Mad asli dan mad far''i asas','tajwid', null, null, null,
 'Panjangkan mad dengan kadar yang konsisten.', 6, 2),
('t2_m03_qalqalah',  'tier2_tajwid','Qalqalah',                    'tajwid', null, null, null,
 'Laksanakan qalqalah sughra dan kubra dengan betul.', 4, 3),
('t2_m04_maun',      'tier2_tajwid','Al-Ma''un & Al-Quraisy',      'hafazan', 107, 1, 7,
 'Hafaz kedua surah dan kenal hukum tajwid di dalamnya.', 5, 4),
('t2_m05_fil',       'tier2_tajwid','Al-Fil & Al-Humazah',         'hafazan', 105, 1, 5,
 'Hafaz kedua surah dengan tajwid yang betul.', 5, 5),
('t2_m06_asr',       'tier2_tajwid','Al-Asr & At-Takathur',        'hafazan', 103, 1, 3,
 'Hafaz kedua surah dan huraikan maksud masa dan kekayaan secara ringkas.', 5, 6),
('t2_m07_qariah',    'tier2_tajwid','Al-Qari''ah & Al-Adiyat',     'hafazan', 101, 1, 11,
 'Hafaz kedua surah.', 6, 7),
('t2_m08_zalzalah',  'tier2_tajwid','Az-Zalzalah & Al-Bayyinah',   'hafazan',  99, 1, 8,
 'Hafaz kedua surah.', 6, 8)
on conflict (key) do update set title = excluded.title, outcome = excluded.outcome;

-- ------------------------------------------------------------
-- Modul · Tier 3 (13–15): khatam Juz 30 + konteks
-- ------------------------------------------------------------
insert into quran.modules
  (key, track_key, title, focus, surah_id, ayah_from, ayah_to, outcome, est_sessions, sort_order) values
('t3_m01_naba',   'tier3_juzamma','Surah An-Naba','hafazan', 78, 1, 40,
 'Hafaz An-Naba dan huraikan tema hari kebangkitan.', 10, 1),
('t3_m02_naziat', 'tier3_juzamma','Surah An-Nazi''at','hafazan', 79, 1, 46,
 'Hafaz An-Nazi''at.', 10, 2),
('t3_m03_abasa',  'tier3_juzamma','Surah Abasa','hafazan', 80, 1, 42,
 'Hafaz Abasa dan kaitkan adab melayan orang secara sama rata.', 9, 3),
('t3_m04_mutaffifin','tier3_juzamma','Surah Al-Mutaffifin','tadabbur', 83, 1, 36,
 'Huraikan amanah dalam timbangan dan kaitkan dengan dimensi Rizq.', 8, 4),
('t3_m05_tajwid_lanjut','tier3_juzamma','Tajwid lanjutan: waqaf & ibtida','tajwid', null, null, null,
 'Pilih tempat berhenti yang tidak merosakkan makna.', 6, 5)
on conflict (key) do update set title = excluded.title, outcome = excluded.outcome;

-- ------------------------------------------------------------
-- Modul · Tier 4 (16–17): tadabbur bertema, dipetakan ke 8 dimensi HLA
-- ------------------------------------------------------------
insert into quran.modules
  (key, track_key, title, focus, surah_id, ayah_from, ayah_to, outcome, est_sessions, sort_order, requires_tasmik) values
('t4_m01_amanah','tier4_tadabbur','Amanah & integriti (Al-Baqarah 188)','tadabbur', 2, 188, 188,
 'Huraikan larangan mengambil harta secara salah dan terapkan pada situasi kerja.', 4, 1, false),
('t4_m02_ilmu','tier4_tadabbur','Ilmu & akal (Ali-Imran 190-191)','tadabbur', 3, 190, 191,
 'Kaitkan tafakkur alam dengan dimensi Aql dan kaedah berfikir kritis.', 4, 2, false),
('t4_m03_ikhlas_niat','tier4_tadabbur','Niat & tujuan hidup (Al-An''am 162-163)','hafazan', 6, 162, 163,
 'Hafaz dan huraikan penyerahan tujuan hidup kepada Allah.', 4, 3, true),
('t4_m04_sabar','tier4_tadabbur','Sabar & ketahanan (Al-Kahfi 101-110)','hafazan', 18, 101, 110,
 'Hafaz penutup Al-Kahfi dan huraikan makna amal yang diterima.', 8, 4, true),
('t4_m05_qalbu','tier4_tadabbur','Hati yang tenang (Ar-Ra''d 28)','tadabbur', 13, 28, 28,
 'Kaitkan zikir dengan ketenangan dan dimensi Qalb.', 3, 5, false)
on conflict (key) do update set title = excluded.title, outcome = excluded.outcome;
