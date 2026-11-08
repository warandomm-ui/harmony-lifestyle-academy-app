import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  adminClient, corsHeaders, env, json, parseToyyibResponse, reconcileOrder,
  toyyibBaseUrl, toyyibText, UUID_RE,
} from '../_shared/toyyibpay.ts';

// ─────────────────────────────────────────────────────────────
// toyyibpay-checkout — called by the signed-in user (JWT required).
//
//   { action: 'create', itemId, phone, returnOrigin?, expectedAmountSen? }
//       → { paymentUrl, orderId, amountSen }
//       Price ALWAYS comes from public.catalog_items, never from the client.
//       If expectedAmountSen differs, returns 409 { error:'price_changed', amountSen }.
//
//   { action: 'verify', orderId }
//       → { orderId, status }   (re-checks with ToyyibPay; only the order's owner)
//
// Deploy:  supabase functions deploy toyyibpay-checkout
// ─────────────────────────────────────────────────────────────

/** Accept Malaysian numbers like 012-345 6789, +60123456789, 60123456789. */
const normalisePhone = (raw: unknown): string | null => {
  let d = String(raw ?? '').replace(/[^\d]/g, '');
  if (d.startsWith('60')) d = '0' + d.slice(2);
  return /^0\d{8,10}$/.test(d) ? d : null;
};

const allowedReturnOrigin = (requested: unknown): string => {
  const appUrl = env('APP_URL').replace(/\/+$/, '');
  const extra = env('EXTRA_RETURN_ORIGINS').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);
  const req = typeof requested === 'string' ? requested.replace(/\/+$/, '') : '';
  if (req && (req === appUrl || extra.includes(req))) return req;
  return appUrl;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const missing = ['TOYYIBPAY_SECRET_KEY', 'TOYYIBPAY_CATEGORY_CODE', 'APP_URL'].filter((k) => !env(k));
  if (missing.length) {
    console.error('[toyyibpay-checkout] missing secrets:', missing);
    return json({ error: 'payments_not_configured' }, 503);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'unauthorized' }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const db = adminClient();

  try {
    // ─── VERIFY ────────────────────────────────────────────────
    if (body?.action === 'verify') {
      const orderId = String(body.orderId ?? '');
      if (!UUID_RE.test(orderId)) return json({ error: 'invalid_order' }, 400);
      const { data: owned } = await db.from('orders').select('id').eq('id', orderId).eq('user_id', user.id).maybeSingle();
      if (!owned) return json({ error: 'order_not_found' }, 404);
      const result = await reconcileOrder(db, orderId);
      return json({ orderId: result.orderId, status: result.status, itemType: result.itemType, itemId: result.itemId });
    }

    // ─── CREATE ────────────────────────────────────────────────
    if (body?.action !== 'create') return json({ error: 'unknown_action' }, 400);

    if (!user.email) return json({ error: 'account_has_no_email' }, 400);
    const phone = normalisePhone(body.phone);
    if (!phone) return json({ error: 'invalid_phone' }, 400);

    const itemId = String(body.itemId ?? '');
    const { data: item } = await db
      .from('catalog_items')
      .select('id, item_type, name, amount_sen, requires_shipping, active')
      .eq('id', itemId)
      .maybeSingle();
    if (!item || !item.active) return json({ error: 'item_unavailable' }, 404);
    if (item.requires_shipping) return json({ error: 'item_unavailable' }, 409);

    if (body.expectedAmountSen != null && Number(body.expectedAmountSen) !== item.amount_sen) {
      return json({ error: 'price_changed', amountSen: item.amount_sen }, 409);
    }

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({
        user_id: user.id,
        item_type: item.item_type,
        item_id: item.id,
        item_name: item.name,
        amount_sen: item.amount_sen,
        status: 'pending',
      })
      .select('id')
      .single();
    if (orderErr || !order) {
      console.error('[toyyibpay-checkout] order insert failed', orderErr);
      return json({ error: 'order_failed' }, 500);
    }

    const payerName =
      (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
      user.email.split('@')[0];
    const returnUrl = `${allowedReturnOrigin(body.returnOrigin)}/payment/return`;
    const callbackUrl = `${env('SUPABASE_URL')}/functions/v1/toyyibpay-callback`;
    const channel = ['0', '1', '2'].includes(env('TOYYIBPAY_PAYMENT_CHANNEL')) ? env('TOYYIBPAY_PAYMENT_CHANNEL') : '0';

    const params = new URLSearchParams({
      userSecretKey: env('TOYYIBPAY_SECRET_KEY'),
      categoryCode: env('TOYYIBPAY_CATEGORY_CODE'),
      billName: toyyibText(item.name, 30),
      billDescription: toyyibText(`Harmony Lifestyle Academy ${item.name}`, 100),
      billPriceSetting: '1',            // fixed amount
      billPayorInfo: '1',               // payer details required
      billAmount: String(item.amount_sen), // in sen
      billReturnUrl: returnUrl,
      billCallbackUrl: callbackUrl,
      billExternalReferenceNo: order.id,
      billTo: payerName.slice(0, 100),
      billEmail: user.email,
      billPhone: phone,
      billPaymentChannel: channel,
      billExpiryDays: '3',
    });

    const tpRes = await fetch(`${toyyibBaseUrl()}/index.php/api/createBill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const tpData: any = await parseToyyibResponse(tpRes);
    const billCode: string | undefined = Array.isArray(tpData) ? tpData[0]?.BillCode : undefined;

    if (!billCode) {
      // Never log the request (it contains the secret key).
      console.error('[toyyibpay-checkout] createBill failed', { orderId: order.id, response: tpData });
      await db.from('orders').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', order.id);
      return json({ error: 'gateway_error' }, 502);
    }

    const { error: updErr } = await db
      .from('orders')
      .update({ bill_code: billCode, updated_at: new Date().toISOString() })
      .eq('id', order.id);
    if (updErr) {
      // Without the bill code we could not reconcile this order — don't send the user to pay.
      console.error('[toyyibpay-checkout] storing bill_code failed', { orderId: order.id, billCode, updErr });
      return json({ error: 'order_failed' }, 500);
    }

    return json({
      paymentUrl: `${toyyibBaseUrl()}/${encodeURIComponent(billCode)}`,
      orderId: order.id,
      amountSen: item.amount_sen,
    });
  } catch (err) {
    console.error('[toyyibpay-checkout] error', err);
    return json({ error: 'server_error' }, 500);
  }
});
