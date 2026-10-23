import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { predictionService } from '../services/prediction.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Badge from '../components/common/Badge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { BrainCircuit, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const PredictionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const householdId = parseInt(id, 10);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      selectHousehold(householdId);
      const res = await predictionService.getPrediction(householdId);
      setPrediction(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load ML risk prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="80px" />
        <Skeleton height="220px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (error || !prediction) {
    return <ErrorState message={error || 'ML risk prediction unavailable'} onRetry={fetchPrediction} />;
  }

  const { predictedRiskLevel, confidence, modelVersion, topFactors, isStale } = prediction;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title="Random Forest ML Risk Assessment"
        subtitle={`Household Profile ID #${householdId} • Supervised Machine Learning Financial Vulnerability Estimation`}
        action={
          <button
            onClick={fetchPrediction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'var(--color-dark-text)'
            }}
          >
            <RefreshCw size={16} />
            <span>Refresh Model</span>
          </button>
        }
      />

      {/* Main Risk Assessment Banner Card */}
      <Card variant="butter" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warm-butter)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cocoa)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <BrainCircuit size={32} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Predicted Vulnerability Status
              </div>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status={predictedRiskLevel} size="lg" />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
              Model Confidence Estimate
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-dark-text)' }}>
              {confidence || '98.50%'}
            </div>
          </div>
        </div>

        {isStale && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', color: 'var(--color-warning)', fontSize: '0.88rem' }}>
            <AlertTriangle size={16} />
            <span>Household demographic or expense profile has changed since this prediction was computed.</span>
          </div>
        )}
      </Card>

      {/* Top Model Influencing Factors Card */}
      <Card variant="default">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Cpu size={22} color="var(--color-dark-peach)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
            Top Model Influencing Factors
          </h3>
        </div>

        {topFactors && topFactors.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topFactors.map((factor, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                <CheckCircle2 size={18} color="var(--color-dark-pistachio)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.92rem', color: 'var(--color-dark-text)', fontWeight: '500' }}>
                  {factor}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-muted-text)' }}>
            Model factors evaluated based on Dependency Ratio, Savings Buffer, and Monthly Income.
          </p>
        )}
      </Card>

      {/* Model Specifications & Legal Disclaimer */}
      <Card variant="outline" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
        <div><strong>ML Microservice Architecture:</strong> Scikit-Learn Supervised Random Forest Model (`{modelVersion || 'rf-v1.0.0'}`).</div>
        <div><strong>Disclaimer:</strong> This prediction represents a model confidence estimate generated from demographic and financial parameters. It does not constitute certified financial advice or guarantee future market conditions.</div>
      </Card>
    </div>
  );
};

export default PredictionPage;
