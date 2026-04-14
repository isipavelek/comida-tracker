import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toastInfo = (msg, d) => addToast(msg, 'info', d);
  const toastSuccess = (msg, d) => addToast(msg, 'success', d);
  const toastError = (msg, d) => addToast(msg, 'error', d);
  const toastWarning = (msg, d) => addToast(msg, 'warning', d);

  return (
    <ToastContext.Provider value={{ toasts, toastInfo, toastSuccess, toastError, toastWarning, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
