import { REQUEST_STATUS, REQUEST_TYPES } from '../constants.js';
import { Item } from '../models/item.model.js';
import { Request } from '../models/request.model.js';
import { HttpError, throwIfErrors } from '../utils/HttpError.js';
import {
  MY_REQUEST_POPULATE, RECEIVED_REQUEST_POPULATE, serializeMyRequest, serializeReceivedRequest,
} from '../utils/serializers.js';

const TRANSITIONS = {
  owner: {
    Pendiente: ['Aceptada', 'Rechazada'],
    Aceptada: ['Pendiente', 'Cancelada', 'Entregada'],
    Rechazada: ['Pendiente'],
  },
  requester: {
    Pendiente: ['Cancelada'],
    Aceptada: ['Cancelada'],
  },
};

const ITEM_CHANGES = {
  'Pendiente>Aceptada': { from: 'Disponible', to: 'En proceso' },
  'Aceptada>Pendiente': { from: 'En proceso', to: 'Disponible' },
  'Aceptada>Cancelada': { from: 'En proceso', to: 'Disponible' },
  'Aceptada>Entregada': { from: 'En proceso', to: 'Entregado' },
};

const HIDEABLE = ['Rechazada', 'Cancelada'];

const NEWEST_FIRST = { createdAt: -1, _id: 1 };
const isId = (value) => typeof value === 'string' && value.trim() !== '';

export async function listMyRequests(user) {
  const requests = await Request.find({ requesterId: user.id }).sort(NEWEST_FIRST).populate(MY_REQUEST_POPULATE);
  return requests.map(serializeMyRequest);
}

export async function getMyRequest(id, user) {
  const request = await Request.findOne({ _id: String(id), requesterId: user.id }).populate(MY_REQUEST_POPULATE);
  if (!request) throw new HttpError(404, 'No encontramos la solicitud.');
  return serializeMyRequest(request);
}

export async function createRequest(body = {}, user) {
  const type = String(body.type ?? '');
  const message = String(body.message ?? '').trim();
  const isExchange = type === 'Intercambio';

  throwIfErrors({
    itemId: isId(body.itemId) ? '' : 'Indica el artículo que quieres pedir.',
    type: REQUEST_TYPES.includes(type) ? '' : 'El tipo debe ser "Donación" o "Intercambio".',
    offeredItemId: isExchange && !isId(body.offeredItemId) ? 'Elige el artículo que ofreces a cambio.' : '',
    message: message.length >= 10 ? '' : 'Escribe un mensaje (mínimo 10 caracteres).',
  });

  const item = await Item.findById(body.itemId).populate({ path: 'owner', select: 'status' });
  if (!item) throw new HttpError(404, 'No encontramos el artículo.');
  if (item.ownerId === user.id) throw new HttpError(400, 'No puedes enviarte una solicitud a ti mismo.');
  if (item.status !== 'Disponible' || item.owner?.status !== 'Activo') {
    throw new HttpError(409, 'Este artículo no está disponible.');
  }

  const pending = await Request.exists({ itemId: item.id, requesterId: user.id, status: 'Pendiente' });
  if (pending) throw new HttpError(409, 'Ya tienes una solicitud pendiente para este artículo.');

  let offered = null;
  if (isExchange) {
    offered = await Item.findOne({ _id: body.offeredItemId, ownerId: user.id, status: 'Disponible' });
    if (!offered) {
      throw new HttpError(400, 'El artículo que ofreces debe ser tuyo y estar disponible.', {
        offeredItemId: 'Elige uno de tus artículos disponibles.',
      });
    }
  }

  const request = await Request.create({
    itemId: item.id,
    requesterId: user.id,
    ownerId: item.ownerId,
    type,
    offeredItemId: offered?.id ?? null,
    offeredTitle: offered?.title ?? null,
    message,
  });
  await request.populate(MY_REQUEST_POPULATE);
  return serializeMyRequest(request);
}

