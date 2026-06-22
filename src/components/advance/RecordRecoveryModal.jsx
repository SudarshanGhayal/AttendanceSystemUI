import { useState } from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/format';

export default function RecordRecoveryModal({ advance, onClose, onSubmit, submitting }) {
  const pending = advance.amount - advance.recoveredAmount;
  const [amount, setAmount] = useState(pending.toFixed(2));
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const val = Number(amount);
    if (!val || val <= 0) return setError('Enter a valid recovery amount.');
    if (val > pending) return setError(`Cannot recover more than the pending balance of ${formatCurrency(pending)}.`);
    try {
      await onSubmit(advance.advanceId, val);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal title="Record advance recovery" onClose={onClose} width={400}>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--color-ink-muted)' }}>
        <strong style={{ color: 'var(--color-ink)' }}>{advance.employeeName}</strong><br />
        Original advance: {formatCurrency(advance.amount)}<br />
        Already recovered: {formatCurrency(advance.recoveredAmount)}<br />
        <strong>Pending: {formatCurrency(pending)}</strong>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="rec-amount">Recovery amount this instalment (₹)</label>
          <input
            id="rec-amount"
            type="number"
            min="0.01"
            step="0.01"
            max={pending}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="field-hint">Enter {formatCurrency(pending)} to mark the advance as fully recovered.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Record recovery'}
          </button>
        </div>
      </form>
    </Modal>
  );
}