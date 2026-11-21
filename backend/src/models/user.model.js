import bcrypt from 'bcrypt';
import { model } from 'mongoose';
import { ROLES, USER_STATUS } from '../constants.js';
import { createSchema } from './base.js';

const SALT_ROUNDS = 10;

const userSchema = createSchema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  photo: { type: String, default: null },
  instagram: { type: String, default: '' },
  role: { type: String, enum: ROLES, default: 'user', index: true },
  status: { type: String, enum: USER_STATUS, default: 'Activo' },
  passwordResetHash: { type: String, default: null, index: true },
  passwordResetExpires: { type: Date, default: null },
  passwordResetRequestedAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
});

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: String(email).trim().toLowerCase() });
};

userSchema.methods.checkPassword = function checkPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = model('User', userSchema);
