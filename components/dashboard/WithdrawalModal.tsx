
import React, { useState } from 'react';
import { XIcon, CashIcon } from './Icons';
import { useToast } from '../../contexts/ToastContext';

interface WithdrawalModalProps {
  onClose: () => void;
  balance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ onClose, balance }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Bayarcash');
    const [accountDetails, setAccountDetails] = useState('');
    const { addToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);
        
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            addToast('Please enter a valid amount.', 'error');
            return;
        }
        if (withdrawAmount > balance) {
            addToast('Insufficient balance.', 'error');
            return;
        }
        if (!accountDetails.trim()) {
            addToast('Please provide account details.', 'error');
            return;
        }

        // Simulate API call
        addToast('Withdrawal request submitted! Pending approval (24-48h).', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-[var(--border)]">
                <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <CashIcon className="h-6 w-6 text-green-500" />
                        Request Payout
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
                        <XIcon className="h-5 w-5" />
                    </button>
                </header>
                
                <div className="p-6 overflow-y-auto">
                    <div className="bg-[var(--secondary)]/30 p-4 rounded-xl mb-6 flex justify-between items-center">
                        <span className="text-sm font-medium text-[var(--muted)]">Available Balance</span>
                        <span className="text-2xl font-bold text-[var(--foreground)]">RM {balance.toFixed(2)}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--muted)] mb-1">Amount to Withdraw (RM)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                                placeholder="0.00"
                                min="10"
                                max={balance}
                                required
                            />
                            <p className="text-xs text-[var(--muted)] mt-1">Minimum withdrawal: RM 10.00</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--muted)] mb-1">Payment Method</label>
                            <select 
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                            >
                                <option value="Bayarcash">Bayarcash (Instant Transfer)</option>
                                <option value="Bank Transfer">Manual Bank Transfer</option>
                                <option value="PayPal">PayPal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--muted)] mb-1">Account Details</label>
                            <textarea 
                                value={accountDetails}
                                onChange={(e) => setAccountDetails(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                                placeholder="e.g., Bank Name, Account Number, Full Name"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-200">
                            <strong>Note:</strong> To ensure security, all withdrawals are manually reviewed. Processing typically takes 1-2 business days.
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-full font-bold text-[var(--muted)] hover:bg-[var(--secondary)] transition">Cancel</button>
                            <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WithdrawalModal;
