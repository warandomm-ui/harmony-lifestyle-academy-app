-- ═══════════════════════════════════════════════
-- HLA PAYMENT MIGRATION (Run di Supabase SQL Editor)
-- Stage 1: subscriptions + ai_usage tables
-- ═══════════════════════════════════════════════

-- 1. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'premium',          -- 'premium' | 'founding'
  status text not null default 'pending',        -- 'pending' | 'active' | 'expired' | 'failed'
  bill_code text,                                -- ToyyibPay BillCode
  ref_no text,                                   -- ToyyibPay transaction refno
  amount integer not null,                       -- dalam sen (2500 = RM25)
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_subs_user on public.subscriptions(user_id);
create index if not exists idx_subs_billcode on public.subscriptions(bill_code);

-- 2. AI USAGE TABLE (untuk free tier limit: 3 lesson/hari)
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  lesson_count integer not null default 0,
  unique(user_id, usage_date)
);

-- 3. RLS POLICIES
alter table public.subscriptions enable row level security;
alter table public.ai_usage enable row level security;

-- drop dulu supaya script ini idempotent (boleh re-run tanpa error)
drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own usage" on public.ai_usage;
create policy "Users read own usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- Insert/update HANYA melalui service role (API callback & RPC)
-- Tiada policy insert/update untuk anon/authenticated = blocked by default

-- 4. RPC: Check premium status (dipanggil dari frontend)
create or replace function public.is_premium(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status = 'active'
      and expires_at > now()
  );
$$;

-- 5. RPC: Increment usage + return remaining (atomic, anti-bypass)
create or replace function public.use_ai_lesson(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_premium boolean;
  v_count integer;
  v_limit integer := 3;  -- free tier: 3 lesson sehari
begin
  -- Authenticated caller hanya boleh guna quota sendiri
  -- (service role: auth.uid() = null, dibenarkan untuk backend calls)
  if auth.uid() is not null and auth.uid() <> p_user_id then
    return json_build_object('allowed', false, 'remaining', 0, 'premium', false, 'error', 'forbidden');
  end if;

  -- Premium = unlimited
  select public.is_premium(p_user_id) into v_premium;
  if v_premium then
    return json_build_object('allowed', true, 'remaining', -1, 'premium', true);
  end if;

  -- Free tier: increment counter hari ini
  insert into public.ai_usage (user_id, usage_date, lesson_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set lesson_count = ai_usage.lesson_count + 1
  where ai_usage.lesson_count < v_limit
  returning lesson_count into v_count;

  if v_count is null then
    -- Limit dah habis
    return json_build_object('allowed', false, 'remaining', 0, 'premium', false);
  end if;

  return json_build_object('allowed', true, 'remaining', v_limit - v_count, 'premium', false);
end;
$$;

-- 6. RPC: Get remaining lessons tanpa increment (untuk display UI)
create or replace function public.get_lesson_quota(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_premium boolean;
  v_count integer;
  v_limit integer := 3;
begin
  select public.is_premium(p_user_id) into v_premium;
  if v_premium then
    return json_build_object('remaining', -1, 'premium', true);
  end if;

  select coalesce(lesson_count, 0) into v_count
  from public.ai_usage
  where user_id = p_user_id and usage_date = current_date;

  return json_build_object('remaining', greatest(v_limit - coalesce(v_count,0), 0), 'premium', false);
end;
$$;
