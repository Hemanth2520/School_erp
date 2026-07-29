import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Home, Users, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Room = {
  id?: string;
  roomNo: string;
  hostelName?: string;
  hostelId?: string;
  type: string;
  floor: number;
  capacity: number;
  occupied: number;
  facilities: string | string[];
  status: string;
};

type AddRoomForm = {
  roomNo: string;
  hostelName: string;
  type: string;
  floor: number;
  capacity: number;
  facilitiesStr: string;
};

const columns: ColumnDef<Room>[] = [
  { accessorKey: 'roomNo', header: 'Room No.', cell: ({ row }) => <span className="font-semibold text-primary">#{row.getValue('roomNo')}</span> },
  { accessorKey: 'hostelName', header: 'Hostel Block', cell: ({ row }) => <span className="text-sm">{row.getValue('hostelName') || 'Main Hostel'}</span> },
  { accessorKey: 'type', header: 'Room Type', cell: ({ row }) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{row.getValue('type')}</span> },
  { accessorKey: 'floor', header: 'Floor' },
  {
    accessorKey: 'capacity',
    header: 'Occupancy',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{row.original.occupied || 0}/{row.getValue('capacity')}</span>
        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${((row.original.occupied || 0) / ((row.getValue('capacity') as number) || 1)) * 100}%` }} />
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'facilities',
    header: 'Facilities',
    cell: ({ row }) => {
      const facs = Array.isArray(row.getValue('facilities')) ? row.getValue('facilities') as string[] : typeof row.getValue('facilities') === 'string' ? (row.getValue('facilities') as string).split(',') : [];
      return (
        <div className="flex flex-wrap gap-1">
          {facs.map(f => <span key={f} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{f.trim()}</span>)}
        </div>
      );
    },
  },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Available'} /> },
];

export function HostelRooms() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: hostelRooms = [], isLoading: loadingRooms } = useApiList<Room>('hostel-rooms');
  const createRoom = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddRoomForm>();

  const available = hostelRooms.filter(r => r.status === 'Available').length;
  const full = hostelRooms.filter(r => r.status === 'Full').length;

  const onSubmit = async (data: AddRoomForm) => {
    try {
      await createRoom.mutateAsync({
        path: 'hostel-rooms',
        data: {
          ...data,
          floor: Number(data.floor),
          capacity: Number(data.capacity),
          occupied: 0,
          status: 'Available',
          facilities: data.facilitiesStr.split(',').map(f => f.trim()),
        },
      });
      toast.success(`Room #${data.roomNo} added!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add room');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingRooms ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Hostel Rooms" description="Manage all hostel rooms and occupancy." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Add Room" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Rooms" value={hostelRooms.length} icon={Home} description="across all hostels" />
        <StatCard title="Available" value={available} icon={CheckCircle} iconColor="text-green-500" description="rooms ready for allocation" />
        <StatCard title="Full" value={full} icon={XCircle} iconColor="text-red-500" description="fully occupied" />
        <StatCard title="Total Capacity" value={hostelRooms.reduce((s, r) => s + (r.capacity || 0), 0)} icon={Users} iconColor="text-blue-500" description="beds total" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={hostelRooms} searchKey="roomNo" searchPlaceholder="Search room number..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hostel Room" description="Register a new room in hostel management.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Room Number *</label>
              <input {...register('roomNo', { required: true })} className={inputClass} placeholder="e.g. 101" />
              {errors.roomNo && <span className="text-xs text-red-500">Room number is required</span>}
            </div>
            <div>
              <label className={labelClass}>Hostel Block Name *</label>
              <input {...register('hostelName', { required: true })} className={inputClass} placeholder="e.g. Takshashila Block A" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Room Type *</label>
              <select {...register('type', { required: true })} className={inputClass}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Dormitory">Dormitory</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Floor Number *</label>
              <input type="number" {...register('floor', { required: true })} className={inputClass} placeholder="e.g. 1" />
            </div>
            <div>
              <label className={labelClass}>Capacity (Beds) *</label>
              <input type="number" {...register('capacity', { required: true })} className={inputClass} placeholder="e.g. 2" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Facilities (comma-separated) *</label>
            <input {...register('facilitiesStr', { required: true })} className={inputClass} placeholder="e.g. Attached Bath, AC, Study Table, Balcony" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createRoom.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createRoom.isPending ? 'Saving…' : 'Add Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
