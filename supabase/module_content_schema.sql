-- ═══════════════════════════════════════════════════════════════════
-- Harmony Lifestyle Academy — Wellness Module Content Schema
-- Run this file first, then supabase/module_content_seed.sql.
-- Safe to re-run.
--
-- Holds the curated lesson, quiz and reflection content for every topic shown
-- on the wellness dimension pages (Physical, Social, Intellectual, Emotional,
-- Environmental, Vocational, Spiritual). Source of truth: content/modules/*.json
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. wellness_modules ─────────────────────────────────────────
--   One row per module. `id` matches the moduleId used by the page
--   components (e.g. 'physical', 'spiritual-islamic').
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wellness_modules (
  id          TEXT PRIMARY KEY,
  name        TEXT    NOT NULL,
  icon        TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  -- 'universal' is shown to every learner; 'muslim' only when the learner
  -- selected Islam (see utils/religionUtils.ts).
  audience    TEXT    NOT NULL DEFAULT 'universal'
                CHECK (audience IN ('universal', 'muslim')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. module_topics ────────────────────────────────────────────
--   One row per topic. `title` is exactly the title the page shows, so a
--   topic can be fetched by (module_id, title) or by (module_id, slug).
--
--   lesson     { title, explanation, keyPoints[4], examples[{title,scenario,takeaway}],
--                practicalTip, deeperInsight, sources?[] }
--   reflection { prompt, guidingQuestions[3] }
--   faith_lens { text, sources[] } | NULL — Islamic perspective on a universal
--              topic; show it only to learners who selected Islam.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.module_topics (
  id               TEXT PRIMARY KEY,           -- '<module_id>/<slug>'
  module_id        TEXT    NOT NULL REFERENCES public.wellness_modules(id) ON DELETE CASCADE,
  slug             TEXT    NOT NULL,
  title            TEXT    NOT NULL,
  icon             TEXT    NOT NULL DEFAULT '',
  summary          TEXT    NOT NULL DEFAULT '',
  objectives       JSONB   NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  xp_reward        INTEGER NOT NULL DEFAULT 20,
  lesson           JSONB   NOT NULL,
  reflection       JSONB   NOT NULL,
  faith_lens       JSONB,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, slug),
  UNIQUE (module_id, title)
);

CREATE INDEX IF NOT EXISTS idx_module_topics_module ON public.module_topics (module_id, sort_order);

-- ─── 3. module_quiz_questions ────────────────────────────────────
--   Multiple-choice questions for a topic, four options each.
--   `correct_index` is readable by clients, as with sunnah_items.quiz; the
--   quizzes are for self-checking, not for graded assessment.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.module_quiz_questions (
  id            TEXT PRIMARY KEY,              -- '<topic_id>#<n>'
  topic_id      TEXT     NOT NULL REFERENCES public.module_topics(id) ON DELETE CASCADE,
  sort_order    INTEGER  NOT NULL,
  question      TEXT     NOT NULL,
  options       JSONB    NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4),
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation   TEXT     NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (topic_id, sort_order)
);

-- ─── Row Level Security: public read, writes via service role only ──
ALTER TABLE public.wellness_modules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_topics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wellness_modules_public_read" ON public.wellness_modules;
CREATE POLICY "wellness_modules_public_read"
  ON public.wellness_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "module_topics_public_read" ON public.module_topics;
CREATE POLICY "module_topics_public_read"
  ON public.module_topics FOR SELECT USING (is_published);

DROP POLICY IF EXISTS "module_quiz_questions_public_read" ON public.module_quiz_questions;
CREATE POLICY "module_quiz_questions_public_read"
  ON public.module_quiz_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.module_topics t
    WHERE t.id = module_quiz_questions.topic_id AND t.is_published
  ));
