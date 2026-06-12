// ═══════════════════════════════════════════════
// FILE: api/toyyibpay/create-bill.ts
// Vercel Serverless Function — Create ToyyibPay Bill
// ═══════════════════════════════════════════════
// ENV VARS perlu set di Vercel (Project Settings > Environment Variables):
//   TOYYIBPAY_SECRET_KEY    = userSecretKey dari toyyibpay.com
//   TOYYIBPAY_CATEGORY_CODE = category code (create category di dashboard ToyyibPay)
//   SUPABASE_URL            = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = service_role key (BUKAN anon key)
//   APP_URL                 = https://harmonylifestyleacademy.com

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PLANS, PlanType } from '../../constants/plans';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, plan = 'premium' } = req.body || {};

    const selectedPlan = PLANS[plan as PlanType] || PLANS.premium;

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Sahkan caller melalui JWT — jangan percaya userId dari body
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ error: 'Sila log masuk dahulu' });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'User tidak sah' });
    }
    const userId = userData.user.id;
    const email = userData.user.email;
    if (!email) {
      return res.status(400).json({ error: 'Akaun tiada email' });
    }

    // 2. Create pending subscription record
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan,
        status: 'pending',
        amount: selectedPlan.amount,
      })
      .select()
      .single();

    if (subErr) {
      console.error('Subscription insert error:', subErr);
      return res.status(500).json({ error: 'Gagal cipta rekod langganan' });
    }

    // 3. Create ToyyibPay bill
    const appUrl = process.env.APP_URL || 'https://harmonylifestyleacademy.com';
    const params = new URLSearchParams({
      userSecretKey: process.env.TOYYIBPAY_SECRET_KEY!,
      categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE!,
      billName: selectedPlan.name,
      billDescription: 'Akses penuh Harmony Lifestyle Academy selama 30 hari',
      billPriceSetting: '1',              // fixed amount
      billPayorInfo: '1',                 // collect payor info
      billAmount: String(selectedPlan.amount), // dalam sen
      billReturnUrl: `${appUrl}/payment/success`,
      billCallbackUrl: `${appUrl}/api/toyyibpay/callback`,
      billExternalReferenceNo: sub.id,    // link balik ke subscription record
      billTo: name || 'Pelajar HLA',
      billEmail: email,
      billPhone: phone || '0000000000',
      billPaymentChannel: '0',            // 0 = FPX + Card
      billChargeToCustomer: '1',
    });

    const tpRes = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    // ToyyibPay return plain text (bukan JSON) bila key/category salah
    const tpText = await tpRes.text();
    let tpData: unknown;
    try {
      tpData = JSON.parse(tpText);
    } catch {
      tpData = tpText;
    }

    if (!Array.isArray(tpData) || !tpData[0]?.BillCode) {
      console.error('ToyyibPay error:', tpData);
      return res.status(502).json({ error: 'ToyyibPay gagal cipta bill', detail: tpData });
    }

    const billCode = tpData[0].BillCode;

    // 4. Update subscription dengan bill code
    // (kalau gagal, callback masih boleh match melalui order_id = sub.id,
    //  tapi log supaya reconciliation manual mudah)
    const { error: updErr } = await supabase
      .from('subscriptions')
      .update({ bill_code: billCode })
      .eq('id', sub.id);
    if (updErr) {
      console.error('Failed to store bill_code on subscription:', { subId: sub.id, billCode, updErr });
    }

    // 5. Return payment URL
    return res.status(200).json({
      paymentUrl: `https://toyyibpay.com/${billCode}`,
      billCode,
    });
  } catch (err) {
    console.error('create-bill error:', err);
    return res.status(500).json({ error: 'Ralat server' });
  }
}
