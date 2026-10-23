import React from 'react';

const SectionHeader = ({ title, subtitle, action, style = {} }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      ...style
    }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;
