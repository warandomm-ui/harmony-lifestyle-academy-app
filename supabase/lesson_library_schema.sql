-- Pre-generated KSSM lesson library
-- Run once to create the table. Re-running is safe (IF NOT EXISTS + idempotent policies).

CREATE TABLE IF NOT EXISTS lesson_library (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id       text        NOT NULL,
  subject_id       text        NOT NULL,
  tingkatan        text        NOT NULL,
  chapter_title    text        NOT NULL,
  mode             text        NOT NULL DEFAULT 'both'
                               CHECK (mode IN ('muslim', 'universal', 'both')),
  difficulty       text        NOT NULL DEFAULT 'medium'
                               CHECK (difficulty IN ('easy', 'medium', 'hard')),
  title            text        NOT NULL,
  explanation      text        NOT NULL,
  key_points       jsonb       NOT NULL DEFAULT '[]',
  example          text        NOT NULL DEFAULT '',
  practice_question text       NOT NULL DEFAULT '',
  practice_answer  text        NOT NULL DEFAULT '',
  generated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, mode, difficulty)
);

ALTER TABLE lesson_library ENABLE ROW LEVEL SECURITY;

-- All authenticated (and anonymous) users may read pre-generated lessons.
-- Only the service-role key (used by the generation script) may insert/update.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lesson_library' AND policyname = 'read_lesson_library'
  ) THEN
    CREATE POLICY "read_lesson_library"
      ON lesson_library FOR SELECT
      USING (true);
  END IF;
END $$;

-- Index for fast lookup by chapter + difficulty
CREATE INDEX IF NOT EXISTS idx_lesson_library_chapter
  ON lesson_library (chapter_id, difficulty);
