import { Schema, model } from 'mongoose';

const classSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    sections: [String],
    students: { type: Number, default: 0 },
    classTeacher: { type: Schema.Types.Mixed },
    room: String,
    academicYear: String,
  },
  { timestamps: true }
);

export const Class = model('Class', classSchema);

const subjectSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    code: String,
    teacher: { type: Schema.Types.Mixed },
    teacherId: { type: Schema.Types.Mixed },
    classes: [{ type: Schema.Types.Mixed }],
    credits: Number,
    type: String,
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export const Subject = model('Subject', subjectSchema);

const attendanceSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    rollNo: String,
    class: { type: Schema.Types.Mixed },
    date: Date,
    status: String,
    subject: { type: Schema.Types.Mixed },
    rfidTag: String,
    markedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1, class: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });

export const Attendance = model('Attendance', attendanceSchema);

const examSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    class: { type: Schema.Types.Mixed },
    type: String,
    startDate: Date,
    endDate: Date,
    totalMarks: Number,
    passMarks: Number,
    status: String,
  },
  { timestamps: true }
);

export const Exam = model('Exam', examSchema);

const examResultSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    examId: { type: Schema.Types.Mixed },
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    class: { type: Schema.Types.Mixed },
    subject: { type: Schema.Types.Mixed },
    marksObtained: Number,
    totalMarks: Number,
    percentage: Number,
    grade: String,
    rank: Number,
  },
  { timestamps: true }
);

export const ExamResult = model('ExamResult', examResultSchema);

const examScheduleSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    examId: { type: Schema.Types.Mixed },
    examName: String,
    class: { type: Schema.Types.Mixed },
    subject: { type: Schema.Types.Mixed },
    date: Date,
    startTime: String,
    endTime: String,
    room: String,
    invigilator: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ExamSchedule = model('ExamSchedule', examScheduleSchema);

const gradeSettingSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    class: { type: Schema.Types.Mixed },
    grade: String,
    minPercentage: Number,
    maxPercentage: Number,
    remarks: String,
  },
  { timestamps: true }
);

export const GradeSetting = model('GradeSetting', gradeSettingSchema);

const meritSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: String,
    points: Number,
    description: String,
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export const Merit = model('Merit', meritSchema);

const meritAssignmentSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    meritId: { type: Schema.Types.Mixed },
    meritName: String,
    points: Number,
    date: Date,
    awardedBy: { type: Schema.Types.Mixed },
    remarks: String,
  },
  { timestamps: true }
);

export const MeritAssignment = model('MeritAssignment', meritAssignmentSchema);

const timetableSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    class: { type: Schema.Types.Mixed },
    section: String,
    day: String,
    period: { type: Schema.Types.Mixed },
    subject: { type: Schema.Types.Mixed },
    teacher: { type: Schema.Types.Mixed },
    room: String,
  },
  { timestamps: true }
);

export const Timetable = model('Timetable', timetableSchema);
