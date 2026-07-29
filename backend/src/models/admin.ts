import { Schema, model } from 'mongoose';

const noticeSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    content: String,
    category: String,
    targetAudience: String,
    date: Date,
    author: { type: Schema.Types.Mixed },
    priority: String,
    status: { type: String, default: 'Draft' },
  },
  { timestamps: true }
);

export const Notice = model('Notice', noticeSchema);

const leaveTypeSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    code: String,
    maxDays: Number,
    carryForward: Boolean,
    paidLeave: Boolean,
    applicableTo: String,
  },
  { timestamps: true }
);

export const LeaveType = model('LeaveType', leaveTypeSchema);

const leaveApplicationSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    applicantId: { type: Schema.Types.Mixed },
    applicantName: String,
    type: { type: Schema.Types.Mixed },
    startDate: Date,
    endDate: Date,
    days: Number,
    reason: String,
    status: { type: String, default: 'Pending' },
    approvedBy: { type: Schema.Types.Mixed },
    appliedOn: Date,
  },
  { timestamps: true }
);

export const LeaveApplication = model('LeaveApplication', leaveApplicationSchema);

const certificateTemplateSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    type: String,
    description: String,
    lastUsed: String,
    status: { type: String, default: 'Active' },
    templateUrl: String,
  },
  { timestamps: true }
);

export const CertificateTemplate = model('CertificateTemplate', certificateTemplateSchema);

const generatedCertificateSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    templateId: { type: Schema.Types.Mixed },
    templateName: String,
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    class: { type: Schema.Types.Mixed },
    generatedOn: Date,
    generatedBy: { type: Schema.Types.Mixed },
    serial: String,
    documentUrl: String,
  },
  { timestamps: true }
);

export const GeneratedCertificate = model('GeneratedCertificate', generatedCertificateSchema);

const designationSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    department: String,
    totalStaff: Number,
    gradePay: String,
    status: String,
  },
  { timestamps: true }
);

export const Designation = model('Designation', designationSchema);

const notificationSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.Mixed },
    title: String,
    message: String,
    type: String,
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

export const Notification = model('Notification', notificationSchema);

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.Mixed },
    userName: String,
    action: String,
    module: String,
    resourceId: String,
    details: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1 });

export const AuditLog = model('AuditLog', auditLogSchema);

const activitySchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    type: String,
    text: String,
    time: Date,
    icon: String,
    userId: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Activity = model('Activity', activitySchema);

const settingsSchema = new Schema(
  {
    key: { type: String, unique: true, required: true },
    value: Schema.Types.Mixed,
    category: String,
  },
  { timestamps: true }
);

export const Settings = model('Settings', settingsSchema);

const studentLeftSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    studentId: { type: Schema.Types.Mixed },
    name: String,
    class: { type: Schema.Types.Mixed },
    section: String,
    leftDate: Date,
    reason: String,
    tcIssued: { type: Boolean, default: false },
    tcNo: String,
    lastFee: String,
    pendingFees: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StudentLeft = model('StudentLeft', studentLeftSchema);
