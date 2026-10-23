import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
  icon: Icon = Inbox
}) => {
  return (
    <Card
      variant="butter"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-warm-butter)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-cocoa)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <Icon size={32} />
      </div>

      <div style={{ maxWidth: '400px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '6px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" style={{ marginTop: '8px' }}>
          {actionText}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;
