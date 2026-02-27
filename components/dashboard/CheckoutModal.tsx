
import React, { useState } from 'react';
import { XIcon, LockClosedIcon, CheckCircleIcon, SpinnerIcon } from './Icons';
import type { Product } from '../../types';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, onClose, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handlePayment = () => {
    setStatus('processing');
    // Simulate Bayarcash API latency
    setTimeout(() => {
      setStatus('success');
      // Auto-close after showing success state briefly
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[100] animate-fade-in-fast">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">Secure Checkout</span>
                <LockClosedIcon className="h-4 w-4 text-green-500" />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <XIcon className="h-5 w-5" />
            </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
            {status === 'idle' && (
                <>
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Paying via Bayarcash</p>
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{product.category}</p>
                        </div>
                        <div className="mt-6 flex justify-between items-center px-4">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">Total Amount</span>
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">RM {product.price.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-3 mt-auto">
                        <button 
                            onClick={handlePayment}
                            className="w-full bg-[#F9A01B] hover:bg-[#e8920e] text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
                        >
                            Pay Now with FPX / Card
                        </button>
                        <p className="text-xs text-center text-gray-400">
                            Secured by Bayarcash using 256-bit SSL encryption.
                        </p>
                    </div>
                </>
            )}

            {status === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <SpinnerIcon className="h-16 w-16 text-[#F9A01B] mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Processing Payment...</h3>
                    <p className="text-gray-500 mt-2">Contacting bank...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Receipt sent to email.<br/>
                        <span className="font-bold">Auto-enrolling you now...</span>
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
