import { ADMIN_EMAIL, LOCALITIES, MAX_PROFILE_PHOTO_CHARS, ROLES, USER_STATUS } from '../constants.js';
import { Item } from '../models/item.model.js';
import { User } from '../models/user.model.js';
import { countBy, getUserStats } from '../utils/counts.js';
import { HttpError, throwIfErrors } from '../utils/HttpError.js';
import { serializeMe, serializeUserForAdmin } from '../utils/serializers.js';
import { isImageDataUrl, phoneDigits } from '../utils/text.js';

const countPublications = (userId) => Item.countDocuments({ ownerId: userId });

export async function getMe(user) {
  return serializeMe(user, await getUserStats(user.id));
}

export async function updateMe(user, body = {}) {
  const has = (field) => body[field] !== undefined;
  const changes = {};
  const errors = {};

  if (has('name')) {
    changes.name = String(body.name).trim();
    errors.name = changes.name ? '' : 'Este campo es obligatorio.';
  }
  if (has('phone')) {
    changes.phone = String(body.phone).trim();
    errors.phone = phoneDigits(changes.phone).length === 10 ? '' : 'El teléfono debe tener 10 dígitos.';
  }
  if (has('location')) {
    changes.location = String(body.location);
    errors.location = LOCALITIES.includes(changes.location) ? '' : 'Selecciona tu localidad.';
  }
  if (has('bio')) {
    changes.bio = String(body.bio ?? '').trim();
    errors.bio = changes.bio.length <= 300 ? '' : 'Máximo 300 caracteres.';
  }
  if (has('instagram')) {
    changes.instagram = String(body.instagram ?? '').trim();
    errors.instagram = changes.instagram.length <= 50 ? '' : 'Máximo 50 caracteres.';
  }
  if (has('photo')) {
    changes.photo = body.photo || null;
    if (changes.photo && !isImageDataUrl(changes.photo)) errors.photo = 'Selecciona una imagen (JPG o PNG).';
    else if (changes.photo && changes.photo.length > MAX_PROFILE_PHOTO_CHARS) errors.photo = 'La imagen debe pesar menos de 1 MB.';
  }
  throwIfErrors(errors);

  user.set(changes);
  await user.save();
  return serializeMe(user, await getUserStats(user.id));
}

export async function listUsers(query = {}) {
  const limit = Number.parseInt(query.limit, 10);
  const filter = query.email === undefined ? {} : { email: String(query.email).trim().toLowerCase() };
  const find = User.find(filter, { password: 0, photo: 0 }).sort({ createdAt: -1, _id: 1 });
  if (limit > 0) find.limit(limit);

  const users = await find;
  const publications = await countBy(Item, 'ownerId', users.map((user) => user.id));
  return users.map((user) => serializeUserForAdmin(user, publications.get(user.id)));
}

async function findManageableUser(id, actor, messages) {
  const user = await User.findById(String(id));
  if (!user) throw new HttpError(404, 'No encontramos al usuario.');
  if (user.id === actor.id) throw new HttpError(403, messages.self);
  if (user.email === ADMIN_EMAIL) throw new HttpError(403, messages.main);
  return user;
}

export async function setUserStatus(id, body, actor) {
  const { status } = body ?? {};
  if (!USER_STATUS.includes(status)) {
    throw new HttpError(400, 'El estado debe ser "Activo" o "Inactivo".', { status: 'Estado no válido.' });
  }

  const user = await findManageableUser(id, actor, {
    self: 'No puedes inactivar tu propia cuenta.',
    main: 'La cuenta principal del administrador no se puede inactivar.',
  });
  user.status = status;
  await user.save();
  return serializeUserForAdmin(user, await countPublications(user.id));
}

export async function setUserRole(id, body, actor) {
  const { role } = body ?? {};
  if (!ROLES.includes(role)) {
    throw new HttpError(400, 'El rol debe ser "user" o "admin".', { role: 'Rol no válido.' });
  }

  const user = await findManageableUser(id, actor, {
    self: 'No puedes cambiar tu propio rol.',
    main: 'La cuenta principal del administrador siempre es administradora.',
  });
  if (role === 'admin' && user.status !== 'Activo') {
    throw new HttpError(409, 'Esta cuenta está inactiva. Reactívala antes de hacerla administradora.');
  }
  user.role = role;
  await user.save();
  return serializeUserForAdmin(user, await countPublications(user.id));
}
