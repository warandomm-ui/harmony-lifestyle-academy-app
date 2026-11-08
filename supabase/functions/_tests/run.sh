#!/usr/bin/env bash
# Runs the ToyyibPay edge-function tests against a throwaway local Postgres
# (real schema, constraints and RLS) plus a fake ToyyibPay. No network to
# ToyyibPay or Supabase is used.
#
# Requires: deno 2.x, PostgreSQL 16 server binaries (initdb/pg_ctl), psql.
# Usage:    bash supabase/functions/_tests/run.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCHEMA="$HERE/../../payments_schema.sql"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
TMP="$(mktemp -d)"; chmod 755 "$TMP"
PORT=54329
# Postgres refuses to run as root: drop to the postgres user when needed.
if [ "$(id -u)" = "0" ]; then
  chown postgres "$TMP"
  pg() { su postgres -s /bin/bash -c "$1"; }
else
  pg() { bash -c "$1"; }
fi
cleanup() { pg "'$PGBIN/pg_ctl' -D '$TMP/data' stop -m fast" >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT

pg "'$PGBIN/initdb' -D '$TMP/data' -A trust -U postgres >/dev/null"
if ! pg "'$PGBIN/pg_ctl' -D '$TMP/data' -o '-p $PORT -k /tmp' -l '$TMP/log' start >/dev/null"; then
  cat "$TMP/log" >&2; exit 1
fi
for _ in $(seq 20); do psql -h /tmp -p $PORT -U postgres -tc 'select 1' >/dev/null 2>&1 && break; sleep 0.5; done

P="psql -h /tmp -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
$P -c "create database hla"
$P -d hla <<'SQL'
-- Minimal stand-in for the Supabase-managed parts the schema relies on.
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
create extension if not exists pgcrypto;
SQL
$P -d hla -f "$SCHEMA"
$P -d hla -f "$SCHEMA"   # must be re-runnable
$P -d hla <<'SQL'
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
insert into auth.users values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','buyer@example.com'),
                              ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','other@example.com');
SQL

cd "$HERE"
deno test -A --no-check payments_test.ts
