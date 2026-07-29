import { createCrudController } from './crudFactory.js';
import {
  Notice, LeaveType, LeaveApplication, CertificateTemplate, GeneratedCertificate,
  Designation, Notification, Activity, StudentLeft, Settings
} from '../models/admin.js';

export const noticeCrud = createCrudController(Notice, { searchFields: ['title'], idField: 'customId' });
export const leaveTypeCrud = createCrudController(LeaveType, { searchFields: ['name'], idField: 'customId' });
export const leaveApplicationCrud = createCrudController(LeaveApplication, { searchFields: ['applicantName'], idField: 'customId' });
export const certificateTemplateCrud = createCrudController(CertificateTemplate, { searchFields: ['name'], idField: 'customId' });
export const generatedCertificateCrud = createCrudController(GeneratedCertificate, { searchFields: ['studentName'], idField: 'customId' });
export const designationCrud = createCrudController(Designation, { searchFields: ['title'], idField: 'customId' });
export const notificationCrud = createCrudController(Notification, { searchFields: ['title'], idField: 'customId' });
export const activityCrud = createCrudController(Activity, { searchFields: ['text'], idField: 'customId' });
export const studentLeftCrud = createCrudController(StudentLeft, { searchFields: ['name'], idField: 'customId' });
export const settingsCrud = createCrudController(Settings, { searchFields: ['key'], idField: 'customId' });
