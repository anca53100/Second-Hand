import Avatar from '../Avatar.jsx';
import Chip from '../Chip.jsx';

const STATUS_VARIANT = { Pendiente: 'yellow', Aceptada: 'green', Rechazada: 'red', Cancelada: 'grey', Entregada: 'green' };

export default function ReceivedRequestCard({ request, busy, onRespond, onDelete, onConfirm }) {
  const { id, requester, type, offeredTitle, itemTitle, itemImage, message, status, cancelledBy } = request;
  const past = status !== 'Pendiente' && status !== 'Rechazada';

  const action = type === 'Donación'
    ? (past ? 'pidió en donación' : 'pide en donación')
    : (past ? 'propuso un intercambio' : 'propone un intercambio');
  const subject = type === 'Intercambio' && offeredTitle ? `${itemTitle}, ofrece ${offeredTitle}` : itemTitle;
  const firstName = requester.name.split(' ')[0];

  return (
    <article className="req rcv">
      {itemImage
        ? <img className="rcv__img" src={itemImage} alt="" loading="lazy" />
        : <Avatar src={requester.photo} name={requester.name} size={56} />}

      <div className="req__body">
        <h2 className="req__title">
          {requester.name} {action} <span className="rcv__item">{subject}</span>
        </h2>
        {message && <p className="rcv__msg">“{message}”</p>}
        {status === 'Cancelada' && (
          <p className="rcv__status">{cancelledBy === 'requester' ? `${firstName} canceló la solicitud.` : 'Cancelaste esta entrega.'}</p>
        )}
      </div>

      <div className="req__actions">
        <Chip variant={STATUS_VARIANT[status]}>{status}</Chip>

        {status === 'Pendiente' && (
          <>
            <button type="button" className="btn btn-sh btn-sm" disabled={busy} onClick={() => onConfirm(request, 'Aceptada')}>Aceptar</button>
            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onRespond(id, 'Rechazada')}>Rechazar</button>
          </>
        )}
        {status === 'Rechazada' && (
          <>
            <button type="button" className="btn btn-sh btn-sm" disabled={busy} onClick={() => onDelete(id)}>Eliminar</button>
            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onRespond(id, 'Pendiente')}>Deshacer</button>
          </>
        )}
        {status === 'Aceptada' && (
          <>
            <button type="button" className="btn btn-sh btn-sm" disabled={busy} onClick={() => onConfirm(request, 'Entregada')}>Marcar como entregado</button>
            <button type="button" className="btn btn-danger-outline btn-sm" disabled={busy} onClick={() => onConfirm(request, 'Cancelada')}>Cancelar entrega</button>
            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onRespond(id, 'Pendiente')}>Deshacer</button>
          </>
        )}
        {status === 'Cancelada' && (
          <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onDelete(id)}>Eliminar</button>
        )}
      </div>
    </article>
  );
}
