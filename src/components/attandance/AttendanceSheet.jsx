import { useState, useEffect, useMemo } from 'react';
import { employeeApi } from '../../api/employeeApi';
import { attendanceApi } from '../../api/attendanceApi';
import { useToast } from '../../context/ToastContext';
import Spinner from '../common/Spinner';
import { todayInput } from '../../utils/format';

const STATUS_OPTIONS = [
  { value: 'P', label: 'P', title: 'Present' },
  { value: 'HD', label: 'HD', title: 'Half Day' },
  { value: 'A', label: 'A', title: 'Absent' },
  { value: 'L', label: 'L', title: 'Leave' },
];

export default function AttendanceSheet() {
  const toast = useToast();

  const [date, setDate] = useState(todayInput());
  const [employees, setEmployees] = useState([]);
  const [entries, setEntries] = useState({}); // employeeId -> { status, remarks }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [emps, attendanceRes] = await Promise.all([
          employeeApi.getSummary(),
          attendanceApi.getAll({ fromDate: date, toDate: date, pageSize: 500 }),
        ]);
        if (cancelled) return;
        setEmployees(emps);

        const existingMap = {};
        attendanceRes.items.forEach((a) => { existingMap[a.employeeId] = a; });

        const initialEntries = {};
        emps.forEach((e) => {
          initialEntries[e.employeeId] = {
            status: existingMap[e.employeeId]?.status || 'P',
            remarks: existingMap[e.employeeId]?.remarks || '',
          };
        });
        setEntries(initialEntries);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [date]);

  function setStatus(employeeId, status) {
    setEntries((prev) => ({ ...prev, [employeeId]: { ...prev[employeeId], status } }));
  }

  function markAllPresent() {
    setEntries((prev) => {
      const next = { ...prev };
      employees.forEach((e) => { next[e.employeeId] = { ...next[e.employeeId], status: 'P' }; });
      return next;
    });
  }

  const summary = useMemo(() => {
    const counts = { P: 0, HD: 0, A: 0, L: 0 };
    Object.values(entries).forEach((e) => { if (counts[e.status] !== undefined) counts[e.status]++; });
    return counts;
  }, [entries]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payload = {
        attendanceDate: date,
        entries: employees.map((e) => ({
          employeeId: e.employeeId,
          status: entries[e.employeeId]?.status || 'P',
          remarks: entries[e.employeeId]?.remarks || null,
        })),
      };
      await attendanceApi.markBulk(payload);
      toast.success(`Attendance saved for ${employees.length} employee(s) on ${date}.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card card-padded">
      <div className="sheet-toolbar">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="sheet-date">Date</label>
          <input id="sheet-date" type="date" value={date} max={todayInput()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sheet-summary">
          <span><span className="badge badge-present">P</span> {summary.P}</span>
          <span><span className="badge badge-half">HD</span> {summary.HD}</span>
          <span><span className="badge badge-absent">A</span> {summary.A}</span>
          <span><span className="badge badge-leave">L</span> {summary.L}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={markAllPresent} disabled={loading || saving}>Mark all present</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save attendance'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Spinner />
      ) : employees.length === 0 ? (
        <div className="empty-state"><h3>No active employees</h3><p>Add employees first to mark attendance.</p></div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const entry = entries[emp.employeeId] || { status: 'P', remarks: '' };
                return (
                  <tr key={emp.employeeId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{emp.employeeCode}</td>
                    <td><strong>{emp.fullName}</strong></td>
                    <td>{emp.designation || '—'}</td>
                    <td>
                      <div className="status-toggle-group" role="radiogroup" aria-label={`Status for ${emp.fullName}`}>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            type="button"
                            key={opt.value}
                            role="radio"
                            aria-checked={entry.status === opt.value}
                            title={opt.title}
                            className={`status-toggle status-${opt.value.toLowerCase()}${entry.status === opt.value ? ' active' : ''}`}
                            onClick={() => setStatus(emp.employeeId, opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="optional"
                        className="remarks-input"
                        value={entry.remarks}
                        onChange={(e) =>
                          setEntries((prev) => ({ ...prev, [emp.employeeId]: { ...prev[emp.employeeId], remarks: e.target.value } }))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}