import { STATUS_BADGE_CLASS, STATUS_LABELS } from '../../utils/format';

export function AttendanceBadge({ status }) {
  return <span className={STATUS_BADGE_CLASS[status] || 'badge'}>{STATUS_LABELS[status] || status}</span>;
}

export function SalaryStatusBadge({ status }) {
  const cls = `badge badge-status-${(status || '').toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}