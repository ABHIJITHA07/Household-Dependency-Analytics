import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { householdService } from '../services/household.service.js';
import { analyticsService } from '../services/analytics.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import Button from '../components/common/Button.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import {
  Users,
  TrendingUp,
  Receipt,
  BrainCircuit,
  Sparkles,
  Edit,
  ArrowLeft,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

const HouseholdDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();

  const [household, setHousehold] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const numId = parseInt(id, 10);
      selectHousehold(numId);
      const [hhRes, analyticsRes] = await Promise.all([
        householdService.getById(numId),
        analyticsService.getAnalytics(numId).catch(() => null)
      ]);

      setHousehold(hhRes.data);
      setAnalytics(analyticsRes?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load household details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="100px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <Skeleton height="140px" />
          <Skeleton height="140px" />
        </div>
      </div>
    );
  }

  if (error || !household) {
    return <ErrorState message={error || 'Household profile not found'} onRetry={fetchData} />;
  }

  const fin = analytics?.financials || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title={household.name}
        subtitle={`Registered Profile ID #${household.id} • Created ${new Date(household.createdAt).toLocaleDateString()}`}
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/households')}>
              Households List
            </Button>
            <Button variant="primary" icon={Edit} onClick={() => navigate(`/households/${household.id}/edit`)}>
              Edit Profile
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard
          title="Monthly Income"
          value={`₹${Number(household.monthlyIncome).toLocaleString()}`}
          subtext="Total earned monthly"
          icon={DollarSign}
          variant="peach"
        />

        <MetricCard
          title="Dependency Ratio"
          value={analytics?.dependencyRatio !== null && analytics?.dependencyRatio !== undefined ? `${analytics.dependencyRatio.toFixed(2)}%` : 'Not Computable'}
          subtext={`${household.dependentMembers} Dependents per ${household.earningMembers} Earners`}
          icon={TrendingUp}
          variant="pistachio"
        />

        <MetricCard
          title="Financial Condition"
          value={<StatusBadge status={fin.financialCondition || 'HEALTHY'} size="lg" />}
          subtext={`Savings Rate: ${fin.savingsRate !== null && fin.savingsRate !== undefined ? `${fin.savingsRate.toFixed(2)}%` : 'N/A'}`}
          icon={ShieldCheck}
          variant="butter"
        />

        <MetricCard
          title="Total Expenses"
          value={`₹${Number(fin.totalExpenses || 0).toLocaleString()}`}
          subtext={`Savings Buffer: ₹${Number(fin.savings || 0).toLocaleString()}`}
          icon={Receipt}
          variant="lavender"
        />
      </div>

      {/* Demographic Profile Breakdown Card */}
      <Card variant="default">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '16px' }}>
          Demographic Profile Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Total Household Members</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>{household.totalMembers}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Earning Members</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-dark-pistachio)' }}>{household.earningMembers}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Dependent Members</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-dark-peach)' }}>{household.dependentMembers}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Children (&lt; 18 yrs)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>{household.childrenCount}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Elderly (60+ yrs)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>{household.elderlyCount}</div>
          </div>
        </div>
      </Card>

      {/* Quick Launch Cards for Analytics, ML & Gemini */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <Card variant="peach" hoverable onClick={() => navigate(`/households/${household.id}/expenses`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Receipt size={24} color="var(--color-dark-peach)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Expenses Manager</h4>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
            Itemize essential vs non-essential expenditures across 10 categories.
          </p>
        </Card>

        <Card variant="pistachio" hoverable onClick={() => navigate(`/households/${household.id}/analytics`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <TrendingUp size={24} color="var(--color-dark-pistachio)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Analytics Engine</h4>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
            Deterministic evaluations for dependency ratios and savings cushions.
          </p>
        </Card>

        <Card variant="butter" hoverable onClick={() => navigate(`/households/${household.id}/prediction`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <BrainCircuit size={24} color="var(--color-cocoa)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>ML Risk Assessment</h4>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
            Random Forest supervised prediction of financial vulnerability.
          </p>
        </Card>

        <Card variant="lavender" hoverable onClick={() => navigate(`/households/${household.id}/insights`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Sparkles size={24} color="#5C4A6F" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Gemini AI Insights</h4>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
            Structured 5-category qualitative suggestions & explanations.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdDetailPage;
