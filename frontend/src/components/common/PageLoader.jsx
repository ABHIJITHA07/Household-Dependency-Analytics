import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const PageLoader = ({ text = 'Loading application...' }) => {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '40px'
      }}
    >
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-3d)',
        border: '1px solid var(--color-soft-peach)'
      }}>
        <LoadingSpinner size="lg" color="var(--color-dark-peach)" />
      </div>
      <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--color-muted-text)' }}>
        {text}
      </span>
    </div>
  );
};

export default PageLoader;
