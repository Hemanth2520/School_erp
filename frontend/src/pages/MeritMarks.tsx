import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Star, Award, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type AssignedMerit = {
  id?: string;
  studentName: string;
  class: string;
  meritName: string;
  points: number;
  date: string;
  awardedBy: string;
};

type AwardMeritForm = {
  studentName: string;
  class: string;
  meritName: string;
  points: number;
  awardedBy: string;
};

const columns: ColumnDef<AssignedMerit>[] = [
  { accessorKey: 'id', header: 'Record ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id || 'ARM-101'}</span> },
  {
    accessorKey: 'studentName',
    header: 'Student',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('studentName') as string || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-sm">{row.getValue('name') || row.getValue('studentName')}</p>
          <p className="text-xs text-muted-foreground">{row.original.class}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'meritName', header: 'Merit Title', cell: ({ row }) => <span className="font-medium text-sm text-primary">{row.getValue('meritName')}</span> },
  { accessorKey: 'points', header: 'Merit Points', cell: ({ row }) => <span className="font-bold text-yellow-600">+{row.getValue('points')} pts</span> },
  { accessorKey: 'date', header: 'Awarded On' },
  { accessorKey: 'awardedBy', header: 'Awarded By' },
];

export function MeritMarks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: assignedMerits = [], isLoading: loadingMerits } = useApiList<AssignedMerit>('merit-assignments');
  const createAssignment = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AwardMeritForm>();

  const totalAwardedPoints = assignedMerits.reduce((sum, m) => sum + (m.points || 0), 0);

  const onSubmit = async (data: AwardMeritForm) => {
    try {
      await createAssignment.mutateAsync({
        path: 'merit-assignments',
        data: {
          ...data,
          points: Number(data.points),
          date: new Date().toISOString().split('T')[0],
        },
      });
      toast.success(`Merit points awarded to ${data.studentName}!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to award merit points');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingMerits ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Merit Marks Log" description="Log of all merit points awarded to students." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Award Merit" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Merit Events" value={assignedMerits.length} icon={Star} description="awarded" />
        <StatCard title="Total Points Awarded" value={`${totalAwardedPoints} pts`} icon={Award} iconColor="text-yellow-500" description="this month" />
        <StatCard title="Total Records" value={assignedMerits.length} icon={TrendingUp} iconColor="text-green-500" description="logged entries" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={assignedMerits} searchKey="studentName" searchPlaceholder="Search student..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Award Merit Points" description="Record a merit achievement for a student.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Student Name *</label>
            <input {...register('studentName', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
            {errors.studentName && <span className="text-xs text-red-500">Student name is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class & Section *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. Class 10th-A" />
            </div>
            <div>
              <label className={labelClass}>Awarded By *</label>
              <input {...register('awardedBy', { required: true })} className={inputClass} placeholder="e.g. Dr. John Mathew / Principal" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Merit Category / Title *</label>
              <input {...register('meritName', { required: true })} className={inputClass} placeholder="e.g. Perfect Attendance" />
            </div>
            <div>
              <label className={labelClass}>Points to Award *</label>
              <input type="number" {...register('points', { required: true })} className={inputClass} placeholder="e.g. 10" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createAssignment.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createAssignment.isPending ? 'Saving…' : 'Award Merit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
