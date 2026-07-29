import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { MODULE_PERMISSIONS } from '../constants/roles.js';
import { Student, Teacher, Parent, Admission, Staff, Agent } from '../models/people.js';
import {
  Class, Subject, Attendance, Exam, ExamResult, ExamSchedule, GradeSetting, Merit, MeritAssignment, Timetable,
} from '../models/academics.js';
import { FeeType, FeeStructure, Transaction, Expense, Payroll, PocketMoney } from '../models/finance.js';
import {
  Hostel, HostelRoom, Hosteler, HostelAttendance, Book, BookIssue, LibraryMember,
  Bus, Route, Inventory, Supplier, InventoryIssue,
} from '../models/operations.js';
import {
  Notice, LeaveType, LeaveApplication, CertificateTemplate, GeneratedCertificate,
  Designation, Notification, Activity, StudentLeft, Settings,
} from '../models/admin.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { studentCrud, promoteStudents, getStudentStats } from '../controllers/studentController.js';
import { teacherCrud, getTeacherStats } from '../controllers/teacherController.js';
import { staffCrud, getStaffStats } from '../controllers/staffController.js';
import { admissionCrud, getAdmissionStats } from '../controllers/admissionController.js';
import { parentCrud, getParentStats } from '../controllers/parentController.js';
import { agentCrud, getAgentStats } from '../controllers/agentController.js';
import { feeTypeCrud, feeStructureCrud, transactionCrud, payrollCrud, pocketMoneyCrud, recordPayment } from '../controllers/financeController.js';
import { expenseCrud } from '../controllers/expenseController.js';
import {
  classCrud, subjectCrud, attendanceCrud, examCrud, examResultCrud,
  examScheduleCrud, gradeSettingCrud, meritCrud, meritAssignmentCrud,
  timetableCrud, markAttendance
} from '../controllers/academicController.js';
import {
  hostelCrud, hostelRoomCrud, hostelerCrud, hostelAttendanceCrud,
  bookCrud, bookIssueCrud, libraryMemberCrud, busCrud, routeCrud,
  inventoryCrud, supplierCrud, inventoryIssueCrud, driverCrud
} from '../controllers/operationController.js';
import {
  noticeCrud, leaveTypeCrud, leaveApplicationCrud, certificateTemplateCrud,
  generatedCertificateCrud, designationCrud, notificationCrud, activityCrud,
  studentLeftCrud, settingsCrud
} from '../controllers/adminController.js';
import { userCrud, toggleUserStatus, getUserStats } from '../controllers/userController.js';

function applyCrudRoutes(router: Router, path: string, controller: any, permissions: string[]) {
  const subRouter = Router();
  subRouter.use(authorize(...permissions as any));
  subRouter.get('/', controller.list);
  subRouter.get('/:id', controller.getById);
  subRouter.post('/', controller.create);
  subRouter.put('/:id', controller.update);
  subRouter.delete('/:id', controller.remove);
  subRouter.post('/bulk-delete', controller.bulkDelete);
  router.use(path, subRouter);
}

export const moduleRoutes = Router();
moduleRoutes.use(authenticate);

// Students
const studentsR = Router();
studentsR.use(authorize(...MODULE_PERMISSIONS.students));
studentsR.get('/stats', getStudentStats);
studentsR.post('/promote', promoteStudents);
studentsR.get('/', studentCrud.list);
studentsR.get('/:id', studentCrud.getById);
studentsR.post('/', studentCrud.create);
studentsR.put('/:id', studentCrud.update);
studentsR.delete('/:id', studentCrud.remove);
studentsR.post('/bulk-delete', studentCrud.bulkDelete);
moduleRoutes.use('/students', studentsR);

// Teachers
const teachersR = Router();
teachersR.use(authorize(...MODULE_PERMISSIONS.teachers));
teachersR.get('/stats', getTeacherStats);
teachersR.get('/', teacherCrud.list);
teachersR.get('/:id', teacherCrud.getById);
teachersR.post('/', teacherCrud.create);
teachersR.put('/:id', teacherCrud.update);
teachersR.delete('/:id', teacherCrud.remove);
moduleRoutes.use('/teachers', teachersR);

