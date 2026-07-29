import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Bell,
  CreditCard,
  BookOpen,
  ClipboardList,
  FileText,
  FileCheck,
  Bus,
  UserCheck,
  Package,
  Building2,
  Library,
  Calendar,
  Star,
  Briefcase,
  ChevronDown,
  ChevronRight,
  School,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Admissions', icon: GraduationCap,
    children: [
      { name: 'Admissions List', href: '/admissions' },
      { name: 'New Admission', href: '/admissions/new' },
    ],
  },
  {
    name: 'Users', icon: Users,
    children: [
      { name: 'Students', href: '/users/students' },
      { name: 'Teachers', href: '/users/teachers' },
      { name: 'Parents', href: '/users/parents' },
    ],
  },
  {
    name: 'Notices', icon: Bell,
    children: [
      { name: 'All Notices', href: '/notices' },
      { name: 'Create Notice', href: '/notices/new' },
    ],
  },
  {
    name: 'Fee Management', icon: CreditCard,
    children: [
      { name: 'Transactions', href: '/fees/transactions' },
      { name: 'Fee Types', href: '/fees/types' },
      { name: 'Fee Structure', href: '/fees/structure' },
      { name: 'Expenses', href: '/fees/expenses' },
    ],
  },
  {
    name: 'Academics', icon: BookOpen,
    children: [
      { name: 'Subjects', href: '/academics/subjects' },
      { name: 'Classes', href: '/academics/classes' },
      { name: 'Timetable', href: '/academics/timetable' },
      { name: 'Attendance', href: '/academics/attendance' },
      { name: 'Leave Requests', href: '/academics/leaves' },
    ],
  },
  {
    name: 'Students', icon: ClipboardList,
    children: [
      { name: 'Student List', href: '/students' },
      { name: 'Promote Students', href: '/students/promote' },
      { name: 'Pocket Money', href: '/students/pocket-money' },
      { name: 'Student Left', href: '/students/left' },
    ],
  },
  {
    name: 'Exams', icon: FileText,
    children: [
      { name: 'Exam List', href: '/exams' },
      { name: 'Exam Schedule', href: '/exams/schedule' },
      { name: 'Results', href: '/exams/results' },
      { name: 'Grade Settings', href: '/exams/grades' },
    ],
  },
  {
    name: 'Documents', icon: FileCheck,
    children: [
      { name: 'Certificates', href: '/documents/certificates' },
      { name: 'Generate ID Card', href: '/documents/id-card' },
      { name: 'Bonafide', href: '/documents/bonafide' },
    ],
  },
  {
    name: 'Transport', icon: Bus,
    children: [
      { name: 'Buses', href: '/transport/buses' },
      { name: 'Drivers', href: '/transport/drivers' },
      { name: 'Routes', href: '/transport/routes' },
    ],
  },
  {
    name: 'Agents', icon: UserCheck,
    children: [
      { name: 'All Agents', href: '/agents' },
      { name: 'Create Agent', href: '/agents/new' },
    ],
  },
  {
    name: 'Inventory', icon: Package,
    children: [
      { name: 'Stock', href: '/inventory' },
      { name: 'Suppliers', href: '/inventory/suppliers' },
      { name: 'Issue Items', href: '/inventory/issue' },
    ],
  },
  {
    name: 'Hostel', icon: Building2,
    children: [
      { name: 'Hostels', href: '/hostel' },
      { name: 'Rooms', href: '/hostel/rooms' },
      { name: 'Hostelers', href: '/hostel/hostelers' },
      { name: 'Attendance', href: '/hostel/attendance' },
    ],
  },
  {
    name: 'Library', icon: Library,
    children: [
      { name: 'Books', href: '/library/books' },
      { name: 'Issue Books', href: '/library/issues' },
      { name: 'Members', href: '/library/members' },
    ],
  },
  {
    name: 'Leave Mgmt', icon: Calendar,
    children: [
      { name: 'Leave Types', href: '/leaves/types' },
      { name: 'Applications', href: '/leaves/applications' },
    ],
  },
  {
    name: 'Child Assessment', icon: Star,
    children: [
      { name: 'Merits', href: '/assessment/merits' },
      { name: 'Merit Marks', href: '/assessment/marks' },
    ],
  },
  {
    name: 'Staff', icon: Briefcase,
    children: [
      { name: 'All Staff', href: '/staff' },
      { name: 'Payroll', href: '/staff/payroll' },
      { name: 'Designations', href: '/staff/designations' },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function NavItemComponent({ item }: { item: NavItem }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => {
    if (item.href) return false;
    return item.children?.some(c => location.pathname === c.href || location.pathname.startsWith(c.href + '/')) ?? false;
  });

  const isChildActive = item.children?.some(c => location.pathname === c.href || location.pathname.startsWith(c.href + '/'));

  if (item.href) {
    return (
      <NavLink
        to={item.href}
        end
        className={({ isActive }) => cn(
          'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        {({ isActive }) => (
          <>
            <item.icon className={cn('mr-3 h-4 w-4 flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
            {item.name}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isChildActive
            ? 'bg-primary/5 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        <item.icon className={cn('mr-3 h-4 w-4 flex-shrink-0 transition-colors', isChildActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1 text-left">{item.name}</span>
        {expanded
          ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-4">
          {item.children?.map(child => (
            <NavLink
              key={child.href}
              to={child.href}
              className={({ isActive }) => cn(
                'flex items-center rounded-md px-3 py-1.5 text-sm transition-all duration-150',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {child.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-card border-r border-border transition-transform duration-300 md:relative md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <School className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none tracking-tight">EduERP</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navigation.map(item => (
            <NavItemComponent key={item.name} item={item} />
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-card p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent cursor-pointer transition-colors">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">AD</span>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Admin User</p>
              <p className="text-xs text-muted-foreground mt-0.5">admin@school.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
