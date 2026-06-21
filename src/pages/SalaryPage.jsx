import { useState, useEffect, useCallback } from 'react';
import { salaryApi } from '../api/salaryApi';
import { exportApi } from '../api/reportsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { SalaryStatusBadge } from '../components/common/StatusBadge';
import GenerateSalaryModal from '../components/salary/GenerateSalaryModal';
import { formatCurrency, MONTH_NAMES } from '../utils/format';

const now = new Date();

export default function SalaryPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [result, setResult] = useState({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await salaryApi.getAll({
        month, year, status: statusFilter || undefined, pageNumber, pageSize: 10,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year, statusFilter, pageNumber]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerate(payload) {
    setGenerating(true);
    try {
      const generated = await salaryApi.generate(payload);
      toast.success(`Salary generated for ${generated.length} employee(s).`);
      setShowGenerate(false);
      setMonth(payload.month);
      setYear(payload.year);
      setPageNumber(1);
      load();
    } finally {
      setGenerating(false);
    }
  }

  async function handleMarkPaid(salary) {
    try {
      await salaryApi.updateStatus(salary.salaryId, 'Paid');
      toast.success(`Marked ${salary.employeeName}'s salary as Paid.`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDownloadPayslip(salary) {
    try {
      await exportApi.payslipPdf(salary.salaryId, salary.employeeName);
    } catch (err) {
      toast.error('Could not download payslip: ' + err.message);
    }
  }

  async function handleExportExcel() {
    try {
      await exportApi.payrollExcel(month, year);
    } catch (err) {
      toast.error('Could not export payroll: ' + err.message);
    }
  }

  const totals = result.items.reduce(
    (acc, s) => ({ gross: acc.gross + s.grossSalary, net: acc.net + s.netSalary }),
    { gross: 0, net: 0 }
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Payroll ledger</div>
          <h1 className="page-title">Salary</h1>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <button className="btn btn-outline" onClick={handleExportExcel}>Export Excel</button>
            <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>Generate salary</button>
          </div>
        )}
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={month} onChange={(e) => { setMonth(Number(e.target.value)); setPageNumber(1); }}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className="filter-select" value={year} onChange={(e) => { setYear(Number(e.target.value)); setPageNumber(1); }}>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}>
          <option value="">All statuses</option>
          <option value="Generated">Generated</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <Spinner />
        ) : result.items.length === 0 ? (
          <div className="empty-state">
            <h3>No salary records for {MONTH_NAMES[month - 1]} {year}</h3>
            <p>Generate salary for this month once attendance has been marked.</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="num">Present</th>
                <th className="num">Half</th>
                <th className="num">Payable days</th>
                <th className="num">Gross</th>
                <th className="num">Deductions</th>
                <th className="num">Net salary</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((s) => (
                <tr key={s.salaryId}>
                  <td>
                    <strong>{s.employeeName}</strong>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{s.employeeCode} · {s.designation || '—'}</div>
                  </td>
                  <td className="num">{s.presentDays}</td>
                  <td className="num">{s.halfDays}</td>
                  <td className="num">{s.totalPayableDays}</td>
                  <td className="num">{formatCurrency(s.grossSalary)}</td>
                  <td className="num">{formatCurrency(s.deductions)}</td>
                  <td className="num"><strong>{formatCurrency(s.netSalary)}</strong></td>
                  <td><SalaryStatusBadge status={s.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDownloadPayslip(s)}>Payslip</button>
                      {isAdmin && s.status === 'Generated' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleMarkPaid(s)}>Mark paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ fontWeight: 700, borderTop: '2px solid var(--color-primary-dark)' }}>Page total</td>
                <td className="num" style={{ fontWeight: 700, borderTop: '2px solid var(--color-primary-dark)' }}>{formatCurrency(totals.gross)}</td>
                <td style={{ borderTop: '2px solid var(--color-primary-dark)' }}></td>
                <td className="num" style={{ fontWeight: 700, borderTop: '2px solid var(--color-primary-dark)' }}>{formatCurrency(totals.net)}</td>
                <td colSpan={2} style={{ borderTop: '2px solid var(--color-primary-dark)' }}></td>
              </tr>
            </tfoot>
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

      {showGenerate && (
        <GenerateSalaryModal
          defaultMonth={month}
          defaultYear={year}
          submitting={generating}
          onClose={() => setShowGenerate(false)}
          onSubmit={handleGenerate}
        />
      )}
    </div>
  );
}