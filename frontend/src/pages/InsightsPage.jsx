import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insightService } from '../services/insight.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { Sparkles, RefreshCw, Users, Receipt, ShieldCheck, TrendingUp, AlertCircle, Info } from 'lucide-react';

const InsightsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  const householdId = parseInt(id, 10);

  const fetchInsights = async (force = false) => {
    if (force) setRegenerating(true);
    else setLoading(true);
    setError(null);

    try {
      selectHousehold(householdId);
      const res = await insightService.getInsights(householdId, { force });
      setInsight(res.data);
      if (force) {
        showToast('Fresh AI insights generated successfully!', 'success');
      }
    } catch (err) {
      if (err.code === 'AI_UNAVAILABLE') {
        setError('AI suggestions are temporarily unavailable. Your household analytics and ML predictions are fully functional.');
      } else {
        setError(err.message || 'Failed to load AI insights');
      }
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="80px" />
        <Skeleton height="150px" borderRadius="var(--radius-lg)" />
        <Skeleton height="150px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="AI Insights Unavailable"
        message={error}
        onRetry={() => fetchInsights(true)}
      />
    );
  }

  if (!insight) return null;

  const { sections, disclaimer, cached, modelName, createdAt } = insight;

  const categoryCards = [
    {
      title: '1. Understand Your Household',
      content: sections.understandHousehold,
      icon: Users,
      variant: 'peach'
    },
    {
      title: '2. Expense Review',
      content: sections.expenseReview,
      icon: Receipt,
      variant: 'pistachio'
    },
    {
      title: '3. Savings & Financial Stability',
      content: sections.savingsStability,
      icon: ShieldCheck,
      variant: 'butter'
    },
    {
      title: '4. Growth & Optimization Opportunities',
      content: sections.growthOpportunities,
      icon: TrendingUp,
      variant: 'lavender'
    },
    {
      title: '5. Things to Monitor',
      content: sections.thingsToMonitor,
      icon: AlertCircle,
      variant: 'peach'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title="Google Gemini AI Insights"
        subtitle={`Household Profile ID #${householdId} • Qualitative AI Financial Analysis (${modelName || 'gemini-2.5-flash'})`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge variant={cached ? 'butter' : 'pistachio'}>
              {cached ? 'Cached Response' : 'Fresh Generation'}
            </Badge>

            <Button
              variant="primary"
              icon={RefreshCw}
              loading={regenerating}
              onClick={() => fetchInsights(true)}
            >
              Regenerate Insights
            </Button>
          </div>
        }
      />

      {/* 5 Required Insight Section Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {categoryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} variant={card.variant} style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-cocoa)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
                  {card.title}
                </h3>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-dark-text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {card.content}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Legal & Financial Disclaimer Card */}
      <Card variant="outline" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'var(--color-surface-alt)' }}>
        <Info size={20} color="var(--color-muted-text)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
          <strong>Disclaimer:</strong> {disclaimer || 'This analysis is automatically generated for educational purposes and does not constitute certified financial advice.'}
        </div>
      </Card>
    </div>
  );
};

export default InsightsPage;
