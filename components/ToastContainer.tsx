
import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    // Mobile: full-width just below the header bar so it never covers its buttons.
    // Desktop: top-right corner as before.
    <div className="fixed top-20 inset-x-4 sm:inset-x-auto sm:top-4 sm:right-4 sm:w-96 z-[100] space-y-2 pointer-events-none [&>*]:pointer-events-auto">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
