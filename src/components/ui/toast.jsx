import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

let toastId = 0;
let toastCallbacks = [];

export const toast = {
  success: (message) => addToast({ type: 'success', message }),
  error: (message) => addToast({ type: 'error', message }),
  info: (message) => addToast({ type: 'info', message }),
};

const addToast = (toast) => {
  const id = ++toastId;
  const newToast = { ...toast, id };
  toastCallbacks.forEach(callback => callback(prevToasts => [...prevToasts, newToast]));
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toastCallbacks.forEach(callback => 
      callback(prevToasts => prevToasts.filter(t => t.id !== id))
    );
  }, 5000);
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallbacks.push(setToasts);
    return () => {
      const index = toastCallbacks.indexOf(setToasts);
      if (index > -1) {
        toastCallbacks.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-80 max-w-md ${getBackgroundColor(toast.type)} animate-in slide-in-from-right-full duration-300`}
        >
          {getIcon(toast.type)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${getTextColor(toast.type)}`}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`flex-shrink-0 p-1 rounded-md hover:bg-white/50 ${getTextColor(toast.type)}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 