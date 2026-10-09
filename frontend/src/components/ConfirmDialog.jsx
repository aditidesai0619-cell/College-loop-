import { useEffect, useRef } from 'react';
import Icon from './Icon';

// Themed confirmation dialog (replaces window.confirm). Uses the native <dialog> for focus + Esc handling.
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(e) => { e.preventDefault(); onCancel(); }}
      onClick={(e) => e.target === ref.current && onCancel()}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-body">
        <span className={`dialog-icon ${danger ? 'danger' : ''}`}><Icon name={danger ? 'trash' : 'alert'} size={20} /></span>
        <h3 id="dialog-title">{title}</h3>
        {message && <p className="muted">{message}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : ''}`} onClick={onConfirm} disabled={busy}>
            {busy ? <><span className="spinner sm" aria-hidden="true" /> Working…</> : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
