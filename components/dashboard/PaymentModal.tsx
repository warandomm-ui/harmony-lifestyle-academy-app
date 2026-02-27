import React, { useState } from 'react';
import { XIcon, CreditCardIcon } from './Icons';
import { useToast } from '../../contexts/ToastContext';
import type { PaymentMethod } from '../../types';

interface PaymentModalProps {
  onClose: () => void;
  onSave: (data: Omit<PaymentMethod, 'id'>) => void;
}

const VisaIcon = () => (
    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa">
        <title id="pi-visa">Visa</title>
        <g fill="#000">
            <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" stroke="#d5d5d5"/>
            <path d="M15.2 6.5l-4.8 11h3l.7-1.9h4.1l.4 1.9h3L17.4 6.5h-2.2zm-1 6.9l1.6-4.4 1.6 4.4h-3.2zM26.2 6.5h-3.2c-.6 0-1.1.3-1.4.8l-4.2 10.2h3.2l4.2-10.3c.1-.3.4-.4.7-.4h.7v10h3V6.5z" fill="#1A1F71"/>
        </g>
    </svg>
);

const MastercardIcon = () => (
    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-mastercard">
        <title id="pi-mastercard">Mastercard</title>
        <g fill="#000">
            <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" stroke="#d5d5d5"/>
            <circle cx="15" cy="12" r="7" fill="#EB001B"/>
            <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
            <path d="M22 12c0 4.2-1.7 8-4.2 8-2.5 0-4.2-3.8-4.2-8s1.7-8 4.2-8 4.2 3.8 4.2 8z" fill="#FF5F00"/>
        </g>
    </svg>
);


const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSave }) => {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [error, setError] = useState('');
    const { addToast } = useToast();

    const getCardType = (number: string): 'Visa' | 'Mastercard' | 'American Express' | null => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'Mastercard';
        if (number.startsWith('34') || number.startsWith('37')) return 'American Express';
        return null;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = value.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (value.length > 2) {
            setExpiry(`${value.slice(0, 2)} / ${value.slice(2)}`);
        } else {
            setExpiry(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (!cardName.trim() || cardNumber.length < 19 || expiry.length < 7 || cvc.length < 3) {
            setError('Please fill out all fields correctly.');
            return;
        }

        const cardType = getCardType(cardNumber.replace(/\s/g, ''));
        if (!cardType) {
            setError('Invalid card number.');
            return;
        }

        const [month, year] = expiry.split(' / ');
        
        onSave({
            cardType,
            last4: cardNumber.slice(-4),
            expiryMonth: month,
            expiryYear: `20${year}`
        });
    };


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in-fast">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5 text-[var(--primary)]" />
                        Add Payment Method
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)] min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <XIcon className="h-5 w-5" />
                    </button>
                </header>
                <div className="overflow-y-auto p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="cardName" className="block text-sm font-medium text-[var(--muted)]">Cardholder Name</label>
                            <input type="text" id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} className="mt-1 block w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-[var(--muted)]">Card Number</label>
                            <div className="relative">
                                <input type="text" id="cardNumber" value={cardNumber} onChange={handleCardNumberChange} className="mt-1 block w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm" required />
                                <div className="absolute inset-y-0 right-3 flex items-center">
                                    {getCardType(cardNumber.replace(/\s/g, '')) === 'Visa' && <VisaIcon />}
                                    {getCardType(cardNumber.replace(/\s/g, '')) === 'Mastercard' && <MastercardIcon />}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label htmlFor="expiry" className="block text-sm font-medium text-[var(--muted)]">Expiry (MM/YY)</label>
                                <input type="text" id="expiry" placeholder="MM / YY" value={expiry} onChange={handleExpiryChange} className="mt-1 block w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm" required />
                            </div>
                             <div>
                                <label htmlFor="cvc" className="block text-sm font-medium text-[var(--muted)]">CVC</label>
                                <input type="text" id="cvc" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 block w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm" required />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition min-h-[44px]">Cancel</button>
                            <button type="submit" className="bg-[var(--primary)] text-white font-bold py-2.5 px-6 rounded-full hover:opacity-90 transition min-h-[44px]">Save Card</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
