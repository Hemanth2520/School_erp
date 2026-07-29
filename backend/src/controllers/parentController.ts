import { createCrudController } from './crudFactory.js';
import { Parent } from '../models/people.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';

export const parentCrud = createCrudController(Parent, {
  searchFields: ['name', 'phone', 'email'],
  idField: 'customId',
});

export const getParentStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await Parent.countDocuments();
  res.json({
    success: true,
    data: {
      total,
    },
  });
});
