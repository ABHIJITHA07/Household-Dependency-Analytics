import React from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import { useAuth } from '../hooks/useAuth.js';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader
        title="Account Settings"
        subtitle="Manage profile details, security preferences, and session tokens"
      />
      <Card variant="default">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '12px' }}>
          User Profile Details
        </h3>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account ID:</strong> #{user?.id}</p>
      </Card>
    </div>
  );
};

export default SettingsPage;
