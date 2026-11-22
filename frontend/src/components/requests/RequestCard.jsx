import { Link } from 'react-router-dom';
import Chip from '../Chip.jsx';
import { formatDay } from '../../utils/format.js';

const STATUS_VARIANT = { Pendiente: 'yellow', Aceptada: 'green', Rechazada: 'red', Cancelada: 'grey', Entregada: 'green' };
const CANCELLABLE = ['Pendiente', 'Aceptada'];
const WITH_CONTACT = ['Aceptada', 'Entregada'];

export default function RequestCard({ request, onCancel }) {
  const { id, itemId, title, image, type, counterpart, date, status, note } = request;
  const verb = type === 'Donación' ? 'Donación pedida a' : 'Intercambio propuesto a';

  return (
    <article className="req">
      <img className="req__img" src={image} alt="" loading="lazy"
           onError={(e) => { e.currentTarget.removeAttribute('src'); }} />

      <div className="req__body">
        <h2 className="req__title">{title}</h2>
        <p className="req__meta">{verb} {counterpart} el {formatDay(date)}</p>
        <p className="req__note">{note}</p>
      </div>

      <div className="req__actions">
        <Chip variant={STATUS_VARIANT[status]}>{status}</Chip>
        {WITH_CONTACT.includes(status) && (
          <Link to={`/mis-solicitudes/${id}/contacto`} className="btn btn-sh-outline btn-sm">Ver contacto</Link>
        )}
        <Link to={`/articulos/${itemId}`} className="btn btn-sh-outline btn-sm">Ver</Link>
        {CANCELLABLE.includes(status) && (
          <button type="button" className="btn btn-danger-outline btn-sm" onClick={onCancel}>Cancelar solicitud</button>
        )}
      </div>
    </article>
  );
}
