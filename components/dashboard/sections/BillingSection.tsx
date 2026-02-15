import React from 'react';
import { CreditCardIcon, TrashIcon } from '../Icons';
import type { PaymentMethod, SubscriptionPlan, Transaction } from '../../../types';

interface BillingSectionProps {
  currentPlan: SubscriptionPlan;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  onAddPaymentMethod: () => void;
  onRemovePaymentMethod: (id: string) => void;
  onChangePlan: () => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({ currentPlan, paymentMethods, transactions, onAddPaymentMethod, onRemovePaymentMethod, onChangePlan }) => {
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
        Billing & Plans
      </h2>
      <div className="space-y-6">
        {/* Current Plan Card */}
        <div className="bg-[var(--secondary)]/50 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">Current Plan</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{currentPlan.name}</p>
          </div>
          <button
            onClick={onChangePlan}
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition transform hover:scale-105"
          >
            Change Plan
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Transaction History</h3>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="bg-[var(--background)] rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(tx.status)}`}></div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{tx.description}</p>
                      <p className="text-xs text-[var(--muted)]">{tx.date}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[var(--foreground)]">RM {tx.amount.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-4">No transactions yet.</p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Your Payment Methods</h3>
          <div className="space-y-3">
            {paymentMethods.length > 0 ? (
              paymentMethods.map(pm => (
                <div key={pm.id} className="bg-[var(--background)] rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{pm.cardType} ending in {pm.last4}</p>
                      <p className="text-xs text-[var(--muted)]">Expires {pm.expiryMonth}/{pm.expiryYear}</p>
                    </div>
                  </div>
                  <button onClick={() => onRemovePaymentMethod(pm.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-4">No payment methods saved.</p>
            )}
            <button
              onClick={onAddPaymentMethod}
              className="w-full mt-2 bg-[var(--primary)]/10 text-[var(--primary)] font-bold py-2.5 px-4 rounded-full hover:bg-[var(--primary)]/20 transition"
            >
              + Add New Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;