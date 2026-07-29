import { createCrudController } from './crudFactory.js';
import { FeeType, FeeStructure, Transaction, Payroll, PocketMoney } from '../models/finance.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';
import { AppError } from '../utils/AppError.js';

export const feeTypeCrud = createCrudController(FeeType, {
  searchFields: ['name', 'description'],
  idField: 'customId',
});

export const feeStructureCrud = createCrudController(FeeStructure, {
  searchFields: ['academicYear'],
  idField: 'customId',
});

export const transactionCrud = createCrudController(Transaction, {
  searchFields: ['customId', 'student'],
  idField: 'customId',
});

export const payrollCrud = createCrudController(Payroll, { searchFields: ['employeeName', 'month'], idField: 'customId' });
export const pocketMoneyCrud = createCrudController(PocketMoney, { searchFields: ['studentName'], idField: 'customId' });

export const recordPayment = asyncHandler(async (req: any, res: Response) => {
  const { studentId, feeTypeId, amount, method, date } = req.body;

  if (!studentId || !feeTypeId || !amount) {
    throw new AppError('Missing required payment details', 400);
  }

  const transaction = await Transaction.create({
    customId: `TRX-${Date.now()}`,
    studentId,
    type: feeTypeId,
    amount,
    method,
    date: date || new Date(),
    status: 'Completed',
  });

  res.status(201).json({
    success: true,
    data: transaction,
  });
});
