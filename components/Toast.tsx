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

const TOAST_COLORS = {
  success: 'bg-green-500/10 border-green-500/20',
  error: 'bg-red-500/10 border-red-500/20',
  info: 'bg-blue-500/10 border-blue-500/20',
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
      role="alert"
      className={`max-w-sm w-full rounded-2xl shadow-lg p-4 border flex items-start gap-3 transition-all duration-300 ease-in-out bg-[var(--card)] ${TOAST_COLORS[toast.type]} ${animationClasses}`}
    >
      <div className="flex-shrink-0">
        {ICONS[toast.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">{toast.message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
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