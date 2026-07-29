import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type LeaveApp = {
  id?: string;
  applicantName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
  status: string;
};

type ApplyLeaveForm = {
  applicantName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const columns: ColumnDef<LeaveApp>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id || 'LEV-101'}</span> },
  {
    accessorKey: 'applicantName',
    header: 'Applicant',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('applicantName') as string || 'AP').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <p className="font-medium text-sm">{row.getValue('applicantName')}</p>
      </div>
    ),
  },
  { accessorKey: 'type', header: 'Leave Type' },
  { accessorKey: 'startDate', header: 'From' },
  { accessorKey: 'endDate', header: 'To' },
  { accessorKey: 'days', header: 'Days', cell: ({ row }) => <span className="font-semibold">{row.getValue('days')}</span> },
  { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => <span className="text-sm text-muted-foreground line-clamp-1">{row.getValue('reason')}</span> },
  { accessorKey: 'appliedOn', header: 'Applied On' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Pending'} /> },
];

export function Leaves() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: leaveApplications = [], isLoading: loadingLeaves } = useApiList<LeaveApp>('leave-applications');
  const createLeave = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplyLeaveForm>();

  const onSubmit = async (data: ApplyLeaveForm) => {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await createLeave.mutateAsync({
        path: 'leave-applications',
        data: {
          ...data,
          days: diffDays,
          status: 'Pending',
          appliedOn: new Date().toISOString().split('T')[0],
        },
      });
      toast.success('Leave application submitted!');
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to submit leave application');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={`space-y-8 ${loadingLeaves ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader title="Leave Management" description="Manage leave applications and approvals." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Apply Leave" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Applications" value={leaveApplications.length} icon={Calendar} description="this year" />
        <StatCard title="Approved" value={leaveApplications.filter(l => l.status === 'Approved').length} icon={CheckCircle} iconColor="text-green-500" description="leaves" />
        <StatCard title="Pending" value={leaveApplications.filter(l => l.status === 'Pending').length} icon={Clock} iconColor="text-yellow-600" description="awaiting" />
        <StatCard title="Rejected" value={leaveApplications.filter(l => l.status === 'Rejected').length} icon={XCircle} iconColor="text-red-500" description="declined" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Leave Applications</h3>
          <p className="text-xs text-muted-foreground">Recent leave requests from staff and teachers</p>
        </div>
        <DataTable columns={columns} data={leaveApplications} searchKey="applicantName" searchPlaceholder="Search applicant..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave" description="Submit a leave application for approval.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Applicant Name *</label>
            <input {...register('applicantName', { required: true })} className={inputClass} placeholder="e.g. Ramesh Kumar" />
            {errors.applicantName && <span className="text-xs text-red-500">Applicant name is required</span>}
          </div>
          <div>
            <label className={labelClass}>Leave Type *</label>
            <select {...register('type', { required: true })} className={inputClass}>
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Earned Leave">Earned Leave (EL)</option>
              <option value="Maternity Leave">Maternity Leave (ML)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" {...register('startDate', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input type="date" {...register('endDate', { required: true })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Reason for Leave *</label>
            <textarea {...register('reason', { required: true })} rows={3} className={`${inputClass} resize-none`} placeholder="Reason for requesting leave" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createLeave.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createLeave.isPending ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
