import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Sidebar';

export function ProtectedRoute({ adminOnly }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}