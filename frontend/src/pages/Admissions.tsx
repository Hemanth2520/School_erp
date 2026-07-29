import { type ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { GraduationCap, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiStats } from '../hooks/useApi';
import { useApiUpdate } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type Admission = {
  id: string;
  name: string;
  class: string;
  section: string;
  gender: string;
  source: string;
  date: string;
  status: string;
  parentName: string;
};

function admissionColumns(onApprove: (admission: Admission) => void, approvingId?: string): ColumnDef<Admission>[] {
  return [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'name',
    header: 'Student Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('name') as string).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
          <p className="text-xs text-muted-foreground">{row.original.parentName}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'class', header: 'Class' },
  { accessorKey: 'section', header: 'Section' },
  { accessorKey: 'gender', header: 'Gender' },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <span className="text-sm capitalize">{row.getValue('source')}</span>,
  },
  { accessorKey: 'date', header: 'Applied On' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <div className="flex items-center justify-end gap-2">
      {row.original.status !== 'Approved' && <button
        onClick={() => onApprove(row.original)}
        disabled={approvingId === row.original.id}
        className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {approvingId === row.original.id ? 'Approving…' : 'Approve'}
      </button>}
      <button
        onClick={() => toast(`Viewing ${row.original.name}`)}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`View ${row.original.name}`}
      ><Eye className="h-4 w-4" /></button>
    </div>,
  },
];
}

export function Admissions() {
  const { data: admissions = [], isLoading: loadingAdmissions, error } = useApiList<Admission>('admissions');
  const { data: stats, isLoading: loadingStats } = useApiStats('admissions');
  const navigate = useNavigate();
  const updateAdmission = useApiUpdate();
  const [approvingId, setApprovingId] = useState<string>();

  async function approveAdmission(admission: Admission) {
    setApprovingId(admission.id);
    try {
      await updateAdmission.mutateAsync({ path: 'admissions', id: admission.id, data: { status: 'Approved' } });
      toast.success(`${admission.name} has been approved`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Unable to approve this admission');
    } finally {
      setApprovingId(undefined);
    }
  }

  return (
    <div className={loadingAdmissions || loadingStats ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Admissions"
        description="Manage student admissions and applications."
        showImport
        addEnabled
        onAdd={() => navigate('/admissions/new')}
        addLabel="New Admission"
      />
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load admissions. Please sign in again or retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Applications" value={stats?.total || 0} icon={GraduationCap} description="this academic year" />
        <StatCard title="Approved" value={stats?.approved || 0} icon={CheckCircle} description="admissions confirmed" iconColor="text-green-500" />
        <StatCard title="Pending" value={stats?.pending || 0} icon={Clock} description="awaiting review" iconColor="text-yellow-600" />
        <StatCard title="Rejected" value={stats?.rejected || 0} icon={XCircle} description="not processed" iconColor="text-red-500" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={admissionColumns(approveAdmission, approvingId)} data={admissions} searchKey="name" searchPlaceholder="Search by student name..." />
      </div>
    </div>
  );
}
