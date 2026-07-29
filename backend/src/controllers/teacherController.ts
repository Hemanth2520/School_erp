import { createCrudController } from './crudFactory.js';
import { Teacher } from '../models/people.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';

export const teacherCrud = createCrudController(Teacher, {
  searchFields: ['name', 'employeeId', 'email'],
  idField: 'customId',
});

export const getTeacherStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await Teacher.countDocuments();
  const active = await Teacher.countDocuments({ status: 'Active' });
  const onLeave = await Teacher.countDocuments({ status: 'On Leave' });

  res.json({
    success: true,
    data: {
      total,
      active,
      onLeave,
      subjectsCovered: 12, // This would be an aggregation of distinct subjects
    },
  });
});
