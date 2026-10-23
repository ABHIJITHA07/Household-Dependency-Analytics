import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { householdService } from '../services/household.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { Home, Plus, Eye, Edit, Trash2, Users, DollarSign } from 'lucide-react';

const HouseholdsPage = () => {
  const navigate = useNavigate();
  const { refreshHouseholds, selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHouseholds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await householdService.getAll();
      setHouseholds(res.data || []);
      await refreshHouseholds();
    } catch (err) {
      setError(err.message || 'Failed to fetch households');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await householdService.delete(deleteTargetId);
      showToast('Household deleted successfully', 'success');
      setDeleteTargetId(null);
      await fetchHouseholds();
    } catch (err) {
      showToast(err.message || 'Failed to delete household', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader
        title="Households Portfolio"
        subtitle="Manage demographic profiles, earner-to-dependent counts, and monthly incomes"
        action={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/households/new')}>
            Add New Household
          </Button>
        }
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <Skeleton height="180px" borderRadius="var(--radius-lg)" />
          <Skeleton height="180px" borderRadius="var(--radius-lg)" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHouseholds} />
      ) : households.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No Households Created Yet"
          description="Create your first household demographic profile to unlock financial dependency analytics and ML predictions."
          actionText="Create Household"
          onAction={() => navigate('/households/new')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {households.map((hh) => (
            <Card
              key={hh.id}
              variant="peach"
              hoverable
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
                    {hh.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-dark-peach)', backgroundColor: 'var(--color-surface)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    ID #{hh.id}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-muted-text)' }}>Total Members:</span>
                    <div style={{ fontWeight: '700', color: 'var(--color-dark-text)' }}>{hh.totalMembers}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted-text)' }}>Earners / Dependents:</span>
                    <div style={{ fontWeight: '700', color: 'var(--color-dark-text)' }}>{hh.earningMembers} / {hh.dependentMembers}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted-text)' }}>Children / Elderly:</span>
                    <div style={{ fontWeight: '700', color: 'var(--color-dark-text)' }}>{hh.childrenCount} / {hh.elderlyCount}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted-text)' }}>Monthly Income:</span>
                    <div style={{ fontWeight: '700', color: 'var(--color-success)' }}>₹{Number(hh.monthlyIncome).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => { selectHousehold(hh.id); navigate(`/households/${hh.id}`); }}
                >
                  View Detail
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => { selectHousehold(hh.id); navigate(`/households/${hh.id}/edit`); }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setDeleteTargetId(hh.id)}
                  style={{ marginLeft: 'auto' }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Household Profile"
        message="Are you sure you want to delete this household profile? This action will permanently remove all associated expenses and insights."
        confirmText="Delete Household"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default HouseholdsPage;
