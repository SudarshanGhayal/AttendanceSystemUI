import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeePage';
import AttendancePage from './pages/AttendancePage';
import SalaryPage from './pages/SalaryPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/salary" element={<SalaryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}