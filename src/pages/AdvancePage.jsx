import { useState, useEffect, useCallback } from 'react';
import { advanceApi } from '../api/advanceApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import GiveAdvanceModal from '../components/advance/GiveAdvanceModal';
import RecordRecoveryModal from '../components/advance/RecordRecoveryModal';
import { formatCurrency, formatDate } from '../utils/format';

export default function AdvancePage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [result, setResult] = useState({ items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const [showGive, setShowGive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(null); // advance object
  const [confirmDelete, setConfirmDelete] = useState(null); // advance object

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await advanceApi.getAll({ pendingOnly: pendingOnly || undefined, pageNumber, pageSize: 20 });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pendingOnly, pageNumber]);

  useEffect(() => { load(); }, [load]);

  async function handleGive(payload) {
    setSubmitting(true);
    try {
      await advanceApi.give(payload);
      toast.success('Advance recorded successfully.');
      setShowGive(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecovery(advanceId, recoveryAmount) {
    setSubmitting(true);
    try {
      await advanceApi.recordRecovery(advanceId, recoveryAmount);
      toast.success('Recovery recorded.');
      setRecovering(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await advanceApi.remove(confirmDelete.advanceId);
      toast.success('Advance deleted.');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(null);
    }
  }

  // Totals for current page
  const totals = result.items.reduce(
    (acc, a) => ({
      given: acc.given + a.amount,
      recovered: acc.recovered + a.recoveredAmount,
      pending: acc.pending + a.pendingAmount,
    }),
    { given: 0, recovered: 0, pending: 0 }
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Cash management</div>
          <h1 className="page-title">Advance Payments</h1>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowGive(true)}>+ Give advance</button>
          </div>
        )}
      </div>

      {/* Summary strip */}
      {!loading && result.items.length > 0 && (
        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          <div className="summary-card">
            <div className="summary-card-label">Total given (this page)</div>
            <div className="summary-card-value" style={{ fontSize: 22 }}>{formatCurrency(totals.given)}</div>
          </div>
          <div className="summary-card tone-present">
            <div className="summary-card-label">Recovered</div>
            <div className="summary-card-value" style={{ fontSize: 22 }}>{formatCurrency(totals.recovered)}</div>
          </div>
          <div className="summary-card tone-absent">
            <div className="summary-card-label">Still pending</div>
            <div className="summary-card-value" style={{ fontSize: 22 }}>{formatCurrency(totals.pending)}</div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => { setPendingOnly(e.target.checked); setPageNumber(1); }}
          />
          Pending (unrecovered) only
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <Spinner />
        ) : result.items.length === 0 ? (
          <div className="empty-state">
            <h3>No advance records found</h3>
            <p>{pendingOnly ? 'No pending advances. All advances have been fully recovered.' : 'No advances have been given yet.'}</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Reason</th>
                <th className="num">Amount given</th>
                <th className="num">Recovered</th>
                <th className="num">Pending</th>
                <th>Status</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {result.items.map((a) => (
                <tr key={a.advanceId}>
                  <td>
                    <strong>{a.employeeName}</strong>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>{a.employeeCode}</div>
                  </td>
                  <td>{formatDate(a.advanceDate)}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{a.reason || '—'}</td>
                  <td className="num">{formatCurrency(a.amount)}</td>
                  <td className="num">{formatCurrency(a.recoveredAmount)}</td>
                  <td className="num">
                    <strong style={{ color: a.pendingAmount > 0 ? 'var(--color-absent)' : 'var(--color-present)' }}>
                      {formatCurrency(a.pendingAmount)}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${a.isFullyRecovered ? 'badge-present' : 'badge-absent'}`}>
                      {a.isFullyRecovered ? 'Recovered' : 'Pending'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {!a.isFullyRecovered && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setRecovering(a)}>
                            Record recovery
                          </button>
                        )}
                        {a.recoveredAmount === 0 && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(a)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && result.items.length > 0 && (
          <Pagination
            pageNumber={result.pageNumber}
            pageSize={result.pageSize}
            totalCount={result.totalCount}
            totalPages={result.totalPages}
            onPageChange={setPageNumber}
          />
        )}
      </div>

      {showGive && (
        <GiveAdvanceModal
          submitting={submitting}
          onClose={() => setShowGive(false)}
          onSubmit={handleGive}
        />
      )}

      {recovering && (
        <RecordRecoveryModal
          advance={recovering}
          submitting={submitting}
          onClose={() => setRecovering(null)}
          onSubmit={handleRecovery}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete advance?"
          message={`Delete the ₹${confirmDelete.amount} advance given to ${confirmDelete.employeeName} on ${formatDate(confirmDelete.advanceDate)}? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}