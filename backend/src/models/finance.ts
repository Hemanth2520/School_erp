import { Schema, model } from 'mongoose';

const feeTypeSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    amount: Number,
    frequency: String,
    applicable: String,
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export const FeeType = model('FeeType', feeTypeSchema);

const feeStructureSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    class: { type: Schema.Types.Mixed },
    feeTypeId: { type: Schema.Types.Mixed },
    feeTypeName: String,
    amount: Number,
    academicYear: String,
  },
  { timestamps: true }
);

export const FeeStructure = model('FeeStructure', feeStructureSchema);

const transactionSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    student: String,
    studentId: { type: Schema.Types.Mixed },
    type: { type: Schema.Types.Mixed },
    amount: Number,
    date: Date,
    status: String,
    method: String,
    receiptNo: String,
    class: { type: Schema.Types.Mixed },
    remarks: String,
  },
  { timestamps: true }
);

transactionSchema.index({ date: 1 });
transactionSchema.index({ studentId: 1 });

export const Transaction = model('Transaction', transactionSchema);

const expenseSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    category: String,
    amount: Number,
    date: Date,
    paidBy: { type: Schema.Types.Mixed },
    vendor: String,
    method: String,
    status: String,
    approvedBy: { type: Schema.Types.Mixed },
    note: String,
  },
  { timestamps: true }
);

export const Expense = model('Expense', expenseSchema);

const payrollSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    employeeId: { type: Schema.Types.Mixed },
    employeeName: String,
    month: String,
    basicSalary: Number,
    hra: Number,
    ta: Number,
    deductions: Number,
    netSalary: Number,
    status: String,
    paidOn: Date,
  },
  { timestamps: true }
);

export const Payroll = model('Payroll', payrollSchema);

const pocketMoneySchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    class: { type: Schema.Types.Mixed },
    balance: Number,
    lastTransaction: Date,
    status: String,
  },
  { timestamps: true }
);

export const PocketMoney = model('PocketMoney', pocketMoneySchema);