// Parents
const parentsR = Router();
parentsR.use(authorize(...MODULE_PERMISSIONS.parents));
parentsR.get('/stats', getParentStats);
parentsR.get('/', parentCrud.list);
parentsR.get('/:id', parentCrud.getById);
parentsR.post('/', parentCrud.create);
parentsR.put('/:id', parentCrud.update);
parentsR.delete('/:id', parentCrud.remove);
moduleRoutes.use('/parents', parentsR);

// Admissions
const admissionsR = Router();
admissionsR.use(authorize(...MODULE_PERMISSIONS.admissions));
admissionsR.get('/stats', getAdmissionStats);
admissionsR.get('/', admissionCrud.list);
admissionsR.get('/:id', admissionCrud.getById);
admissionsR.post('/', admissionCrud.create);
admissionsR.put('/:id', admissionCrud.update);
admissionsR.delete('/:id', admissionCrud.remove);
moduleRoutes.use('/admissions', admissionsR);

// Staff
const staffR = Router();
staffR.use(authorize(...MODULE_PERMISSIONS.staff));
staffR.get('/stats', getStaffStats);
staffR.get('/', staffCrud.list);
staffR.get('/:id', staffCrud.getById);
staffR.post('/', staffCrud.create);
staffR.put('/:id', staffCrud.update);
staffR.delete('/:id', staffCrud.remove);
moduleRoutes.use('/staff', staffR);

// Agents
const agentsR = Router();
agentsR.use(authorize(...MODULE_PERMISSIONS.agents));
agentsR.get('/stats', getAgentStats);
agentsR.get('/', agentCrud.list);
agentsR.get('/:id', agentCrud.getById);
agentsR.post('/', agentCrud.create);
agentsR.put('/:id', agentCrud.update);
agentsR.delete('/:id', agentCrud.remove);
moduleRoutes.use('/agents', agentsR);

// Classes
applyCrudRoutes(moduleRoutes, '/classes', classCrud, MODULE_PERMISSIONS.academics);

// Subjects
applyCrudRoutes(moduleRoutes, '/subjects', subjectCrud, MODULE_PERMISSIONS.academics);

// Attendance
const attR = Router();
attR.use(authorize(...MODULE_PERMISSIONS.academics));
attR.post('/mark', markAttendance);
attR.get('/', attendanceCrud.list);
attR.get('/:id', attendanceCrud.getById);
attR.post('/', attendanceCrud.create);
attR.put('/:id', attendanceCrud.update);
attR.delete('/:id', attendanceCrud.remove);
moduleRoutes.use('/attendance', attR);

// Exams
applyCrudRoutes(moduleRoutes, '/exams', examCrud, MODULE_PERMISSIONS.exams);
applyCrudRoutes(moduleRoutes, '/exam-results', examResultCrud, MODULE_PERMISSIONS.exams);
applyCrudRoutes(moduleRoutes, '/exam-schedules', examScheduleCrud, MODULE_PERMISSIONS.exams);
applyCrudRoutes(moduleRoutes, '/grade-settings', gradeSettingCrud, MODULE_PERMISSIONS.exams);

// Merit
applyCrudRoutes(moduleRoutes, '/merits', meritCrud, MODULE_PERMISSIONS.assessment);
applyCrudRoutes(moduleRoutes, '/merit-assignments', meritAssignmentCrud, MODULE_PERMISSIONS.assessment);

// Timetable
applyCrudRoutes(moduleRoutes, '/timetable', timetableCrud, MODULE_PERMISSIONS.academics);
applyCrudRoutes(moduleRoutes, '/timetables', timetableCrud, MODULE_PERMISSIONS.academics);

// Finance
applyCrudRoutes(moduleRoutes, '/fee-types', feeTypeCrud, MODULE_PERMISSIONS.fees);
applyCrudRoutes(moduleRoutes, '/fee-structures', feeStructureCrud, MODULE_PERMISSIONS.fees);

const transR = Router();
transR.use(authorize(...MODULE_PERMISSIONS.fees));
transR.post('/payment', recordPayment);
transR.get('/', transactionCrud.list);
transR.get('/:id', transactionCrud.getById);
transR.post('/', transactionCrud.create);
transR.put('/:id', transactionCrud.update);
transR.delete('/:id', transactionCrud.remove);
moduleRoutes.use('/transactions', transR);

