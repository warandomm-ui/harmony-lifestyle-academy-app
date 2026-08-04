-- ═══════════════════════════════════════════════════════════════════
-- HLA · Modul Al-Quran · 003: Fungsi Retrieval (RAG)
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- Requires 001 and 002 to have run first.
--
-- Prinsip: AI hanya boleh MENERIMA ayat dari fungsi ini.
-- AI tidak sekali-kali menjana teks ayat dari memori model.
-- ═══════════════════════════════════════════════════════════════════

-- ------------------------------------------------------------
-- 1. Ambil satu julat ayat (rujukan tepat, cth 18:101-110)
-- ------------------------------------------------------------
create or replace function quran.get_range(
  p_surah int,
  p_from  int,
  p_to    int,
  p_ms_edition text default null,
  p_en_edition text default null
)
returns table (
  ref            text,
  surah_name     text,
  ayah_number    int,
  text_uthmani   text,
  translation_ms text,
  translation_en text,
  audio_url      text
)
language sql stable security definer set search_path = quran, public as $$
  with cfg as (
    select coalesce(p_ms_edition, c.active_ms_edition) as ms_ed,
           c.active_arabic_edition as ar_ed,
           c.arabic_display_enabled, c.audio_enabled
    from quran.compliance c where c.id = 1
  )
  select
    s.id || ':' || a.ayah_number                                    as ref,
    s.name_rumi                                                     as surah_name,
    a.ayah_number,
    case when cfg.arabic_display_enabled then a.text_uthmani else null end,
    tms.text                                                        as translation_ms,
    ten.text                                                        as translation_en,
    case when cfg.audio_enabled then r.audio_url else null end      as audio_url
  from cfg
  join quran.ayahs a  on a.surah_id = p_surah
                      and a.ayah_number between p_from and p_to
  join quran.surahs s on s.id = a.surah_id
  left join quran.translations tms on tms.ayah_id = a.id and tms.edition_key = cfg.ms_ed
  left join quran.translations ten on ten.ayah_id = a.id and ten.edition_key = p_en_edition
  left join quran.recitations  r   on r.ayah_id  = a.id
  order by a.ayah_number;
$$;

comment on function quran.get_range is
  'Retrieval utama untuk RAG. Menghormati compliance gate: teks Arab & audio hanya keluar jika flag diaktifkan.';

-- ------------------------------------------------------------
-- 2. Carian semantik ringan atas terjemahan (untuk soalan tematik)
--    Nota: gunakan pgvector di Fasa 3 jika perlu ketepatan lebih tinggi.
-- ------------------------------------------------------------
create or replace function quran.search_translation(
  p_query text,
  p_edition text default null,
  p_limit int default 5
)
returns table (
  ref            text,
  surah_name     text,
  ayah_number    int,
  translation    text,
  rank           real
)
language sql stable security definer set search_path = quran, public as $$
  with cfg as (
    select coalesce(p_edition, active_ms_edition) as ed
    from quran.compliance where id = 1
  )
  select
    a.surah_id || ':' || a.ayah_number,
    s.name_rumi,
    a.ayah_number,
    t.text,
    ts_rank(to_tsvector('simple', t.text), plainto_tsquery('simple', p_query)) as rank
  from cfg
  join quran.translations t on t.edition_key = cfg.ed
  join quran.ayahs a  on a.id = t.ayah_id
  join quran.surahs s on s.id = a.surah_id
  where to_tsvector('simple', t.text) @@ plainto_tsquery('simple', p_query)
  order by rank desc
  limit greatest(1, least(p_limit, 20));
$$;

-- ------------------------------------------------------------
-- 3. Baris giliran semakan hari ini (Solat: penyelarasan berkala)
-- ------------------------------------------------------------
create or replace function quran.due_reviews(p_limit int default 20)
returns table (
  ayah_id      int,
  ref          text,
  surah_name   text,
  tier         text,
  days_overdue int
)
language sql stable security definer set search_path = quran, public as $$
  select
    p.ayah_id,
    a.surah_id || ':' || a.ayah_number,
    s.name_rumi,
    p.tier,
    greatest(0, (current_date - p.next_review_at::date))::int
  from quran.progress p
  join quran.ayahs a  on a.id = p.ayah_id
  join quran.surahs s on s.id = a.surah_id
  where p.user_id = auth.uid()
    and p.status in ('learning','memorised','mastered','lapsed')
    and p.next_review_at <= now()
  order by p.next_review_at asc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function quran.get_range, quran.search_translation, quran.due_reviews
  to authenticated;
