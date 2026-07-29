import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Users, Phone, Briefcase, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiStats, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Parent = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  phone: string;
  email: string;
  occupation: string;
  address: string;
  status?: string;
  students?: any[];
};

type ParentFormInputs = {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  status: string;
  address: string;
};

export function Parents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  const { data: parents = [], isLoading: loadingParents, error } = useApiList<Parent>('parents');
  const { data: stats, isLoading: loadingStats } = useApiStats('parents');

  const createParent = useApiCreate();
  const updateParent = useApiUpdate();
  const deleteParent = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ParentFormInputs>({
    defaultValues: {
      status: 'Active',
    },
  });

  const handleOpenAddModal = () => {
    setEditingParent(null);
    reset({
      name: '',
      phone: '',
      email: '',
      occupation: '',
      status: 'Active',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (parent: Parent) => {
    setEditingParent(parent);
    setValue('name', parent.name || '');
    setValue('phone', parent.phone || '');
    setValue('email', parent.email || '');
    setValue('occupation', parent.occupation || '');
    setValue('status', parent.status || 'Active');
    setValue('address', parent.address || '');
    setIsModalOpen(true);
  };

  const handleDeleteParent = async (parent: Parent) => {
    const parentId = parent.customId || parent._id || parent.id;
    if (!parentId) return;

    if (window.confirm(`Are you sure you want to delete parent ${parent.name}?`)) {
      try {
        await deleteParent.mutateAsync({ path: 'parents', id: parentId });
        toast.success(`Parent ${parent.name} deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete parent');
      }
    }
  };

  const onSubmit = async (data: ParentFormInputs) => {
    try {
      if (editingParent) {
        const parentId = editingParent.customId || editingParent._id || editingParent.id;
        await updateParent.mutateAsync({
          path: 'parents',
          id: parentId!,
          data,
        });
        toast.success(`Parent ${data.name} updated successfully!`);
      } else {
        await createParent.mutateAsync({
          path: 'parents',
          data,
        });
        toast.success(`Parent profile for ${data.name} created!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingParent(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save parent profile');
    }
  };

  const columns: ColumnDef<Parent>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue('name')}</span> },
    { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('phone')}</span> },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('email')}</span> },
    { accessorKey: 'occupation', header: 'Occupation', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('occupation')}</span> },
    { accessorKey: 'address', header: 'Address', cell: ({ row }) => <span className="text-muted-foreground truncate max-w-[200px] block">{row.getValue('address')}</span> },
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
            title="Edit Parent"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteParent(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Parent"
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
    <div className={loadingParents || loadingStats ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Parents"
        description="Manage parent profiles and contact details."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Parent"
      />
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load parents. Please sign in again or retry.</p>}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Parents" value={stats?.total || parents.length || 0} icon={Users} description="registered" />
        <StatCard title="Children" value={parents.reduce((s: number, p: Parent) => s + (p.students?.length || 0), 0)} icon={Phone} iconColor="text-blue-500" description="students linked" />
        <StatCard title="Avg Income" value="—" icon={Briefcase} iconColor="text-green-500" description="parent statistics" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={parents} searchKey="name" searchPlaceholder="Search parents..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingParent(null);
        }}
        title={editingParent ? 'Edit Parent Profile' : 'Add New Parent'}
        description={editingParent ? 'Update parent contact details.' : 'Enter parent/guardian contact details.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Suresh Kumar" />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register('phone', { required: true })} className={inputClass} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" {...register('email', { required: true })} className={inputClass} placeholder="parent@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Occupation *</label>
              <input {...register('occupation', { required: true })} className={inputClass} placeholder="e.g. Software Engineer, Business" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status', { required: true })} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Address *</label>
            <textarea {...register('address', { required: true })} rows={2} className={`${inputClass} resize-none`} placeholder="Residential address" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingParent(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createParent.isPending || updateParent.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createParent.isPending || updateParent.isPending
                ? 'Saving…'
                : editingParent
                ? 'Update Parent'
                : 'Add Parent'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
