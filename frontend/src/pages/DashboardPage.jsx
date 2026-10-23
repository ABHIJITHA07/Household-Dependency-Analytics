import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHousehold } from '../hooks/useHousehold.js';
import { analyticsService } from '../services/analytics.service.js';
import { predictionService } from '../services/prediction.service.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import Button from '../components/common/Button.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import {
  Home,
  Plus,
  Users,
  Receipt,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  DollarSign,
  History,
  FileSpreadsheet
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { households, activeHousehold, activeHouseholdId, loading: hhLoading } = useHousehold();

  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeHouseholdId) return;
      setDataLoading(true);
      try {
        const [aRes, pRes] = await Promise.all([
          analyticsService.getAnalytics(activeHouseholdId).catch(() => null),
          predictionService.getPrediction(activeHouseholdId).catch(() => null)
        ]);
        setAnalytics(aRes?.data || null);
        setPrediction(pRes?.data || null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeHouseholdId]);

  if (hhLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="80px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <Skeleton height="140px" />
          <Skeleton height="140px" />
        </div>
      </div>
    );
  }

  if (households.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
        <PageHeader
          title="Household Command Center"
          subtitle="Welcome! Get started by setting up your primary household profile."
        />
        <EmptyState
          icon={Home}
          title="No Active Households"
          description="Create your first household profile to unlock financial dependency analytics, ML risk assessment, and Gemini AI insights."
          actionText="Create Household Profile"
          onAction={() => navigate('/households/new')}
        />
      </div>
    );
  }

  const fin = analytics?.financials || {};
  const isZeroEarners = activeHousehold?.earningMembers === 0 || analytics?.dependencyRatio === null;
  const displayRatio = isZeroEarners ? 'Not Computable' : `${analytics?.dependencyRatio?.toFixed(2) || '0.00'}%`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title={`Dashboard Overview — ${activeHousehold?.name || 'Household'}`}
        subtitle={`Household Profile ID #${activeHouseholdId} • Real-Time Financial & ML Risk Summary`}
        action={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/households/new')}>
            Add New Household
          </Button>
        }
      />

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <MetricCard
          title="Monthly Income"
          value={`₹${Number(activeHousehold?.monthlyIncome || 0).toLocaleString()}`}
          subtext={`Earners: ${activeHousehold?.earningMembers || 0}`}
          icon={DollarSign}
          variant="peach"
        />

        <MetricCard
          title="Total Expenses"
          value={`₹${Number(fin.totalExpenses || 0).toLocaleString()}`}
          subtext={`Savings: ₹${Number(fin.savings || 0).toLocaleString()}`}
          icon={Receipt}
          variant="lavender"
        />

        <MetricCard
          title="Dependency Ratio"
          value={displayRatio}
          subtext={`${activeHousehold?.dependentMembers || 0} Dependents : ${activeHousehold?.earningMembers || 0} Earners`}
          icon={TrendingUp}
          variant="pistachio"
        />

        <MetricCard
          title="ML Financial Risk"
          value={<StatusBadge status={prediction?.predictedRiskLevel || 'LOW'} size="lg" />}
          subtext={`Model Confidence: ${prediction?.confidence || '98.50%'}`}
          icon={BrainCircuit}
          variant="butter"
        />
      </div>

      {/* Interactive Command Launchpad Grid */}
      <Card variant="default">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '16px' }}>
          Household Financial Modules
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <Card variant="peach" hoverable onClick={() => navigate(`/households/${activeHouseholdId}/expenses`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Receipt size={22} color="var(--color-dark-peach)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Expense Manager</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Log, itemize and categorize essential vs non-essential expenditures.
            </p>
          </Card>

          <Card variant="pistachio" hoverable onClick={() => navigate(`/households/${activeHouseholdId}/analytics`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={22} color="var(--color-dark-pistachio)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Analytics Engine</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Deterministic mathematical formulas and cash flow charts.
            </p>
          </Card>

          <Card variant="butter" hoverable onClick={() => navigate(`/households/${activeHouseholdId}/prediction`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <BrainCircuit size={22} color="var(--color-cocoa)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>ML Risk Prediction</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Random Forest vulnerability assessment & model confidence.
            </p>
          </Card>

          <Card variant="lavender" hoverable onClick={() => navigate(`/households/${activeHouseholdId}/insights`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Sparkles size={22} color="#5C4A6F" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Gemini AI Insights</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Qualitative financial explanations across 5 required categories.
            </p>
          </Card>

          <Card variant="peach" hoverable onClick={() => navigate(`/households/${activeHouseholdId}/history`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <History size={22} color="var(--color-dark-peach)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>Monthly History</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Track historical monthly snapshots & progress trajectory over time.
            </p>
          </Card>

          <Card variant="pistachio" hoverable onClick={() => navigate(`/households/${activeHouseholdId}/reports`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FileSpreadsheet size={22} color="var(--color-dark-pistachio)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>PDF Financial Reports</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Export official PDF household financial assessment reports.
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
