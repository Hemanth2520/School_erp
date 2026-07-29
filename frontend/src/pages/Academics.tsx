import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { BookOpen, Users, Layout, Clock, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Subject = {
  _id?: string;
  id?: string;
  customId?: string;
  code: string;
  name: string;
  teacher: string;
  classes: string | string[];
  credits: number;
  type: string;
  status: string;
};

type SubjectFormInputs = {
  code: string;
  name: string;
  teacher: string;
  classesStr: string;
  credits: number;
  type: string;
  status: string;
};

export function Academics() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const { data: subjects = [], isLoading: loadingSubjects, error } = useApiList<Subject>('subjects');
  const { data: classes = [] } = useApiList<any>('classes');

  const createSubject = useApiCreate();
  const updateSubject = useApiUpdate();
  const deleteSubject = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SubjectFormInputs>({
    defaultValues: {
      type: 'Core',
      status: 'Active',
      credits: 4,
    },
  });

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    reset({
      code: '',
      name: '',
      teacher: '',
      classesStr: '',
      credits: 4,
      type: 'Core',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setValue('code', subject.code || '');
    setValue('name', subject.name || '');
    setValue('teacher', subject.teacher || '');
    const clsStr = Array.isArray(subject.classes) ? subject.classes.join(', ') : subject.classes || '';
    setValue('classesStr', clsStr);
    setValue('credits', subject.credits || 4);
    setValue('type', subject.type || 'Core');
    setValue('status', subject.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    const subjectId = subject.customId || subject._id || subject.id;
    if (!subjectId) return;

    if (window.confirm(`Are you sure you want to delete subject "${subject.name}"?`)) {
      try {
        await deleteSubject.mutateAsync({ path: 'subjects', id: subjectId });
        toast.success(`Subject "${subject.name}" deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete subject');
      }
    }
  };

  const onSubmit = async (data: SubjectFormInputs) => {
    try {
      const clsArray = data.classesStr ? data.classesStr.split(',').map(s => s.trim()) : [];
      if (editingSubject) {
        const subjectId = editingSubject.customId || editingSubject._id || editingSubject.id;
        await updateSubject.mutateAsync({
          path: 'subjects',
          id: subjectId!,
          data: {
            code: data.code,
            name: data.name,
            teacher: data.teacher,
            classes: clsArray,
            credits: Number(data.credits),
            type: data.type,
            status: data.status,
          },
        });
        toast.success(`Subject "${data.name}" updated successfully!`);
      } else {
        await createSubject.mutateAsync({
          path: 'subjects',
          data: {
            code: data.code,
            name: data.name,
            teacher: data.teacher,
            classes: clsArray,
            credits: Number(data.credits),
            type: data.type,
            status: data.status,
          },
        });
        toast.success(`Subject "${data.name}" added successfully!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingSubject(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save subject');
    }
  };

  const subjectColumns: ColumnDef<Subject>[] = [
    { accessorKey: 'code', header: 'Code', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('code')}</span> },
    {
      accessorKey: 'name',
      header: 'Subject',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {(row.getValue('code') as string || 'SUB').slice(0, 3)}
          </div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
        </div>
      ),
    },
    { accessorKey: 'teacher', header: 'Teacher' },
    {
      accessorKey: 'classes',
      header: 'Classes',
      cell: ({ row }) => {
        const val = row.getValue('classes');
        const clsList = Array.isArray(val) ? val : typeof val === 'string' ? val.split(',') : [];
        return (
          <div className="flex flex-wrap gap-1">
            {clsList.map((c: string) => (
              <span key={c} className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{c.trim()}</span>
            ))}
          </div>
        );
      },
    },
    { accessorKey: 'credits', header: 'Credits' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{row.getValue('type') || 'Core'}</span> },
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
            title="Edit Subject"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteSubject(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Subject"
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
    <div className={`space-y-8 ${loadingSubjects ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader
        title="Subject Management"
        description="Manage academic subjects, teachers, credits, and class assignments."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Subject"
      />

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load subjects. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Subjects" value={subjects.length || 0} icon={BookOpen} description="offered this year" />
        <StatCard title="Total Classes" value={classes.length || 0} icon={Layout} description="active classes" iconColor="text-blue-500" />
        <StatCard title="Active Subjects" value={subjects.filter(s => s.status !== 'Inactive').length} icon={Users} description="currently taught" iconColor="text-purple-500" />
        <StatCard title="Core Subjects" value={subjects.filter(s => s.type === 'Core').length} icon={Clock} description="mandatory curriculum" iconColor="text-green-500" />
      </div>

      {/* Subjects Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Subject Catalog</h3>
          <p className="text-xs text-muted-foreground">List of all academic subjects offered across grades</p>
        </div>
        <DataTable columns={subjectColumns} data={subjects} searchKey="name" searchPlaceholder="Search subjects..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? 'Edit Subject Details' : 'Add New Subject'}
        description={editingSubject ? 'Update subject specifications and assigned teacher.' : 'Define a new academic subject in the curriculum.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Subject Code *</label>
              <input {...register('code', { required: true })} className={inputClass} placeholder="e.g. MTH-101" />
              {errors.code && <span className="text-xs text-red-500">Code is required</span>}
            </div>
            <div>
              <label className={labelClass}>Subject Name *</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Mathematics" />
              {errors.name && <span className="text-xs text-red-500">Name is required</span>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Assigned Teacher *</label>
            <input {...register('teacher', { required: true })} className={inputClass} placeholder="e.g. Dr. Rajesh Kumar" />
          </div>
          <div>
            <label className={labelClass}>Classes (comma-separated) *</label>
            <input {...register('classesStr', { required: true })} className={inputClass} placeholder="e.g. 9th, 10th, 11th" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Credits *</label>
              <input type="number" {...register('credits', { required: true })} className={inputClass} placeholder="e.g. 4" />
            </div>
            <div>
              <label className={labelClass}>Type *</label>
              <select {...register('type', { required: true })} className={inputClass}>
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Lab">Lab</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status', { required: true })} className={inputClass}>
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
                setEditingSubject(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createSubject.isPending || updateSubject.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createSubject.isPending || updateSubject.isPending
                ? 'Saving…'
                : editingSubject
                ? 'Update Subject'
                : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
