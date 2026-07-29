import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('Resource not found', 404));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  logger.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  return res.status(500).json({ success: false, message });
}
