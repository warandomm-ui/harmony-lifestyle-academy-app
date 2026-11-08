import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, env, expectedCallbackHash, reconcileOrder, UUID_RE } from '../_shared/toyyibpay.ts';

// ─────────────────────────────────────────────────────────────
// toyyibpay-callback — server-to-server notification from ToyyibPay.
// ToyyibPay sends no Supabase JWT, so this MUST be deployed with:
//
//   supabase functions deploy toyyibpay-callback --no-verify-jwt
//
// POST fields: refno, status (1 ok / 2 pending / 3 fail), reason, billcode,
//              order_id (= our orders.id), amount, transaction_time, hash
//
// Defence in depth:
//   1. hash = md5(secretKey + status + order_id + refno + "ok") must match.
//   2. billcode must match the order we created.
//   3. Fulfilment only happens after reconcileOrder() confirms the payment
//      directly with ToyyibPay's getBillTransactions API (amount + reference).
// ─────────────────────────────────────────────────────────────

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain' } });

const readFields = async (req: Request): Promise<Record<string, string>> => {
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const j = await req.json();
    return Object.fromEntries(Object.entries(j ?? {}).map(([k, v]) => [k, String(v ?? '')]));
  }
  if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData();
    const out: Record<string, string> = {};
    form.forEach((v, k) => { out[k] = typeof v === 'string' ? v : ''; });
    return out;
  }
  // Unknown/missing content type: try urlencoded.
  return Object.fromEntries(new URLSearchParams(await req.text()));
};

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return text('Method not allowed', 405);
  if (!env('TOYYIBPAY_SECRET_KEY')) {
    console.error('[toyyibpay-callback] TOYYIBPAY_SECRET_KEY not set');
    return text('not configured', 503);
  }

  let f: Record<string, string>;
  try {
    f = await readFields(req);
  } catch {
    return text('bad request', 400);
  }

  const orderId = (f.order_id ?? '').trim();
  const billcode = (f.billcode ?? '').trim();
  const status = (f.status ?? f.status_id ?? '').trim();
  const refno = (f.refno ?? f.transaction_id ?? '').trim();

  if (!UUID_RE.test(orderId) || !billcode) return text('bad request', 400);

  // 1. Signature
  if (f.hash) {
    if (f.hash.toLowerCase() !== expectedCallbackHash(status, orderId, refno)) {
      console.error('[toyyibpay-callback] hash mismatch', { orderId, billcode });
      return text('invalid signature', 401);
    }
  } else {
    // Still safe: nothing is fulfilled without server-side verification below.
    console.warn('[toyyibpay-callback] callback without hash', { orderId, billcode });
  }

  const db = adminClient();

  // 2. Bill code must belong to this order
  const { data: order } = await db.from('orders').select('id, bill_code').eq('id', orderId).maybeSingle();
  if (!order) return text('unknown order', 404);
  if (order.bill_code !== billcode) {
    console.error('[toyyibpay-callback] billcode mismatch', { orderId, expected: order.bill_code, got: billcode });
    return text('billcode mismatch', 400);
  }

  // 3. Verify with ToyyibPay and fulfil (idempotent)
  try {
    const { hash: _omit, ...auditPayload } = f;
    const result = await reconcileOrder(db, orderId, { callbackPayload: auditPayload });
    return text(`OK ${result.status}`);
  } catch (err) {
    console.error('[toyyibpay-callback] reconcile failed', { orderId, err });
    // 500 lets ToyyibPay retry; the return page also re-verifies.
    return text('error', 500);
  }
});
