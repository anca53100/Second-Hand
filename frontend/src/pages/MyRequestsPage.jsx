import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/admin/ConfirmModal.jsx';
import RequestCard from '../components/requests/RequestCard.jsx';
import useMyRequests from '../hooks/useMyRequests.js';

export default function MyRequestsPage() {
  const { items: requests, loading, error, cancel } = useMyRequests();
  const flash = useLocation().state?.message;
  const [cancelling, setCancelling] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const closeCancel = () => {
    if (cancelBusy) return;
    setCancelling(null);
    setCancelError('');
  };

  const confirmCancel = async () => {
    setCancelBusy(true);
    setCancelError('');
    try {
      await cancel(cancelling.id);
      setCancelling(null);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <div className="page container-xl">
      <div className="page__head">
        <h1>Mis solicitudes</h1>
        <p>Lo que has pedido a otros miembros y en qué va cada caso.</p>
      </div>

      {flash && <p className="auth__success" role="status">{flash}</p>}
      {loading && <p role="status">Cargando solicitudes…</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <div className="explore__empty">
          <p>Aún no has hecho solicitudes. Explora los artículos y pide el que necesites.</p>
          <Link to="/explorar" className="btn btn-sh btn-sm">Ir a Explorar</Link>
        </div>
      )}

      <div className="req-list">
        {requests.map((r) => <RequestCard key={r.id} request={r} onCancel={() => setCancelling(r)} />)}
      </div>

      {cancelling && (
        <ConfirmModal
          title="¿Cancelar esta solicitud?"
          confirmLabel="Cancelar solicitud"
          busyLabel="Cancelando…"
          cancelLabel="Volver"
          danger
          busy={cancelBusy}
          error={cancelError}
          onConfirm={confirmCancel}
          onClose={closeCancel}
        >
          {cancelling.status === 'Aceptada' ? (
            <p>
              {cancelling.counterpart} ya aceptó tu solicitud. Si cancelas, <strong>{cancelling.title}</strong> vuelve
              a quedar disponible para otras personas.
            </p>
          ) : (
            <p>
              Tu solicitud de <strong>{cancelling.title}</strong> quedará cancelada. Si cambias de opinión, puedes volver
              a pedirlo mientras siga disponible.
            </p>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
