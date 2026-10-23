import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { reportService } from '../services/report.service.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Toast from '../components/common/Toast.jsx';
import { ArrowLeft, Printer, Download, PieChart, CheckCircle2, ShieldAlert, BrainCircuit } from 'lucide-react';

const ReportPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const report = location.state?.report;
  const snapshot = report?.snapshotJson || {};

  const [downloading, setDownloading] = useState(false);

  const householdInfo = snapshot.householdInfo || {};
  const demographics = snapshot.demographics || {};
  const financials = snapshot.financials || {};
  const expenses = snapshot.expenseBreakdown || [];
  const prediction = snapshot.prediction || {};
  const insight = snapshot.insight || {};

  const handleDownloadPDF = async () => {
    if (!report?.id) {
      window.print();
      return;
    }
    setDownloading(true);
    try {
      const blob = await reportService.downloadPDF(report.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Household_Report_${report.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PageHeader title="Report Preview" subtitle="No report selected" />
        <Card variant="butter">
          <p>No report preview state found. Please select a report from the Reports page.</p>
          <Button variant="primary" style={{ marginTop: '16px' }} onClick={() => navigate(`/households/${id}/reports`)}>
            Back to Reports
          </Button>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amt) => (amt !== undefined && amt !== null ? `₹${Number(amt).toLocaleString('en-IN')}` : 'N/A');
  const formatPct = (pct) => (pct !== undefined && pct !== null ? `${Number(pct).toFixed(2)}%` : 'Not Computable');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '850px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <PageHeader
        title={report.title || 'Official Household Assessment Report'}
        subtitle={`Household Profile ID #${id} • Executive Report Summary`}
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(`/households/${id}/reports`)}>
              Back to Reports
            </Button>
            <Button variant="outline" icon={Printer} onClick={handlePrint}>
              Print View
            </Button>
            <Button variant="primary" icon={Download} loading={downloading} onClick={handleDownloadPDF}>
              Download Official PDF
            </Button>
          </div>
        }
      />

      {/* Document Canvas Container */}
      <Card variant="default" style={{ padding: '48px', display: 'flex', flexDirection: 'column', gap: '32px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-card)' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--color-peach)', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-dark-peach)', fontWeight: '800', fontSize: '1.3rem' }}>
              <PieChart size={28} />
              <span>HOUSEHOLD DEPENDENCY ANALYTICS</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', marginTop: '4px' }}>
              Financial Condition & Vulnerability Assessment Report
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>
            <div><strong>Report ID:</strong> #{report.id}</div>
            <div><strong>Type:</strong> {report.reportType}</div>
            <div><strong>Period:</strong> {report.periodLabel || 'Live'}</div>
            <div><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Demographics */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
            1. Household Demographics & Structure
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-text)' }}>Total Members</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-dark-text)' }}>{demographics.totalMembers || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-text)' }}>Earning Members</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-dark-pistachio)' }}>{demographics.earningMembers || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-text)' }}>Dependent Members</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-dark-peach)' }}>{demographics.dependentMembers || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-text)' }}>Children (&lt; 18 yrs)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-dark-text)' }}>{demographics.childrenCount || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-text)' }}>Elderly (60+ yrs)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-dark-text)' }}>{demographics.elderlyCount || 0}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Health & Dependency Ratios */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
            2. Deterministic Financial Health & Dependency Ratios
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Monthly Income</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-dark-text)' }}>{formatCurrency(financials.monthlyIncome)}</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)' }}>Total Expenses</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-dark-text)' }}>{formatCurrency(financials.totalExpenses)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
            <div><strong>Net Monthly Savings:</strong> {formatCurrency(financials.savings)}</div>
            <div><strong>Savings Rate:</strong> {formatPct(financials.savingsRate)}</div>
            <div><strong>Expense Ratio:</strong> {formatPct(financials.expenseRatio)}</div>
            <div><strong>Dependency Ratio:</strong> {formatPct(financials.dependencyRatio)}</div>
            <div><strong>Financial Condition:</strong> <StatusBadge status={financials.financialCondition || 'MODERATE'} size="sm" /></div>
            <div><strong>Dependency Level:</strong> <StatusBadge status={financials.dependencyLevel || 'MEDIUM'} size="sm" /></div>
          </div>
        </div>

        {/* Section 3: Expense Itemization */}
        {expenses.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
              3. Categorized Expense Breakdown
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Category</th>
                  <th style={{ padding: '8px 12px' }}>Type</th>
                  <th style={{ padding: '8px 12px' }}>Description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: '600' }}>{exp.category}</td>
                    <td style={{ padding: '8px 12px' }}>{exp.isEssential || exp.is_essential ? 'Essential' : 'Discretionary'}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-muted-text)' }}>{exp.description || '-'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 4: ML Prediction */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
            4. Random Forest Machine Learning Risk Assessment
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-warm-butter)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrainCircuit size={24} color="var(--color-cocoa)" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-muted-text)' }}>PREDICTED RISK LEVEL</div>
                <StatusBadge status={prediction.predictedRiskLevel || snapshot.predictedRiskLevel || 'MEDIUM'} size="md" />
              </div>
            </div>
            {prediction.confidence && (
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--color-dark-text)' }}>
                <strong>Model Confidence Estimate:</strong> {prediction.confidence}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Gemini AI Guidance */}
        {insight && (typeof insight === 'object') && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
              5. Qualitative Gemini AI Guidance & Strategic Plan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {Object.entries(insight).map(([key, val]) => (
                typeof val === 'string' && (
                  <div key={key} style={{ padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-dark-peach)', textTransform: 'capitalize', marginBottom: '4px' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{ color: 'var(--color-dark-text)' }}>{val}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div style={{ borderTop: '2px dashed var(--color-border)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
          <strong>Analytical & Legal Disclaimer:</strong> This official assessment report synthesizes deterministic financial accounting formulas, supervised random forest probability estimates, and generative AI explanations. It is produced strictly for educational self-assessment purposes and does not constitute certified legal, medical, or financial advice.
        </div>
      </Card>
    </div>
  );
};

export default ReportPreviewPage;
