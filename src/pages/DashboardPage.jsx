import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reportsApi';
import SummaryCard from '../components/dashboard/SummaryCard';
import BloomRing from '../components/dashboard/BloomRing';
import Spinner from '../components/common/Spinner';
import { formatCurrency } from '../utils/format';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">{today}</div>
          <h1 className="page-title">Today in the nursery</h1>
        </div>
        <div className="page-actions">
          <Link className="btn btn-primary" to="/attendance">Mark attendance →</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <Spinner />}

      {data && (
        <>
          <div className="summary-grid">
            <SummaryCard label="Active employees" value={data.activeEmployees} sub={`${data.totalEmployees} total on record`} />
            <SummaryCard label="Present today" value={data.presentToday} tone="present" />
            <SummaryCard label="Absent today" value={data.absentToday} tone="absent" />
            <SummaryCard label="Not yet marked" value={data.notMarkedToday} tone="muted" />
            <SummaryCard label="This month's payroll" value={formatCurrency(data.currentMonthPayroll)} sub={`Last month: ${formatCurrency(data.lastMonthPayroll)}`} />
          </div>

          <div className="dashboard-split">
            <div className="card card-padded">
              <h3 style={{ marginBottom: 4 }}>Today's attendance bloom</h3>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: 13, marginTop: 0 }}>
                Each petal of the ring is one status, sized by share of active staff.
              </p>
              <BloomRing
                present={data.presentToday}
                half={data.halfDayToday}
                absent={data.absentToday}
                leave={data.onLeaveToday}
                notMarked={data.notMarkedToday}
                total={data.activeEmployees}
              />
            </div>

            <div className="card card-padded">
              <h3 style={{ marginBottom: 12 }}>Recent activity</h3>
              {data.recentActivity?.length ? (
                <ul className="activity-list">
                  {data.recentActivity.map((a, i) => (
                    <li key={i}>
                      <span className="activity-dot" />
                      <div>
                        <div className="activity-desc">{a.description}</div>
                        <div className="activity-time">{new Date(a.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 14 }}>No activity recorded yet today.</p>
              )}

              <div className="vein-divider" />

              <div className="dashboard-stat-row">
                <span>Pending salary generations</span>
                <strong>{data.pendingSalaryGenerations}</strong>
              </div>
              {data.pendingSalaryGenerations > 0 && (
                <Link to="/salary" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
                  Generate salary →
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}