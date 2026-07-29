import { createCrudController } from './crudFactory.js';
import { Student } from '../models/people.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';
import { AppError } from '../utils/AppError.js';

export const studentCrud = createCrudController(Student, {
  searchFields: ['name', 'rollNo', 'email'],
  idField: 'customId',
});

export const promoteStudents = asyncHandler(async (req: any, res: Response) => {
  const { studentIds, fromClass, toClass, academicYear } = req.body;
  if (!Array.isArray(studentIds) || !studentIds.length) {
    throw new AppError('Student IDs are required', 400);
  }

  const result = await Student.updateMany(
    { customId: { $in: studentIds } },
    {
      $set: {
        class: toClass,
        academicYear: academicYear
      }
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} students promoted successfully`,
    modifiedCount: result.modifiedCount,
  });
});

export const getStudentStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await Student.countDocuments();
  const active = await Student.countDocuments({ status: 'Active' });
  const inactive = await Student.countDocuments({ status: 'Inactive' });

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive,
      attendanceRate: '94%', // This would come from aggregation in production
    },
  });
});
