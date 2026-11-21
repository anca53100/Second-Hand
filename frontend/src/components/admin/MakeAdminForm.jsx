import { useState } from 'react';
import ConfirmModal from './ConfirmModal.jsx';
import { findUserByEmail } from '../../services/usersService.js';
import { formatDate } from '../../utils/format.js';
import { validateEmail } from '../../utils/validators.js';

export default function MakeAdminForm({ me, onPromote }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fail = (text) => setMessage({ type: 'error', text });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return fail('Escribe el correo de la persona.');
    const invalid = validateEmail(value);
    if (invalid) return fail(invalid);

    setMessage(null);
    setSearching(true);
    try {
      const user = await findUserByEmail(value);
      if (!user) return fail('No hay ninguna cuenta registrada con ese correo.');
      if (user.id === me?.id) return fail('Esa es tu cuenta: ya eres administrador.');
      if (user.role === 'admin') return fail(`${user.name} ya es administrador.`);
      if (user.status !== 'Activo') return fail('Esa cuenta está inactiva. Reactívala antes de hacerla administradora.');
      setModalError(null);
      setFound(user);
    } catch (err) {
      fail(err.message);
    } finally {
      setSearching(false);
    }
  };

  const confirm = async () => {
    setSaving(true);
    setModalError(null);
    try {
      await onPromote(found);
      setMessage({ type: 'success', text: `${found.name} ahora tiene permisos de administrador.` });
      setEmail('');
      setFound(null);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="make-admin">
      <form className="make-admin__box" onSubmit={handleSubmit} noValidate>
        <input type="email" className="make-admin__input" placeholder="Correo para hacer admin"
               aria-label="Correo de la persona que quieres hacer administrador" autoComplete="off"
               aria-invalid={message?.type === 'error'} aria-describedby={message ? 'make-admin-msg' : undefined}
               value={email} onChange={(e) => { setEmail(e.target.value); setMessage(null); }} />
        <button type="submit" className="btn btn-sh btn-sm make-admin__btn" disabled={searching}>
          {searching ? 'Buscando…' : 'Hacer admin'}
        </button>
      </form>
      {message && (
        <p id="make-admin-msg" className={`make-admin__msg make-admin__msg--${message.type}`}
           role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {found && (
        <ConfirmModal
          title="Verifica la cuenta"
          confirmLabel="Hacer administrador"
          busy={saving}
          error={modalError}
          onConfirm={confirm}
          onClose={() => setFound(null)}
        >
          <p>Revisa que sea la persona correcta antes de darle permisos de administrador.</p>
          <dl className="verify-list">
            <dt>Nombre</dt><dd>{found.name}</dd>
            <dt>Correo</dt><dd>{found.email}</dd>
            <dt>Ubicación</dt><dd>{found.location || 'Sin ubicación'}</dd>
            <dt>Registro</dt><dd>{formatDate(found.registeredAt)}</dd>
            <dt>Publicaciones</dt><dd>{found.publications}</dd>
          </dl>
          <p>Podrá entrar al panel, inactivar cuentas, gestionar categorías y dar o quitar permisos de administrador.</p>
        </ConfirmModal>
      )}
    </div>
  );
}
