import { useEffect } from 'react';

export default function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={width ? { maxWidth: width } : undefined}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}