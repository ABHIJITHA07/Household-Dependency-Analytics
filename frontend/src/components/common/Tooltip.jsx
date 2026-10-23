import React, { useState } from 'react';

const Tooltip = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          style={{
            position: 'absolute',
            bottom: position === 'top' ? '100%' : 'auto',
            top: position === 'bottom' ? '100%' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: position === 'top' ? '8px' : '0',
            marginTop: position === 'bottom' ? '8px' : '0',
            padding: '6px 12px',
            backgroundColor: 'var(--color-cocoa)',
            color: '#FFFFFF',
            fontSize: '0.78rem',
            fontWeight: '500',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-soft)',
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
