-- ═══════════════════════════════════════════════════════════════════
-- HLA · Modul Al-Quran · 001: Teras Teks (Immutable)
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- Run in this order: 001 → 001b → 002 → 003 → 004.
-- (001b seeds quran.surahs, which 004's modules require via FK.)
--
-- Lapisan "Kitab": repositori ilmu yang TIDAK BOLEH diubah.
-- Hanya service_role (import job) boleh tulis. AI tiada akses tulis.
--
-- PENTING (satu kali sahaja): schema `quran` perlu didedahkan melalui API.
-- Supabase Dashboard → Settings → API → Data API → Exposed schemas →
-- tambah "quran". Tanpa ini, panggilan supabase.schema('quran') akan gagal.
-- ═══════════════════════════════════════════════════════════════════

create schema if not exists quran;

-- ------------------------------------------------------------
-- 1. Metadata lesen setiap edisi (status undang-undang = data, bukan nota)
-- ------------------------------------------------------------
create table if not exists quran.editions (
  key                 text primary key,          -- 'tanzil_uthmani', 'ms_basmeih', 'en_clearquran'
  kind                text not null check (kind in ('arabic','translation','tafsir','audio')),
  lang                text not null,             -- 'ar','ms','en'
  display_name        text not null,
  source_url          text not null,
  license             text not null,             -- 'CC BY 3.0','JAKIM - lesen bertulis diperlukan', dsl.
  attribution_text    text,                      -- teks attribution WAJIB dipaparkan
  commercial_ok       boolean not null default false,
  modification_ok     boolean not null default false,
  approval_ref        text,                      -- no. rujukan kelulusan JAKIM / KDN
  approval_status     text not null default 'pending'
                      check (approval_status in ('pending','applied','approved','rejected')),
  notes               text,
  created_at          timestamptz not null default now()
);

comment on table quran.editions is
  'Setiap edisi teks/terjemahan/audio mesti ada status lesen. Kod aplikasi WAJIB semak commercial_ok + approval_status sebelum paparan awam.';

-- ------------------------------------------------------------
-- 2. Gate pematuhan (singleton) — Qada'/Qadar: had sistem
-- ------------------------------------------------------------
create table if not exists quran.compliance (
  id                    int primary key default 1 check (id = 1),
  display_mode          text not null default 'locked'
                        check (display_mode in ('locked','reference_only','full')),
  arabic_display_enabled boolean not null default false,
  audio_enabled          boolean not null default false,
  active_arabic_edition  text references quran.editions(key),
  active_ms_edition      text references quran.editions(key),
  kdn_perakuan_ref       text,   -- Perakuan Betul Pruf Akhir (Akta 326)
  jakim_approval_ref     text,   -- kelulusan terjemahan
  certified_app_deeplink text default 'https://www.islam.gov.my/ms/quran-hadith/smart-quran',
  updated_at             timestamptz not null default now()
);

insert into quran.compliance (id) values (1) on conflict (id) do nothing;

comment on column quran.compliance.display_mode is
  'locked = tiada teks mushaf dipaparkan (kurikulum + hafazan tracking sahaja, deeplink ke app berperakuan). reference_only = nama surah/ayat + audio berlesen. full = mushaf penuh (perlu Perakuan KDN + kelulusan JAKIM).';

-- ------------------------------------------------------------
-- 3. Surah
-- ------------------------------------------------------------
create table if not exists quran.surahs (
  id                int primary key check (id between 1 and 114),
  name_arabic       text not null,
  name_rumi         text not null,
  name_malay        text,
  revelation_place  text check (revelation_place in ('makkiyyah','madaniyyah')),
  revelation_order  int,
  ayah_count        int not null,
  juz_start         int,
  page_start        int
);

-- ------------------------------------------------------------
-- 4. Ayah — teks Arab, immutable
-- ------------------------------------------------------------
create table if not exists quran.ayahs (
  id            int primary key check (id between 1 and 6236),  -- nombor global
  surah_id      int not null references quran.surahs(id),
  ayah_number   int not null,
  text_uthmani  text not null,
  text_plain    text not null,   -- tanpa baris/tanda waqf, untuk carian & guardrail matching
  juz           int, hizb int, page int, sajdah boolean default false,
  edition_key   text not null references quran.editions(key),
  unique (surah_id, ayah_number)
);

create index if not exists ayahs_surah_idx on quran.ayahs (surah_id, ayah_number);
create index if not exists ayahs_juz_idx   on quran.ayahs (juz);

-- ------------------------------------------------------------
-- 5. Terjemahan
-- ------------------------------------------------------------
create table if not exists quran.translations (
  id           bigserial primary key,
  ayah_id      int not null references quran.ayahs(id),
  edition_key  text not null references quran.editions(key),
  text         text not null,
  unique (ayah_id, edition_key)
);

create index if not exists translations_edition_idx on quran.translations (edition_key);
-- Carian teks penuh BM untuk RAG retrieval
create index if not exists translations_fts_idx
  on quran.translations using gin (to_tsvector('simple', text));

-- ------------------------------------------------------------
-- 6. Audio (riwayat Hafs an Asim sebagai default — syarat KDN)
-- ------------------------------------------------------------
create table if not exists quran.recitations (
  id           bigserial primary key,
  ayah_id      int not null references quran.ayahs(id),
  edition_key  text not null references quran.editions(key),
  qari         text not null,
  riwayah      text not null default 'Hafs an Asim',
  audio_url    text not null,
  duration_ms  int,
  unique (ayah_id, edition_key)
);

-- ------------------------------------------------------------
-- 7. RLS: baca sahaja untuk semua pengguna sah; tulis = service_role
-- ------------------------------------------------------------
alter table quran.surahs       enable row level security;
alter table quran.ayahs        enable row level security;
alter table quran.translations enable row level security;
alter table quran.recitations  enable row level security;
alter table quran.editions     enable row level security;
alter table quran.compliance   enable row level security;

do $$
declare t text;
begin
  for t in
    select unnest(array['surahs','ayahs','translations','recitations','editions','compliance'])
  loop
    execute format($f$
      drop policy if exists "read_only_authenticated" on quran.%I;
      create policy "read_only_authenticated" on quran.%I
        for select to authenticated using (true);
    $f$, t, t);
    -- TIADA policy insert/update/delete: hanya service_role (bypass RLS) boleh tulis.
  end loop;
end $$;

revoke insert, update, delete on all tables in schema quran from authenticated, anon;
grant usage on schema quran to authenticated;
grant select on all tables in schema quran to authenticated;
