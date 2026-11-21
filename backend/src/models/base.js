import { randomUUID } from 'node:crypto';
import { Schema } from 'mongoose';

export function createSchema(fields) {
  return new Schema(
    { _id: { type: String, default: () => randomUUID() }, ...fields },
    { timestamps: true, versionKey: false, toObject: { virtuals: true }, toJSON: { virtuals: true } },
  );
}

export const belongsTo = (ref, localField) => ({ ref, localField, foreignField: '_id', justOne: true });
