// ═══════════════════════════════════════════════
// FILE: api/toyyibpay/callback.ts
// Vercel Serverless Function — ToyyibPay payment callback
// ToyyibPay POST ke sini (form-urlencoded) selepas payment:
//   refno, status (1=success, 2=pending, 3=fail), reason,
//   billcode, order_id (= subscriptions.id), amount, transaction_time
// JANGAN percaya payload bulat-bulat — sahkan dengan
// getBillTransactions API sebelum activate subscription.
// ═══════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PLANS, PlanType } from '../../constants/plans';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refno, status, billcode, order_id } = req.body as Record<string, string>;

    if (!billcode || !order_id) {
      return res.status(400).json({ error: 'billcode dan order_id diperlukan' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Cari subscription record (order_id = subscriptions.id dari create-bill)
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, bill_code, amount')
      .eq('id', order_id)
      .single();

    if (subErr || !sub) {
      console.error('Callback: subscription not found', { order_id, billcode, subErr });
      return res.status(404).json({ error: 'Subscription tidak dijumpai' });
    }

    // Idempotent: kalau dah active, jangan proses lagi
    if (sub.status === 'active') {
      return res.status(200).json({ ok: true, already: true });
    }

    // bill_code mesti match record kita (kalau sempat disimpan)
    if (sub.bill_code && sub.bill_code !== billcode) {
      console.error('Callback: billcode mismatch', { expected: sub.bill_code, got: billcode });
      return res.status(400).json({ error: 'Bill code tidak sepadan' });
    }

    // 2. Payment gagal/pending — rekod dan habis
    if (status !== '1') {
      await supabase
        .from('subscriptions')
        .update({ status: status === '3' ? 'failed' : 'pending', ref_no: refno || null })
        .eq('id', sub.id);
      return res.status(200).json({ ok: true, activated: false });
    }

    // 3. Sahkan transaksi terus dengan ToyyibPay (jangan percaya callback sahaja)
    const verifyRes = await fetch('https://toyyibpay.com/index.php/api/getBillTransactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ billCode: billcode, billpaymentStatus: '1' }).toString(),
    });

    const verifyText = await verifyRes.text();
    let transactions: any;
    try {
      transactions = JSON.parse(verifyText);
    } catch {
      transactions = verifyText;
    }

    const txn = Array.isArray(transactions)
      ? transactions.find(
          (t: any) =>
            t.billpaymentStatus === '1' &&
            (t.billExternalReferenceNo === order_id || !t.billExternalReferenceNo)
        )
      : null;

    if (!txn) {
      console.error('Callback: no verified successful transaction', { billcode, order_id, transactions });
      return res.status(400).json({ error: 'Transaksi tidak dapat disahkan' });
    }

    // Amount check: ToyyibPay return RM (cth "25.00"), kita simpan sen
    const paidSen = Math.round(parseFloat(txn.billpaymentAmount || '0') * 100);
    if (paidSen < sub.amount) {
      console.error('Callback: amount mismatch', { expected: sub.amount, paid: paidSen });
      return res.status(400).json({ error: 'Jumlah bayaran tidak sepadan' });
    }

    // 4. Activate subscription
    const plan = PLANS[sub.plan as PlanType] || PLANS.premium;
    const now = new Date();
    const expires = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const { error: updErr } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        ref_no: refno || txn.billpaymentInvoiceNo || null,
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
        bill_code: billcode,
      })
      .eq('id', sub.id)
      .neq('status', 'active'); // idempotency guard kalau callback datang dua kali

    if (updErr) {
      console.error('Callback: activation update failed', updErr);
      return res.status(500).json({ error: 'Gagal aktifkan langganan' });
    }

    return res.status(200).json({ ok: true, activated: true });
  } catch (err) {
    console.error('callback error:', err);
    return res.status(500).json({ error: 'Ralat server' });
  }
}
