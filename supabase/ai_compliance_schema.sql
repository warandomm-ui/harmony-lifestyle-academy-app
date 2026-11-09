-- ═══════════════════════════════════════════════════════════════════
-- Harmony Lifestyle Academy — AI Content Compliance (human review queue)
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- Flow:  ai-proxy edge function ──(service role)──▶ ai_compliance_reviews
--        reviewer (ustaz/pendidik) approves/rejects via admin page
--        learner sees status + released text via my_compliance_reviews()
--
-- Learners NEVER get SELECT on the table itself, so content that is
-- held for review cannot be fetched around the gate.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Qualified human reviewers ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_compliance_reviewers (
  user_id      UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  credential   TEXT NOT NULL DEFAULT '',   -- e.g. "Tauliah Mengajar JAIS", "Guru PAI"
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.ai_compliance_reviewers ENABLE ROW LEVEL SECURITY;
-- Managed by the project owner from the dashboard (service role) only.

CREATE OR REPLACE FUNCTION public.is_compliance_reviewer()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.ai_compliance_reviewers WHERE user_id = auth.uid());
$$;

-- ─── 2. Review queue ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_compliance_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  action           TEXT NOT NULL,                    -- generateContent / chat / tts / anthropic
  model            TEXT NOT NULL DEFAULT '',
  verdict          TEXT NOT NULL CHECK (verdict IN ('hold', 'block')),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  findings         JSONB NOT NULL DEFAULT '[]',      -- [{code, maqsad, severity, reason, excerpt}]
  held_content     TEXT NOT NULL DEFAULT '',         -- PII already masked by the engine
  released_content TEXT,                             -- set by reviewer on approval (may be corrected)
  reviewer_id      UUID REFERENCES auth.users (id),
  reviewer_note    TEXT,
  engine_version   TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_reviews_status  ON public.ai_compliance_reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_user    ON public.ai_compliance_reviews (user_id, created_at DESC);

ALTER TABLE public.ai_compliance_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviewers read queue"   ON public.ai_compliance_reviews;
DROP POLICY IF EXISTS "reviewers decide queue" ON public.ai_compliance_reviews;

CREATE POLICY "reviewers read queue"
  ON public.ai_compliance_reviews FOR SELECT
  USING (public.is_compliance_reviewer());

-- Reviewers may only decide on pending items, and must sign the decision.
CREATE POLICY "reviewers decide queue"
  ON public.ai_compliance_reviews FOR UPDATE
  USING (public.is_compliance_reviewer() AND status = 'pending')
  WITH CHECK (
    public.is_compliance_reviewer()
    AND status IN ('approved', 'rejected')
    AND reviewer_id = auth.uid()
    AND user_id <> auth.uid()            -- no self-approval of one's own held output
  );
-- No INSERT/DELETE policies: only the edge function (service role) inserts,
-- and the audit trail is never deleted by app users.

-- ─── 3. Learner view of their own items (no held content) ────────
CREATE OR REPLACE FUNCTION public.my_compliance_reviews()
RETURNS TABLE (
  id UUID, status TEXT, verdict TEXT, codes TEXT[], created_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ, reviewer_note TEXT, released_content TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.status, r.verdict,
         ARRAY(SELECT DISTINCT f->>'code' FROM jsonb_array_elements(r.findings) f),
         r.created_at, r.reviewed_at, r.reviewer_note,
         CASE WHEN r.status = 'approved' THEN r.released_content END
  FROM public.ai_compliance_reviews r
  WHERE r.user_id = auth.uid()
  ORDER BY r.created_at DESC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.my_compliance_reviews() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_compliance_reviews() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_compliance_reviewer() TO authenticated;

-- ─── 4. Add a reviewer (run manually, replace the UUID) ──────────
-- INSERT INTO public.ai_compliance_reviewers (user_id, display_name, credential)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Ustaz Ahmad', 'Guru Pendidikan Islam');
