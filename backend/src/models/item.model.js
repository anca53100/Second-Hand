import { model } from 'mongoose';
import { CONDITIONS, ITEM_STATUS, LOCALITIES } from '../constants.js';
import { normalize } from '../utils/text.js';
import { belongsTo, createSchema } from './base.js';

const itemSchema = createSchema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  categoryId: { type: String, required: true, index: true },
  condition: { type: String, enum: CONDITIONS, required: true },
  location: { type: String, enum: LOCALITIES, required: true },
  description: { type: [String], default: [] },
  images: { type: [String], default: [] },
  status: { type: String, enum: ITEM_STATUS, default: 'Disponible' },
  ownerId: { type: String, required: true },
  searchText: { type: String, default: '' },
});

itemSchema.pre('validate', function setSearchText() {
  this.searchText = normalize(`${this.title} ${this.description.join(' ')}`);
});

itemSchema.virtual('owner', belongsTo('User', 'ownerId'));
itemSchema.virtual('category', belongsTo('Category', 'categoryId'));

itemSchema.index({ status: 1, createdAt: -1 });
itemSchema.index({ ownerId: 1, createdAt: -1 });

export const Item = model('Item', itemSchema);
