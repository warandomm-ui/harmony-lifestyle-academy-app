import { assert, assertEquals } from 'jsr:@std/assert@1';
import { createHash } from 'node:crypto';
import { closePool, makeToken, query, startFakeSupabase } from './fake_supabase.ts';

const SUPA_PORT = 54400;
const SECRET = 'test-secret-key';
const APP_URL = 'https://www.harmonylifestyleacademy.com';
const BUYER = { sub: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'buyer@example.com', role: 'authenticated', user_metadata: { full_name: 'Aisyah Rahman' } };
const OTHER = { sub: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', email: 'other@example.com', role: 'authenticated' };

const setEnv = (overrides: Record<string, string> = {}) => {
  const base: Record<string, string> = {
    SUPABASE_URL: `http://localhost:${SUPA_PORT}`,
    SUPABASE_ANON_KEY: makeToken({ role: 'anon' }),
    SUPABASE_SERVICE_ROLE_KEY: makeToken({ role: 'service_role' }),
    TOYYIBPAY_SECRET_KEY: SECRET,
    TOYYIBPAY_CATEGORY_CODE: 'cat123',
    TOYYIBPAY_ENV: 'sandbox',
    APP_URL,
    EXTRA_RETURN_ORIGINS: 'https://preview.example.app',
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) v === '' ? Deno.env.delete(k) : Deno.env.set(k, v);
};
setEnv();

// ─── Fake ToyyibPay (stateful) ─────────────────────────────────
type Bill = { params: Record<string, string>; txns: any[] };
const bills = new Map<string, Bill>();
let billSeq = 0;
const toyyib = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const p = Object.fromEntries(new URLSearchParams(await req.text()));
  if (url.pathname === '/index.php/api/createBill') {
    if (p.userSecretKey !== SECRET) return new Response('[KEY-DID-NOT-EXIST]');
    if (!/^[A-Za-z0-9 _]{1,30}$/.test(p.billName)) return Response.json({ status: 'error', msg: 'billName invalid' });
    if (!/^[A-Za-z0-9 _]{1,100}$/.test(p.billDescription)) return Response.json({ status: 'error', msg: 'billDescription invalid' });
    for (const k of ['categoryCode', 'billPriceSetting', 'billPayorInfo', 'billAmount', 'billTo', 'billEmail', 'billPhone']) {
      if (!p[k]) return Response.json({ status: 'error', msg: `${k} parameter is empty` });
    }
    const code = `bill${++billSeq}`;
    bills.set(code, { params: p, txns: [] });
    return Response.json([{ BillCode: code }]);
  }
  if (url.pathname === '/index.php/api/getBillTransactions') {
    const b = bills.get(p.billCode);
    if (!b || p.userSecretKey !== SECRET) return Response.json([]);
    return Response.json(b.txns);
  }
  return new Response('not found', { status: 404 });
};
const pay = (billCode: string, rm: string, status = '1', ref?: string) => {
  const b = bills.get(billCode)!;
  b.txns.unshift({
    billpaymentStatus: status,
    billpaymentAmount: rm,
    billpaymentInvoiceNo: `TP${Math.random().toString().slice(2, 12)}`,
    billExternalReferenceNo: ref ?? b.params.billExternalReferenceNo,
  });
};

// Route outbound ToyyibPay traffic to the fake; everything else is real HTTP.
const realFetch = globalThis.fetch;
globalThis.fetch = (input: any, init?: any) => {
  const req = new Request(input, init);
  if (new URL(req.url).hostname.endsWith('toyyibpay.com')) {
    assert(new URL(req.url).hostname === 'dev.toyyibpay.com', 'sandbox must not call production host');
    return toyyib(req);
  }
  return realFetch(req);
};

// Capture function handlers instead of listening on ports.
const supa = startFakeSupabase(SUPA_PORT);
const realServe = Deno.serve;
let captured: ((r: Request) => Promise<Response>) | null = null;
(Deno as any).serve = (h: any) => { captured = typeof h === 'function' ? h : h.handler; return { finished: Promise.resolve(), shutdown() {} }; };
await import('../toyyibpay-checkout/index.ts');
const checkout = captured!;
await import('../toyyibpay-callback/index.ts');
const callback = captured!;
(Deno as any).serve = realServe;

