import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ color: 'var(--color-ink-muted)', marginTop: 0 }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}