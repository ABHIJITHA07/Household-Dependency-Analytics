import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '24px 32px',
      borderTop: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)',
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '0.85rem',
      color: 'var(--color-muted-text)'
    }}>
      <div>
        <strong>Household Dependency Analytics & Prediction System</strong> © 2026. All rights reserved.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>Node.js Express + MySQL</span>
        <span>•</span>
        <span>Random Forest ML</span>
        <span>•</span>
        <span>Google Gemini 2.5 Flash</span>
      </div>
    </footer>
  );
};

export default Footer;