export async function listReceivedRequests(user) {
  const requests = await Request.find({ ownerId: user.id, hiddenForOwner: false })
    .sort(NEWEST_FIRST)
    .populate(RECEIVED_REQUEST_POPULATE);
  return requests.map(serializeReceivedRequest);
}

async function findReceived(id, user) {
  const request = await Request.findOne({ _id: String(id), ownerId: user.id, hiddenForOwner: false });
  if (!request) throw new HttpError(404, 'No encontramos la solicitud.');
  return request;
}

async function explainFailedReservation(itemId) {
  const item = await Item.findById(itemId, { status: 1 });
  if (item?.status === 'Inactivo') return new HttpError(409, 'Activa la publicación antes de aceptar la solicitud.');
  if (item?.status === 'En proceso') return new HttpError(409, 'Esta publicación ya tiene una solicitud aceptada.');
  return new HttpError(409, 'Esta publicación ya no está disponible.');
}

export async function updateRequestStatus(id, body, user) {
  const next = body?.status;
  if (!REQUEST_STATUS.includes(next)) {
    throw new HttpError(400, `El estado debe ser uno de: ${REQUEST_STATUS.join(', ')}.`, { status: 'Estado no válido.' });
  }

  const request = await Request.findOne({
    _id: String(id),
    $or: [{ ownerId: user.id, hiddenForOwner: false }, { requesterId: user.id }],
  });
  if (!request) throw new HttpError(404, 'No encontramos la solicitud.');

  const role = request.ownerId === user.id ? 'owner' : 'requester';
  const previous = request.status;
  if (!TRANSITIONS[role][previous]?.includes(next)) {
    if (role === 'requester' && next !== 'Cancelada') {
      throw new HttpError(403, 'Solo quien publicó el artículo puede responder la solicitud.');
    }
    throw new HttpError(409, `No puedes pasar una solicitud de "${previous}" a "${next}".`);
  }

  const changes = { status: next };
  if (next === 'Aceptada') changes.acceptedAt = new Date();
  if (next === 'Pendiente') changes.acceptedAt = null;
  if (next === 'Cancelada') changes.cancelledBy = role;

  const itemChange = ITEM_CHANGES[`${previous}>${next}`];
  let itemChanged = false;
  if (itemChange) {
    const result = await Item.updateOne({ _id: request.itemId, status: itemChange.from }, { status: itemChange.to });
    itemChanged = result.modifiedCount > 0;
    if (!itemChanged && next === 'Aceptada') throw await explainFailedReservation(request.itemId);
    if (!itemChanged && next === 'Entregada') {
      throw new HttpError(409, 'La publicación cambió de estado. Recarga la página e intenta de nuevo.');
    }
  }

  const updated = await Request.findOneAndUpdate(
    { _id: request.id, status: previous },
    changes,
    { returnDocument: 'after' },
  ).populate(role === 'owner' ? RECEIVED_REQUEST_POPULATE : MY_REQUEST_POPULATE);

  if (!updated) {
    if (itemChanged) await Item.updateOne({ _id: request.itemId, status: itemChange.to }, { status: itemChange.from });
    throw new HttpError(409, 'La solicitud cambió mientras respondías. Recarga la página e intenta de nuevo.');
  }

  if (next === 'Entregada') {
    await Request.updateMany({ itemId: request.itemId, status: 'Pendiente' }, { status: 'Rechazada' });
  }

  return role === 'owner' ? serializeReceivedRequest(updated) : serializeMyRequest(updated);
}

export async function deleteReceivedRequest(id, user) {
  const request = await findReceived(id, user);
  if (!HIDEABLE.includes(request.status)) {
    throw new HttpError(409, 'Solo puedes eliminar solicitudes rechazadas o canceladas.');
  }

  await Request.updateOne({ _id: request.id }, { hiddenForOwner: true });
}
