import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function SetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.setupStatus()
      .then((res) => {
        if (res.setupComplete) navigate('/login', { replace: true });
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.setupAdmin({ ...form, role: 'Admin' });
      navigate('/login', { replace: true, state: { setupJustCompleted: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null;

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-brand">
          <span>🌹</span>
          <div>
            <div className="auth-brand-name">Trimurti Rose Nursery</div>
            <div className="auth-brand-sub">First-time setup</div>
          </div>
        </div>

        <h1 className="auth-title">Create the administrator account</h1>
        <p className="auth-subtitle">
          This runs once, when the database is empty. Afterward, sign in and create additional
          Admin or Supervisor accounts from the Users page.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" required value={form.username} onChange={(e) => update('username', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email (optional)</label>
            <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={6} required value={form.password} onChange={(e) => update('password', e.target.value)} />
            <span className="field-hint">At least 6 characters.</span>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create administrator account'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          Already set up? <Link to="/login">Back to sign in</Link>
        </p>
      </div>
      <div className="auth-art" aria-hidden="true" />
    </div>
  );
}