
import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';
import ComplianceNotice from './ComplianceNotice';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      <ComplianceNotice />
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
