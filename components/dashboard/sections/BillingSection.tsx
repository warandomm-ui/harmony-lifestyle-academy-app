import React from 'react';
import { CreditCardIcon, LockClosedIcon } from '../Icons';
import type { SubscriptionPlan, Transaction } from '../../../types';

interface BillingSectionProps {
  currentPlan: SubscriptionPlan;
  planExpiresAt: string | null;
  transactions: Transaction[];
  onChangePlan: () => void;
}

const STATUS_LABEL: Record<Transaction['status'], string> = {
  Completed: 'Berjaya',
  Pending: 'Dalam proses',
  Failed: 'Gagal',
};

const BillingSection: React.FC<BillingSectionProps> = ({ currentPlan, planExpiresAt, transactions, onChangePlan }) => {
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Failed': return 'bg-red-500';
    }
  };

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <CreditCardIcon className="h-7 w-7 text-[var(--accent)]" />
        Bil & Pelan
      </h2>
      <div className="space-y-6">
        {/* Current Plan Card */}
        <div className="bg-[var(--secondary)]/50 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-[var(--muted)]">Pelan semasa</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{currentPlan.name}</p>
            {planExpiresAt && (
              <p className="text-xs text-[var(--muted)] mt-1">
                Aktif sehingga {new Date(planExpiresAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })} · tiada pembaharuan automatik
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onChangePlan}
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition transform hover:scale-105"
          >
            {planExpiresAt ? 'Lanjutkan / Tukar' : 'Naik Taraf'}
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Sejarah Transaksi</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="bg-[var(--background)] rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(tx.status)}`} aria-hidden="true"></div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--foreground)] truncate">{tx.description}</p>
                      <p className="text-xs text-[var(--muted)]">{tx.date} · {STATUS_LABEL[tx.status]}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[var(--foreground)] flex-shrink-0">RM {tx.amount.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-4">Tiada transaksi lagi.</p>
            )}
          </div>
        </div>

        {/* Payment security note (replaces stored cards: we never hold card/bank details) */}
        <div className="flex items-start gap-3 bg-[var(--background)] rounded-lg p-3 border border-[var(--border)]">
          <LockClosedIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--muted)]">
            Pembayaran diproses dengan selamat oleh <span className="font-semibold text-[var(--foreground)]">ToyyibPay</span> melalui FPX.
            Harmony Lifestyle Academy tidak menyimpan butiran bank atau kad anda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;
