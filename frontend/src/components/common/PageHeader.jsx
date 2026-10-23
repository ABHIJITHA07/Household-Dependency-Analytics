import React from 'react';

const PageHeader = ({ title, subtitle, action, breadcrumb, style = {} }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '28px',
      ...style
    }}>
      {breadcrumb && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
          {breadcrumb}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: '700',
            color: 'var(--color-dark-text)',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.95rem', color: 'var(--color-muted-text)', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>

        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
