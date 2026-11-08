// ─────────────────────────────────────────────────────────────
// Shared ToyyibPay helpers for the payment edge functions.
//
// Secrets (Supabase Dashboard → Edge Functions → Secrets):
//   TOYYIBPAY_SECRET_KEY     userSecretKey from your ToyyibPay account
//   TOYYIBPAY_CATEGORY_CODE  category code created in the ToyyibPay dashboard
//   TOYYIBPAY_ENV            "production" for real money; anything else = sandbox (dev.toyyibpay.com)
//   APP_URL                  e.g. https://www.harmonylifestyleacademy.com (where users return after paying)
// Optional:
//   EXTRA_RETURN_ORIGINS     comma-separated extra origins allowed as return targets (e.g. preview URLs)
//   TOYYIBPAY_PAYMENT_CHANNEL  "0" FPX (default), "1" card, "2" both — card must be enabled on your account
// Injected automatically by Supabase: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// ─────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const env = (name: string): string => Deno.env.get(name) ?? '';

export const toyyibBaseUrl = (): string =>
  env('TOYYIBPAY_ENV').toLowerCase() === 'production'
    ? 'https://toyyibpay.com'
    : 'https://dev.toyyibpay.com';

export const adminClient = (): SupabaseClient =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ToyyibPay: billName ≤30, billDescription ≤100, alphanumeric + space + underscore only. */
export const toyyibText = (s: string, max: number): string =>
  s.replace(/[^A-Za-z0-9 _]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max).trim() || 'HLA';

/** Callback hash as documented: md5(userSecretKey + status + order_id + refno + "ok"). */
export const expectedCallbackHash = (status: string, orderId: string, refno: string): string =>
  createHash('md5').update(`${env('TOYYIBPAY_SECRET_KEY')}${status}${orderId}${refno}ok`).digest('hex');

/** RM string from ToyyibPay ("25.00") → sen integer. */
export const rmToSen = (rm: unknown): number => {
  const n = parseFloat(String(rm ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

/** ToyyibPay sometimes returns plain-text error codes with HTTP 200. */
export const parseToyyibResponse = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

type Order = {
  id: string;
  user_id: string;
  item_type: 'product' | 'plan';
  item_id: string;
  amount_sen: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  bill_code: string | null;
};

export type ReconcileResult = {
  orderId: string;
  status: Order['status'];
  itemType?: Order['item_type'];
  itemId?: string;
};

/**
 * Ask ToyyibPay (server-to-server) what really happened to this order's bill
 * and update our records. This is the ONLY place an order becomes "paid".
 * Safe to call any number of times, concurrently, from the callback or the
 * return page: the paid transition is a conditional update, so exactly one
 * caller performs fulfilment.
 */
export async function reconcileOrder(
  db: SupabaseClient,
  orderId: string,
  opts: { callbackPayload?: Record<string, string> } = {},
): Promise<ReconcileResult> {
  const { data: order, error } = await db
    .from('orders')
    .select('id, user_id, item_type, item_id, amount_sen, status, bill_code')
    .eq('id', orderId)
    .maybeSingle<Order>();
  if (error) throw new Error(`order lookup failed: ${error.message}`);
  if (!order) throw new Error('order not found');

  if (opts.callbackPayload) {
    await db.from('orders')
      .update({ last_callback: opts.callbackPayload, updated_at: new Date().toISOString() })
      .eq('id', order.id);
  }

  // 'failed' is not terminal: the payer may retry on the same bill.
  if (order.status === 'paid' || !order.bill_code) {
    return { orderId: order.id, status: order.status, itemType: order.item_type, itemId: order.item_id };
  }

  // Authoritative check with ToyyibPay.
  const res = await fetch(`${toyyibBaseUrl()}/index.php/api/getBillTransactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      billCode: order.bill_code,
      userSecretKey: env('TOYYIBPAY_SECRET_KEY'),
    }).toString(),
  });
  const txns = await parseToyyibResponse(res);
  const list: any[] = Array.isArray(txns) ? txns : [];

  const success = list.find((t) =>
    String(t?.billpaymentStatus) === '1' &&
    (!t?.billExternalReferenceNo || t.billExternalReferenceNo === order.id) &&
    rmToSen(t?.billpaymentAmount) >= order.amount_sen
  );

  if (success) {
    const now = new Date().toISOString();
    const { data: won, error: updErr } = await db.from('orders')
      .update({
        status: 'paid',
        paid_at: now,
        paid_amount_sen: rmToSen(success.billpaymentAmount),
        ref_no: success.billpaymentInvoiceNo || opts.callbackPayload?.refno || null,
        updated_at: now,
      })
      .eq('id', order.id)
      .neq('status', 'paid')
      .select('id');
    if (updErr) throw new Error(`mark paid failed: ${updErr.message}`);

    if (won && won.length > 0 && order.item_type === 'plan') {
      await grantPlan(db, order);
    }
    return { orderId: order.id, status: 'paid', itemType: order.item_type, itemId: order.item_id };
  }

  if (list.some((t) => String(t?.billpaymentStatus) === '1')) {
    // Paid, but not the amount/reference we expect — never fulfil automatically.
    console.error('[toyyibpay] paid transaction did not match order, needs manual review', { orderId: order.id, list });
  } else if (list.length > 0 && list.every((t) => String(t?.billpaymentStatus) === '3')) {
    // Every attempt on this bill failed. (A later retry on the same bill can still
    // succeed: reconcile runs again on the next callback and will mark it paid.)
    await db.from('orders')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending');
    return { orderId: order.id, status: 'failed', itemType: order.item_type, itemId: order.item_id };
  }

  return { orderId: order.id, status: order.status, itemType: order.item_type, itemId: order.item_id };
}

/** Create (or stack) a subscription period for a paid plan order. Idempotent via orders.id unique. */
async function grantPlan(db: SupabaseClient, order: Order) {
  const { data: item } = await db
    .from('catalog_items')
    .select('duration_days')
    .eq('id', order.item_id)
    .maybeSingle<{ duration_days: number | null }>();
  const days = item?.duration_days ?? 30;

  // If the user already has time left on the same plan, extend from its end.
  const { data: latest } = await db
    .from('subscriptions')
    .select('expires_at')
    .eq('user_id', order.user_id)
    .eq('plan_id', order.item_id)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ expires_at: string }>();

  const start = latest ? new Date(latest.expires_at) : new Date();
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

  const { error } = await db.from('subscriptions').upsert(
    {
      user_id: order.user_id,
      plan_id: order.item_id,
      order_id: order.id,
      starts_at: start.toISOString(),
      expires_at: end.toISOString(),
    },
    { onConflict: 'order_id', ignoreDuplicates: true },
  );
  if (error) console.error('[toyyibpay] grantPlan failed — order is paid, fix manually', { orderId: order.id, error });
}
