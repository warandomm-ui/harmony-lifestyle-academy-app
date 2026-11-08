-- ═══════════════════════════════════════════════════════════════
-- HLA PAYMENTS (ToyyibPay) — run once in Supabase SQL Editor.
-- Idempotent: safe to re-run.
--
-- Tables
--   catalog_items  : the ONLY source of truth for prices (in sen).
--   orders         : one row per checkout attempt / ToyyibPay bill.
--   subscriptions  : plan access periods created when a plan order is paid.
--
-- Clients may only READ their own orders/subscriptions and the active
-- catalogue. All writes happen in edge functions using the service role.
-- ═══════════════════════════════════════════════════════════════

-- 1. CATALOGUE ───────────────────────────────────────────────────
create table if not exists public.catalog_items (
  id                text primary key,                -- matches ids used in the app (prod_1, plan_pro…)
  item_type         text not null check (item_type in ('product', 'plan')),
  name              text not null,
  amount_sen        integer not null check (amount_sen >= 100), -- ToyyibPay minimum is RM1.00
  duration_days     integer check (duration_days is null or duration_days > 0), -- plans only
  requires_shipping boolean not null default false,  -- physical goods: no address capture yet
  active            boolean not null default true,
  updated_at        timestamptz not null default now()
);

-- Seed / refresh prices. Edit here (or in the table editor) to change prices;
-- the app picks up the new price on the next checkout without a redeploy.
insert into public.catalog_items (id, item_type, name, amount_sen, duration_days, requires_shipping, active) values
  ('plan_pro',     'plan',    'HLA Pro 30 Hari',              2500, 30, false, true),
  ('plan_premium', 'plan',    'HLA Premium 30 Hari',          5000, 30, false, true),
  ('prod_1',       'product', 'Notion Study Planner',         2500, null, false, true),
  ('prod_2',       'product', 'Harmony Hoodie',              12000, null, true,  false),
  ('prod_3',       'product', 'SPM Sejarah Survival E-Book',  1500, null, false, true),
  ('prod_4',       'product', 'Focus Pomodoro Timer App',      500, null, false, true),
  ('prod_5',       'product', 'Aesthetic Sticker Pack',       1200, null, true,  false),
  ('prod_6',       'product', 'Python for Beginners Course',  5000, null, false, true)
on conflict (id) do nothing;

-- 2. ORDERS ──────────────────────────────────────────────────────
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  item_type     text not null check (item_type in ('product', 'plan')),
  item_id       text not null references public.catalog_items(id),
  item_name     text not null,
  amount_sen    integer not null,                  -- price charged, copied from catalogue at order time
  status        text not null default 'pending'
                check (status in ('pending', 'paid', 'failed', 'expired')),
  bill_code     text unique,                       -- ToyyibPay BillCode
  ref_no        text,                              -- ToyyibPay refno / invoice no
  paid_amount_sen integer,                         -- what ToyyibPay says was actually paid
  paid_at       timestamptz,
  last_callback jsonb,                             -- last raw callback payload (audit)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id, created_at desc);

-- 3. SUBSCRIPTIONS ───────────────────────────────────────────────
create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_id     text not null references public.catalog_items(id),
  order_id    uuid not null unique references public.orders(id), -- one period per paid order (idempotency)
  starts_at   timestamptz not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_subs_user_expiry on public.subscriptions(user_id, expires_at desc);

-- 4. ROW LEVEL SECURITY ──────────────────────────────────────────
alter table public.catalog_items enable row level security;
alter table public.orders        enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Anyone reads active catalogue" on public.catalog_items;
create policy "Anyone reads active catalogue"
  on public.catalog_items for select
  using (active);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies: only the service role (edge functions) can write.

-- 5. HELPER: active plan for the current user ────────────────────
create or replace function public.current_plan()
returns table (plan_id text, expires_at timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select s.plan_id, s.expires_at
  from public.subscriptions s
  where s.user_id = auth.uid()
    and s.starts_at <= now()
    and s.expires_at > now()
  order by s.expires_at desc
  limit 1;
$$;
