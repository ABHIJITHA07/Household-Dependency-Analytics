import React from 'react';

const Badge = ({
  children,
  variant = 'default', // 'default' | 'peach' | 'pistachio' | 'butter' | 'lavender' | 'success' | 'warning' | 'danger'
  size = 'md',
  style = {}
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'peach':
        return { bg: 'var(--color-primary-soft)', color: 'var(--color-cocoa)', border: '1px solid var(--color-peach)' };
      case 'pistachio':
        return { bg: 'var(--color-secondary-soft)', color: 'var(--color-dark-pistachio)', border: '1px solid var(--color-pistachio)' };
      case 'butter':
        return { bg: 'var(--color-warm-butter)', color: 'var(--color-cocoa)', border: '1px solid #E4D0AA' };
      case 'lavender':
        return { bg: 'var(--color-soft-lavender)', color: '#5C4A6F', border: '1px solid #C4B1D7' };
      case 'success':
        return { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #C5E4C2' };
      case 'warning':
        return { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid #F5DBB8' };
      case 'danger':
        return { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid #F7C6C6' };
      case 'default':
      default:
        return { bg: 'var(--color-surface-alt)', color: 'var(--color-dark-text)', border: '1px solid var(--color-border)' };
    }
  };

  const { bg, color, border } = getStyles();
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9rem' : '0.82rem';
  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '4px 10px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: '600',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        border: border,
        fontSize,
        padding,
        lineHeight: 1.2,
        ...style
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
