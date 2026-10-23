import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { householdService } from '../services/household.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';
import { Save, ArrowLeft, Home, Users, DollarSign } from 'lucide-react';

const HouseholdNewPage = () => {
  const navigate = useNavigate();
  const { refreshHouseholds, selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    totalMembers: 4,
    earningMembers: 2,
    dependentMembers: 2,
    childrenCount: 1,
    elderlyCount: 0,
    monthlyIncome: 85000
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    // Client-side validation matching Zod backend rules
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

    setLoading(true);
    setError(null);

    try {
      const res = await householdService.create(formData);
      const newHousehold = res.data;
      showToast('Household profile created successfully!', 'success');
      await refreshHouseholds();
      selectHousehold(newHousehold.id);
      navigate(`/households/${newHousehold.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create household profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <PageHeader
        title="Create Household Profile"
        subtitle="Specify family demographic structure and monthly income"
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/households')}>
            Back to List
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
            placeholder="e.g. Sharma Family Household"
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
            <Button variant="outline" onClick={() => navigate('/households')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={loading}>
              Create Household
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default HouseholdNewPage;
