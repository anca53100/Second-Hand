import { useEffect } from 'react';

export default function ConfirmModal({ title, children, confirmLabel, busy, error, onConfirm, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-sh" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sh__box" role="alertdialog" aria-modal="true"
           aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-body">
        <h2 id="confirm-modal-title">{title}</h2>
        <div id="confirm-modal-body" className="modal-sh__body">{children}</div>
        {error && <p className="auth__alert" role="alert">{error}</p>}
        <div className="form-actions mt-3">
          <button type="button" className="btn btn-sh-outline" onClick={onClose} autoFocus>Cancelar</button>
          <button type="button" className="btn btn-sh" onClick={onConfirm} disabled={busy}>
            {busy ? 'Guardando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
