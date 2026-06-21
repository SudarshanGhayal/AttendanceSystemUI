import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(true);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    authApi.setupStatus()
      .then((res) => setSetupComplete(res.setupComplete))
      .catch(() => setSetupComplete(true));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-brand">
          <RoseMark />
          <div>
            <div className="auth-brand-name">Trimurti Rose Nursery</div>
            <div className="auth-brand-sub">Employee Attendance &amp; Salary Records</div>
          </div>
        </div>

        <h1 className="auth-title">Sign in to the ledger</h1>
        <p className="auth-subtitle">Enter your credentials to mark attendance, manage staff, and run payroll.</p>

        {!setupComplete && (
          <div className="alert alert-success">
            No administrator account exists yet. <Link to="/setup">Set up the first admin account →</Link>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
      <div className="auth-art" aria-hidden="true">
        <FieldArt />
      </div>
    </div>
  );
}

function RoseMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#B5495B" strokeWidth="1.4" opacity="0.5" />
      <path d="M14 7c2.2 0 4 1.8 4 4 0 2.6-2 4.6-4 6.2-2-1.6-4-3.6-4-6.2 0-2.2 1.8-4 4-4z" fill="#B5495B" opacity="0.9" />
      <path d="M14 17.2V22" stroke="#3F7350" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FieldArt() {
  return (
    <svg viewBox="0 0 400 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="600" fill="#2F4538" />
      {Array.from({ length: 28 }).map((_, i) => {
        const x = 20 + (i % 7) * 55 + (Math.floor(i / 7) % 2 === 0 ? 0 : 27);
        const y = 60 + Math.floor(i / 7) * 130;
        return (
          <g key={i} transform={`translate(${x},${y})`} opacity={0.85}>
            <path d="M0 30V60" stroke="#7C9885" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="14" r="13" fill="#B5495B" opacity="0.92" />
            <circle cx="0" cy="14" r="6" fill="#D98A96" opacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
}