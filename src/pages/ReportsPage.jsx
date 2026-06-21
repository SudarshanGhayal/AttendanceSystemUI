import { useState, useEffect, useCallback } from 'react';
import { reportsApi, exportApi } from '../api/reportsApi';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import { formatCurrency, MONTH_NAMES } from '../utils/format';

const now = new Date();

export default function ReportsPage() {
  const toast = useToast();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState('attendance');
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [payrollReport, setPayrollReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [att, pay] = await Promise.all([
        reportsApi.getMonthlyAttendance(month, year),
        reportsApi.getPayroll(month, year),
      ]);
      setAttendanceReport(att);
      setPayrollReport(pay);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  async function handleExport(format) {
    try {
      if (format === 'excel') await exportApi.attendanceExcel(month, year);
      else await exportApi.attendancePdf(month, year);
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Monthly summaries</div>
          <h1 className="page-title">Reports</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => handleExport('excel')}>Export Excel</button>
          <button className="btn btn-outline" onClick={() => handleExport('pdf')}>Export PDF</button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className="filter-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn${tab === 'attendance' ? ' active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
        <button className={`tab-btn${tab === 'payroll' ? ' active' : ''}`} onClick={() => setTab('payroll')}>Payroll</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <Spinner />}

      {!loading && tab === 'attendance' && attendanceReport && (
        <div className="table-wrap">
          {attendanceReport.rows.length === 0 ? (
            <div className="empty-state"><h3>No data</h3><p>No active employees found.</p></div>
          ) : (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th className="num">Present</th>
                  <th className="num">Half</th>
                  <th className="num">Absent</th>
                  <th className="num">Leave</th>
                  <th className="num">Payable days</th>
                  <th className="num">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceReport.rows.map((r) => (
                  <tr key={r.employeeId}>
                    <td><strong>{r.employeeName}</strong> <span style={{ color: 'var(--color-ink-muted)', fontSize: 12 }}>({r.employeeCode})</span></td>
                    <td>{r.designation || '—'}</td>
                    <td className="num">{r.presentDays}</td>
                    <td className="num">{r.halfDays}</td>
                    <td className="num">{r.absentDays}</td>
                    <td className="num">{r.leaveDays}</td>
                    <td className="num">{r.totalPayableDays}</td>
                    <td className="num">{r.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!loading && tab === 'payroll' && payrollReport && (
        <>
          <div className="summary-grid" style={{ marginBottom: 20 }}>
            <div className="summary-card">
              <div className="summary-card-label">Employees paid</div>
              <div className="summary-card-value">{payrollReport.employeeCount}</div>
            </div>
            <div className="summary-card tone-present">
              <div className="summary-card-label">Total gross</div>
              <div className="summary-card-value">{formatCurrency(payrollReport.totalGrossSalary)}</div>
            </div>
            <div className="summary-card tone-absent">
              <div className="summary-card-label">Total deductions</div>
              <div className="summary-card-value">{formatCurrency(payrollReport.totalDeductions)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">Total net payroll</div>
              <div className="summary-card-value">{formatCurrency(payrollReport.totalNetSalary)}</div>
            </div>
          </div>

          <div className="table-wrap">
            {payrollReport.details.length === 0 ? (
              <div className="empty-state"><h3>No salary generated yet</h3><p>Generate salary from the Salary page for this month.</p></div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th className="num">Payable days</th>
                    <th className="num">Gross</th>
                    <th className="num">Deductions</th>
                    <th className="num">Net salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollReport.details.map((s) => (
                    <tr key={s.salaryId}>
                      <td><strong>{s.employeeName}</strong></td>
                      <td className="num">{s.totalPayableDays}</td>
                      <td className="num">{formatCurrency(s.grossSalary)}</td>
                      <td className="num">{formatCurrency(s.deductions)}</td>
                      <td className="num">{formatCurrency(s.netSalary)}</td>
                      <td>{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}