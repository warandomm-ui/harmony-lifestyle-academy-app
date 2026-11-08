import React, { useEffect, useRef, useState } from 'react';
import { verifyOrder, type OrderStatus } from '../services/paymentService';
import { CheckCircleIcon, SpinnerIcon, XCircleIcon } from './dashboard/Icons';

interface PaymentReturnPageProps {
  /** Called when the user leaves this page (URL already reset to "/"). */
  onDone: (result: { status: OrderStatus | 'unknown'; itemType?: 'product' | 'plan' }) => void;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POLL_MS = 3000;
const MAX_POLLS = 10; // ~30s for the callback to land

/** True when the app was opened on ToyyibPay's return URL. */
export const isPaymentReturnUrl = () =>
  window.location.pathname.replace(/\/+$/, '') === '/payment/return';

/**
 * Landing page after ToyyibPay. The query string (status_id, order_id, billcode)
 * is NOT trusted — we ask our server, which confirms with ToyyibPay directly.
 */
const PaymentReturnPage: React.FC<PaymentReturnPageProps> = ({ onDone }) => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id') ?? '';
  const urlSaysFailed = params.get('status_id') === '3';

  const [status, setStatus] = useState<OrderStatus | 'checking' | 'unknown'>('checking');
  const [itemType, setItemType] = useState<'product' | 'plan' | undefined>();
  const polls = useRef(0);

  useEffect(() => {
    if (!UUID_RE.test(orderId)) {
      setStatus('unknown');
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const r = await verifyOrder(orderId);
        if (cancelled) return;
        setItemType(r.itemType);
        if (r.status === 'paid' || r.status === 'failed') {
          setStatus(r.status);
          return;
        }
        // Still pending: keep polling briefly; if ToyyibPay told the browser it failed, stop sooner.
        polls.current += 1;
        if (polls.current >= (urlSaysFailed ? 2 : MAX_POLLS)) {
          setStatus(urlSaysFailed ? 'failed' : 'pending');
          return;
        }
        timer = setTimeout(check, POLL_MS);
      } catch (err) {
        console.error('[payment-return] verify failed', err);
        if (!cancelled) setStatus('unknown');
      }
    };
    check();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [orderId, urlSaysFailed]);

  const leave = () => {
    window.history.replaceState(null, '', '/' + (itemType === 'plan' || status === 'paid' ? '#financial' : ''));
    onDone({ status: status === 'checking' ? 'unknown' : status, itemType });
  };

  const view = {
    checking: {
      icon: <SpinnerIcon className="!h-14 !w-14 text-[var(--primary)]" />,
      title: 'Mengesahkan pembayaran…',
      body: 'Kami sedang menyemak dengan ToyyibPay. Jangan tutup halaman ini.',
    },
    paid: {
      icon: <CheckCircleIcon className="!h-16 !w-16 text-green-500" />,
      title: 'Pembayaran berjaya!',
      body: itemType === 'plan'
        ? 'Pelan anda kini aktif. Resit telah dihantar ke e-mel anda oleh ToyyibPay.'
        : 'Pembelian anda telah disahkan. Resit telah dihantar ke e-mel anda oleh ToyyibPay.',
    },
    failed: {
      icon: <XCircleIcon className="!h-16 !w-16 text-red-500" />,
      title: 'Pembayaran tidak berjaya',
      body: 'Tiada caj dikenakan. Anda boleh cuba semula dari dashboard.',
    },
    pending: {
      icon: <SpinnerIcon className="!h-14 !w-14 text-amber-500" />,
      title: 'Pembayaran sedang diproses',
      body: 'Bank anda masih memproses transaksi. Status akan dikemas kini secara automatik — semak semula di bahagian Bil & Pelan sebentar lagi.',
    },
    unknown: {
      icon: <XCircleIcon className="!h-16 !w-16 text-amber-500" />,
      title: 'Status tidak dapat disemak',
      body: 'Jika wang anda telah ditolak, jangan bayar semula — status akan dikemas kini sebaik sahaja ToyyibPay mengesahkannya. Hubungi sokongan jika ia tidak muncul dalam 1 jam.',
    },
  }[status];

  return (
    <div className="hla-dashboard min-h-screen flex items-center justify-center p-4 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-lg p-8 text-center" role="status" aria-live="polite">
        <div className="flex justify-center mb-4">{view.icon}</div>
        <h1 className="text-2xl font-bold">{view.title}</h1>
        <p className="text-[var(--muted)] mt-3">{view.body}</p>
        {status !== 'checking' && (
          <button
            type="button"
            onClick={leave}
            className="mt-8 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 px-8 rounded-full hover:opacity-90 transition"
          >
            Kembali ke Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
