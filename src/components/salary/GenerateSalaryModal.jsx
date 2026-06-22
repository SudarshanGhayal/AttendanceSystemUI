import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { employeeApi } from '../../api/employeeApi';
import { MONTH_NAMES } from '../../utils/format';

export default function GenerateSalaryModal({ onClose, onSubmit, submitting, defaultMonth, defaultYear }) {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [employeeId, setEmployeeId] = useState('');
  const [deductions, setDeductions] = useState('0');
  const [autoDeduct, setAutoDeduct] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    employeeApi.getSummary().then(setEmployees).catch(() => {});
  }, []);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        month: Number(month),
        year: Number(year),
        employeeId: employeeId ? Number(employeeId) : null,
        deductions: Number(deductions) || 0,
        autoDeductPendingAdvances: autoDeduct,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal title="Generate salary" onClose={onClose} width={460}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="gen-month">Month</label>
            <select id="gen-month" value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="gen-year">Year</label>
            <select id="gen-year" value={year} onChange={(e) => setYear(e.target.value)}>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="gen-employee">Employee</label>
          <select id="gen-employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">All active employees</option>
            {employees.map((e) => (
              <option key={e.employeeId} value={e.employeeId}>{e.fullName} ({e.employeeCode})</option>
            ))}
          </select>
          <span className="field-hint">Leave as "All active employees" to run payroll for everyone at once.</span>
        </div>

        <div className="field">
          <label htmlFor="gen-deductions">Additional flat deductions (₹)</label>
          <input id="gen-deductions" type="number" min="0" step="0.01" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
          <span className="field-hint">Applied on top of any advance auto-deduction below.</span>
        </div>

        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={autoDeduct}
              onChange={(e) => setAutoDeduct(e.target.checked)}
            />
            Auto-deduct pending advance balance
          </label>
          <span className="field-hint">
            If ticked, any unrecovered advance amounts will automatically be included as deductions in the salary calculation.
          </span>
        </div>

        <div className="alert" style={{ background: 'var(--color-surface-alt)', borderColor: 'var(--color-border)', color: 'var(--color-ink-muted)' }}>
          Formula: (Present Days × Daily Wage) + (Half Days × Daily Wage ÷ 2) − Pending Advances − Additional Deductions
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Generating…' : 'Generate salary'}
          </button>
        </div>
      </form>
    </Modal>
  );
}