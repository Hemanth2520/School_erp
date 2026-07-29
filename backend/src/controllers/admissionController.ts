import { createCrudController } from './crudFactory.js';
import { Admission } from '../models/people.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';

export const admissionCrud = createCrudController(Admission, {
  searchFields: ['name', 'phone', 'email'],
  idField: 'customId',
});

export const getAdmissionStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await Admission.countDocuments();
  const approved = await Admission.countDocuments({ status: 'Approved' });
  const pending = await Admission.countDocuments({ status: 'Pending' });
  const rejected = await Admission.countDocuments({ status: 'Rejected' });

  res.json({
    success: true,
    data: {
      total,
      approved,
      pending,
      rejected,
    },
  });
});
