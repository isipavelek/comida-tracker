import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '350px',
      pointerEvents: 'none'
    }}>
      {toasts.map((t) => {
        let icon;
        let colorStr;
        switch (t.type) {
          case 'success':
            icon = <CheckCircle size={18} />;
            colorStr = 'var(--success)';
            break;
          case 'error':
            icon = <AlertCircle size={18} />;
            colorStr = 'var(--danger)';
            break;
          case 'warning':
            icon = <AlertTriangle size={18} />;
            colorStr = '#f59e0b';
            break;
          case 'info':
          default:
            icon = <Info size={18} />;
            colorStr = 'var(--primary)';
            break;
        }

        return (
          <div 
            key={t.id} 
            className="glass-card toast-enter" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              background: 'rgba(15, 23, 42, 0.85)',
              borderLeft: `4px solid ${colorStr}`,
              pointerEvents: 'auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              minWidth: '250px'
            }}
          >
            <div style={{ color: colorStr }}>{icon}</div>
            <p style={{ margin: 0, flex: 1, fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
              {t.message}
            </p>
            <button 
              onClick={() => removeToast(t.id)} 
              className="btn-glass btn-icon" 
              style={{ width: '28px', height: '28px', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
