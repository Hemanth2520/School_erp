import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from './api/client';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Admissions } from './pages/Admissions';
import { AdmissionForm } from './pages/AdmissionForm';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Parents } from './pages/Parents';
import { Notices } from './pages/Notices';
import { CreateNotice } from './pages/CreateNotice';
import { Fees } from './pages/Fees';
import { FeeTypes } from './pages/FeeTypes';
import { FeeStructure } from './pages/FeeStructure';
import { Expenses } from './pages/Expenses';
import { Academics } from './pages/Academics';
import { ClassesPage } from './pages/ClassesPage';
import { Timetable } from './pages/Timetable';
import { Attendance } from './pages/Attendance';
import { PromoteStudents } from './pages/PromoteStudents';
import { PocketMoney } from './pages/PocketMoney';
import { StudentLeftList } from './pages/StudentLeftList';
import { Exams } from './pages/Exams';
import { ExamSchedule } from './pages/ExamSchedule';
import { ExamResults } from './pages/ExamResults';
import { GradeSettings } from './pages/GradeSettings';
import { Documents } from './pages/Documents';
import { GenerateIDCard } from './pages/GenerateIDCard';
import { Bonafide } from './pages/Bonafide';
import { Transport } from './pages/Transport';
import { Drivers } from './pages/Drivers';
import { Agents } from './pages/Agents';
import { CreateAgent } from './pages/CreateAgent';
import { Inventory } from './pages/Inventory';
import { Suppliers } from './pages/Suppliers';
import { IssueItems } from './pages/IssueItems';
import { Hostel } from './pages/Hostel';
import { HostelRooms } from './pages/HostelRooms';
import { Hostelers } from './pages/Hostelers';
import { HostelAttendance } from './pages/HostelAttendance';
import { LibraryPage } from './pages/LibraryPage';
import { BookIssues } from './pages/BookIssues';
import { LibraryMembers } from './pages/LibraryMembers';
import { Leaves } from './pages/Leaves';
import { Assessment } from './pages/Assessment';
import { MeritMarks } from './pages/MeritMarks';
import { Staff } from './pages/Staff';
import { Designations } from './pages/Designations';
import { Login } from './pages/Login';

function RequireAuth() {
  const { isPending, isError } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => (await apiClient.get('/auth/me')).data.data,
    retry: false,
  });
  if (isPending) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (isError) return <Navigate to="/login" replace />;
  return <MainLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Admissions */}
          <Route path="admissions" element={<Admissions />} />
          <Route path="admissions/new" element={<AdmissionForm />} />

          {/* Users */}
          <Route path="users/students" element={<Students />} />
          <Route path="users/teachers" element={<Teachers />} />
          <Route path="users/parents" element={<Parents />} />

          {/* Notices */}
          <Route path="notices" element={<Notices />} />
          <Route path="notices/new" element={<CreateNotice />} />

          {/* Fee Management */}
          <Route path="fees/transactions" element={<Fees />} />
          <Route path="fees/types" element={<FeeTypes />} />
          <Route path="fees/structure" element={<FeeStructure />} />
          <Route path="fees/expenses" element={<Expenses />} />

          {/* Academics */}
          <Route path="academics/subjects" element={<Academics />} />
          <Route path="academics/classes" element={<ClassesPage />} />
          <Route path="academics/timetable" element={<Timetable />} />
          <Route path="academics/attendance" element={<Attendance />} />
          <Route path="academics/leaves" element={<Leaves />} />

          {/* Students */}
          <Route path="students" element={<Students />} />
          <Route path="students/promote" element={<PromoteStudents />} />
          <Route path="students/pocket-money" element={<PocketMoney />} />
          <Route path="students/left" element={<StudentLeftList />} />

          {/* Exams */}
          <Route path="exams" element={<Exams />} />
          <Route path="exams/schedule" element={<ExamSchedule />} />
          <Route path="exams/results" element={<ExamResults />} />
          <Route path="exams/grades" element={<GradeSettings />} />

          {/* Documents */}
          <Route path="documents/certificates" element={<Documents />} />
          <Route path="documents/id-card" element={<GenerateIDCard />} />
          <Route path="documents/bonafide" element={<Bonafide />} />

          {/* Transport */}
          <Route path="transport/buses" element={<Transport />} />
          <Route path="transport/drivers" element={<Drivers />} />
          <Route path="transport/routes" element={<Transport />} />

          {/* Agents */}
          <Route path="agents" element={<Agents />} />
          <Route path="agents/new" element={<CreateAgent />} />

          {/* Inventory */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/suppliers" element={<Suppliers />} />
          <Route path="inventory/issue" element={<IssueItems />} />

          {/* Hostel */}
          <Route path="hostel" element={<Hostel />} />
          <Route path="hostel/rooms" element={<HostelRooms />} />
          <Route path="hostel/hostelers" element={<Hostelers />} />
          <Route path="hostel/attendance" element={<HostelAttendance />} />

          {/* Library */}
          <Route path="library/books" element={<LibraryPage />} />
          <Route path="library/issues" element={<BookIssues />} />
          <Route path="library/members" element={<LibraryMembers />} />

          {/* Leave Management */}
          <Route path="leaves/types" element={<Leaves />} />
          <Route path="leaves/applications" element={<Leaves />} />

          {/* Child Assessment */}
          <Route path="assessment/merits" element={<Assessment />} />
          <Route path="assessment/marks" element={<MeritMarks />} />

          {/* Staff */}
          <Route path="staff" element={<Staff />} />
          <Route path="staff/payroll" element={<Staff />} />
          <Route path="staff/designations" element={<Designations />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
