import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expenseService } from '../services/expense.service.js';
import { useHousehold } from '../hooks/useHousehold.js';
import { useToast } from '../hooks/useToast.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import {
  Receipt,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  ShieldCheck,
  Tag,
  FileText
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'HOUSING', label: 'Housing / Rent' },
  { value: 'FOOD', label: 'Food & Groceries' },
  { value: 'UTILITIES', label: 'Utilities (Electricity, Water, Gas)' },
  { value: 'HEALTHCARE', label: 'Healthcare & Medical' },
  { value: 'EDUCATION', label: 'Education & Schooling' },
  { value: 'TRANSPORTATION', label: 'Transportation & Fuel' },
  { value: 'ENTERTAINMENT', label: 'Entertainment & Dining Out' },
  { value: 'CLOTHING', label: 'Clothing & Personal Care' },
  { value: 'DEBT', label: 'Debt Payments & EMIs' },
  { value: 'OTHER', label: 'Other Expenses' }
];

const ExpensesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectHousehold } = useHousehold();
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ totalExpenses: 0, essentialExpenses: 0, nonEssentialExpenses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: 'FOOD',
    amount: '',
    isEssential: true,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const householdId = parseInt(id, 10);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      selectHousehold(householdId);
      const res = await expenseService.getAll(householdId);
      setExpenses(res.data.expenses || []);
      setTotals(res.data.totals || { totalExpenses: 0, essentialExpenses: 0, nonEssentialExpenses: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [id]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      category: 'FOOD',
      amount: '',
      isEssential: true,
      description: ''
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      amount: exp.amount,
      isEssential: Boolean(exp.isEssential),
      description: exp.description || ''
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
    });
    if (formError) setFormError(null);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError('Expense amount must be greater than zero');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingExpense) {
        await expenseService.update(householdId, editingExpense.id, formData);
        showToast('Expense updated successfully', 'success');
      } else {
        await expenseService.create(householdId, formData);
        showToast('Expense added successfully', 'success');
      }
      setModalOpen(false);
      await fetchExpenses();
    } catch (err) {
      setFormError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await expenseService.delete(householdId, deleteTargetId);
      showToast('Expense deleted successfully', 'success');
      setDeleteTargetId(null);
      await fetchExpenses();
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <PageHeader
        title="Expense Manager"
        subtitle={`Household Profile ID #${householdId} • Itemized Spending & Category Categorization`}
        action={
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add New Expense
          </Button>
        }
      />

      {/* Expense Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard
          title="Total Expenses"
          value={`₹${Number(totals.totalExpenses).toLocaleString()}`}
          subtext="Monthly expenditure total"
          icon={Receipt}
          variant="peach"
        />
        <MetricCard
          title="Essential Expenses"
          value={`₹${Number(totals.essentialExpenses).toLocaleString()}`}
          subtext="Rent, groceries, utilities & health"
          icon={ShieldCheck}
          variant="pistachio"
        />
        <MetricCard
          title="Non-Essential Expenses"
          value={`₹${Number(totals.nonEssentialExpenses).toLocaleString()}`}
          subtext="Discretionary & entertainment"
          icon={Tag}
          variant="butter"
        />
      </div>

      {/* Itemized Expenses Table Card */}
      {loading ? (
        <Skeleton height="300px" borderRadius="var(--radius-lg)" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchExpenses} />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Expenses Added Yet"
          description="Itemize your monthly household expenses to calculate essential percentages and financial buffers."
          actionText="Add Expense"
          onAction={handleOpenAddModal}
        />
      ) : (
        <Card variant="default" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
              Itemized Expense Records ({expenses.length})
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-text)', fontWeight: '600' }}>
                  <th style={{ padding: '14px 24px' }}>Category</th>
                  <th style={{ padding: '14px 24px' }}>Description</th>
                  <th style={{ padding: '14px 24px' }}>Type</th>
                  <th style={{ padding: '14px 24px' }}>Amount (₹)</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'var(--transition-fast)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--color-dark-text)' }}>
                      <Badge variant="pistachio">{exp.category}</Badge>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-muted-text)' }}>
                      {exp.description || '—'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Badge variant={exp.isEssential ? 'success' : 'butter'}>
                        {exp.isEssential ? 'Essential' : 'Non-Essential'}
                      </Badge>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--color-dark-text)' }}>
                      ₹{Number(exp.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditModal(exp)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTargetId(exp.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Add New Expense Record'}
      >
        {formError && (
          <div style={{ marginBottom: '16px' }}>
            <Toast message={formError} type="error" />
          </div>
        )}

        <form onSubmit={handleSaveExpense} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Select
            label="Expense Category"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            options={CATEGORY_OPTIONS}
            required
          />

          <Input
            label="Expense Amount (₹)"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleFormChange}
            placeholder="e.g. 15000"
            min="0.01"
            step="0.01"
            required
            startIcon={DollarSign}
          />

          <Input
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="e.g. Monthly apartment rental payment"
            startIcon={FileText}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <input
              type="checkbox"
              id="isEssential"
              name="isEssential"
              checked={formData.isEssential}
              onChange={handleFormChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-dark-peach)', cursor: 'pointer' }}
            />
            <label htmlFor="isEssential" style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--color-dark-text)', cursor: 'pointer' }}>
              Mark as Essential Expenditure (Rent, Groceries, Medicine)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense Record"
        message="Are you sure you want to remove this expense record? Household analytics will be recalculated automatically."
        confirmText="Delete Expense"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default ExpensesPage;
