import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import { Compass } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <EmptyState
        icon={Compass}
        title="404 — Page Not Found"
        description="The page you requested does not exist or has been moved."
        actionText="Return to Safety"
        onAction={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default NotFoundPage;
