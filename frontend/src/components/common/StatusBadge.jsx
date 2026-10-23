import React from 'react';
import Badge from './Badge.jsx';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusVariant = () => {
    switch (String(status).toUpperCase()) {
      case 'LOW':
      case 'HEALTHY':
        return { variant: 'success', label: status };
      case 'MEDIUM':
      case 'MODERATE':
      case 'TIGHT':
        return { variant: 'warning', label: status };
      case 'HIGH':
      case 'DEFICIT':
      case 'NO_INCOME':
        return { variant: 'danger', label: status };
      default:
        return { variant: 'default', label: status || 'UNKNOWN' };
    }
  };

  const { variant, label } = getStatusVariant();

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
