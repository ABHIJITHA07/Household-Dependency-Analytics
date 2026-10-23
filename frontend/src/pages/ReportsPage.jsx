import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/report.service.js';
import { monthlyService } from '../services/monthly.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { FileSpreadsheet, Download, Eye, Sparkles, CheckCircle2, History, Calendar, Trash2 } from 'lucide-react';

const ReportsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [reportType, setReportType] = useState('CURRENT');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [snapshots, setSnapshots] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  const householdId = parseInt(id, 10);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      selectHousehold(householdId);
      const [snapsRes, repsRes] = await Promise.all([
        monthlyService.getAll(householdId).catch(() => ({ data: [] })),
        reportService.listByHousehold(householdId).catch(() => ({ data: [] }))
      ]);
      const snapList = snapsRes.data || [];
      setSnapshots(snapList);
      if (snapList.length > 0) {
        setSelectedRecordId(String(snapList[0].id));
      }
      setReports(repsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load report resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    try {
      const payload = {
        reportType,
        monthlyRecordId: reportType === 'MONTHLY' ? Number(selectedRecordId) : null
      };

      const res = await reportService.create(householdId, payload);
      const newReport = res.data;
      showToast('Official Financial Report generated successfully!', 'success');
      await loadData();
      navigate(`/households/${householdId}/reports/preview`, { state: { report: newReport } });
    } catch (err) {
      setError(err.message || 'Failed to generate financial report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async (reportId) => {
    setDownloadingId(reportId);
    try {
      const blob = await reportService.downloadPDF(reportId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Household_Report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF Report downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download PDF report', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await reportService.delete(reportId);
      showToast('Report deleted', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete report', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title="PDF Financial Assessment Reports"
        subtitle={`Household Profile ID #${householdId} • Server-side vector PDF generation compiling analytics, predictions, and Gemini AI insights`}
      />

      {/* Generator Control Card */}
      <Card variant="pistachio" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-secondary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cocoa)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
              Generate Official PDF Assessment Report
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-muted-text)', marginTop: '4px' }}>
              Select report type: Live current state or an immutable point-in-time monthly snapshot.
            </p>
          </div>
        </div>

        {error && <Toast message={error} type="error" />}

        {/* Report Options Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
              <input
                type="radio"
                name="reportType"
                value="CURRENT"
                checked={reportType === 'CURRENT'}
                onChange={() => setReportType('CURRENT')}
              />
              <span>Live Current Household Report</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
              <input
                type="radio"
                name="reportType"
                value="MONTHLY"
                checked={reportType === 'MONTHLY'}
                disabled={snapshots.length === 0}
                onChange={() => setReportType('MONTHLY')}
              />
              <span>Historical Monthly Snapshot Report</span>
            </label>
          </div>

          {reportType === 'MONTHLY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--color-dark-text)' }}>
                Select Historical Monthly Snapshot Period:
              </label>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-alt)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {snapshots.map((snap) => (
                  <option key={snap.id} value={snap.id}>
                    Period: {snap.recordMonth}/{snap.recordYear} (Saved {new Date(snap.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
          <Button
            variant="primary"
            size="lg"
            icon={Sparkles}
            loading={generating}
            onClick={handleGenerateReport}
          >
            Generate PDF Report
          </Button>
        </div>
      </Card>

      {/* Generated Reports List Table */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '16px' }}>
          Report History & Downloads
        </h3>

        {loading ? (
          <Skeleton height="120px" />
        ) : reports.length === 0 ? (
          <Card variant="butter">
            <p style={{ color: 'var(--color-muted-text)', textAlign: 'center' }}>
              No PDF reports generated yet for this household. Click "Generate PDF Report" above to create your first executive summary.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((rep) => (
              <Card key={rep.id} variant="default" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-peach)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-cocoa)'
                  }}>
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.02rem', color: 'var(--color-dark-text)' }}>
                      {rep.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-muted-text)', marginTop: '2px' }}>
                      Type: <strong>{rep.reportType}</strong> • Period: {rep.periodLabel || 'Live'} • Created: {new Date(rep.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/households/${householdId}/reports/preview`, { state: { report: rep } })}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    loading={downloadingId === rep.id}
                    onClick={() => handleDownloadPDF(rep.id)}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteReport(rep.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
