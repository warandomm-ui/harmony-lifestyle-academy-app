// ═══════════════════════════════════════════════
// FILE: components/UpgradeModal.tsx
// Paywall modal — muncul bila free quota habis
// Design: HLA dark theme, gold #C9A84C, teal #14B8A6
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { subscriptionService, PlanType } from '../services/subscriptionService';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  name?: string;
  /** Set true untuk tunjuk Founding Member offer RM15 */
  foundingOffer?: boolean;
}

export default function UpgradeModal({
  open,
  onClose,
  userId,
  email,
  name,
  foundingOffer = true,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleCheckout = async (plan: PlanType) => {
    setLoading(true);
    setError('');
    try {
      await subscriptionService.startCheckout({ userId, email, name, plan });
      // redirect berlaku dalam startCheckout
    } catch (e: any) {
      setError(e.message || 'Ralat. Cuba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#2a2a3e] bg-[#161625] p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8888aa] hover:text-white text-xl"
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔓</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Quota Hari Ini Habis
          </h2>
          <p className="text-[#8888aa] text-sm">
            Kamu dah guna 3 AI lesson percuma hari ini. Upgrade untuk akses
            tanpa had + semua features premium.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 mb-6 text-sm text-[#e0e0e0]">
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]">✓</span>
            AI lesson tanpa had — semua 13 subjek, 198 chapters
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]">✓</span>
            Study Planner Agent — pelan ulangkaji automatik
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]">✓</span>
            Quiz & latihan tanpa had setiap chapter
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#14B8A6]">✓</span>
            Akses penuh 7 Dimensi Kehidupan
          </li>
        </ul>

        {/* Founding Member offer */}
        {foundingOffer && (
          <button
            onClick={() => handleCheckout('founding')}
            disabled={loading}
            className="w-full mb-3 rounded-xl bg-[#C9A84C] py-4 font-bold text-black hover:bg-[#d9b85c] transition disabled:opacity-50"
          >
            <span className="block text-lg">
              🌟 Founding Member — RM15/30 hari
            </span>
            <span className="block text-xs font-medium opacity-80">
              Harga istimewa 50 pelajar pertama (biasa RM25)
            </span>
          </button>
        )}

        {/* Standard plan */}
        <button
          onClick={() => handleCheckout('premium')}
          disabled={loading}
          className={`w-full rounded-xl py-4 font-bold transition disabled:opacity-50 ${
            foundingOffer
              ? 'border border-[#2a2a3e] text-[#e0e0e0] hover:border-[#C9A84C]'
              : 'bg-[#C9A84C] text-black hover:bg-[#d9b85c]'
          }`}
        >
          Premium — RM25/30 hari
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-[#ef4444]">{error}</p>
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
