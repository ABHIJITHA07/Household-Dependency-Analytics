import React, { useId } from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  startIcon: StartIcon,
  endIcon: EndIcon,
  onEndIconClick,
  className = '',
  style = {},
  ...props
}) => {
  const id = useId();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--color-dark-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {StartIcon && (
          <div style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--color-muted-text)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <StartIcon size={18} />
          </div>
        )}

        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: StartIcon ? '12px 14px 12px 42px' : EndIcon ? '12px 42px 12px 14px' : '12px 14px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-dark-text)',
            backgroundColor: 'var(--color-surface)',
            border: error ? '1.5px solid var(--color-danger)' : '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxShadow: 'var(--shadow-inner-3d)',
            transition: 'var(--transition-fast)'
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--color-dark-peach)';
            e.target.style.boxShadow = '0 0 0 4px rgba(246, 183, 168, 0.3)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
            e.target.style.boxShadow = 'var(--shadow-inner-3d)';
          }}
          {...props}
        />

        {EndIcon && (
          <div
            onClick={onEndIconClick}
            style={{
              position: 'absolute',
              right: '14px',
              color: 'var(--color-muted-text)',
              display: 'flex',
              alignItems: 'center',
              cursor: onEndIconClick ? 'pointer' : 'default'
            }}
          >
            <EndIcon size={18} />
          </div>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '0.82rem', color: 'var(--color-danger)', fontWeight: '500' }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '0.82rem', color: 'var(--color-muted-text)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
