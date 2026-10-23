import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'var(--color-peach)' }) => {
  const getPixelSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 36;
      case 'md': default: return 24;
    }
  };

  const px = getPixelSize();

  return (
    <div
      style={{
        width: px,
        height: px,
        border: `2.5px solid ${color}33`,
        borderTop: `2.5px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite'
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
