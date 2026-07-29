import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';

const createUserSchema = z.object({
  name: z.string().min(1), email: z.string().email(), password: z.string().min(8),
  role: z.enum(ROLES), phone: z.string().optional(), avatar: z.string().url().optional(),
});
const updateUserSchema = createUserSchema.omit({ password: true, role: true, email: true }).partial();

function safeUser(user: any) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role,
    phone: user.phone, avatar: user.avatar, isActive: user.isActive, lastLogin: user.lastLogin };
}

export const userCrud = {
  list: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users.map(safeUser) });
  }),
  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: safeUser(user) });
  }),
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = createUserSchema.parse(req.body);
    if (input.role === 'super_admin' && req.user?.role !== 'super_admin') {
      throw new AppError('Only a super admin can create another super admin', 403);
    }
    const user = await User.create(input);
    res.status(201).json({ success: true, data: safeUser(user) });
  }),
  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = updateUserSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: safeUser(user) });
  }),
  remove: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.id === req.params.id) throw new AppError('You cannot delete your own account', 400);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: 'Deleted successfully' });
  }),
};

export const toggleUserStatus = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user: any = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'super_admin' && req.user?.role !== 'super_admin') {
    throw new AppError('Only a super admin can change another super admin', 403);
  }

  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      isActive: user.isActive,
    },
  });
});

export const getUserStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await User.countDocuments();
  const active = await User.countDocuments({ isActive: true });

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive: total - active,
    },
  });
});
