import React, { useEffect, useRef, useState } from 'react';
import { XIcon, LockClosedIcon, SpinnerIcon } from './Icons';
import { startCheckout, CheckoutError, type CheckoutItem } from '../../services/paymentService';

interface CheckoutModalProps {
  item: CheckoutItem;
  onClose: () => void;
}

const PHONE_KEY = 'hla_checkout_phone';
const isValidMyPhone = (raw: string) => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('60')) d = '0' + d.slice(2);
  return /^0\d{8,10}$/.test(d);
};

/**
 * Real checkout: creates a ToyyibPay bill on the server and sends the user to
 * ToyyibPay's hosted FPX page. Nothing here marks anything as paid — that only
 * happens server-side after ToyyibPay confirms the payment.
 */
const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, onClose }) => {
  const [priceRm, setPriceRm] = useState(item.priceRm);
  const [phone, setPhone] = useState(() => {
    try { return localStorage.getItem(PHONE_KEY) ?? ''; } catch { return ''; }
  });
  const [status, setStatus] = useState<'idle' | 'redirecting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => { phoneRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && status === 'idle') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, status]);

  const phoneOk = isValidMyPhone(phone);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!phoneOk) return;
    setStatus('redirecting');
    try {
      try { localStorage.setItem(PHONE_KEY, phone); } catch { /* optional convenience */ }
      const { paymentUrl } = await startCheckout({ ...item, priceRm }, phone);
      window.location.assign(paymentUrl);
    } catch (err) {
      const ce = err as CheckoutError;
      if (ce.code === 'price_changed' && typeof ce.amountSen === 'number') {
        setPriceRm(ce.amountSen / 100); // show the real price; user confirms again
      }
      setError(ce.message || 'Pembayaran tidak dapat dimulakan. Sila cuba lagi.');
      setStatus('idle');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[100] animate-fade-in-fast"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden flex flex-col relative">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span id="checkout-title" className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">Pembayaran Selamat</span>
            <LockClosedIcon className="h-4 w-4 text-green-500" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'redirecting'}
            aria-label="Tutup"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 flex-1 flex flex-col gap-5">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
            {item.subtitle && <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{item.subtitle}</p>}
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-gray-600 dark:text-gray-300 font-medium">Jumlah</span>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">RM {priceRm.toFixed(2)}</span>
          </div>

          <div>
            <label htmlFor="checkout-phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              No. telefon (untuk resit ToyyibPay)
            </label>
            <input
              ref={phoneRef}
              id="checkout-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="012-345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && !phoneOk}
              aria-describedby="checkout-phone-help"
              className={`w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 text-gray-900 dark:text-white focus:outline-none transition ${
                touched && !phoneOk ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-[#F9A01B]'
              }`}
            />
            <p id="checkout-phone-help" className={`text-xs mt-1 ${touched && !phoneOk ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {touched && !phoneOk ? 'Masukkan nombor telefon Malaysia yang sah.' : 'Resit dihantar ke e-mel akaun anda.'}
            </p>
          </div>

          {error && (
            <div role="alert" className="text-sm text-red-700 bg-red-50 dark:bg-red-900/40 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'redirecting'}
            className="w-full bg-[#F9A01B] hover:bg-[#e8920e] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
          >
            {status === 'redirecting' ? (
              <><SpinnerIcon className="h-5 w-5" /> Membawa anda ke ToyyibPay…</>
            ) : (
              <>Bayar dengan FPX (Perbankan Online)</>
            )}
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-2">
            Anda akan dibawa ke halaman ToyyibPay yang selamat. Kami tidak menyimpan butiran bank atau kad anda.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
