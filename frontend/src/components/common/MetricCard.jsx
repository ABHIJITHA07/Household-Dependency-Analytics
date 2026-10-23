import React from 'react';
import Card from './Card.jsx';

const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'peach', // 'peach' | 'pistachio' | 'butter' | 'lavender'
  trend, // { value: string, positive: boolean }
  style = {}
}) => {
  const getBadgeBg = () => {
    switch (variant) {
      case 'pistachio': return 'var(--color-secondary-soft)';
      case 'butter': return 'var(--color-warm-butter)';
      case 'lavender': return 'var(--color-soft-lavender)';
      case 'peach': default: return 'var(--color-primary-soft)';
    }
  };

  return (
    <Card variant={variant} hoverable style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-muted-text)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: getBadgeBg(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cocoa)',
            boxShadow: '0 4px 10px rgba(74, 59, 53, 0.05)'
          }}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--color-dark-text)', tracking: '-0.02em' }}>
          {value}
        </span>
        {trend && (
          <span style={{
            fontSize: '0.82rem',
            fontWeight: '600',
            color: trend.positive ? 'var(--color-success)' : 'var(--color-danger)',
            backgroundColor: trend.positive ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <span style={{ fontSize: '0.82rem', color: 'var(--color-muted-text)' }}>
          {subtext}
        </span>
      )}
    </Card>
  );
};

export default MetricCard;
