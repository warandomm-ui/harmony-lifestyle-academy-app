import React, { useEffect, useState } from 'react';
import type { Toast as ToastProps } from '../contexts/ToastContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XIcon } from './dashboard/Icons';

interface Props {
  toast: ToastProps;
  onClose: (id: number) => void;
}

const ICONS = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  error: <XCircleIcon className="h-6 w-6 text-red-500" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
};

// Border accents only: the background must stay solid (bg-[var(--card)]).
// A translucent bg-*/10 here used to override it, letting page text show through.
const TOAST_COLORS = {
  success: 'border-green-500/60',
  error: 'border-red-500/60',
  info: 'border-blue-500/60',
};

const Toast: React.FC<Props> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };
  
  const animationClasses = isExiting 
    ? 'opacity-0 translate-y-2' 
    : 'opacity-100 translate-y-0';

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`w-full sm:max-w-sm rounded-2xl shadow-2xl p-4 border border-l-4 flex items-start gap-3 transition-all duration-300 ease-in-out bg-[var(--card)] ${TOAST_COLORS[toast.type]} ${animationClasses}`}
    >
      <div className="flex-shrink-0">
        {ICONS[toast.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">{toast.message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)] focus:outline-none"
          aria-label="Close notification"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;