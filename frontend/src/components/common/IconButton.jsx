import React from 'react';

const IconButton = ({
  icon: Icon,
  onClick,
  title,
  variant = 'ghost', // 'ghost' | 'primary' | 'secondary' | 'outline'
  size = 'md',
  disabled = false,
  style = {},
  ...props
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm': return { box: '32px', icon: 16 };
      case 'lg': return { box: '44px', icon: 22 };
      case 'md': default: return { box: '38px', icon: 18 };
    }
  };

  const { box, icon } = getDimensions();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        width: box,
        height: box,
        borderRadius: 'var(--radius-md)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: variant === 'outline' ? '1px solid var(--color-border)' : 'none',
        background: variant === 'primary' ? 'var(--color-primary-soft)' : variant === 'secondary' ? 'var(--color-secondary-soft)' : 'transparent',
        color: 'var(--color-dark-text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'var(--transition-fast)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.background = 'var(--color-butter)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = variant === 'primary' ? 'var(--color-primary-soft)' : variant === 'secondary' ? 'var(--color-secondary-soft)' : 'transparent';
        }
      }}
      {...props}
    >
      <Icon size={icon} />
    </button>
  );
};

export default IconButton;
