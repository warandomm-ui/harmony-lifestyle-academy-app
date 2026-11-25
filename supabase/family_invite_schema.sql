-- ═══════════════════════════════════════════════════════════════════
-- Harmony Lifestyle Academy — Family Invite Module
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
--
-- Provides:
--   • families, family_members, family_invite_codes,
--     parent_child_links, family_activity_log
--   • RPC public.redeem_family_invite(p_code text) → jsonb
--
-- Client call (supabase-js):
--   const { data, error } = await supabase.rpc('redeem_family_invite', { p_code: 'AB12CD34' });
--   // error.code is one of the HL0xx codes documented below.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. families ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.families (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER     NOT NULL DEFAULT 6 CHECK (max_members BETWEEN 1 AND 50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. family_members ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_members (
  family_id  UUID        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('parent', 'child')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (family_id, user_id)
);

-- A child account belongs to exactly one family.
CREATE UNIQUE INDEX IF NOT EXISTS uq_family_members_one_family_per_child
  ON public.family_members (user_id) WHERE role = 'child';
CREATE INDEX IF NOT EXISTS idx_family_members_user ON public.family_members (user_id);

-- ─── 3. family_invite_codes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_invite_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  code        TEXT        NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{6,16}$'),
  created_by  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_uses    INTEGER     NOT NULL DEFAULT 1 CHECK (max_uses >= 1),
  use_count   INTEGER     NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (use_count <= max_uses)
);

CREATE INDEX IF NOT EXISTS idx_family_invite_codes_family ON public.family_invite_codes (family_id);

