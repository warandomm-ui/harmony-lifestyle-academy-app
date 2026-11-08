/**
 * Payments via ToyyibPay (FPX), through the toyyibpay-checkout edge function.
 *
 * The browser never sees the ToyyibPay secret key and never decides the price:
 * the edge function reads prices from `catalog_items` and only marks an order
 * paid after confirming it with ToyyibPay server-to-server.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Transaction } from '../types';

export type CheckoutItemType = 'product' | 'plan';

export interface CheckoutItem {
  type: CheckoutItemType;
  id: string;          // catalogue id, e.g. 'prod_3' or 'plan_pro'
  name: string;
  subtitle?: string;
  priceRm: number;     // price shown to the user (server re-checks it)
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface OrderRecord {
  id: string;
  item_type: CheckoutItemType;
  item_id: string;
  item_name: string;
  amount_sen: number;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
}

export interface ActivePlan {
  planId: string;
  expiresAt: string;
}

export class CheckoutError extends Error {
  constructor(public code: string, message: string, public amountSen?: number) {
    super(message);
  }
}

const MESSAGES: Record<string, string> = {
  invalid_phone: 'Sila masukkan nombor telefon Malaysia yang sah (cth. 012-345 6789).',
  item_unavailable: 'Item ini tidak tersedia untuk dibeli buat masa ini.',
  price_changed: 'Harga telah dikemas kini. Sila semak harga baharu sebelum meneruskan.',
  payments_not_configured: 'Pembayaran belum diaktifkan. Sila cuba lagi kemudian.',
  gateway_error: 'ToyyibPay tidak dapat dihubungi. Sila cuba sebentar lagi.',
  unauthorized: 'Sesi anda telah tamat. Sila log masuk semula.',
  account_has_no_email: 'Akaun anda tiada alamat e-mel untuk resit.',
};

const normaliseSen = (rm: number) => Math.round(rm * 100);

/** Read the error body a FunctionsHttpError carries (supabase-js keeps the Response in `context`). */
const readFunctionError = async (error: any): Promise<{ code: string; amountSen?: number }> => {
  try {
    const body = await error?.context?.json?.();
    if (body?.error) return { code: body.error, amountSen: body.amountSen };
  } catch { /* fall through */ }
  return { code: 'server_error' };
};

/**
 * Create a ToyyibPay bill and return the hosted payment page URL.
 * Throws CheckoutError with a user-facing (Malay) message.
 */
export async function startCheckout(item: CheckoutItem, phone: string): Promise<{ paymentUrl: string; orderId: string }> {
  if (!isSupabaseConfigured()) {
    throw new CheckoutError('payments_not_configured', MESSAGES.payments_not_configured);
  }
  const { data, error } = await supabase.functions.invoke('toyyibpay-checkout', {
    body: {
      action: 'create',
      itemId: item.id,
      phone,
      expectedAmountSen: normaliseSen(item.priceRm),
      returnOrigin: window.location.origin,
    },
  });
  if (error) {
    const { code, amountSen } = await readFunctionError(error);
    throw new CheckoutError(code, MESSAGES[code] ?? 'Pembayaran tidak dapat dimulakan. Sila cuba lagi.', amountSen);
  }
  if (!data?.paymentUrl || !/^https:\/\/(dev\.)?toyyibpay\.com\//.test(data.paymentUrl)) {
    throw new CheckoutError('server_error', 'Pembayaran tidak dapat dimulakan. Sila cuba lagi.');
  }
  return { paymentUrl: data.paymentUrl, orderId: data.orderId };
}

/** Ask the server to re-check an order with ToyyibPay (used on the return page). */
export async function verifyOrder(orderId: string): Promise<{ status: OrderStatus; itemType?: CheckoutItemType; itemId?: string }> {
  const { data, error } = await supabase.functions.invoke('toyyibpay-checkout', {
    body: { action: 'verify', orderId },
  });
  if (error) {
    const { code } = await readFunctionError(error);
    throw new CheckoutError(code, MESSAGES[code] ?? 'Status pembayaran tidak dapat disemak.');
  }
  return data;
}

/** The signed-in user's orders (RLS limits this to their own rows). */
export async function fetchMyOrders(): Promise<OrderRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('id, item_type, item_id, item_name, amount_sen, status, created_at, paid_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('[payments] fetchMyOrders failed:', error);
    return [];
  }
  return (data ?? []) as OrderRecord[];
}

/** The plan the user currently has access to, if any. */
export async function fetchActivePlan(): Promise<ActivePlan | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc('current_plan');
  if (error) {
    console.error('[payments] fetchActivePlan failed:', error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row?.plan_id ? { planId: row.plan_id, expiresAt: row.expires_at } : null;
}

export const ordersToTransactions = (orders: OrderRecord[]): Transaction[] =>
  orders
    .filter((o) => o.status !== 'expired')
    .map((o) => ({
      id: o.id,
      date: new Date(o.paid_at ?? o.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: o.item_name,
      amount: o.amount_sen / 100,
      status: o.status === 'paid' ? 'Completed' : o.status === 'failed' ? 'Failed' : 'Pending',
    }));
