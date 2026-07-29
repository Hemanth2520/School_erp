import { createCrudController } from './crudFactory.js';
import { Staff } from '../models/people.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';

export const staffCrud = createCrudController(Staff, {
  searchFields: ['name', 'employeeId', 'designation'],
  idField: 'customId',
});

export const getStaffStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await Staff.countDocuments();
  const active = await Staff.countDocuments({ status: 'Active' });
  const inactive = await Staff.countDocuments({ status: 'Inactive' });

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive,
    },
  });
});
