import { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import Spinner from '../common/Spinner';
import { MONTH_NAMES, daysInMonth } from '../../utils/format';

const STATUS_CELL_CLASS = { P: 'cell-present', HD: 'cell-half', A: 'cell-absent', L: 'cell-leave' };

export default function MonthlyAttendanceGrid() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    attendanceApi.getMonthlyGrid(month, year)
      .then((res) => { if (!cancelled) setRows(res); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [month, year]);

  const totalDays = daysInMonth(month, year);
  const dayList = Array.from({ length: totalDays }, (_, i) => i + 1);
  const currentYear = now.getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="card card-padded">
      <div className="sheet-toolbar">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="grid-month">Month</label>
          <select id="grid-month" className="filter-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="grid-year">Year</label>
          <select id="grid-year" className="filter-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="grid-legend" style={{ marginLeft: 'auto' }}>
          <span><i className="legend-swatch cell-present" /> Present</span>
          <span><i className="legend-swatch cell-half" /> Half Day</span>
          <span><i className="legend-swatch cell-absent" /> Absent</span>
          <span><i className="legend-swatch cell-leave" /> Leave</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="empty-state"><h3>No data</h3><p>No active employees or attendance records for this month.</p></div>
      ) : (
        <div className="table-wrap grid-scroll" style={{ marginTop: 16 }}>
          <table className="ledger-table grid-table">
            <thead>
              <tr>
                <th className="sticky-col">Employee</th>
                {dayList.map((d) => <th key={d} className="day-col">{d}</th>)}
                <th className="num">Payable</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.employeeId}>
                  <td className="sticky-col">
                    <strong>{row.employeeName}</strong>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>{row.employeeCode}</div>
                  </td>
                  {dayList.map((d) => {
                    const status = row.dayStatus[d];
                    return (
                      <td key={d} className={`day-col grid-cell ${status ? STATUS_CELL_CLASS[status] : ''}`}>
                        {status || ''}
                      </td>
                    );
                  })}
                  <td className="num">{row.totalPayableDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}