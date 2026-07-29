export const ROLES = [
  'super_admin',
  'school_admin',
  'principal',
  'vice_principal',
  'teacher',
  'class_teacher',
  'accountant',
  'hr',
  'librarian',
  'transport_manager',
  'hostel_warden',
  'parent',
  'student',
  'agent',
  'receptionist',
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  principal: 'Principal',
  vice_principal: 'Vice Principal',
  teacher: 'Teacher',
  class_teacher: 'Class Teacher',
  accountant: 'Accountant',
  hr: 'HR',
  librarian: 'Librarian',
  transport_manager: 'Transport Manager',
  hostel_warden: 'Hostel Warden',
  parent: 'Parent',
  student: 'Student',
  agent: 'Agent',
  receptionist: 'Receptionist',
};

export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  dashboard: ['super_admin', 'school_admin', 'principal', 'vice_principal', 'accountant', 'hr', 'receptionist'],
  admissions: ['super_admin', 'school_admin', 'principal', 'receptionist', 'agent'],
  students: ['super_admin', 'school_admin', 'principal', 'vice_principal', 'teacher', 'class_teacher', 'receptionist'],
  teachers: ['super_admin', 'school_admin', 'principal', 'hr'],
  parents: ['super_admin', 'school_admin', 'principal', 'receptionist'],
  notices: ['super_admin', 'school_admin', 'principal', 'vice_principal', 'teacher'],
  fees: ['super_admin', 'school_admin', 'accountant'],
  academics: ['super_admin', 'school_admin', 'principal', 'vice_principal', 'teacher', 'class_teacher'],
  exams: ['super_admin', 'school_admin', 'principal', 'teacher', 'class_teacher'],
  documents: ['super_admin', 'school_admin', 'principal', 'receptionist'],
  transport: ['super_admin', 'school_admin', 'transport_manager'],
  agents: ['super_admin', 'school_admin', 'receptionist'],
  inventory: ['super_admin', 'school_admin', 'hr'],
  hostel: ['super_admin', 'school_admin', 'hostel_warden'],
  library: ['super_admin', 'school_admin', 'librarian'],
  leaves: ['super_admin', 'school_admin', 'principal', 'hr', 'teacher'],
  assessment: ['super_admin', 'school_admin', 'principal', 'teacher', 'class_teacher'],
  staff: ['super_admin', 'school_admin', 'hr', 'accountant'],
  settings: ['super_admin', 'school_admin'],
  users: ['super_admin', 'school_admin'],
};

export function roleHasModuleAccess(role: Role, module: string): boolean {
  const allowed = MODULE_PERMISSIONS[module];
  if (!allowed) return role === 'super_admin';
  return allowed.includes(role) || role === 'super_admin';
}
