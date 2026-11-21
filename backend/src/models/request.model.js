import { model } from 'mongoose';
import { REQUEST_STATUS, REQUEST_TYPES } from '../constants.js';
import { belongsTo, createSchema } from './base.js';

const requestSchema = createSchema({
  itemId: { type: String, required: true, index: true },
  requesterId: { type: String, required: true },
  ownerId: { type: String, required: true },
  type: { type: String, enum: REQUEST_TYPES, required: true },
  offeredItemId: { type: String, default: null },
  offeredTitle: { type: String, default: null },
  message: { type: String, default: '' },
  status: { type: String, enum: REQUEST_STATUS, default: 'Pendiente' },
  acceptedAt: { type: Date, default: null },
  hiddenForOwner: { type: Boolean, default: false },
});

requestSchema.virtual('item', belongsTo('Item', 'itemId'));
requestSchema.virtual('owner', belongsTo('User', 'ownerId'));
requestSchema.virtual('requester', belongsTo('User', 'requesterId'));

requestSchema.index({ requesterId: 1, createdAt: -1 });
requestSchema.index({ ownerId: 1, createdAt: -1 });

export const Request = model('Request', requestSchema);
