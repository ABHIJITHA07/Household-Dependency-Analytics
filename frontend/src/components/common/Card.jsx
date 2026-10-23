import React from 'react';

const Card = ({
  children,
  variant = 'default', // 'default' | 'peach' | 'pistachio' | 'butter' | 'lavender' | 'outline'
  hoverable = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'peach':
        return {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF0EC 100%)',
          border: '1px solid var(--color-soft-peach)',
          shadow: '0 12px 30px rgba(246, 183, 168, 0.2)'
        };
      case 'pistachio':
        return {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F2F8F0 100%)',
          border: '1px solid var(--color-soft-pistachio)',
          shadow: '0 12px 30px rgba(191, 216, 184, 0.25)'
        };
      case 'butter':
        return {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF8ED 100%)',
          border: '1px solid var(--color-warm-butter)',
          shadow: '0 12px 30px rgba(245, 231, 200, 0.3)'
        };
      case 'lavender':
        return {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F3FC 100%)',
          border: '1px solid var(--color-soft-lavender)',
          shadow: '0 12px 30px rgba(216, 199, 232, 0.25)'
        };
      case 'outline':
        return {
          background: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          shadow: 'none'
        };
      case 'default':
      default:
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          shadow: 'var(--shadow-card)'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      style={{
        background: vStyles.background,
        border: vStyles.border,
        boxShadow: vStyles.shadow,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = vStyles.shadow;
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
