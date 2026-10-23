import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Badge from '../components/common/Badge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, DollarSign, ShieldCheck, PieChart, Users, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const AnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const householdId = parseInt(id, 10);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      selectHousehold(householdId);
      const res = await analyticsService.getAnalytics(householdId);
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load household analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  if (loading) {
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

  if (error || !analytics) {
    return <ErrorState message={error || 'Analytics not available for this household'} onRetry={fetchAnalytics} />;
  }

  const { demographics, dependencyRatio, dependencyLevel, financials, explanations } = analytics;

  // Handling Zero Earning Members Edge Case
  const isZeroEarners = demographics.earningMembers === 0 || dependencyRatio === null;
  const displayDependencyRatio = isZeroEarners ? 'Not Computable' : `${dependencyRatio.toFixed(2)}%`;

  // Handling Zero Income Edge Case
  const isZeroIncome = financials.monthlyIncome === 0 || financials.financialCondition === 'NO_INCOME';
  const displaySavingsRate = isZeroIncome || financials.savingsRate === null ? 'N/A' : `${financials.savingsRate.toFixed(2)}%`;

  // Income vs Expenses Bar Chart Data
  const incomeVsExpenseData = {
    labels: ['Monthly Income', 'Total Expenses', 'Monthly Savings'],
    datasets: [
      {
        label: 'Financial Position (₹)',
        data: [financials.monthlyIncome, financials.totalExpenses, Math.max(0, financials.savings)],
        backgroundColor: ['#BFD8B8', '#F6B7A8', '#F5E7C8'],
        borderColor: ['#8EA687', '#E09584', '#E4D0AA'],
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  // Essential vs Non-Essential Doughnut Chart Data
  const essentialBreakdownData = {
    labels: ['Essential Expenses', 'Non-Essential Expenses'],
    datasets: [
      {
        data: [financials.essentialExpenses, financials.nonEssentialExpenses],
        backgroundColor: ['#BFD8B8', '#FAD1C8'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 2
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title="Deterministic Analytics Engine"
        subtitle={`Household Profile ID #${householdId} • Pure Mathematical Financial & Demographic Calculations`}
      />

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard
          title="Dependency Ratio"
          value={displayDependencyRatio}
          subtext={explanations.dependencyText}
          icon={Users}
          variant="pistachio"
        />

        <MetricCard
          title="Dependency Level"
          value={<StatusBadge status={dependencyLevel} size="lg" />}
          subtext={`Authoritative Classification: ${dependencyLevel}`}
          icon={TrendingUp}
          variant="peach"
        />

        <MetricCard
          title="Financial Condition"
          value={<StatusBadge status={financials.financialCondition} size="lg" />}
          subtext={explanations.financialText}
          icon={ShieldCheck}
          variant="butter"
        />

        <MetricCard
          title="Savings Cushion"
          value={`₹${Number(financials.savings).toLocaleString()}`}
          subtext={`Savings Rate: ${displaySavingsRate}`}
          icon={DollarSign}
          variant="lavender"
        />
      </div>

      {/* Zero Earners / Zero Income Warning Alerts */}
      {isZeroEarners && (
        <Card variant="peach" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '6px solid var(--color-danger)' }}>
          <AlertCircle size={28} color="var(--color-danger)" />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
              Zero Earning Members Warning
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', marginTop: '2px' }}>
              Household reports zero earning members. The dependency ratio is mathematically undefined (division by zero) and reported as <strong>Not Computable</strong>. Dependency risk is authoritatively classified as <strong>HIGH</strong>.
            </p>
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Income vs Expenses Bar Chart */}
        <Card variant="default">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '16px' }}>
            Monthly Cash Flow Comparison
          </h3>
          <div style={{ height: '260px' }}>
            <Bar
              data={incomeVsExpenseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </Card>

        {/* Essential vs Non-Essential Doughnut Chart */}
        <Card variant="default">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '16px' }}>
            Essential vs Non-Essential Expenditure
          </h3>
          <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
            {financials.totalExpenses > 0 ? (
              <Doughnut
                data={essentialBreakdownData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted-text)' }}>
                No expenses logged to generate breakdown chart.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Financial Summary Table */}
      <Card variant="default">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '16px' }}>
          Official Deterministic Financial Analytics Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Monthly Income</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>₹{Number(financials.monthlyIncome).toLocaleString()}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Total Expenses</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>₹{Number(financials.totalExpenses).toLocaleString()}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Essential Expenses</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-pistachio)' }}>₹{Number(financials.essentialExpenses).toLocaleString()} ({financials.essentialPercentage}%)</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Non-Essential Expenses</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-peach)' }}>₹{Number(financials.nonEssentialExpenses).toLocaleString()} ({financials.nonEssentialPercentage}%)</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Expense-to-Income Ratio</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>{financials.expenseRatio !== null ? `${financials.expenseRatio.toFixed(2)}%` : 'N/A'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
