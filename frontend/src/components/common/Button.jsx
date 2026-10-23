import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  onClick,
  icon: Icon,
  fullWidth = false,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'var(--color-secondary)',
          color: 'var(--color-cocoa)',
          border: '1px solid var(--color-soft-pistachio)',
          shadow: '0 4px 14px rgba(191, 216, 184, 0.4)'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--color-dark-text)',
          border: '1.5px solid var(--color-border)',
          shadow: 'none'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--color-dark-text)',
          border: 'none',
          shadow: 'none'
        };
      case 'danger':
        return {
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-primary-soft)',
          shadow: '0 4px 14px rgba(200, 90, 90, 0.15)'
        };
      case 'primary':
      default:
        return {
          background: 'var(--color-primary)',
          color: 'var(--color-cocoa)',
          border: '1px solid var(--color-primary-soft)',
          shadow: '0 4px 16px rgba(246, 183, 168, 0.45)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', fontSize: '0.85rem', gap: '6px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '1.05rem', gap: '10px' };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '0.95rem', gap: '8px' };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: vStyles.shadow,
        background: vStyles.background,
        color: vStyles.color,
        border: vStyles.border,
        width: fullWidth ? '100%' : 'auto',
        ...sStyles,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && variant !== 'ghost') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = vStyles.shadow;
        }
      }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" color={vStyles.color} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
