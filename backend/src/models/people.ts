import { Schema, model } from 'mongoose';

const studentSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    rollNo: String,
    class: { type: Schema.Types.Mixed },
    section: String,
    gender: String,
    dob: Date,
    phone: String,
    email: String,
    address: String,
    parentName: String,
    parentId: { type: Schema.Types.Mixed },
    status: { type: String, default: 'Active' },
    admissionDate: Date,
    feeStatus: { type: String, default: 'Pending' },
    photo: String,
    rfidTag: String,
    academicYear: String,
    leftDate: Date,
    leftReason: String,
    pocketMoneyBalance: { type: Number, default: 0 },
    hostelId: { type: Schema.Types.Mixed },
    roomId: { type: Schema.Types.Mixed },
    busId: { type: Schema.Types.Mixed },
    routeId: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

studentSchema.index({ name: 'text', rollNo: 'text', email: 'text' });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ status: 1 });

export const Student = model('Student', studentSchema);

const teacherSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    employeeId: String,
    subject: { type: Schema.Types.Mixed },
    qualification: String,
    experience: String,
    phone: String,
    email: String,
    gender: String,
    dob: Date,
    joinDate: Date,
    salary: Number,
    status: { type: String, default: 'Active' },
    classTeacher: { type: Schema.Types.Mixed },
    address: String,
    photo: String,
  },
  { timestamps: true }
);

teacherSchema.index({ name: 'text', employeeId: 'text' });

export const Teacher = model('Teacher', teacherSchema);

const parentSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    phone: String,
    email: String,
    occupation: String,
    address: String,
    students: [{ type: Schema.Types.Mixed }],
    annualIncome: String,
  },
  { timestamps: true }
);

export const Parent = model('Parent', parentSchema);

const admissionSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    class: String,
    section: String,
    date: Date,
    status: { type: String, default: 'Pending' },
    gender: String,
    dob: Date,
    parentName: String,
    phone: String,
    source: String,
    agent: { type: Schema.Types.Mixed },
    previousSchool: String,
    email: String,
    address: String,
  },
  { timestamps: true }
);

export const Admission = model('Admission', admissionSchema);

const staffSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    employeeId: String,
    designation: String,
    department: String,
    phone: String,
    email: String,
    joinDate: Date,
    salary: Number,
    status: { type: String, default: 'Active' },
    type: String,
  },
  { timestamps: true }
);

export const Staff = model('Staff', staffSchema);

const agentSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    area: String,
    commission: String,
    totalAdmissions: { type: Number, default: 0 },
    pendingPayment: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export const Agent = model('Agent', agentSchema);

const driverSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    license: String,
    phone: String,
    dob: Date,
    joinDate: Date,
    busId: { type: Schema.Types.Mixed },
    busNo: String,
    address: String,
    status: { type: String, default: 'Active' },
    experience: String,
  },
  { timestamps: true }
);

export const Driver = model('Driver', driverSchema);
