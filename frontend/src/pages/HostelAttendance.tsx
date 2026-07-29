import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { students, hostels } from '../data/mockData';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const todayHostelAttendance = students.slice(0, 6).map((s, idx) => ({
  id: `HATT-${100 + idx}`,
  studentName: s.name,
  roomNo: `Room 10${idx + 1}`,
  hostelName: idx % 2 === 0 ? hostels[0].name : hostels[1].name,
  status: idx === 1 ? 'Absent' : idx === 3 ? 'Late' : 'Present',
  time: idx === 3 ? '09:45 PM' : '08:30 PM',
  date: new Date().toISOString().split('T')[0],
}));

type HAttRecord = typeof todayHostelAttendance[0];

const columns: ColumnDef<HAttRecord>[] = [
  { accessorKey: 'id', header: 'Record ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  {
    accessorKey: 'studentName',
    header: 'Hosteler Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('studentName') as string).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <p className="font-medium text-sm">{row.getValue('studentName')}</p>
      </div>
    ),
  },
  { accessorKey: 'hostelName', header: 'Hostel Block' },
  { accessorKey: 'roomNo', header: 'Room' },
  { accessorKey: 'time', header: 'Check-in Time' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.getValue('status')} /> },
];

export function HostelAttendance() {
  const present = todayHostelAttendance.filter(a => a.status === 'Present').length;
  const absent = todayHostelAttendance.filter(a => a.status === 'Absent').length;

  return (
    <div>
      <PageHeader title="Hostel Attendance" description="Daily night roll-call and hostel attendance records." onAdd={() => toast.success('Night Roll-Call Marked!')} addLabel="Mark Night Roll-Call" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Hostelers" value={todayHostelAttendance.length} icon={Users} description="today" />
        <StatCard title="Present in Rooms" value={present} icon={CheckCircle} iconColor="text-green-500" description="verified" />
        <StatCard title="Absent / Out of Campus" value={absent} icon={XCircle} iconColor="text-red-500" description="flagged" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={todayHostelAttendance} searchKey="studentName" searchPlaceholder="Search hosteler..." />
      </div>
    </div>
  );
}
