import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const ACCENT = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

const AUTO_DISMISS_MS = 5000;
const EXIT_MS = 300;

const Toast: React.FC<Props> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (exitTimer.current) return; // already closing
    setIsExiting(true);
    exitTimer.current = setTimeout(() => onClose(toast.id), EXIT_MS);
  }, [onClose, toast.id]);

  // Enter animation on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss, paused while hovered/focused so the message can be read
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismiss, isPaused]);

  // Clear the pending exit timer if the toast unmounts first
  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const shown = isVisible && !isExiting;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`pointer-events-auto w-full rounded-2xl shadow-lg p-4 border border-[var(--border)] border-l-4 ${ACCENT[toast.type]} flex items-start gap-3 bg-[var(--card)] transition-all duration-300 ease-in-out ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex-shrink-0">{ICONS[toast.type]}</div>
      <p className="flex-1 min-w-0 text-sm font-semibold text-[var(--foreground)] break-words">{toast.message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="flex-shrink-0 p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        aria-label="Tutup notifikasi"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
