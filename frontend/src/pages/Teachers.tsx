import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Users, BookOpen, Award, UserX, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiStats, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Teacher = {
  _id?: string;
  id?: string;
  customId?: string;
  employeeId: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  classTeacher: string;
  joinDate: string;
  salary: number;
  status: string;
  email: string;
  phone?: string;
};

type TeacherFormInputs = {
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  classTeacher: string;
  salary: number;
  status: string;
};

export function Teachers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const { data: teachers = [], isLoading: loadingTeachers, error } = useApiList<Teacher>('teachers');
  const { data: stats, isLoading: loadingStats } = useApiStats('teachers');

  const createTeacher = useApiCreate();
  const updateTeacher = useApiUpdate();
  const deleteTeacher = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TeacherFormInputs>({
    defaultValues: {
      status: 'Active',
    },
  });

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    reset({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      subject: '',
      qualification: '',
      experience: '',
      classTeacher: '',
      salary: 0,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setValue('name', teacher.name || '');
    setValue('employeeId', teacher.employeeId || '');
    setValue('email', teacher.email || '');
    setValue('phone', teacher.phone || '');
    setValue('subject', teacher.subject || '');
    setValue('qualification', teacher.qualification || '');
    setValue('experience', teacher.experience || '');
    setValue('classTeacher', teacher.classTeacher || '');
    setValue('salary', teacher.salary || 0);
    setValue('status', teacher.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    const teacherId = teacher.customId || teacher._id || teacher.id;
    if (!teacherId) return;

    if (window.confirm(`Are you sure you want to delete teacher ${teacher.name}?`)) {
      try {
        await deleteTeacher.mutateAsync({ path: 'teachers', id: teacherId });
        toast.success(`Teacher ${teacher.name} deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete teacher');
      }
    }
  };

  const onSubmit = async (data: TeacherFormInputs) => {
    try {
      if (editingTeacher) {
        const teacherId = editingTeacher.customId || editingTeacher._id || editingTeacher.id;
        await updateTeacher.mutateAsync({
          path: 'teachers',
          id: teacherId!,
          data: {
            ...data,
            salary: Number(data.salary),
          },
        });
        toast.success(`Teacher ${data.name} updated successfully!`);
      } else {
        await createTeacher.mutateAsync({
          path: 'teachers',
          data: {
            ...data,
            salary: Number(data.salary),
            joinDate: new Date().toISOString().split('T')[0],
          },
        });
        toast.success(`Teacher ${data.name} added successfully!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingTeacher(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save teacher details');
    }
  };

  const columns: ColumnDef<Teacher>[] = [
    { accessorKey: 'employeeId', header: 'Emp ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('employeeId')}</span> },
    {
      accessorKey: 'name',
      header: 'Teacher',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('name') as string || 'TR').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'qualification', header: 'Qualification' },
    { accessorKey: 'experience', header: 'Experience' },
    { accessorKey: 'classTeacher', header: 'Class Teacher' },
    { accessorKey: 'joinDate', header: 'Join Date' },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: ({ row }) => <span className="font-semibold text-sm">₹{(row.getValue('salary') as number || 0).toLocaleString()}</span>,
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
            title="Edit Teacher"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteTeacher(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Teacher"
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
    <div className={loadingTeachers || loadingStats ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Teachers"
        description="Manage teaching staff and their profiles."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Teacher"
      />
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load teachers. Please sign in again or retry.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Teachers" value={stats?.total || teachers.length || 0} icon={Users} description="on staff" />
        <StatCard title="Active" value={stats?.active || teachers.filter((t: any) => t.status !== 'Inactive').length || 0} icon={BookOpen} iconColor="text-green-500" description="teaching" />
        <StatCard title="On Leave" value={stats?.onLeave || 0} icon={Award} iconColor="text-yellow-600" description="currently" />
        <StatCard title="Subjects Covered" value={stats?.subjectsCovered || 12} icon={UserX} iconColor="text-blue-500" description="this year" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={teachers} searchKey="name" searchPlaceholder="Search by teacher name..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeacher(null);
        }}
        title={editingTeacher ? 'Edit Teacher Details' : 'Add New Teacher'}
        description={editingTeacher ? 'Update existing teacher profile details.' : 'Register a new teacher profile in the ERP system.'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Dr. Rajesh Kumar" />
              {errors.name && <span className="text-xs text-red-500">Name is required</span>}
            </div>
            <div>
              <label className={labelClass}>Employee ID *</label>
              <input {...register('employeeId', { required: true })} className={inputClass} placeholder="e.g. TCH-501" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" {...register('email', { required: true })} className={inputClass} placeholder="teacher@school.com" />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input {...register('phone', { required: true })} className={inputClass} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className={labelClass}>Primary Subject *</label>
              <input {...register('subject', { required: true })} className={inputClass} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className={labelClass}>Qualification *</label>
              <input {...register('qualification', { required: true })} className={inputClass} placeholder="e.g. M.Sc., B.Ed." />
            </div>
            <div>
              <label className={labelClass}>Experience *</label>
              <input {...register('experience', { required: true })} className={inputClass} placeholder="e.g. 5 Years" />
            </div>
            <div>
              <label className={labelClass}>Class Teacher (Optional)</label>
              <input {...register('classTeacher')} className={inputClass} placeholder="e.g. Class 10-A" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status', { required: true })} className={inputClass}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Monthly Salary (₹) *</label>
              <input type="number" {...register('salary', { required: true })} className={inputClass} placeholder="e.g. 45000" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTeacher(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createTeacher.isPending || updateTeacher.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createTeacher.isPending || updateTeacher.isPending
                ? 'Saving…'
                : editingTeacher
                ? 'Update Teacher'
                : 'Add Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
