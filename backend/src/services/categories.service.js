import { CATEGORY_STATUS } from '../constants.js';
import { Category } from '../models/category.model.js';
import { Item } from '../models/item.model.js';
import { countBy } from '../utils/counts.js';
import { HttpError } from '../utils/HttpError.js';
import { serializeCategory } from '../utils/serializers.js';
import { collapseSpaces } from '../utils/text.js';

const DUPLICATE = 'Ya existe una categoría con ese nombre.';

async function toJson(category) {
  return serializeCategory(category, await Item.countDocuments({ categoryId: category.id }));
}

async function readName(body, currentId) {
  const name = collapseSpaces(body?.name);
  if (!name) throw new HttpError(400, 'Escribe el nombre de la categoría.', { name: 'Escribe el nombre de la categoría.' });
  if (name.length > 40) throw new HttpError(400, 'Máximo 40 caracteres.', { name: 'Máximo 40 caracteres.' });

  const duplicate = await Category.findByName(name);
  if (duplicate && duplicate.id !== currentId) throw new HttpError(409, DUPLICATE);
  return name;
}

async function findCategory(id) {
  const category = await Category.findById(String(id));
  if (!category) throw new HttpError(404, 'No encontramos la categoría.');
  return category;
}

async function save(category) {
  try {
    return await category.save();
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, DUPLICATE);
    throw error;
  }
}

export async function listCategories(status) {
  if (status !== undefined && !CATEGORY_STATUS.includes(status)) {
    throw new HttpError(400, 'El filtro status debe ser "Activa" o "Inactiva".');
  }

  const categories = await Category.find(status ? { status } : {}).sort({ createdAt: 1, _id: 1 });
  const counts = await countBy(Item, 'categoryId', categories.map((c) => c.id));
  return categories.map((category) => serializeCategory(category, counts.get(category.id)));
}

export async function createCategory(body) {
  const category = await save(new Category({ name: await readName(body) }));
  return toJson(category);
}

export async function updateCategory(id, body) {
  const category = await findCategory(id);
  category.name = await readName(body, category.id);
  await save(category);
  return toJson(category);
}

export async function setCategoryStatus(id, body) {
  const { status } = body ?? {};
  if (!CATEGORY_STATUS.includes(status)) {
    throw new HttpError(400, 'El estado debe ser "Activa" o "Inactiva".', { status: 'Estado no válido.' });
  }

  const category = await findCategory(id);
  category.status = status;
  await category.save();
  return toJson(category);
}
