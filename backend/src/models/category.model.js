import { model } from 'mongoose';
import { CATEGORY_STATUS } from '../constants.js';
import { normalize } from '../utils/text.js';
import { createSchema } from './base.js';

const categorySchema = createSchema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  nameKey: { type: String, required: true, unique: true },
  status: { type: String, enum: CATEGORY_STATUS, default: 'Activa' },
});

categorySchema.pre('validate', function setNameKey() {
  this.nameKey = normalize(this.name);
});

categorySchema.statics.findByName = function findByName(name) {
  return this.findOne({ nameKey: normalize(name) });
};

export const Category = model('Category', categorySchema);
