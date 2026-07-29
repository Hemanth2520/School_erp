import { createCrudController } from './crudFactory.js';
import { Class, Subject, Attendance, Exam, ExamResult, ExamSchedule, GradeSetting, Merit, MeritAssignment, Timetable } from '../models/academics.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';
import { AppError } from '../utils/AppError.js';

export const classCrud = createCrudController(Class, {
  searchFields: ['name'],
  idField: 'customId',
});

export const subjectCrud = createCrudController(Subject, {
  searchFields: ['name', 'code'],
  idField: 'customId',
});

export const attendanceCrud = createCrudController(Attendance, {
  searchFields: ['studentName', 'rollNo', 'customId'],
  idField: 'customId',
});

export const examCrud = createCrudController(Exam, {
  searchFields: ['name'],
  idField: 'customId',
});

export const examResultCrud = createCrudController(ExamResult, {
  searchFields: ['studentName', 'customId'],
  idField: 'customId',
});

export const examScheduleCrud = createCrudController(ExamSchedule, {
  searchFields: ['examName', 'subject'],
  idField: 'customId',
});

export const gradeSettingCrud = createCrudController(GradeSetting, {
  searchFields: ['grade'],
  idField: 'customId',
});

export const meritCrud = createCrudController(Merit, {
  searchFields: ['name'],
  idField: 'customId',
});

export const meritAssignmentCrud = createCrudController(MeritAssignment, {
  searchFields: ['studentName'],
  idField: 'customId',
});

export const timetableCrud = createCrudController(Timetable, {
  searchFields: ['class'],
  idField: 'customId',
});

export const markAttendance = asyncHandler(async (req: any, res: Response) => {
  const { records } = req.body; // Expected: [{ studentId, status }]
  if (!Array.isArray(records) || !records.length) {
    throw new AppError('Attendance records are required', 400);
  }

  const results = await Promise.all(
    records.map(async (rec: any) => {
      return Attendance.create({
        ...rec,
        customId: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(),
      });
    })
  );

  res.status(201).json({
    success: true,
    data: results,
  });
});
