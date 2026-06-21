import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((message) => push(message, 'success'), [push]);
  const error = useCallback((message) => push(message, 'error'), [push]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div style={toastContainerStyle}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...toastStyle, ...(t.type === 'error' ? toastErrorStyle : toastSuccessStyle) }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const toastContainerStyle = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  zIndex: 1000,
  maxWidth: 360,
};

const toastStyle = {
  padding: '12px 16px',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 8px 24px rgba(31,41,34,0.18)',
  color: '#fff',
  animation: 'toast-in 0.2s ease',
};

const toastSuccessStyle = { background: '#2F4538' };
const toastErrorStyle = { background: '#B5495B' };

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}