import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Building2, Users, Home, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Hostel = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  type: string;
  floors: number;
  totalRooms: number;
  capacity: number;
  occupiedRooms: number;
  warden: string;
  chiefWarden: string;
  status: string;
  facilities: string | string[];
};

type HostelFormInputs = {
  name: string;
  type: string;
  floors: number;
  totalRooms: number;
  capacity: number;
  warden: string;
  chiefWarden: string;
  facilitiesStr: string;
  status?: string;
};

export function Hostel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);

  const { data: hostels = [], isLoading: loadingHostels, error } = useApiList<Hostel>('hostels');
  const createHostel = useApiCreate();
  const updateHostel = useApiUpdate();
  const deleteHostel = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<HostelFormInputs>({
    defaultValues: {
      type: 'Boys',
      floors: 3,
      totalRooms: 30,
      capacity: 100,
      status: 'Active',
      facilitiesStr: 'Wi-Fi, Mess, Study Room',
    },
  });

  const totalCapacity = hostels.reduce((s, h) => s + (h.capacity || 0), 0);
  const totalOccupied = hostels.reduce((s, h) => s + (h.occupiedRooms || 0), 0);

  const handleOpenAddModal = () => {
    setEditingHostel(null);
    reset({
      name: '',
      type: 'Boys',
      floors: 3,
      totalRooms: 30,
      capacity: 100,
      warden: '',
      chiefWarden: '',
      facilitiesStr: 'Wi-Fi, Mess, Study Room',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setValue('name', hostel.name || '');
    setValue('type', hostel.type || 'Boys');
    setValue('floors', hostel.floors || 1);
    setValue('totalRooms', hostel.totalRooms || 10);
    setValue('capacity', hostel.capacity || 40);
    setValue('warden', hostel.warden || '');
    setValue('chiefWarden', hostel.chiefWarden || '');
    const facText = Array.isArray(hostel.facilities)
      ? hostel.facilities.join(', ')
      : hostel.facilities || '';
    setValue('facilitiesStr', facText);
    setValue('status', hostel.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteHostel = async (hostel: Hostel) => {
    const id = hostel.customId || hostel._id || hostel.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete hostel block "${hostel.name}"?`)) {
      try {
        await deleteHostel.mutateAsync({ path: 'hostels', id });
        toast.success(`Hostel block deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete hostel block');
      }
    }
  };

  const onSubmit = async (data: HostelFormInputs) => {
    try {
      const facilitiesArray = data.facilitiesStr
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: data.name,
        type: data.type,
        floors: Number(data.floors),
        totalRooms: Number(data.totalRooms),
        capacity: Number(data.capacity),
        warden: data.warden,
        chiefWarden: data.chiefWarden,
        facilities: facilitiesArray,
        status: data.status || 'Active',
        occupiedRooms: editingHostel ? editingHostel.occupiedRooms || 0 : 0,
      };

      if (editingHostel) {
        const id = editingHostel.customId || editingHostel._id || editingHostel.id;
        await updateHostel.mutateAsync({
          path: 'hostels',
          id: id!,
          data: payload,
        });
        toast.success(`Hostel "${data.name}" updated!`);
      } else {
        await createHostel.mutateAsync({
          path: 'hostels',
          data: payload,
        });
        toast.success(`Hostel "${data.name}" added!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingHostel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save hostel block');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={`space-y-8 ${loadingHostels ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader
        title="Hostel Management"
        description="Manage hostel building blocks, rooms, warden assignments, and facilities."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Hostel"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load hostels. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Hostels" value={hostels.length} icon={Building2} description="blocks available" />
        <StatCard title="Total Capacity" value={totalCapacity} icon={Users} iconColor="text-blue-500" description="beds total" />
        <StatCard title="Occupied Rooms" value={totalOccupied} icon={Home} iconColor="text-yellow-600" description="rooms occupied" />
        <StatCard title="Available Rooms" value={hostels.reduce((s, h) => s + (h.totalRooms || 0), 0) - totalOccupied} icon={CheckCircle} iconColor="text-green-500" description="rooms free" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hostels.map(hostel => {
          const facList = Array.isArray(hostel.facilities)
            ? hostel.facilities
            : typeof hostel.facilities === 'string'
            ? hostel.facilities.split(',')
            : [];

          return (
            <div key={hostel.customId || hostel._id || hostel.id || hostel.name} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{hostel.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${hostel.type === 'Boys' ? 'bg-blue-500/10 text-blue-600' : 'bg-pink-500/10 text-pink-600'}`}>
                      {hostel.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={hostel.status || 'Active'} />
                  <button
                    onClick={() => handleOpenEditModal(hostel)}
                    className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                    title="Edit Hostel"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteHostel(hostel)}
                    className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                    title="Delete Hostel"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div><span className="text-muted-foreground">Floors:</span> <span className="font-medium">{hostel.floors}</span></div>
                <div><span className="text-muted-foreground">Rooms:</span> <span className="font-medium">{hostel.totalRooms}</span></div>
                <div><span className="text-muted-foreground">Capacity:</span> <span className="font-medium">{hostel.capacity} beds</span></div>
                <div><span className="text-muted-foreground">Occupied:</span> <span className="font-medium">{hostel.occupiedRooms || 0} rooms</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Warden:</span> <span className="font-medium">{hostel.warden}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Chief Warden:</span> <span className="font-medium">{hostel.chiefWarden}</span></div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Facilities:</p>
                <div className="flex flex-wrap gap-1">
                  {facList.map((f: string) => (
                    <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {f.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHostel(null);
        }}
        title={editingHostel ? 'Edit Hostel Block' : 'Add New Hostel Block'}
        description={editingHostel ? 'Modify hostel building details and warden assignments.' : 'Enter details for the new hostel building block.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Hostel Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Takshashila Block A" />
            {errors.name && <span className="text-xs text-red-500">Hostel name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hostel Type *</label>
              <select {...register('type', { required: true })} className={inputClass}>
                <option value="Boys">Boys Hostel</option>
                <option value="Girls">Girls Hostel</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Floors *</label>
              <input type="number" {...register('floors', { required: true })} className={inputClass} placeholder="e.g. 4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Rooms *</label>
              <input type="number" {...register('totalRooms', { required: true })} className={inputClass} placeholder="e.g. 50" />
            </div>
            <div>
              <label className={labelClass}>Total Capacity (Beds) *</label>
              <input type="number" {...register('capacity', { required: true })} className={inputClass} placeholder="e.g. 150" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hostel Warden *</label>
              <input {...register('warden', { required: true })} className={inputClass} placeholder="e.g. Dr. A. Sharma" />
            </div>
            <div>
              <label className={labelClass}>Chief Warden *</label>
              <input {...register('chiefWarden', { required: true })} className={inputClass} placeholder="e.g. Prof. R. Patel" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status *</label>
            <select {...register('status')} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Facilities (comma-separated) *</label>
            <input {...register('facilitiesStr', { required: true })} className={inputClass} placeholder="e.g. Wi-Fi, Mess, Study Room, Gym, Laundry" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingHostel(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createHostel.isPending || updateHostel.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createHostel.isPending || updateHostel.isPending
                ? 'Saving…'
                : editingHostel
                ? 'Update Hostel'
                : 'Add Hostel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
