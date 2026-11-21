import { ADMIN_EMAIL, CITY } from '../constants.js';
import { toBogotaDate, toBogotaISO } from './dates.js';

const COVER_ONLY = { images: { $slice: 1 } };
export const ITEM_POPULATE = [
  { path: 'owner', select: 'name photo status' },
  { path: 'category', select: 'name' },
];
export const MY_REQUEST_POPULATE = [
  { path: 'item', select: { title: 1, ...COVER_ONLY } },
  { path: 'owner', select: '-password' },
];
export const RECEIVED_REQUEST_POPULATE = [
  { path: 'item', select: { title: 1, ...COVER_ONLY } },
  { path: 'requester', select: 'name photo' },
];

export function serializeMe(user, stats) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    photo: user.photo ?? null,
    instagram: user.instagram,
    role: user.role,
    status: user.status,
    memberSince: toBogotaDate(user.createdAt),
    stats,
  };
}

export function serializeUserForAdmin(user, publications) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location,
    publications,
    role: user.role,
    isMainAdmin: user.email === ADMIN_EMAIL,
    status: user.status,
    registeredAt: toBogotaDate(user.createdAt),
  };
}

export function serializeCategory(category, articleCount) {
  return { id: category.id, name: category.name, status: category.status, articleCount };
}

export function serializeItem(item, viewer, { coverOnly = false } = {}) {
  const { owner } = item;
  return {
    id: item.id,
    title: item.title,
    category: item.category?.name ?? null,
    condition: item.condition,
    location: item.location,
    description: item.description,
    images: coverOnly ? item.images.slice(0, 1) : item.images,
    image: item.images[0] ?? null,
    status: item.status,
    createdAt: toBogotaISO(item.createdAt),
    owner: {
      id: item.ownerId,
      name: owner?.name ?? 'Usuario',
      location: `${item.location}, ${CITY}`,
      photo: owner?.photo ?? null,
    },
    mine: Boolean(viewer && item.ownerId === viewer.id),
  };
}

const NOTES = {
  Pendiente: 'Esperando respuesta del donante. Recibirás una notificación cuando haya novedad.',
  Aceptada: 'Tu solicitud fue aceptada. Contacta al miembro para coordinar la entrega.',
  Rechazada: 'El artículo ya no está disponible o el donante no pudo atender tu solicitud.',
};

export function serializeMyRequest(request) {
  const { item, owner } = request;
  const data = {
    id: request.id,
    itemId: request.itemId,
    title: item?.title ?? '',
    image: item?.images[0] ?? null,
    type: request.type,
    counterpart: owner?.name ?? '',
    date: toBogotaDate(request.createdAt),
    status: request.status,
    note: NOTES[request.status],
    message: request.message,
    offeredTitle: request.offeredTitle ?? null,
  };
  if (request.status === 'Aceptada' && owner) {
    data.acceptedAt = toBogotaDate(request.acceptedAt);
    data.contact = {
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      location: owner.location,
      instagram: owner.instagram,
      photo: owner.photo ?? null,
      memberSince: toBogotaDate(owner.createdAt),
    };
  }
  return data;
}

export function serializeReceivedRequest(request) {
  const { item, requester } = request;
  return {
    id: request.id,
    itemId: request.itemId,
    itemTitle: item?.title ?? '',
    itemImage: item?.images[0] ?? null,
    requester: { id: request.requesterId, name: requester?.name ?? '', photo: requester?.photo ?? null },
    type: request.type,
    offeredTitle: request.offeredTitle ?? null,
    status: request.status,
    message: request.message,
    date: toBogotaDate(request.createdAt),
  };
}
