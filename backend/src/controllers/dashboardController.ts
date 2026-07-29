import type { Response } from 'express';
import { Student } from '../models/people.js';
import { Teacher } from '../models/people.js';
import { Admission } from '../models/people.js';
import { Transaction } from '../models/finance.js';
import { Attendance } from '../models/academics.js';
import { Exam } from '../models/academics.js';
import { Notice } from '../models/admin.js';
import { Activity } from '../models/admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getDashboard = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    activeTeachers,
    pendingAdmissions,
    upcomingExams,
    publishedNotices,
    recentAdmissions,
    recentActivities,
    revenueAgg,
    attendanceAgg,
    admissionTrend,
    recentTransactions,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'Active' }),
    Teacher.countDocuments(),
    Teacher.countDocuments({ status: 'Active' }),
    Admission.countDocuments({ status: 'Pending' }),
    Exam.countDocuments({ status: { $in: ['Upcoming', 'Scheduled'] } }),
    Notice.countDocuments({ status: 'Published' }),
    Admission.find().sort({ createdAt: -1 }).limit(4).lean(),
    Activity.find().sort({ createdAt: -1 }).limit(5).lean(),
    Transaction.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Admission.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 5, 2] },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Transaction.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = revenueAgg.map((r: { _id: string; total: number }) => {
    const month = parseInt(r._id.split('-')[1] ?? '1', 10) - 1;
    return { name: monthNames[month] ?? r._id, total: r.total };
  });

  const present = attendanceAgg.find((a: { _id: string }) => a._id === 'Present')?.count ?? 0;
  const absent = attendanceAgg.find((a: { _id: string }) => a._id === 'Absent')?.count ?? 0;
  const totalAtt = present + absent || 1;
  const attendanceRate = Math.round((present / totalAtt) * 100);

  const totalRevenue = revenueAgg.reduce((sum: number, r: { total: number }) => sum + r.total, 0);
  const pendingFeesResult = await Student.aggregate([
    { $match: { feeStatus: { $ne: 'Paid' } } },
    { $count: 'count' },
  ]);
  const pendingFeeCount = pendingFeesResult[0]?.count ?? 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalRevenue: totalRevenue >= 1_000_000
          ? `₹${(totalRevenue / 1_000_000).toFixed(1)}M`
          : `₹${totalRevenue.toLocaleString('en-IN')}`,
        attendanceRate: `${attendanceRate}%`,
        pendingAdmissions,
        pendingFees: pendingFeeCount,
        upcomingExams,
        notices: publishedNotices,
        activeStudents,
        activeTeachers,
      },
      revenueData: revenueData.length ? revenueData : [
        { name: 'Jan', total: 0 }, { name: 'Feb', total: 0 }, { name: 'Mar', total: 0 },
      ],
      attendanceData: [
        { name: 'Mon', present: Math.round(attendanceRate * 0.98), absent: 100 - Math.round(attendanceRate * 0.98) },
        { name: 'Tue', present: attendanceRate, absent: 100 - attendanceRate },
        { name: 'Wed', present: Math.min(100, attendanceRate + 2), absent: Math.max(0, 100 - attendanceRate - 2) },
        { name: 'Thu', present: attendanceRate - 2, absent: 100 - attendanceRate + 2 },
        { name: 'Fri', present: attendanceRate - 5, absent: 100 - attendanceRate + 5 },
      ],
      admissionTrend: admissionTrend.map((a: { _id: string; count: number }) => ({
        name: monthNames[parseInt(a._id, 10) - 1] ?? a._id,
        count: a.count,
      })),
      recentAdmissions: recentAdmissions.map(a => ({
        ...a,
        id: a.customId,
      })),
      recentActivities: recentActivities.map(a => ({
        ...a,
        id: a.customId,
      })),
      recentTransactions: recentTransactions.map(t => ({
        ...t,
        id: t.customId,
      })),
    },
  });
});

export const globalSearch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) {
    return res.json({ success: true, data: { students: [], teachers: [], fees: [] } });
  }

  const [students, teachers, fees] = await Promise.all([
    Student.find({ $or: [{ name: new RegExp(q, 'i') }, { rollNo: new RegExp(q, 'i') }] }).limit(5).lean(),
    Teacher.find({ name: new RegExp(q, 'i') }).limit(5).lean(),
    Transaction.find({ $or: [{ student: new RegExp(q, 'i') }, { customId: new RegExp(q, 'i') }] }).limit(5).lean(),
  ]);

  res.json({
    success: true,
    data: {
      students: students.map(s => ({ ...s, id: s.customId })),
      teachers: teachers.map(t => ({ ...t, id: t.customId })),
      fees: fees.map(f => ({ ...f, id: f.customId })),
    },
  });
});
