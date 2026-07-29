import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Hosteler = {
  id?: string;
  name: string;
  class: string;
  section: string;
  hostelName: string;
  roomNo: string;
  bedNo: string;
  allottedDate: string;
  messStatus: string;
};

type AllocateRoomForm = {
  name: string;
  class: string;
  section: string;
  hostelName: string;
  roomNo: string;
  bedNo: string;
  messStatus: string;
};

const columns: ColumnDef<Hosteler>[] = [
  { accessorKey: 'id', header: 'Student ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id || 'HST-101'}</span> },
  {
    accessorKey: 'name',
    header: 'Hosteler',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('name') as string || 'HT').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
          <p className="text-xs text-muted-foreground">Class {row.original.class} {row.original.section}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'hostelName', header: 'Hostel' },
  { accessorKey: 'roomNo', header: 'Room' },
  { accessorKey: 'bedNo', header: 'Bed' },
  { accessorKey: 'allottedDate', header: 'Allotted On' },
  { accessorKey: 'messStatus', header: 'Mess Status', cell: ({ row }) => <StatusBadge status={row.getValue('messStatus') || 'Active'} /> },
];

export function Hostelers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: hostelers = [], isLoading: loadingHostelers } = useApiList<Hosteler>('hostelers');
  const createHosteler = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AllocateRoomForm>();

  const onSubmit = async (data: AllocateRoomForm) => {
    try {
      await createHosteler.mutateAsync({
        path: 'hostelers',
        data: {
          ...data,
          allottedDate: new Date().toISOString().split('T')[0],
        },
      });
      toast.success(`Room allocated to ${data.name}!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to allocate hostel room');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingHostelers ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Hostelers List" description="Manage resident students living in school hostels." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Allocate Room" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Resident Students" value={hostelers.length} icon={Users} description="living in hostels" />
        <StatCard title="Hostel Block A" value={hostelers.filter(h => h.hostelName?.includes('A')).length || hostelers.length} icon={Building2} iconColor="text-blue-500" description="residents" />
        <StatCard title="Mess Active" value={hostelers.filter(h => h.messStatus === 'Active').length || hostelers.length} icon={Building2} iconColor="text-green-500" description="students" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={hostelers} searchKey="name" searchPlaceholder="Search hosteler..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Hostel Room" description="Assign a student to a hostel room and bed.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Student Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
            {errors.name && <span className="text-xs text-red-500">Student name is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. 10th" />
            </div>
            <div>
              <label className={labelClass}>Section *</label>
              <input {...register('section', { required: true })} className={inputClass} placeholder="e.g. A" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Hostel Name / Block *</label>
            <input {...register('hostelName', { required: true })} className={inputClass} placeholder="e.g. Takshashila Block A" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Room Number *</label>
              <input {...register('roomNo', { required: true })} className={inputClass} placeholder="e.g. Room 101" />
            </div>
            <div>
              <label className={labelClass}>Bed Number *</label>
              <input {...register('bedNo', { required: true })} className={inputClass} placeholder="e.g. Bed B1" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Mess Subscription Status *</label>
            <select {...register('messStatus', { required: true })} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Opt-out">Opt-out</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createHosteler.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createHosteler.isPending ? 'Saving…' : 'Allocate Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
