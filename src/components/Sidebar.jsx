import { NavLink } from 'react-router-dom';
import { useAuth } from './../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/employees', label: 'Employees', icon: EmployeesIcon },
  { to: '/attendance', label: 'Attendance', icon: AttendanceIcon },
  { to: '/salary', label: 'Salary', icon: SalaryIcon },
  { to: '/reports', label: 'Reports', icon: ReportsIcon },
  { to: '/advance', label: 'Advances', icon: AdvanceIcon },
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-mark" aria-hidden="true">
          <RoseMark />
        </span>
        <div>
          <div className="sidebar-brand-name">Trimurti Rose</div>
          <div className="sidebar-brand-sub">Nursery Records</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/users" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <UsersIcon />
            <span>Users</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="vein-divider" />
        <div className="sidebar-user">
          <div className="sidebar-avatar">{(user?.fullName || '?').charAt(0).toUpperCase()}</div>
          <div>
            <div className="sidebar-user-name">{user?.fullName}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-block" onClick={logout} style={{ marginTop: 8, justifyContent: 'flex-start' }}>
          <LogoutIcon /> Sign out
        </button>
      </div>
    </aside>
  );
}

function RoseMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="13" stroke="#B5495B" strokeWidth="1.4" opacity="0.5" />
      <path d="M14 7c2.2 0 4 1.8 4 4 0 2.6-2 4.6-4 6.2-2-1.6-4-3.6-4-6.2 0-2.2 1.8-4 4-4z" fill="#B5495B" opacity="0.9" />
      <path d="M14 17.2V22" stroke="#3F7350" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 19.5c-1.4 0-2.6-1-3-2.3M14 20.5c1.4 0 2.6-1 3-2.3" stroke="#3F7350" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function EmployeesIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function AttendanceIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="3" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 7h13" stroke="currentColor" strokeWidth="1.4"/><path d="M6 5V1.8M12 5V1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M6 10.2l1.5 1.5L11 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SalaryIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5.5v7M11 7.2c0-1-1-1.4-2-1.4-1.1 0-2 .5-2 1.4 0 2 4 1 4 3 0 .9-.9 1.4-2 1.4-1 0-2-.4-2-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function AdvanceIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M3 9l3-3M3 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="10" y="5" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function ReportsIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 15V8M8 15V3M13 15v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="6.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="13" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 16c0-2.5 2-4.5 4.5-4.5S11 13.5 11 16M11.5 16c0-1.9-.9-3.5-2.3-4.3.6-.4 1.4-.7 2.3-.7 2 0 3.5 1.6 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10.5 11l3-3-3-3M13.3 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}