import React, { useState } from 'react';
import { XIcon, LifebuoyIcon } from './Icons';
import { useToast } from '../../contexts/ToastContext';

interface RequestHelpModalProps {
  onClose: () => void;
}

const RequestHelpModal: React.FC<RequestHelpModalProps> = ({ onClose }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [agreed, setAgreed] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !reason || !agreed) {
            addToast('Please fill all fields and agree to the terms.', 'error');
            return;
        }
        // Simulate submission
        addToast('Your confidential request has been submitted. Our team will review it shortly.', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in-fast">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <LifebuoyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                        Request Emergency Support
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)] min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <XIcon className="h-5 w-5" />
                    </button>
                </header>
                <div className="overflow-y-auto p-4 sm:p-6">
                    <div className="bg-orange-500/10 text-orange-800 dark:text-orange-200 p-4 rounded-lg border border-orange-500/20 mb-6">
                        <p className="font-bold">Confidential & For Emergencies Only</p>
                        <p className="text-sm mt-1">
                            This fund is for urgent needs like food, transport, or unexpected medical costs. All requests are confidential and reviewed by a small, dedicated support team.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-[var(--muted)]">Amount Requested (RM)</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                                placeholder="e.g., 50"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-[var(--muted)]">Briefly explain your situation (confidential)</label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                                placeholder="e.g., I need help with bus fare to get home for an emergency."
                                required
                            />
                        </div>
                        <div className="flex items-start">
                            <input
                                id="agree"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded mt-1"
                            />
                            <label htmlFor="agree" className="ml-3 block text-sm text-[var(--muted)]">
                                I understand this fund is for emergencies and my request will be reviewed confidentially.
                            </label>
                        </div>
                        <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition min-h-[44px]">Cancel</button>
                            <button type="submit" disabled={!agreed || !amount || !reason} className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-full hover:opacity-90 transition disabled:bg-gray-400 min-h-[44px]">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestHelpModal;
