export const STATUS_LABELS = {
  P: 'Present',
  HD: 'Half Day',
  A: 'Absent',
  L: 'Leave',
};

export const STATUS_BADGE_CLASS = {
  P: 'badge badge-present',
  HD: 'badge badge-half',
  A: 'badge badge-absent',
  L: 'badge badge-leave',
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatCurrency(value) {
  const num = Number(value ?? 0);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

export function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}