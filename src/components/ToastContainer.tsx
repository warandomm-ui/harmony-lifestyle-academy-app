import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import type { ToastType } from '../types';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-l-success';
      case 'error':
        return 'border-l-destructive';
      case 'warning':
        return 'border-l-warning';
      case 'info':
        return 'border-l-primary';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-card rounded-lg p-4 border-l-4 ${getBorderColor(toast.type)} animate-slide-up flex items-start gap-3`}
        >
          {getIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm text-muted-foreground mt-1">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
