import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { employeeApi } from '../../api/employeeApi';
import { todayInput } from '../../utils/format';

export default function GiveAdvanceModal({ onClose, onSubmit, submitting }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    amount: '',
    advanceDate: todayInput(),
    reason: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    employeeApi.getSummary().then(setEmployees).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.employeeId) return setError('Please select an employee.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid advance amount.');
    try {
      await onSubmit({
        employeeId: Number(form.employeeId),
        amount: Number(form.amount),
        advanceDate: form.advanceDate,
        reason: form.reason || null,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal title="Give advance to employee" onClose={onClose} width={460}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="adv-employee">Employee *</label>
          <select id="adv-employee" required value={form.employeeId} onChange={(e) => update('employeeId', e.target.value)}>
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.fullName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="adv-amount">Advance amount (₹) *</label>
            <input
              id="adv-amount"
              type="number"
              min="1"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="adv-date">Date *</label>
            <input
              id="adv-date"
              type="date"
              required
              max={todayInput()}
              value={form.advanceDate}
              onChange={(e) => update('advanceDate', e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="adv-reason">Reason (optional)</label>
          <input
            id="adv-reason"
            placeholder="e.g. Medical emergency, Festival advance…"
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
          />
        </div>
        <div className="alert" style={{ background: 'var(--color-surface-alt)', borderColor: 'var(--color-border)', color: 'var(--color-ink-muted)' }}>
          The pending balance of this advance will be auto-deducted the next time salary is generated for this employee.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Recording…' : 'Give advance'}
          </button>
        </div>
      </form>
    </Modal>
  );
}