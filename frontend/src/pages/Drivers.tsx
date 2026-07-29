import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { User, Bus, Award, Phone, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Driver = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  phone: string;
  license: string;
  experience: string;
  busNo: string;
  joinDate?: string;
  dob: string;
  status: string;
};

type DriverFormInputs = {
  name: string;
  phone: string;
  license: string;
  experience: string;
  busNo: string;
  dob: string;
  status: string;
};

export function Drivers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const { data: drivers = [], isLoading: loadingDrivers, error } = useApiList<Driver>('drivers');
  const createDriver = useApiCreate();
  const updateDriver = useApiUpdate();
  const deleteDriver = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DriverFormInputs>({
    defaultValues: {
      status: 'Active',
      experience: '5 Years',
    },
  });

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    reset({
      name: '',
      phone: '',
      license: '',
      experience: '5 Years',
      busNo: 'BUS-01',
      dob: '1985-05-15',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setValue('name', driver.name || '');
    setValue('phone', driver.phone || '');
    setValue('license', driver.license || '');
    setValue('experience', driver.experience || '');
    setValue('busNo', driver.busNo || '');
    setValue('dob', driver.dob ? new Date(driver.dob).toISOString().split('T')[0] : '');
    setValue('status', driver.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteDriver = async (driver: Driver) => {
    const id = driver.customId || driver._id || driver.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
      try {
        await deleteDriver.mutateAsync({ path: 'drivers', id });
        toast.success(`Driver ${driver.name} removed.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete driver');
      }
    }
  };

  const onSubmit = async (data: DriverFormInputs) => {
    try {
      const payload = {
        ...data,
        joinDate: editingDriver ? editingDriver.joinDate || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };

      if (editingDriver) {
        const id = editingDriver.customId || editingDriver._id || editingDriver.id;
        await updateDriver.mutateAsync({
          path: 'drivers',
          id: id!,
          data: payload,
        });
        toast.success(`Driver ${data.name} updated!`);
      } else {
        await createDriver.mutateAsync({
          path: 'drivers',
          data: payload,
        });
        toast.success(`Driver ${data.name} added!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingDriver(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save driver');
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: 'customId',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('customId') || row.original.id || 'DRV-101'}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Driver',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('name') as string || 'DR').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">{row.original.phone}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'license',
      header: 'License No.',
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('license')}</span>,
    },
    { accessorKey: 'experience', header: 'Experience' },
    { accessorKey: 'busNo', header: 'Assigned Bus' },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.getValue('joinDate') ? new Date(row.getValue('joinDate')).toISOString().split('T')[0] : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Active'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Driver"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteDriver(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Driver"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingDrivers ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Drivers"
        description="Manage school bus drivers and their vehicle assignments."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Driver"
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load drivers. Please retry.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Drivers" value={drivers.length} icon={User} description="registered" />
        <StatCard title="Active" value={drivers.filter(d => d.status === 'Active').length} icon={Bus} iconColor="text-green-500" description="on duty" />
        <StatCard title="On Leave" value={drivers.filter(d => d.status === 'On Leave').length} icon={Award} iconColor="text-yellow-600" description="absent" />
        <StatCard title="Total Fleet" value={drivers.length} icon={Phone} iconColor="text-blue-500" description="assigned drivers" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={drivers} searchKey="name" searchPlaceholder="Search driver by name..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDriver(null);
        }}
        title={editingDriver ? 'Edit Driver Profile' : 'Add New Driver'}
        description={editingDriver ? 'Modify driver vehicle assignment or license details.' : 'Register a new driver profile in transport management.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Driver Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Ramesh Singh" />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register('phone', { required: true })} className={inputClass} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className={labelClass}>Driving License No. *</label>
              <input {...register('license', { required: true })} className={inputClass} placeholder="e.g. DL-1420110012345" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Driving Experience *</label>
              <input {...register('experience', { required: true })} className={inputClass} placeholder="e.g. 8 Years" />
            </div>
            <div>
              <label className={labelClass}>Assigned Bus No. *</label>
              <input {...register('busNo', { required: true })} className={inputClass} placeholder="e.g. BUS-01" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input type="date" {...register('dob', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDriver(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createDriver.isPending || updateDriver.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createDriver.isPending || updateDriver.isPending
                ? 'Saving…'
                : editingDriver
                ? 'Update Driver'
                : 'Add Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
