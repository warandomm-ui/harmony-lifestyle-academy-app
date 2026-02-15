import React, { useState } from 'react';
import { XIcon, GiftIcon } from './Icons';
import { useToast } from '../../contexts/ToastContext';

interface DonateModalProps {
  onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ onClose }) => {
    const [amount, setAmount] = useState(10);
    const presetAmounts = [5, 10, 25, 50];
    const { addToast } = useToast();

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) {
            addToast('Please enter a valid donation amount.', 'error');
            return;
        }
        // Simulate donation
        console.log(`Donating RM${amount}`);
        addToast(`Thank you for your generous RM${amount.toFixed(2)} donation! ❤️`, 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <GiftIcon className="h-6 w-6 text-[var(--primary)]" />
                        Support Your Community
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
                        <XIcon className="h-5 w-5" />
                    </button>
                </header>
                <div className="overflow-y-auto p-6">
                    <p className="text-center text-[var(--muted)] mb-6">
                        Your contribution directly helps students in our community during times of need. Every little bit helps!
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-center text-[var(--muted)] mb-3">Choose an amount (RM)</label>
                            <div className="grid grid-cols-4 gap-3">
                                {presetAmounts.map(preset => (
                                    <button
                                        type="button"
                                        key={preset}
                                        onClick={() => setAmount(preset)}
                                        className={`py-3 rounded-lg border-2 font-bold transition-colors ${
                                            amount === preset
                                                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                                : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="custom-amount" className="block text-sm font-medium text-center text-[var(--muted)]">Or enter a custom amount</label>
                            <div className="relative mt-2">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--muted)]">RM</span>
                                <input
                                    type="number"
                                    id="custom-amount"
                                    value={amount}
                                    onChange={handleCustomAmountChange}
                                    className="block w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                                />
                            </div>
                        </div>

                        {/* In a real app, this would involve Stripe Elements or another payment gateway */}
                        <div className="text-sm text-center text-[var(--muted)]">
                            Payment will be processed securely.
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-full font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition">Cancel</button>
                            <button type="submit" className="bg-[var(--primary)] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition">Confirm Donation</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonateModal;
