-- ═══════════════════════════════════════════════════════════════════
-- HLA · Modul Al-Quran · 002: Progres & Hafazan
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- Requires 001_quran_core.sql to have run first.
--
-- Lapisan "Solat": penyelarasan berkala + pembetulan haluan.
-- Lapisan "Akhirat": audit akhir (tasmik, skor, rekod kekal).
-- ═══════════════════════════════════════════════════════════════════

-- ------------------------------------------------------------
-- 1. Progres per-ayah + jadual ulangan (SM-2)
-- ------------------------------------------------------------
create table if not exists quran.progress (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  ayah_id         int  not null references quran.ayahs(id),
  status          text not null default 'new'
                  check (status in ('new','learning','memorised','mastered','lapsed')),
  -- Lapisan hafazan tradisi: sabaq (baru) / sabqi (semakan dekat) / manzil (semakan lama)
  tier            text not null default 'sabaq' check (tier in ('sabaq','sabqi','manzil')),
  ease_factor     numeric(4,2) not null default 2.50 check (ease_factor >= 1.30),
  interval_days   int not null default 0,
  repetitions     int not null default 0,
  lapses          int not null default 0,
  last_reviewed_at timestamptz,
  next_review_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, ayah_id)
);

create index if not exists progress_due_idx
  on quran.progress (user_id, next_review_at)
  where status <> 'new';

-- ------------------------------------------------------------
-- 2. Sesi tasmik / semakan (rekod kekal, tidak boleh dipadam pelajar)
-- ------------------------------------------------------------
create table if not exists quran.sessions (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  surah_id      int  not null references quran.surahs(id),
  ayah_from     int  not null,
  ayah_to       int  not null,
  session_type  text not null check (session_type in ('sabaq','sabqi','manzil','tilawah','tasmik')),
  quality       int  check (quality between 0 and 5),   -- 0 = lupa total, 5 = lancar tanpa silap
  mistakes      jsonb default '[]'::jsonb,               -- [{ayah_number, kind:'tajwid'|'lupa'|'tertukar', note}]
  verified_by   uuid references auth.users(id),          -- guru/ibu bapa yang tasmik (human-in-the-loop)
  duration_sec  int,
  created_at    timestamptz not null default now()
);

create index if not exists sessions_user_idx on quran.sessions (user_id, created_at desc);

-- ------------------------------------------------------------
-- 3. Log interaksi AI (untuk audit & red-teaming guardrail)
-- ------------------------------------------------------------
create table if not exists quran.ai_audit (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete set null,
  question        text not null,
  retrieved_refs  text[] not null default '{}',   -- ['2:255','18:101']
  model           text,
  answer          text,
  guardrail_pass  boolean not null,
  violations      jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists ai_audit_fail_idx on quran.ai_audit (created_at desc)
  where guardrail_pass = false;

-- ------------------------------------------------------------
-- 4. RLS: pelajar nampak data sendiri sahaja
-- ------------------------------------------------------------
alter table quran.progress enable row level security;
alter table quran.sessions enable row level security;
alter table quran.ai_audit enable row level security;

drop policy if exists "own_progress" on quran.progress;
create policy "own_progress" on quran.progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Sesi: pelajar boleh baca & cipta, tetapi TIDAK boleh ubah/padam rekod lampau (akauntabiliti)
drop policy if exists "sessions_read_own" on quran.sessions;
create policy "sessions_read_own" on quran.sessions
  for select to authenticated
  using (user_id = auth.uid() or verified_by = auth.uid());

drop policy if exists "sessions_insert_own" on quran.sessions;
create policy "sessions_insert_own" on quran.sessions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "audit_read_own" on quran.ai_audit;
create policy "audit_read_own" on quran.ai_audit
  for select to authenticated using (user_id = auth.uid());
-- Insert audit dibuat oleh edge function (service_role) sahaja.

-- ------------------------------------------------------------
-- 5. Trigger updated_at
-- ------------------------------------------------------------
create or replace function quran.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists progress_touch on quran.progress;
create trigger progress_touch before update on quran.progress
  for each row execute function quran.touch_updated_at();
