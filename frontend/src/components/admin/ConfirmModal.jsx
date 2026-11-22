import { useEffect } from 'react';

export default function ConfirmModal({
  title, children, confirmLabel, cancelLabel = 'Cancelar', busyLabel = 'Guardando…',
  busy, error, danger = false, autoFocusCancel = true, onConfirm, onClose,
}) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!busy) onConfirm();
  };

  return (
    <div className="modal-sh" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal-sh__box field-light" role="alertdialog" aria-modal="true" noValidate onSubmit={handleSubmit}
            aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-body">
        <h2 id="confirm-modal-title">{title}</h2>
        <div id="confirm-modal-body" className="modal-sh__body">{children}</div>
        {error && <p className="auth__alert" role="alert">{error}</p>}
        <div className="form-actions mt-3">
          <button type="button" className="btn btn-sh-outline" onClick={onClose} autoFocus={autoFocusCancel}>{cancelLabel}</button>
          <button type="submit" className={`btn ${danger ? 'btn-danger-sh' : 'btn-sh'}`} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
