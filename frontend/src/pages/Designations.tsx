import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Briefcase, Users, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Designation = {
  _id?: string;
  id?: string;
  customId?: string;
  title: string;
  department: string;
  totalStaff?: number;
  gradePay: string;
  status?: string;
};

type DesignationFormInputs = {
  title: string;
  department: string;
  gradePay: string;
  totalStaff?: number;
  status?: string;
};

export function Designations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);

  const { data: designations = [], isLoading: loadingDes, error } = useApiList<Designation>('designations');
  const createDesignation = useApiCreate();
  const updateDesignation = useApiUpdate();
  const deleteDesignation = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DesignationFormInputs>({
    defaultValues: {
      department: 'Academics',
      gradePay: 'Level 10 / Grade A',
      status: 'Active',
    },
  });

  const totalPositions = designations.reduce((s, d) => s + (d.totalStaff || 0), 0);

  const handleOpenAddModal = () => {
    setEditingDesignation(null);
    reset({
      title: '',
      department: 'Academics',
      gradePay: 'Level 10 / Grade A',
      totalStaff: 0,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (des: Designation) => {
    setEditingDesignation(des);
    setValue('title', des.title || '');
    setValue('department', des.department || 'Academics');
    setValue('gradePay', des.gradePay || '');
    setValue('totalStaff', des.totalStaff || 0);
    setValue('status', des.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteDesignation = async (des: Designation) => {
    const id = des.customId || des._id || des.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete designation title "${des.title}"?`)) {
      try {
        await deleteDesignation.mutateAsync({ path: 'designations', id });
        toast.success(`Designation deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete designation');
      }
    }
  };

  const onSubmit = async (data: DesignationFormInputs) => {
    try {
      const payload = {
        ...data,
        totalStaff: Number(data.totalStaff) || 0,
        status: data.status || 'Active',
      };

      if (editingDesignation) {
        const id = editingDesignation.customId || editingDesignation._id || editingDesignation.id;
        await updateDesignation.mutateAsync({
          path: 'designations',
          id: id!,
          data: payload,
        });
        toast.success(`Designation "${data.title}" updated!`);
      } else {
        await createDesignation.mutateAsync({
          path: 'designations',
          data: payload,
        });
        toast.success(`Designation "${data.title}" created!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingDesignation(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save designation');
    }
  };

  const columns: ColumnDef<Designation>[] = [
    {
      accessorKey: 'customId',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('customId') || row.original.id || 'DES-101'}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Designation Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium text-sm">{row.getValue('title')}</span>
        </div>
      ),
    },
    { accessorKey: 'department', header: 'Department' },
    {
      accessorKey: 'totalStaff',
      header: 'Staff Count',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('totalStaff') || 0}</span>,
    },
    {
      accessorKey: 'gradePay',
      header: 'Pay Grade Scale',
      cell: ({ row }) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono">{row.getValue('gradePay')}</span>,
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
            title="Edit Designation"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteDesignation(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Designation"
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
    <div className={loadingDes ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Designations"
        description="Manage staff designations, role positions, and pay grade scales."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Designation"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load designations. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-3 mb-2">
        <StatCard title="Total Designations" value={designations.length} icon={Briefcase} description="roles defined" />
        <StatCard title="Total Positions Filled" value={totalPositions} icon={Users} iconColor="text-blue-500" description="active staff" />
        <StatCard title="Active Designations" value={designations.filter(d => d.status === 'Active').length} icon={CheckCircle} iconColor="text-green-500" description="configured" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={designations} searchKey="title" searchPlaceholder="Search designation..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDesignation(null);
        }}
        title={editingDesignation ? 'Edit Designation Title' : 'Add New Designation'}
        description={editingDesignation ? 'Modify designation details or pay grade.' : 'Create a new staff role or position title.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Designation Title *</label>
            <input {...register('title', { required: true })} className={inputClass} placeholder="e.g. Senior Academic Coordinator" />
            {errors.title && <span className="text-xs text-red-500">Title is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department *</label>
              <input {...register('department', { required: true })} className={inputClass} placeholder="e.g. Academics, Administration, Finance" />
            </div>
            <div>
              <label className={labelClass}>Pay Grade Scale *</label>
              <input {...register('gradePay', { required: true })} className={inputClass} placeholder="e.g. Level 10 / Grade A" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Staff Count (Allocated)</label>
              <input type="number" {...register('totalStaff')} className={inputClass} placeholder="e.g. 5" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDesignation(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createDesignation.isPending || updateDesignation.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createDesignation.isPending || updateDesignation.isPending
                ? 'Saving…'
                : editingDesignation
                ? 'Update Designation'
                : 'Add Designation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