const callCheckout = (user: any, body: unknown) =>
  checkout(new Request('http://fn/toyyibpay-checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${makeToken(user)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
const md5 = (s: string) => createHash('md5').update(s).digest('hex');
const sendCallback = (fields: Record<string, string>, signed = true) => {
  const f = { ...fields };
  if (signed) f.hash = md5(`${SECRET}${f.status}${f.order_id}${f.refno}ok`);
  return callback(new Request('http://fn/toyyibpay-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(f).toString(),
  }));
};
const orderRow = async (id: string) => (await query('select * from public.orders where id = $1', [id])).rows[0];
const create = async (itemId: string, extra: Record<string, unknown> = {}) => {
  const res = await callCheckout(BUYER, { action: 'create', itemId, phone: '012-345 6789', ...extra });
  return { res, body: await res.json() };
};

await query('truncate public.subscriptions, public.orders');

Deno.test('rejects unauthenticated and invalid input', async () => {
  const noAuth = await checkout(new Request('http://fn', { method: 'POST', body: '{}' }));
  assertEquals(noAuth.status, 401);
  await noAuth.body?.cancel();
  const badPhone = await callCheckout(BUYER, { action: 'create', itemId: 'prod_3', phone: '123' });
  assertEquals(badPhone.status, 400);
  assertEquals((await badPhone.json()).error, 'invalid_phone');
  const merch = await create('prod_2');
  assertEquals(merch.res.status, 404, 'physical/inactive item must not be sellable');
  const unknown = await create('prod_999');
  assertEquals(unknown.res.status, 404);
});

Deno.test('price comes from the server catalogue, not the client', async () => {
  const stale = await create('prod_3', { expectedAmountSen: 1 });
  assertEquals(stale.res.status, 409);
  assertEquals(stale.body, { error: 'price_changed', amountSen: 1500 });
});

Deno.test('creates a correct ToyyibPay bill', async () => {
  const { res, body } = await create('prod_3', { expectedAmountSen: 1500, returnOrigin: 'https://evil.example' });
  assertEquals(res.status, 200);
  const billCode = body.paymentUrl.split('/').pop();
  assertEquals(body.paymentUrl, `https://dev.toyyibpay.com/${billCode}`);
  const p = bills.get(billCode)!.params;
  assertEquals(p.billAmount, '1500');
  assertEquals(p.billExternalReferenceNo, body.orderId);
  assertEquals(p.billReturnUrl, `${APP_URL}/payment/return`, 'untrusted return origin must fall back to APP_URL');
  assertEquals(p.billCallbackUrl, `http://localhost:${SUPA_PORT}/functions/v1/toyyibpay-callback`);
  assertEquals(p.billPhone, '0123456789');
  assertEquals(p.billTo, 'Aisyah Rahman');
  assertEquals(p.billEmail, 'buyer@example.com');
  assertEquals(p.billPaymentChannel, '0');
  const row = await orderRow(body.orderId);
  assertEquals([row.status, row.bill_code, row.amount_sen, row.user_id], ['pending', billCode, 1500, BUYER.sub]);

  const allowed = await create('prod_3', { returnOrigin: 'https://preview.example.app' });
  const p2 = bills.get(allowed.body.paymentUrl.split('/').pop())!.params;
  assertEquals(p2.billReturnUrl, 'https://preview.example.app/payment/return');
});

Deno.test('callback: forged hash and unverified "success" are not fulfilled', async () => {
  const { body } = await create('prod_4');
  const billcode = body.paymentUrl.split('/').pop();
  const base = { refno: 'R1', status: '1', reason: 'ok', billcode, order_id: body.orderId, amount: '5.00', transaction_time: 'now' };

  const forged = await callback(new Request('http://fn', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...base, hash: 'deadbeef' }).toString(),
  }));
  assertEquals(forged.status, 401);
  await forged.body?.cancel();

  // Correctly signed "status=1" but ToyyibPay has no successful transaction → stays pending.
  const unverified = await sendCallback(base);
  assertEquals(unverified.status, 200);
  await unverified.body?.cancel();
  assertEquals((await orderRow(body.orderId)).status, 'pending');

  // Mismatched billcode for this order is rejected.
  const wrongBill = await sendCallback({ ...base, billcode: 'someoneElsesBill' });
  assertEquals(wrongBill.status, 400);
  await wrongBill.body?.cancel();
});

Deno.test('callback: underpayment is never fulfilled', async () => {
  const { body } = await create('prod_3');
  const billcode = body.paymentUrl.split('/').pop();
  pay(billcode, '10.00');
  const r = await sendCallback({ refno: 'R2', status: '1', reason: '', billcode, order_id: body.orderId, amount: '10.00', transaction_time: '' });
  await r.body?.cancel();
  assertEquals((await orderRow(body.orderId)).status, 'pending');
});

Deno.test('callback: verified payment marks product order paid, idempotently', async () => {
  const { body } = await create('prod_3');
  const billcode = body.paymentUrl.split('/').pop();
  pay(billcode, '15.00');
  const fields = { refno: 'R3', status: '1', reason: 'Approved', billcode, order_id: body.orderId, amount: '15.00', transaction_time: '' };
  for (let i = 0; i < 3; i++) {
    const r = await sendCallback(fields);
    assertEquals(r.status, 200);
    await r.body?.cancel();
  }
  const row = await orderRow(body.orderId);
  assertEquals([row.status, row.paid_amount_sen], ['paid', 1500]);
  assert(row.paid_at && row.ref_no);
  assert(row.last_callback && !('hash' in row.last_callback), 'audit payload stored without hash');
});

