import crypto from 'crypto';
import type { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { AuditLog } from '../models/admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { AuthRequest } from '../middleware/auth.js';
import { ROLE_LABELS } from '../constants/roles.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

const cookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
});

function setAuthCookies(res: Response, accessToken: string, refreshToken: string, rememberMe = false) {
  res.cookie('accessToken', accessToken, { ...cookieOptions(rememberMe), maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, cookieOptions(rememberMe));
}

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, rememberMe } = loginSchema.parse(req.body);
  const user: any = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const payload = { userId: user._id.toString(), role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  user.rememberMe = rememberMe;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken, rememberMe);

  await AuditLog.create({
    userId: user._id.toString(),
    userName: user.name,
    action: 'LOGIN',
    module: 'auth',
    ip: req.ip,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: ROLE_LABELS[user.role as keyof typeof ROLE_LABELS],
      },
      accessToken,
    },
  });
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw new AppError('Refresh token required', 401);

  const payload = verifyRefreshToken(token);
  const user: any = await User.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

  const newPayload = { userId: user._id.toString(), role: user.role, email: user.email };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);
  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken, user.rememberMe);
  res.json({ success: true, accessToken });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'LOGOUT',
      module: 'auth',
      ip: req.ip,
    });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user: any = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: ROLE_LABELS[user.role as keyof typeof ROLE_LABELS],
      phone: user.phone,
      avatar: user.avatar,
    },
  });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const user: any = await User.findOne({ email: email.toLowerCase() }).select('+passwordResetToken +passwordResetExpires');
  if (!user) {
    return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  // In production, send email via nodemailer
  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = z.object({
    token: z.string(),
    password: z.string().min(8),
  }).parse(req.body);

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user: any = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  }).parse(req.body);

  const user: any = await User.findById(req.user!.id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});
