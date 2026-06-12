// ═══════════════════════════════════════════════
// FILE: components/PaymentSuccessPage.tsx
// Landing: /payment/success (ToyyibPay return URL)
// Tiada router dalam app ini — dirender melalui
// pathname check dalam App.tsx.
// ═══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { subscriptionService } from '../services/subscriptionService';

export default function PaymentSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // ToyyibPay return params: status_id (1=success, 2=pending, 3=fail), billcode
  const statusId = params.get('status_id');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 6;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Callback mungkin ambil beberapa saat — poll status
    const poll = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setChecking(false);
        return;
      }
      const sub = await subscriptionService.getActiveSubscription(user.id);
      if (cancelled) return;
      if (sub) {
        setActive(true);
        setExpiresAt(sub.expires_at);
        setChecking(false);
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        timer = setTimeout(poll, 2000); // cuba lagi setiap 2 saat
      } else {
        setChecking(false);
      }
    };

    if (statusId === '1') {
      poll();
    } else {
      setChecking(false);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [statusId]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a3e] bg-[#161625] p-10 text-center">
        {checking ? (
          <>
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <h1 className="text-xl font-bold text-white mb-2">
              Mengesahkan pembayaran...
            </h1>
            <p className="text-sm text-[#8888aa]">
              Sila tunggu sebentar. Jangan tutup page ini.
            </p>
          </>
        ) : active ? (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-[#C9A84C] mb-2">
              Selamat Datang, Premium Member!
            </h1>
            <p className="text-sm text-[#e0e0e0] mb-1">
              Akaun kamu kini aktif dengan akses penuh.
            </p>
            {expiresAt && (
              <p className="text-xs text-[#8888aa] mb-6">
                Sah sehingga: {formatDate(expiresAt)}
              </p>
            )}
            <a
              href="/"
              className="inline-block w-full rounded-xl bg-[#C9A84C] py-4 font-bold text-black hover:bg-[#d9b85c] transition"
            >
              Mula Belajar Sekarang →
            </a>
          </>
        ) : statusId === '3' ? (
          <>
            <div className="text-5xl mb-4">😔</div>
            <h1 className="text-xl font-bold text-white mb-2">
              Pembayaran Tidak Berjaya
            </h1>
            <p className="text-sm text-[#8888aa] mb-6">
              Tiada caj dikenakan. Kamu boleh cuba semula bila-bila masa.
            </p>
            <a
              href="/"
              className="inline-block w-full rounded-xl border border-[#2a2a3e] py-4 font-bold text-[#e0e0e0] hover:border-[#C9A84C] transition"
            >
              Kembali ke Dashboard
            </a>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-xl font-bold text-white mb-2">
              Pembayaran Sedang Diproses
            </h1>
            <p className="text-sm text-[#8888aa] mb-6">
              Kalau kamu dah bayar, akses akan aktif dalam beberapa minit.
              Refresh page atau check email kamu.
            </p>
            <a
              href="/"
              className="inline-block w-full rounded-xl border border-[#2a2a3e] py-4 font-bold text-[#e0e0e0] hover:border-[#C9A84C] transition"
            >
              Kembali ke Dashboard
            </a>
          </>
        )}
      </div>
    </div>
  );
}
