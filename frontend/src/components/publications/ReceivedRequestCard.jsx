import Avatar from '../Avatar.jsx';
import Chip from '../Chip.jsx';

const STATUS_VARIANT = { Pendiente: 'yellow', Aceptada: 'green', Rechazada: 'red' };

export default function ReceivedRequestCard({ request, busy, onRespond, onDelete }) {
  const { id, requester, type, offeredTitle, itemTitle, itemImage, message, status } = request;
  const accepted = status === 'Aceptada';

  const action = type === 'Donación'
    ? (accepted ? 'pidió en donación' : 'pide en donación')
    : (accepted ? 'propuso un intercambio' : 'propone un intercambio');
  const subject = type === 'Intercambio' && offeredTitle ? `${itemTitle}, ofrece ${offeredTitle}` : itemTitle;

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
      </div>

      <div className="req__actions">
        <Chip variant={STATUS_VARIANT[status]}>{status}</Chip>

        {status === 'Pendiente' && (
          <>
            <button type="button" className="btn btn-sh btn-sm" disabled={busy} onClick={() => onRespond(id, 'Aceptada')}>Aceptar</button>
            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onRespond(id, 'Rechazada')}>Rechazar</button>
          </>
        )}
        {status === 'Rechazada' && (
          <>
            <button type="button" className="btn btn-sh btn-sm" disabled={busy} onClick={() => onDelete(id)}>Eliminar</button>
            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onRespond(id, 'Pendiente')}>Deshacer</button>
          </>
        )}
        {accepted && (
          <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy} onClick={() => onRespond(id, 'Pendiente')}>Deshacer</button>
        )}
      </div>
    </article>
  );
}
