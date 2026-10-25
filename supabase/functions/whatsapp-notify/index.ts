import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ─────────────────────────────────────────────────────────────
// whatsapp-notify — sends a WhatsApp message via the Meta Cloud API.
//
// Requires Supabase secrets:
//   WHATSAPP_TOKEN          (permanent access token)
//   WHATSAPP_PHONE_ID       (phone number ID)
//
// If the secrets are absent it returns { ok: true, simulated: true } and
// logs the message, so onboarding still completes during development.
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// E.164-ish: digits only, optional leading +. Meta wants no '+'.
const normalize = (phone: string) => phone.replace(/[^\d]/g, '');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, message } = await req.json();
    if (!phone || !message) return json({ error: 'phone and message required' }, 400);

    const token = Deno.env.get('WHATSAPP_TOKEN');
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');

    if (!token || !phoneId) {
      console.log(`[whatsapp-notify SIMULATED] → ${phone}: ${message}`);
      return json({ ok: true, simulated: true });
    }

    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalize(phone),
        type: 'text',
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error('WhatsApp API error:', details);
      return json({ ok: false, error: 'WhatsApp send failed', details }, res.status);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('whatsapp-notify error:', error);
    return json({ ok: false, error: String(error) }, 500);
  }
});
