// Test-only fake of the Supabase HTTP surface used by the payment functions:
//   /rest/v1/<table>  → minimal PostgREST subset over a REAL Postgres (pg)
//   /auth/v1/user     → returns the user encoded in the bearer token
// Roles: token payload {role:'service_role'} bypasses RLS; {role:'authenticated', sub}
// runs as `authenticated` with request.jwt.claims set, so RLS policies apply.
import pg from 'npm:pg@8';

const pool = new pg.Pool({ host: '/tmp', port: 54329, user: 'postgres', database: 'hla' });

const b64 = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));
export const makeToken = (payload: Record<string, unknown>) =>
  `x.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.y`;
const claimsOf = (req: Request) => {
  const tok = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '') || req.headers.get('apikey') || '';
  try { return JSON.parse(b64(tok.split('.')[1] ?? '')); } catch { return {}; }
};

const ident = (s: string) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(s)) throw new Error('bad identifier ' + s);
  return `"${s}"`;
};

function parseFilters(url: URL, params: unknown[]) {
  const where: string[] = [];
  for (const [k, v] of url.searchParams) {
    if (['select', 'order', 'limit', 'on_conflict', 'columns'].includes(k)) continue;
    const m = v.match(/^(eq|neq|gt|gte|lt|lte|is)\.(.*)$/);
    if (!m) throw new Error('unsupported filter ' + k + '=' + v);
    const op = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', is: 'is' }[m[1]]!;
    if (op === 'is') { where.push(`${ident(k)} is ${m[2] === 'null' ? 'null' : 'not null'}`); continue; }
    params.push(m[2]);
    where.push(`${ident(k)} ${op} $${params.length}`);
  }
  return where.length ? ' where ' + where.join(' and ') : '';
}

const selectCols = (url: URL) => {
  const s = url.searchParams.get('select');
  if (!s || s === '*') return '*';
  return s.split(',').map((c) => ident(c.trim())).join(', ');
};

async function runAs(claims: any, fn: (c: pg.PoolClient) => Promise<any>) {
  const c = await pool.connect();
  try {
    await c.query('begin');
    if (claims.role === 'service_role') {
      await c.query('set local role service_role');
    } else {
      await c.query(`set local role ${claims.role === 'authenticated' ? 'authenticated' : 'anon'}`);
      await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    }
    const r = await fn(c);
    await c.query('commit');
    return r;
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

async function rest(req: Request, url: URL, table: string) {
  const claims = claimsOf(req);
  const prefer = req.headers.get('prefer') ?? '';
  const accept = req.headers.get('accept') ?? '';
  const wantRows = prefer.includes('return=representation') || req.method === 'GET';
  const t = ident(table);

  const rows: any[] = await runAs(claims, async (c) => {
    const params: unknown[] = [];
    if (req.method === 'GET') {
      let sql = `select ${selectCols(url)} from public.${t}` + parseFilters(url, params);
      const order = url.searchParams.get('order');
      if (order) {
        const [col, dir] = order.split('.');
        sql += ` order by ${ident(col)} ${dir === 'desc' ? 'desc' : 'asc'}`;
      }
      const limit = url.searchParams.get('limit');
      if (limit) sql += ` limit ${parseInt(limit, 10)}`;
      return (await c.query(sql, params)).rows;
    }
    if (req.method === 'POST') {
      const body = await req.json();
      const list = Array.isArray(body) ? body : [body];
      const cols = Object.keys(list[0]);
      const values = list.map((r) => '(' + cols.map((k) => { params.push(r[k]); return `$${params.length}`; }).join(', ') + ')');
      let sql = `insert into public.${t} (${cols.map(ident).join(', ')}) values ${values.join(', ')}`;
      const onConflict = url.searchParams.get('on_conflict');
      if (onConflict && prefer.includes('resolution=ignore-duplicates')) sql += ` on conflict (${ident(onConflict)}) do nothing`;
      sql += ` returning ${selectCols(url)}`;
      return (await c.query(sql, params)).rows;
    }
    if (req.method === 'PATCH') {
      const body = await req.json();
      const sets = Object.keys(body).map((k) => { params.push(body[k]); return `${ident(k)} = $${params.length}`; });
      const sql = `update public.${t} set ${sets.join(', ')}` + parseFilters(url, params) + ` returning ${selectCols(url)}`;
      return (await c.query(sql, params)).rows;
    }
    throw new Error('unsupported method ' + req.method);
  });

  if (accept.includes('vnd.pgrst.object')) {
    if (rows.length !== 1) {
      return Response.json({ code: 'PGRST116', message: `${rows.length} rows`, details: null, hint: null }, { status: 406 });
    }
    return Response.json(rows[0]);
  }
  return wantRows ? Response.json(rows, { status: req.method === 'POST' ? 201 : 200 }) : new Response(null, { status: 204 });
}

export function startFakeSupabase(port: number) {
  return Deno.serve({ port, onListen: () => {} }, async (req) => {
    const url = new URL(req.url);
    try {
      if (url.pathname === '/auth/v1/user') {
        const c = claimsOf(req);
        if (c.role !== 'authenticated') return Response.json({ msg: 'invalid' }, { status: 401 });
        return Response.json({ id: c.sub, email: c.email, aud: 'authenticated', role: 'authenticated', user_metadata: c.user_metadata ?? {}, app_metadata: {} });
      }
      const m = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/);
      if (m) return await rest(req, url, m[1]);
      return new Response('not found', { status: 404 });
    } catch (e) {
      const err = e as any;
      return Response.json({ code: err.code ?? 'TEST', message: String(err.message ?? err), details: null, hint: null }, { status: 400 });
    }
  });
}

export const query = (sql: string, params: unknown[] = []) => pool.query(sql, params);
export const closePool = () => pool.end();
