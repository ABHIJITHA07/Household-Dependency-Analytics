import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load requested data. Please try again.',
  onRetry
}) => {
  return (
    <Card
      variant="peach"
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-danger-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-danger)'
      }}>
        <AlertCircle size={28} />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '6px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" icon={RefreshCw} size="sm">
          Retry Action
        </Button>
      )}
    </Card>
  );
};

export default ErrorState;
