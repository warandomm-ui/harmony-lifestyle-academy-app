import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Full-width with side gutters on phones, fixed width from `sm` up.
  // pointer-events-none on the wrapper so the empty area never blocks clicks underneath.
  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
