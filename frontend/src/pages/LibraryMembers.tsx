import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Users, GraduationCap, BookOpen, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type LibMember = {
  _id?: string;
  id?: string;
  customId?: string;
  cardId?: string;
  name: string;
  type: string;
  classDept: string;
  booksIssued: number;
  maxLimit: number;
  status: string;
};

type RegisterMemberFormInputs = {
  name: string;
  type: string;
  classDept: string;
  cardId: string;
  maxLimit: number;
  booksIssued?: number;
  status?: string;
};

export function LibraryMembers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LibMember | null>(null);

  const { data: members = [], isLoading: loadingMembers, error } = useApiList<LibMember>('library-members');

  const createMember = useApiCreate();
  const updateMember = useApiUpdate();
  const deleteMember = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RegisterMemberFormInputs>({
    defaultValues: {
      type: 'Student',
      maxLimit: 3,
      booksIssued: 0,
      status: 'Active',
    },
  });

  const handleOpenAddModal = () => {
    setEditingMember(null);
    reset({
      name: '',
      type: 'Student',
      classDept: 'Class 10th A',
      cardId: `LIB-${Math.floor(1000 + Math.random() * 9000)}`,
      maxLimit: 3,
      booksIssued: 0,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (memberItem: LibMember) => {
    setEditingMember(memberItem);
    setValue('name', memberItem.name || '');
    setValue('type', memberItem.type || 'Student');
    setValue('classDept', memberItem.classDept || '');
    setValue('cardId', memberItem.cardId || memberItem.customId || '');
    setValue('maxLimit', memberItem.maxLimit || 3);
    setValue('booksIssued', memberItem.booksIssued || 0);
    setValue('status', memberItem.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (memberItem: LibMember) => {
    const id = memberItem.customId || memberItem._id || memberItem.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to revoke library card for ${memberItem.name}?`)) {
      try {
        await deleteMember.mutateAsync({ path: 'library-members', id });
        toast.success(`Library member card revoked.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete member');
      }
    }
  };

  const onSubmit = async (data: RegisterMemberFormInputs) => {
    try {
      const payload = {
        ...data,
        maxLimit: Number(data.maxLimit) || 3,
        booksIssued: Number(data.booksIssued) || 0,
        status: data.status || 'Active',
      };

      if (editingMember) {
        const id = editingMember.customId || editingMember._id || editingMember.id;
        await updateMember.mutateAsync({
          path: 'library-members',
          id: id!,
          data: payload,
        });
        toast.success(`Library member details updated for ${data.name}!`);
      } else {
        await createMember.mutateAsync({
          path: 'library-members',
          data: payload,
        });
        toast.success(`Library card issued to ${data.name}!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingMember(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save member profile');
    }
  };

  const columns: ColumnDef<LibMember>[] = [
    {
      accessorKey: 'cardId',
      header: 'Member Card ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue('cardId') || row.original.customId || row.original.id || 'LIB-101'}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Member Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('name') as string || 'LM').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Member Type',
      cell: ({ row }) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{row.getValue('type')}</span>,
    },
    { accessorKey: 'classDept', header: 'Class / Department' },
    {
      accessorKey: 'booksIssued',
      header: 'Books Issued',
      cell: ({ row }) => (
        <span className="font-semibold text-sm">
          {row.getValue('booksIssued') || 0}
          <span className="text-muted-foreground font-normal text-xs">/{row.original.maxLimit || 3}</span>
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
            title="Edit Member"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteMember(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Revoke / Delete Card"
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
    <div className={loadingMembers ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Library Members"
        description="View and manage all registered library cardholders and book allowances."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Register Member"
        showExport
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load library members. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-3 mb-2">
        <StatCard title="Total Members" value={members.length} icon={Users} description="registered cardholders" />
        <StatCard title="Student Members" value={members.filter(m => m.type === 'Student').length} icon={GraduationCap} iconColor="text-blue-500" description="active cards" />
        <StatCard title="Teacher Members" value={members.filter(m => m.type === 'Teacher').length} icon={BookOpen} iconColor="text-purple-500" description="active cards" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={members} searchKey="name" searchPlaceholder="Search member name..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        title={editingMember ? 'Edit Library Member Card' : 'Register Library Member'}
        description={editingMember ? 'Modify library member card details and book limit.' : 'Issue a new library card to a student or teacher.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Member Type *</label>
              <select {...register('type', { required: true })} className={inputClass}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Class / Department *</label>
              <input {...register('classDept', { required: true })} className={inputClass} placeholder="e.g. Class 10th-A" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Library Card ID *</label>
              <input {...register('cardId', { required: true })} className={inputClass} placeholder="e.g. LIB-2026-001" />
            </div>
            <div>
              <label className={labelClass}>Max Books Allowed *</label>
              <input type="number" {...register('maxLimit', { required: true })} className={inputClass} placeholder="e.g. 3" />
            </div>
          </div>

          {editingMember && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Currently Issued Books</label>
                <input type="number" {...register('booksIssued')} className={inputClass} placeholder="e.g. 1" />
              </div>
              <div>
                <label className={labelClass}>Card Status *</label>
                <select {...register('status')} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createMember.isPending || updateMember.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMember.isPending || updateMember.isPending
                ? 'Saving…'
                : editingMember
                ? 'Update Card'
                : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
