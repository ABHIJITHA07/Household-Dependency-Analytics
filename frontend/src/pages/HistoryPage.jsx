import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { monthlyService } from '../services/monthly.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Modal from '../components/common/Modal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { History, Plus, Trash2, Calendar, FileText } from 'lucide-react';

const HistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recordMonth: new Date().getMonth() + 1,
    recordYear: new Date().getFullYear(),
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const householdId = parseInt(id, 10);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      selectHousehold(householdId);
      const res = await monthlyService.getAll(householdId);
      setRecords(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load monthly snapshot records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [id]);

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await monthlyService.create(householdId, {
        recordMonth: Number(formData.recordMonth),
        recordYear: Number(formData.recordYear),
        notes: formData.notes,
        overwrite: true
      });
      showToast('Monthly snapshot captured successfully!', 'success');
      setModalOpen(false);
      await fetchRecords();
    } catch (err) {
      setFormError(err.message || 'Failed to capture monthly snapshot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSnapshot = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await monthlyService.delete(householdId, deleteTargetId);
      showToast('Monthly snapshot deleted successfully', 'success');
      setDeleteTargetId(null);
      await fetchRecords();
    } catch (err) {
      showToast(err.message || 'Failed to delete snapshot', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title="Monthly Snapshot History"
        subtitle={`Household Profile ID #${householdId} • Capture and track monthly financial trajectory over time`}
        action={
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            Capture Current Month Snapshot
          </Button>
        }
      />

      {loading ? (
        <Skeleton height="250px" borderRadius="var(--radius-lg)" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecords} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Monthly Snapshots Saved"
          description="Capture a monthly snapshot to record your household analytics state for historical trajectory tracking."
          actionText="Capture First Snapshot"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {records.map((rec) => (
            <Card key={rec.id} variant="peach" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--color-dark-text)' }}>
                  <Calendar size={18} color="var(--color-dark-peach)" />
                  <span>{rec.recordMonth}/{rec.recordYear}</span>
                </div>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTargetId(rec.id)}>
                  Delete
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--color-muted-text)' }}>Monthly Income:</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-dark-text)' }}>₹{Number(rec.monthlyIncome).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted-text)' }}>Total Expenses:</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-dark-text)' }}>₹{Number(rec.totalExpenses).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted-text)' }}>Savings:</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-success)' }}>₹{Number(rec.savings).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted-text)' }}>Savings Rate:</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-dark-text)' }}>{rec.savingsRate !== null ? `${Number(rec.savingsRate).toFixed(2)}%` : 'N/A'}</div>
                </div>
              </div>

              {rec.notes && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted-text)', fontStyle: 'italic', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                  "{rec.notes}"
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Capture Snapshot */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Capture Monthly Financial Snapshot"
      >
        {formError && (
          <div style={{ marginBottom: '16px' }}>
            <Toast message={formError} type="error" />
          </div>
        )}

        <form onSubmit={handleCreateSnapshot} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Record Month (1-12)"
              type="number"
              name="recordMonth"
              value={formData.recordMonth}
              onChange={(e) => setFormData({ ...formData, recordMonth: e.target.value })}
              min="1"
              max="12"
              required
            />
            <Input
              label="Record Year"
              type="number"
              name="recordYear"
              value={formData.recordYear}
              onChange={(e) => setFormData({ ...formData, recordYear: e.target.value })}
              min="2000"
              max="2100"
              required
            />
          </div>

          <Input
            label="Snapshot Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Captured after monthly salary increment"
            startIcon={FileText}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Snapshot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Snapshot Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteSnapshot}
        title="Delete Monthly Snapshot"
        message="Are you sure you want to delete this historical monthly snapshot?"
        confirmText="Delete Snapshot"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default HistoryPage;
