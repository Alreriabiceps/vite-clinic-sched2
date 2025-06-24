import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

let toastId = 0;
const toasts = [];
const listeners = [];

export function toast(message, options = {}) {
  const id = ++toastId;
  const newToast = {
    id,
    message,
    type: options.type || 'info',
    duration: options.duration || 4000,
    ...options
  };
  
  toasts.push(newToast);
  listeners.forEach(listener => listener([...toasts]));
  
  if (newToast.duration > 0) {
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        listeners.forEach(listener => listener([...toasts]));
      }
    }, newToast.duration);
  }
  
  return id;
}

toast.success = (message, options) => toast(message, { ...options, type: 'success' });
toast.error = (message, options) => toast(message, { ...options, type: 'error' });
toast.warning = (message, options) => toast(message, { ...options, type: 'warning' });
toast.info = (message, options) => toast(message, { ...options, type: 'info' });

function useToasts() {
  const [toastList, setToastList] = useState([...toasts]);
  
  useEffect(() => {
    listeners.push(setToastList);
    return () => {
      const index = listeners.indexOf(setToastList);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  
  return toastList;
}

function Toast({ toast: toastData, onClose }) {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border shadow-lg animate-slide-in',
        typeStyles[toastData.type]
      )}
    >
      <span className="text-sm font-medium">{toastData.message}</span>
      <button
        onClick={() => onClose(toastData.id)}
        className="ml-4 text-current hover:opacity-70"
      >
        ×
      </button>
    </div>
  );
}

export function Toaster() {
  const toastList = useToasts();
  
  const removeToast = (id) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  };

  if (toastList.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toastList.map((toastData) => (
        <Toast
          key={toastData.id}
          toast={toastData}
          onClose={removeToast}
        />
      ))}
    </div>
  );
} 