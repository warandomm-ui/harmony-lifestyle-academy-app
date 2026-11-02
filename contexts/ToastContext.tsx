import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

// Keep the stack short so repeated clicks don't bury the screen.
const MAX_TOASTS = 4;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // A counter, not Date.now(): two toasts in the same millisecond used to share an id,
  // which collided as React keys and made closing one close both.
  const nextId = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++;
    setToasts(current => {
      // Skip an identical message that is already on screen (e.g. double-clicks).
      if (current.some(t => t.message === message && t.type === type)) return current;
      return [...current, { id, message, type }].slice(-MAX_TOASTS);
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