-- ─── 4. parent_child_links ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  parent_id  UUID        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  child_id   UUID        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  invite_id  UUID        REFERENCES public.family_invite_codes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, child_id),
  CHECK (parent_id <> child_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_child_links_child ON public.parent_child_links (child_id);

-- ─── 5. family_activity_log ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_activity_log (
  id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  family_id  UUID        REFERENCES public.families(id) ON DELETE CASCADE,
  actor_id   UUID        REFERENCES auth.users(id)      ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  details    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_activity_log_family
  ON public.family_activity_log (family_id, created_at DESC);

-- ─── 6. Row Level Security ───────────────────────────────────────
-- All writes go through SECURITY DEFINER functions; clients only read.
ALTER TABLE public.families            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_activity_log ENABLE ROW LEVEL SECURITY;

-- Helper: is the caller a member (optionally a parent) of this family?
-- SECURITY DEFINER so policies on family_members do not recurse.
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id UUID, p_parent_only BOOLEAN DEFAULT FALSE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members m
    WHERE m.family_id = p_family_id
      AND m.user_id   = auth.uid()
      AND (NOT p_parent_only OR m.role = 'parent')
  );
$$;

REVOKE ALL ON FUNCTION public.is_family_member(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_family_member(UUID, BOOLEAN) TO authenticated;

DROP POLICY IF EXISTS "families_member_read" ON public.families;
CREATE POLICY "families_member_read" ON public.families
  FOR SELECT TO authenticated USING (public.is_family_member(id));

DROP POLICY IF EXISTS "family_members_member_read" ON public.family_members;
CREATE POLICY "family_members_member_read" ON public.family_members
  FOR SELECT TO authenticated USING (public.is_family_member(family_id));

DROP POLICY IF EXISTS "family_invite_codes_parent_read" ON public.family_invite_codes;
CREATE POLICY "family_invite_codes_parent_read" ON public.family_invite_codes
  FOR SELECT TO authenticated USING (public.is_family_member(family_id, TRUE));

DROP POLICY IF EXISTS "parent_child_links_party_read" ON public.parent_child_links;
CREATE POLICY "parent_child_links_party_read" ON public.parent_child_links
  FOR SELECT TO authenticated USING (auth.uid() IN (parent_id, child_id));

DROP POLICY IF EXISTS "family_activity_log_parent_read" ON public.family_activity_log;
CREATE POLICY "family_activity_log_parent_read" ON public.family_activity_log
  FOR SELECT TO authenticated USING (public.is_family_member(family_id, TRUE));


-- ═══════════════════════════════════════════════════════════════════
-- 7. RPC: redeem_family_invite
--
-- The caller (auth.uid()) is the new child account. Everything below
-- runs inside the single transaction PostgREST opens for the RPC call:
-- any RAISE rolls back every insert/update made so far.
--
-- Error codes (returned as error.code to supabase-js):
--   HL001  not authenticated
--   HL002  code is empty or malformed
--   HL003  code not found
--   HL004  code revoked
--   HL005  code expired
--   HL006  code has no uses left
--   HL007  caller is already a member of this family
--   HL008  caller is already a child in another family
--   HL009  family is at full capacity
--   HL010  family has no parent account to link to
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.redeem_family_invite(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_code         TEXT := upper(btrim(coalesce(p_code, '')));
  v_invite       public.family_invite_codes%ROWTYPE;
  v_family       public.families%ROWTYPE;
  v_member_count INTEGER;
  v_parent_ids   UUID[];
BEGIN
  -- ── 1. Identity (Syahadah: validate who is acting) ──────────────
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Anda perlu log masuk untuk menebus kod jemputan.'
      USING ERRCODE = 'HL001';
  END IF;

  IF v_code !~ '^[A-Z0-9]{6,16}$' THEN
    RAISE EXCEPTION 'Format kod jemputan tidak sah.'
      USING ERRCODE = 'HL002', HINT = 'Kod mengandungi 6–16 huruf/nombor.';
  END IF;

  -- ── 2. Lock the invite row so concurrent redemptions serialise ──
  SELECT * INTO v_invite
  FROM public.family_invite_codes
  WHERE code = v_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kod jemputan tidak wujud.' USING ERRCODE = 'HL003';
  END IF;

  IF v_invite.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Kod jemputan ini telah dibatalkan.' USING ERRCODE = 'HL004';
  END IF;

  IF v_invite.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Kod jemputan ini telah tamat tempoh.'
      USING ERRCODE = 'HL005',
            DETAIL  = format('Tamat pada %s', v_invite.expires_at);
  END IF;

  IF v_invite.use_count >= v_invite.max_uses THEN
    RAISE EXCEPTION 'Kod jemputan ini telah digunakan sepenuhnya.' USING ERRCODE = 'HL006';
  END IF;

  -- ── 3. Lock the family row: capacity check must be race-free ────
  --    (two different codes for the same family also serialise here)
  SELECT * INTO v_family
  FROM public.families
  WHERE id = v_invite.family_id
  FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = v_family.id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Anda sudah menjadi ahli keluarga ini.' USING ERRCODE = 'HL007';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = v_user_id AND role = 'child'
  ) THEN
    RAISE EXCEPTION 'Akaun anda sudah dipautkan kepada keluarga lain.' USING ERRCODE = 'HL008';
  END IF;

  SELECT count(*) INTO v_member_count
  FROM public.family_members
  WHERE family_id = v_family.id;

  IF v_member_count >= v_family.max_members THEN
    RAISE EXCEPTION 'Kuota keluarga telah penuh.'
      USING ERRCODE = 'HL009',
            DETAIL  = format('%s/%s ahli', v_member_count, v_family.max_members),
            HINT    = 'Minta ibu bapa menaik taraf pelan atau membuang ahli tidak aktif.';
  END IF;

  SELECT array_agg(user_id) INTO v_parent_ids
  FROM public.family_members
  WHERE family_id = v_family.id AND role = 'parent';

  IF v_parent_ids IS NULL THEN
    RAISE EXCEPTION 'Keluarga ini tiada akaun ibu bapa untuk dipautkan.' USING ERRCODE = 'HL010';
  END IF;

  -- ── 4. Writes (all-or-nothing) ──────────────────────────────────
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (v_family.id, v_user_id, 'child');

  INSERT INTO public.parent_child_links (family_id, parent_id, child_id, invite_id)
  SELECT v_family.id, p, v_user_id, v_invite.id
  FROM unnest(v_parent_ids) AS p
  ON CONFLICT (parent_id, child_id) DO NOTHING;

  UPDATE public.family_invite_codes
  SET use_count = use_count + 1
  WHERE id = v_invite.id;

  INSERT INTO public.family_activity_log (family_id, actor_id, action, details)
  VALUES (
    v_family.id,
    v_user_id,
    'invite_redeemed',
    jsonb_build_object(
      'invite_id',      v_invite.id,
      'invited_by',     v_invite.created_by,
      'linked_parents', to_jsonb(v_parent_ids),
      'uses_remaining', v_invite.max_uses - v_invite.use_count - 1,
      'member_count',   v_member_count + 1
    )
  );

  RETURN jsonb_build_object(
    'family_id',      v_family.id,
    'family_name',    v_family.name,
    'role',           'child',
    'linked_parents', to_jsonb(v_parent_ids),
    'member_count',   v_member_count + 1,
    'max_members',    v_family.max_members
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_family_invite(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_family_invite(TEXT) TO authenticated;