Deno.test('failed payment → failed, then a retry on the same bill → paid', async () => {
  const { body } = await create('prod_1');
  const billcode = body.paymentUrl.split('/').pop();
  pay(billcode, '25.00', '3');
  let r = await sendCallback({ refno: 'R4', status: '3', reason: 'Declined', billcode, order_id: body.orderId, amount: '25.00', transaction_time: '' });
  await r.body?.cancel();
  assertEquals((await orderRow(body.orderId)).status, 'failed');
  pay(billcode, '25.00', '1');
  r = await sendCallback({ refno: 'R5', status: '1', reason: 'Approved', billcode, order_id: body.orderId, amount: '25.00', transaction_time: '' });
  await r.body?.cancel();
  assertEquals((await orderRow(body.orderId)).status, 'paid');
});

Deno.test('plan: concurrent callbacks grant exactly one 30-day period; second purchase stacks', async () => {
  await query('delete from public.subscriptions');
  const first = await create('plan_pro');
  const bc1 = first.body.paymentUrl.split('/').pop();
  pay(bc1, '25.00');
  const fields = { refno: 'R6', status: '1', reason: '', billcode: bc1, order_id: first.body.orderId, amount: '25.00', transaction_time: '' };
  const results = await Promise.all(Array.from({ length: 6 }, () => sendCallback(fields)));
  for (const r of results) await r.body?.cancel();
  let subs = (await query('select * from public.subscriptions where user_id = $1 order by starts_at', [BUYER.sub])).rows;
  assertEquals(subs.length, 1, 'exactly one subscription despite concurrent callbacks');
  const days = (new Date(subs[0].expires_at).getTime() - new Date(subs[0].starts_at).getTime()) / 86400000;
  assertEquals(Math.round(days), 30);

  const second = await create('plan_pro');
  const bc2 = second.body.paymentUrl.split('/').pop();
  pay(bc2, '25.00');
  const r = await sendCallback({ ...fields, refno: 'R7', billcode: bc2, order_id: second.body.orderId });
  await r.body?.cancel();
  subs = (await query('select * from public.subscriptions where user_id = $1 order by starts_at', [BUYER.sub])).rows;
  assertEquals(subs.length, 2);
  assertEquals(new Date(subs[1].starts_at).getTime(), new Date(subs[0].expires_at).getTime(), 'renewal extends from current expiry');
});

Deno.test('verify: owner can reconcile when callback never arrived; others cannot', async () => {
  const { body } = await create('prod_6');
  const billcode = body.paymentUrl.split('/').pop();
  pay(billcode, '50.00');
  const other = await callCheckout(OTHER, { action: 'verify', orderId: body.orderId });
  assertEquals(other.status, 404);
  await other.body?.cancel();
  const mine = await callCheckout(BUYER, { action: 'verify', orderId: body.orderId });
  assertEquals((await mine.json()).status, 'paid');
});

Deno.test('RLS: users only read their own orders and cannot write', async () => {
  const supaUrl = `http://localhost:${SUPA_PORT}/rest/v1`;
  const asOther = { Authorization: `Bearer ${makeToken(OTHER)}`, 'Content-Type': 'application/json' };
  const seen = await (await realFetch(`${supaUrl}/orders?select=id`, { headers: asOther })).json();
  assertEquals(seen.length, 0, 'other user sees none of the buyer orders');
  const asBuyer = { Authorization: `Bearer ${makeToken(BUYER)}`, 'Content-Type': 'application/json' };
  const mine = await (await realFetch(`${supaUrl}/orders?select=id`, { headers: asBuyer })).json();
  assert(mine.length > 0);
  const write = await realFetch(`${supaUrl}/orders`, {
    method: 'POST', headers: { ...asBuyer, Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: BUYER.sub, item_type: 'product', item_id: 'prod_3', item_name: 'x', amount_sen: 1500, status: 'paid' }),
  });
  assertEquals(write.status, 400, 'client cannot insert a paid order');
  await write.body?.cancel();
  const hidden = await (await realFetch(`${supaUrl}/catalog_items?select=id&id=eq.prod_2`, { headers: asBuyer })).json();
  assertEquals(hidden.length, 0, 'inactive catalogue items are hidden');
});

Deno.test('missing secrets → 503, never a half-configured bill', async () => {
  setEnv({ TOYYIBPAY_CATEGORY_CODE: '' });
  const r = await callCheckout(BUYER, { action: 'create', itemId: 'prod_3', phone: '0123456789' });
  assertEquals(r.status, 503);
  await r.body?.cancel();
  setEnv();
});

Deno.test({
  name: 'teardown',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => { await supa.shutdown(); await closePool(); },
});
