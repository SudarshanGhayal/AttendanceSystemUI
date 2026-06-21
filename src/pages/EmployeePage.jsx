import { useState, useEffect, useCallback } from 'react';
import { employeeApi } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';
import { formatCurrency, formatDate } from '../utils/format';

export default function EmployeesPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [result, setResult] = useState({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const [editing, setEditing] = useState(null); // employee object or null
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { employee, action }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getAll({
        pageNumber,
        pageSize: 10,
        search: search || undefined,
        activeOnly,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, search, activeOnly]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(emp) {
    setEditing(emp);
    setShowForm(true);
  }

  async function handleFormSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing) {
        await employeeApi.update(editing.employeeId, payload);
        toast.success('Employee updated.');
      } else {
        await employeeApi.create(payload);
        toast.success('Employee added.');
      }
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmedAction() {
    if (!confirmTarget) return;
    const { employee, action } = confirmTarget;
    try {
      if (action === 'deactivate') await employeeApi.deactivate(employee.employeeId);
      if (action === 'activate') await employeeApi.activate(employee.employeeId);
      if (action === 'delete') await employeeApi.remove(employee.employeeId);
      toast.success(`Employee ${action === 'delete' ? 'deleted' : action + 'd'}.`);
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
      setConfirmTarget(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Staff register</div>
          <h1 className="page-title">Employees</h1>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={openCreate}>+ Add employee</button>
          </div>
        )}
      </div>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search by name, code, or designation…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
          className="filter-search"
        />
        <label className="filter-toggle">
          <input type="checkbox" checked={activeOnly} onChange={(e) => { setActiveOnly(e.target.checked); setPageNumber(1); }} />
          Active only
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <Spinner />
        ) : result.items.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Try adjusting your search, or add a new employee to get started.</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Joined</th>
                <th className="num">Daily wage</th>
                <th>Status</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {result.items.map((emp) => (
                <tr key={emp.employeeId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{emp.employeeCode}</td>
                  <td>
                    <strong>{emp.fullName}</strong>
                    {emp.phoneNumber && <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{emp.phoneNumber}</div>}
                  </td>
                  <td>{emp.designation || '—'}</td>
                  <td>{formatDate(emp.dateOfJoining)}</td>
                  <td className="num">{formatCurrency(emp.dailyWage)}</td>
                  <td>
                    <span className={`badge ${emp.isActive ? 'badge-present' : 'badge-absent'}`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                        {emp.isActive ? (
                          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmTarget({ employee: emp, action: 'deactivate' })}>
                            Deactivate
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmTarget({ employee: emp, action: 'activate' })}>
                            Activate
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

      {showForm && (
        <EmployeeFormModal
          employee={editing}
          submitting={submitting}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title={confirmTarget.action === 'delete' ? 'Delete employee?' : `${confirmTarget.action === 'activate' ? 'Activate' : 'Deactivate'} employee?`}
          message={`This applies to ${confirmTarget.employee.fullName}.`}
          confirmLabel={confirmTarget.action === 'delete' ? 'Delete' : 'Confirm'}
          danger={confirmTarget.action !== 'activate'}
          onConfirm={handleConfirmedAction}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}