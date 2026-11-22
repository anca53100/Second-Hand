import { useState } from 'react';
import ConfirmModal from '../admin/ConfirmModal.jsx';
import ReceivedRequestCard from './ReceivedRequestCard.jsx';
import useReceivedRequests from '../../hooks/useReceivedRequests.js';

const othersText = (count) => (count === 1 ? 'La otra solicitud pendiente' : `Las otras ${count} solicitudes pendientes`);

const CONFIRMS = {
  Aceptada: {
    title: '¿Aceptar esta solicitud?',
    confirmLabel: 'Aceptar solicitud',
    body: ({ request, others }) => (
      <>
        <p>
          <strong>{request.itemTitle}</strong> pasará a «En proceso» y dejará de mostrarse en Explorar.
          {' '}{request.requester.name} verá tus datos de contacto para coordinar la entrega.
        </p>
        <p>
          {others > 0 && `${othersText(others)} de este artículo ${others === 1 ? 'queda' : 'quedan'} en espera. `}
          Si al final no se entrega, cancela la entrega y el artículo vuelve a estar disponible.
        </p>
      </>
    ),
  },
  Entregada: {
    title: '¿Ya entregaste el artículo?',
    confirmLabel: 'Marcar como entregado',
    body: ({ request }) => (
      <p>
        <strong>{request.itemTitle}</strong> quedará como entregado a {request.requester.name} y ya
        no recibirá solicitudes. Las demás solicitudes pendientes de este artículo se rechazarán.
      </p>
    ),
  },
  Cancelada: {
    title: '¿Cancelar la entrega?',
    confirmLabel: 'Cancelar entrega',
    danger: true,
    body: ({ request }) => (
      <p>
        La solicitud de {request.requester.name} quedará cancelada y <strong>{request.itemTitle}</strong> volverá
        a estar disponible para otras personas.
      </p>
    ),
  },
};

export default function ReceivedPanel() {
  const { items, loading, error, busyId, respond, remove } = useReceivedRequests();
  const [pending, setPending] = useState(null);
  const [confirmError, setConfirmError] = useState('');

  const askConfirm = (request, status) => { setConfirmError(''); setPending({ request, status }); };
  const closeConfirm = () => { if (busyId !== pending?.request.id) setPending(null); };

  const confirm = async () => {
    const failure = await respond(pending.request.id, pending.status, { quiet: true });
    if (failure) setConfirmError(failure);
    else setPending(null);
  };

  const config = pending && CONFIRMS[pending.status];
  const others = pending
    ? items.filter((r) => r.itemId === pending.request.itemId && r.status === 'Pendiente' && r.id !== pending.request.id).length
    : 0;

  return (
    <>
      {loading && <p role="status">Cargando solicitudes…</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}

      {!loading && items.length === 0 && (
        <div className="explore__empty"><p>Aún no has recibido solicitudes sobre tus artículos.</p></div>
      )}

      <div className="req-list">
        {items.map((r) => (
          <ReceivedRequestCard key={r.id} request={r} busy={busyId === r.id}
                               onRespond={respond} onDelete={remove} onConfirm={askConfirm} />
        ))}
      </div>

      {config && (
        <ConfirmModal
          title={config.title}
          confirmLabel={config.confirmLabel}
          busyLabel="Guardando…"
          cancelLabel="Volver"
          danger={Boolean(config.danger)}
          busy={busyId === pending.request.id}
          error={confirmError}
          onConfirm={confirm}
          onClose={closeConfirm}
        >
          {config.body({ request: pending.request, others })}
        </ConfirmModal>
      )}
    </>
  );
}
