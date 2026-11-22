import { CONDITIONS, LOCALITIES, MAX_ITEM_PHOTOS, MAX_ITEM_PHOTO_CHARS } from '../constants.js';
import { Category } from '../models/category.model.js';
import { Item } from '../models/item.model.js';
import { User } from '../models/user.model.js';
import { HttpError, throwIfErrors } from '../utils/HttpError.js';
import { ITEM_POPULATE, serializeItem } from '../utils/serializers.js';
import { escapeRegex, isImageDataUrl, normalize, toParagraphs } from '../utils/text.js';

const SORTS = {
  recent: { createdAt: -1, _id: 1 },
  oldest: { createdAt: 1, _id: 1 },
  title: { title: 1, _id: 1 },
};
const SPANISH = { locale: 'es' };

async function findItem(id) {
  const item = await Item.findById(String(id)).populate(ITEM_POPULATE);
  if (!item) throw new HttpError(404, 'No encontramos el artículo.');
  return item;
}

async function readItemInput(body = {}, current) {
  const title = String(body.title ?? '').trim();
  const categoryName = String(body.category ?? '').trim();
  const condition = String(body.condition ?? '');
  const descriptionText = Array.isArray(body.description) ? body.description.join('\n\n') : String(body.description ?? '');
  const location = String(body.location ?? '');
  const photos = [...new Set([body.photos ?? []].flat().filter((p) => typeof p === 'string' && p !== ''))];

  const category = categoryName ? await Category.findByName(categoryName) : null;
  const keepsCurrentCategory = current && category && current.categoryId === category.id;
  const newPhotos = photos.filter((p) => !current?.images.includes(p));

  let categoryError = '';
  if (!categoryName) categoryError = 'Selecciona una categoría.';
  else if (!category) categoryError = 'La categoría no existe.';
  else if (category.status !== 'Activa' && !keepsCurrentCategory) categoryError = 'La categoría está inactiva.';

  let photoError = '';
  if (!photos.length) photoError = 'Agrega al menos una fotografía del artículo.';
  else if (photos.length > MAX_ITEM_PHOTOS) photoError = `Puedes subir máximo ${MAX_ITEM_PHOTOS} fotografías.`;
  else if (!newPhotos.every(isImageDataUrl)) photoError = 'Solo se permiten imágenes JPG o PNG.';
  else if (newPhotos.some((p) => p.length > MAX_ITEM_PHOTO_CHARS)) photoError = 'Cada imagen debe pesar máximo 5 MB.';

  throwIfErrors({
    title: !title ? 'Este campo es obligatorio.' : title.length > 80 ? 'Máximo 80 caracteres.' : '',
    category: categoryError,
    condition: CONDITIONS.includes(condition) ? '' : 'Selecciona el estado.',
    description: descriptionText.trim().length >= 20 ? '' : 'Describe el artículo en al menos 20 caracteres.',
    location: LOCALITIES.includes(location) ? '' : 'Selecciona la ubicación de entrega.',
    photos: photoError,
  });

  return {
    title,
    categoryId: category.id,
    condition,
    description: toParagraphs(descriptionText),
    location,
    images: photos,
  };
}

function assertOwner(item, user) {
  if (item.ownerId !== user.id) throw new HttpError(403, 'Solo puedes modificar tus publicaciones.');
}

export async function listItems(query, viewer) {
  const text = (value) => (value === undefined ? '' : String(value).trim());
  const q = normalize(text(query.q));
  const categoryName = text(query.category);
  const location = text(query.location);
  const sort = query.sort ?? 'recent';
  if (!Object.hasOwn(SORTS, sort)) throw new HttpError(400, 'El orden debe ser recent, oldest o title.');

  const conditions = query.condition === undefined
    ? null
    : [query.condition].flat().flatMap((c) => String(c).split(',')).map((c) => c.trim());

  const filter = { status: 'Disponible', ownerId: { $nin: await User.distinct('_id', { status: 'Inactivo' }) } };
  if (q) filter.searchText = { $regex: escapeRegex(q) };
  if (categoryName) {
    const category = await Category.findByName(categoryName);
    if (!category) return { total: 0, items: [] };
    filter.categoryId = category.id;
  }
  if (conditions) filter.condition = { $in: conditions };
  if (location) filter.location = location;

  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 0, 0), 100);
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);

  const find = Item.find(filter, { images: { $slice: 1 } }).sort(SORTS[sort]).populate(ITEM_POPULATE);
  if (sort === 'title') find.collation(SPANISH);
  if (limit) find.skip((page - 1) * limit).limit(limit);

  const [total, items] = await Promise.all([Item.countDocuments(filter), find]);
  return {
    total,
    items: items.map((item) => serializeItem(item, viewer, { coverOnly: true })),
  };
}

export async function listMyItems(user) {
  const items = await Item.find({ ownerId: user.id }).sort(SORTS.recent).populate(ITEM_POPULATE);
  return items.map((item) => serializeItem(item, user));
}

export async function getItem(id, viewer) {
  const item = await findItem(id);
  const isOwner = viewer && item.ownerId === viewer.id;
  const hidden = item.status === 'Inactivo' || item.owner?.status === 'Inactivo';
  if (hidden && !isOwner && viewer?.role !== 'admin') {
    throw new HttpError(404, 'No encontramos el artículo.');
  }
  return serializeItem(item, viewer);
}

export async function createItem(body, user) {
  const item = await Item.create({ ...(await readItemInput(body)), ownerId: user.id });
  await item.populate(ITEM_POPULATE);
  return serializeItem(item, user);
}

export async function updateItem(id, body, user) {
  const item = await findItem(id);
  assertOwner(item, user);
  if (item.status === 'Entregado') throw new HttpError(409, 'Esta publicación ya fue entregada y no se puede editar.');

  item.set(await readItemInput(body, item));
  await item.save();
  await item.populate(ITEM_POPULATE);
  return serializeItem(item, user);
}

export async function setItemStatus(id, body, user) {
  const { status } = body ?? {};
  if (!['Disponible', 'Inactivo'].includes(status)) {
    throw new HttpError(400, 'El estado debe ser "Disponible" o "Inactivo".', { status: 'Estado no válido.' });
  }

  const item = await findItem(id);
  assertOwner(item, user);
  const updated = await Item.findOneAndUpdate(
    { _id: item.id, status: { $in: ['Disponible', 'Inactivo'] } },
    { status },
    { returnDocument: 'after' },
  ).populate(ITEM_POPULATE);
  if (!updated) {
    throw new HttpError(409, `No puedes activar ni inactivar una publicación en estado "${item.status}".`);
  }
  return serializeItem(updated, user);
}
