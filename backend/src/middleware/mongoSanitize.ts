import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

function containsMongoOperator(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsMongoOperator);

  return Object.entries(value as Record<string, unknown>).some(([key, child]) =>
    key.startsWith('$') || key.includes('.') || containsMongoOperator(child)
  );
}

/**
 * Express 5 exposes req.query through a read-only getter, so the older
 * express-mongo-sanitize middleware crashes when it tries to replace it.
 * Reject operator-shaped input instead of mutating request properties.
 */
export function rejectMongoOperators(req: Request, _res: Response, next: NextFunction) {
  if (containsMongoOperator(req.body) || containsMongoOperator(req.query) || containsMongoOperator(req.params)) {
    return next(new AppError('Invalid request field', 400));
  }
  next();
}
