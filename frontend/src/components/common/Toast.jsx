import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'var(--color-secondary)',
          color: 'var(--color-success)',
          Icon: CheckCircle
        };
      case 'error':
        return {
          bg: 'var(--color-danger-bg)',
          border: 'var(--color-primary)',
          color: 'var(--color-danger)',
          Icon: AlertCircle
        };
      default:
        return {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-soft-sky-blue)',
          color: 'var(--color-info)',
          Icon: Info
        };
    }
  };

  const { bg, border, color, Icon } = getStyles();

  return (
    <div
      className="animate-slide-up"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '380px',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}
    >
      <Icon size={18} />
      <span style={{ flex: 1, color: 'var(--color-text)' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
