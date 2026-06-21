import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/format';

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    authApi.getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Access control</div>
          <h1 className="page-title">Users</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add user</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? <Spinner /> : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td><strong>{u.fullName}</strong>{u.email && <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{u.email}</div>}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{u.username}</td>
                  <td><span className="badge badge-leave">{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? 'badge-present' : 'badge-absent'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AddUserModal
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load(); toast.success('User created.'); }}
        />
      )}
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', role: 'Supervisor' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.register(form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add new user" onClose={onClose} width={460}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="u-fullname">Full name</label>
          <input id="u-fullname" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="u-username">Username</label>
          <input id="u-username" required value={form.username} onChange={(e) => update('username', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="u-email">Email (optional)</label>
          <input id="u-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="u-password">Password</label>
          <input id="u-password" type="password" minLength={6} required value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="u-role">Role</label>
          <select id="u-role" value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="Supervisor">Supervisor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create user'}</button>
        </div>
      </form>
    </Modal>
  );
}