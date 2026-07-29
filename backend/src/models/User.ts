import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, type Role } from '../constants/roles.js';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  rememberMe?: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  profileRef?: string;
  profileType?: string;
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ROLES },
    phone: String,
    avatar: String,
    isActive: { type: Boolean, default: true },
    rememberMe: Boolean,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    profileRef: String,
    profileType: String,
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.method('comparePassword', async function comparePassword(this: any, candidate: string) {
  return bcrypt.compare(candidate, this.password);
});

export const User = model<any>('User', userSchema);
