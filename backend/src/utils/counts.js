import { Item } from '../models/item.model.js';
import { Request } from '../models/request.model.js';

export async function getUserStats(userId) {
  const [publications, requests] = await Promise.all([
    Item.countDocuments({ ownerId: userId }),
    Request.countDocuments({ requesterId: userId }),
  ]);
  return { publications, requests };
}

export async function countBy(Model, field, ids) {
  const rows = await Model.aggregate([
    { $match: { [field]: { $in: ids } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);
  const counts = new Map(ids.map((id) => [id, 0]));
  for (const row of rows) counts.set(row._id, row.count);
  return counts;
}
