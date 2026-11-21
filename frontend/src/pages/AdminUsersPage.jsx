import { useMemo, useState } from 'react';
import Chip from '../components/Chip.jsx';
import ConfirmModal from '../components/admin/ConfirmModal.jsx';
import MakeAdminForm from '../components/admin/MakeAdminForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useUsersAdmin from '../hooks/useUsersAdmin.js';
import { normalize } from '../utils/format.js';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { users, loading, error, busyId, toggleStatus, setRole } = useUsersAdmin();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('todos');
  const [role, setRoleFilter] = useState('todos');
  const [demoting, setDemoting] = useState(null);
  const [demoteError, setDemoteError] = useState(null);

  const filtered = useMemo(() => {
    const term = normalize(q.trim());
    return users.filter((u) =>
      (!term || normalize(`${u.name} ${u.email}`).includes(term)) &&
      (status === 'todos' || u.status === status) &&
      (role === 'todos' || u.role === role)
    );
  }, [users, q, status, role]);

  const askDemote = (user) => {
    setDemoteError(null);
    setDemoting(user);
  };

  const confirmDemote = async () => {
    setDemoteError(null);
    try {
      await setRole(demoting, 'user');
      setDemoting(null);
    } catch (err) {
      setDemoteError(err.message);
    }
  };

  return (
    <div className="page container-xl">
      <div className="page__head">
        <h1>Usuarios</h1>
        <p>Inactiva las cuentas que incumplen las normas de la comunidad y da permisos de administrador a quien te ayude a moderar.</p>
      </div>

      <div className="admin-toolbar">
        <input type="search" className="filters__control admin-toolbar__search" placeholder="Buscar por nombre o correo"
               aria-label="Buscar por nombre o correo" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="filters__control admin-toolbar__select" aria-label="Filtrar por estado"
                value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
        <MakeAdminForm me={me} onPromote={(user) => setRole(user, 'admin')} />
        <select className="filters__control admin-toolbar__select" aria-label="Filtrar por rol"
                value={role} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="todos">Todos los roles</option>
          <option value="user">Usuarios</option>
          <option value="admin">Administradores</option>
        </select>
      </div>

      {loading && <p role="status">Cargando usuarios…</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <div className="explore__empty"><p>No encontramos usuarios con esos criterios.</p></div>
      )}

      {filtered.length > 0 && (
        <div className="admin-card">
          <table className="admin-table admin-table--users">
            <thead>
              <tr>
                <th>Usuario</th><th>Correo</th><th>Ubicación</th><th>Publicaciones</th><th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isMe = u.id === me?.id;
                const busy = busyId === u.id;
                return (
                  <tr key={u.id}>
                    <td className="c-name">
                      {u.name}
                      {isMe && <span className="c-you"> (tú)</span>}
                      {u.role === 'admin' && <span className="role-badge">Admin</span>}
                    </td>
                    <td className="c-email">{u.email}</td>
                    <td className="c-loc">{u.location || 'Sin ubicación'}</td>
                    <td className="c-count">{u.publications}</td>
                    <td className="c-state"><Chip variant={u.status === 'Activo' ? 'green' : 'grey'}>{u.status}</Chip></td>
                    <td className="c-actions">
                      {u.isMainAdmin ? (
                        <span className="c-note">Cuenta principal</span>
                      ) : isMe ? (
                        <span className="c-note">Tu cuenta</span>
                      ) : (
                        <>
                          {u.role === 'admin' && (
                            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy}
                                    onClick={() => askDemote(u)}>Quitar admin</button>
                          )}
                          {u.status === 'Activo' ? (
                            <button type="button" className="btn btn-sh-outline btn-sm" disabled={busy}
                                    onClick={() => toggleStatus(u)}>Inactivar</button>
                          ) : (
                            <button type="button" className="btn btn-sh btn-sm" disabled={busy}
                                    onClick={() => toggleStatus(u)}>Reactivar</button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <p className="admin-toolbar__count" role="status">Mostrando {filtered.length} de {users.length}</p>
      )}

      {demoting && (
        <ConfirmModal
          title="Quitar permisos de administrador"
          confirmLabel="Quitar permisos"
          busy={busyId === demoting.id}
          error={demoteError}
          onConfirm={confirmDemote}
          onClose={() => setDemoting(null)}
        >
          <p>
            <strong>{demoting.name}</strong> dejará de ver el panel de administración y seguirá usando la tienda
            como cualquier usuario.
          </p>
        </ConfirmModal>
      )}
    </div>
  );
}
