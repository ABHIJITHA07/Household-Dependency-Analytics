import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { householdService } from '../services/household.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { Save, ArrowLeft, Home, Users, DollarSign } from 'lucide-react';

const HouseholdEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshHouseholds, selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHousehold = async () => {
      setLoading(true);
      setError(null);
      try {
        const numId = parseInt(id, 10);
        selectHousehold(numId);
        const res = await householdService.getById(numId);
        const h = res.data;
        setFormData({
          name: h.name,
          totalMembers: h.totalMembers,
          earningMembers: h.earningMembers,
          dependentMembers: h.dependentMembers,
          childrenCount: h.childrenCount,
          elderlyCount: h.elderlyCount,
          monthlyIncome: Number(h.monthlyIncome)
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch household details');
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = Number(formData.totalMembers);
    const earners = Number(formData.earningMembers);
    const dependents = Number(formData.dependentMembers);

    if (total < 1) {
      setError('Total members count must be at least 1');
      return;
    }

    if (earners + dependents > total) {
      setError('Earning members plus dependent members cannot exceed total members count');
      return;
    }

    if (Number(formData.monthlyIncome) < 0) {
      setError('Monthly income cannot be negative');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await householdService.update(parseInt(id, 10), formData);
      showToast('Household profile updated successfully!', 'success');
      await refreshHouseholds();
      navigate(`/households/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update household profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Skeleton height="350px" borderRadius="var(--radius-lg)" />;
  }

  if (error && !formData) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <PageHeader
        title="Edit Household Profile"
        subtitle={`Updating Profile ID #${id}`}
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(`/households/${id}`)}>
            Cancel & Return
          </Button>
        }
      />

      <Card variant="peach" style={{ padding: '32px' }}>
        {error && (
          <div style={{ marginBottom: '20px' }}>
            <Toast message={error} type="error" />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Household Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            startIcon={Home}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Total Members"
              type="number"
              name="totalMembers"
              value={formData.totalMembers}
              onChange={handleChange}
              min="1"
              required
              startIcon={Users}
            />

            <Input
              label="Earning Members"
              type="number"
              name="earningMembers"
              value={formData.earningMembers}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Dependent Members"
              type="number"
              name="dependentMembers"
              value={formData.dependentMembers}
              onChange={handleChange}
              min="0"
              required
            />

            <Input
              label="Children Count (< 18 yrs)"
              type="number"
              name="childrenCount"
              value={formData.childrenCount}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Elderly Count (60+ yrs)"
              type="number"
              name="elderlyCount"
              value={formData.elderlyCount}
              onChange={handleChange}
              min="0"
              required
            />

            <Input
              label="Monthly Household Income (₹)"
              type="number"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              min="0"
              step="500"
              required
              startIcon={DollarSign}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => navigate(`/households/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default HouseholdEditPage;
