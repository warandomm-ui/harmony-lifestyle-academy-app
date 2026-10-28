// ═══════════════════════════════════════════════
// FILE: components/UpgradeModal.tsx
// Paywall modal — muncul bila free quota habis
// Design: HLA dark theme, gold #C9A84C, teal #14B8A6
// ═══════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { subscriptionService, PlanType } from '../services/subscriptionService';
import { PLANS, FREE_LESSONS_PER_DAY } from '../constants/plans';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  name?: string;
  /** Set true untuk tunjuk Founding Member offer RM15 */
  foundingOffer?: boolean;
}

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]';

export default function UpgradeModal({
  open,
  onClose,
  name,
  foundingOffer = true,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  // Callers pass inline arrows; a ref keeps the effect from re-running (and
  // stealing focus) on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus masuk ke dialog bila dibuka, Escape tutup, Tab terperangkap dalam
  // dialog, dan focus dipulangkan ke elemen asal bila ditutup.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    firstActionRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const handleCheckout = async (plan: PlanType) => {
    setLoading(true);
    setError('');
    try {
      await subscriptionService.startCheckout({ name, plan });
      // redirect berlaku dalam startCheckout
    } catch (e: any) {
      setError(e.message || 'Ralat. Cuba lagi.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        aria-describedby="upgrade-modal-desc"
        aria-busy={loading}
        lang="ms"
        className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-[#2a2a3e] bg-[#161625] p-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg text-[#8888aa] hover:text-white text-xl ${FOCUS_RING}`}
          aria-label="Tutup"
        >
          <span aria-hidden="true">✕</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3" aria-hidden="true">🔓</div>
          <h2 id="upgrade-modal-title" className="text-2xl font-bold text-white mb-2">
            Quota Hari Ini Habis
          </h2>
          <p id="upgrade-modal-desc" className="text-[#8888aa] text-sm">
            Kamu dah guna {FREE_LESSONS_PER_DAY} AI lesson percuma hari ini.
            Upgrade untuk akses tanpa had + semua features premium.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 mb-6 text-sm text-[#e0e0e0]" aria-label="Kelebihan Premium">
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]" aria-hidden="true">✓</span>
            AI lesson tanpa had — semua 13 subjek, 198 chapters
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]" aria-hidden="true">✓</span>
            Study Planner Agent — pelan ulangkaji automatik
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]" aria-hidden="true">✓</span>
            Quiz & latihan tanpa had setiap chapter
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]" aria-hidden="true">✓</span>
            Akses penuh 7 Dimensi Kehidupan
          </li>
        </ul>

        {/* Founding Member offer */}
        {foundingOffer && (
          <button
            ref={firstActionRef}
            onClick={() => handleCheckout('founding')}
            disabled={loading}
            className={`w-full mb-3 rounded-xl bg-[#C9A84C] py-4 font-bold text-black hover:bg-[#d9b85c] transition disabled:opacity-50 ${FOCUS_RING}`}
          >
            <span className="block text-lg">
              <span aria-hidden="true">🌟 </span>
              Founding Member — {PLANS.founding.priceLabel}/{PLANS.founding.durationDays} hari
            </span>
            <span className="block text-xs font-medium opacity-80">
              Harga istimewa 50 pelajar pertama (biasa {PLANS.premium.priceLabel})
            </span>
          </button>
        )}

        {/* Standard plan */}
        <button
          ref={foundingOffer ? undefined : firstActionRef}
          onClick={() => handleCheckout('premium')}
          disabled={loading}
          className={`w-full rounded-xl py-4 font-bold transition disabled:opacity-50 ${FOCUS_RING} ${
            foundingOffer
              ? 'border border-[#8888aa] text-[#e0e0e0] hover:border-[#C9A84C]'
              : 'bg-[#C9A84C] text-black hover:bg-[#d9b85c]'
          }`}
        >
          Premium — {PLANS.premium.priceLabel}/{PLANS.premium.durationDays} hari
        </button>

        {/* Status untuk screen reader semasa redirect */}
        <p className="sr-only" role="status">
          {loading ? 'Sedang menyediakan pembayaran…' : ''}
        </p>

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-[#ef4444]">{error}</p>
        )}

        <p className="mt-5 text-center text-xs text-[#8888aa]">
          Pembayaran selamat melalui ToyyibPay — FPX & kad diterima.
          <br />
          Tiada auto-renewal. Kamu kawal sepenuhnya.
        </p>
      </div>
    </div>
  );
}
