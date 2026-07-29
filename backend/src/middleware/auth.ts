import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import type { Role } from '../constants/roles.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string;
    name: string;
  };
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken as string | undefined;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;

    if (!token) throw new AppError('Authentication required', 401);

    const payload = verifyAccessToken(token);
    const user: any = await User.findById(payload.userId).select('+password');
    if (!user || !user.isActive) throw new AppError('Invalid or inactive user', 401);

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError('Invalid or expired token', 401));
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (roles.length && !roles.includes(req.user.role) && req.user.role !== 'super_admin') {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role,
      email: payload.email,
      name: payload.email.split('@')[0],
    };
  } catch {
    // ignore invalid optional token
  }
  next();
}