// Expenses
const expR = Router();
expR.use(authorize(...MODULE_PERMISSIONS.fees));
expR.get('/', expenseCrud.list);
expR.get('/:id', expenseCrud.getById);
expR.post('/', expenseCrud.create);
expR.put('/:id', expenseCrud.update);
expR.delete('/:id', expenseCrud.remove);
moduleRoutes.use('/expenses', expR);

// Operation modules
applyCrudRoutes(moduleRoutes, '/hostels', hostelCrud, MODULE_PERMISSIONS.hostel);
applyCrudRoutes(moduleRoutes, '/hostel-rooms', hostelRoomCrud, MODULE_PERMISSIONS.hostel);
applyCrudRoutes(moduleRoutes, '/hostelers', hostelerCrud, MODULE_PERMISSIONS.hostel);
applyCrudRoutes(moduleRoutes, '/hostel-attendance', hostelAttendanceCrud, MODULE_PERMISSIONS.hostel);
applyCrudRoutes(moduleRoutes, '/books', bookCrud, MODULE_PERMISSIONS.library);
applyCrudRoutes(moduleRoutes, '/book-issues', bookIssueCrud, MODULE_PERMISSIONS.library);
applyCrudRoutes(moduleRoutes, '/library-members', libraryMemberCrud, MODULE_PERMISSIONS.library);
applyCrudRoutes(moduleRoutes, '/buses', busCrud, MODULE_PERMISSIONS.transport);
applyCrudRoutes(moduleRoutes, '/routes', routeCrud, MODULE_PERMISSIONS.transport);
applyCrudRoutes(moduleRoutes, '/inventory', inventoryCrud, MODULE_PERMISSIONS.inventory);
applyCrudRoutes(moduleRoutes, '/suppliers', supplierCrud, MODULE_PERMISSIONS.inventory);
applyCrudRoutes(moduleRoutes, '/inventory-issues', inventoryIssueCrud, MODULE_PERMISSIONS.inventory);
applyCrudRoutes(moduleRoutes, '/drivers', driverCrud, MODULE_PERMISSIONS.transport);

// Staff finance and student wallet records
applyCrudRoutes(moduleRoutes, '/payroll', payrollCrud, MODULE_PERMISSIONS.staff);
applyCrudRoutes(moduleRoutes, '/pocket-money', pocketMoneyCrud, MODULE_PERMISSIONS.students);

// Admin
applyCrudRoutes(moduleRoutes, '/notices', noticeCrud, MODULE_PERMISSIONS.notices);
applyCrudRoutes(moduleRoutes, '/leave-types', leaveTypeCrud, MODULE_PERMISSIONS.leaves);
applyCrudRoutes(moduleRoutes, '/leave-applications', leaveApplicationCrud, MODULE_PERMISSIONS.leaves);
applyCrudRoutes(moduleRoutes, '/certificate-templates', certificateTemplateCrud, MODULE_PERMISSIONS.documents);
applyCrudRoutes(moduleRoutes, '/generated-certificates', generatedCertificateCrud, MODULE_PERMISSIONS.documents);
applyCrudRoutes(moduleRoutes, '/designations', designationCrud, MODULE_PERMISSIONS.staff);
applyCrudRoutes(moduleRoutes, '/notifications', notificationCrud, MODULE_PERMISSIONS.dashboard);
applyCrudRoutes(moduleRoutes, '/activities', activityCrud, MODULE_PERMISSIONS.dashboard);
applyCrudRoutes(moduleRoutes, '/students-left', studentLeftCrud, MODULE_PERMISSIONS.students);
applyCrudRoutes(moduleRoutes, '/settings', settingsCrud, MODULE_PERMISSIONS.settings);

// User Management
const usersR = Router();
usersR.use(authorize(...MODULE_PERMISSIONS.users));
usersR.get('/stats', getUserStats);
usersR.get('/', userCrud.list);
usersR.get('/:id', userCrud.getById);
usersR.post('/', userCrud.create);
usersR.put('/:id', userCrud.update);
usersR.delete('/:id', userCrud.remove);
usersR.patch('/:id/status', toggleUserStatus);
moduleRoutes.use('/users', usersR);
