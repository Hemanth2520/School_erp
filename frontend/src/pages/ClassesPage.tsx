import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Layout, Users, School, BookOpen, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type ClassItem = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  sections: string | string[];
  students: number;
  classTeacher: string;
  room: string;
  academicYear: string;
  status?: string;
};

type ClassFormInputs = {
  name: string;
  sectionsStr: string;
  classTeacher: string;
  room: string;
  students: number;
  academicYear: string;
  status: string;
};

export function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const { data: classes = [], isLoading: loadingClasses, error } = useApiList<ClassItem>('classes');
  const createClass = useApiCreate();
  const updateClass = useApiUpdate();
  const deleteClass = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClassFormInputs>({
    defaultValues: {
      academicYear: '2026-2027',
      status: 'Active',
      students: 0,
    },
  });

  const handleOpenAddModal = () => {
    setEditingClass(null);
    reset({
      name: '',
      sectionsStr: 'A, B',
      classTeacher: '',
      room: '',
      students: 0,
      academicYear: '2026-2027',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls: ClassItem) => {
    setEditingClass(cls);
    setValue('name', cls.name || '');
    const secStr = Array.isArray(cls.sections) ? cls.sections.join(', ') : cls.sections || '';
    setValue('sectionsStr', secStr);
    setValue('classTeacher', cls.classTeacher || '');
    setValue('room', cls.room || '');
    setValue('students', cls.students || 0);
    setValue('academicYear', cls.academicYear || '2026-2027');
    setValue('status', cls.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (cls: ClassItem) => {
    const classId = cls.customId || cls._id || cls.id;
    if (!classId) return;

    if (window.confirm(`Are you sure you want to delete class ${cls.name}?`)) {
      try {
        await deleteClass.mutateAsync({ path: 'classes', id: classId });
        toast.success(`Class ${cls.name} deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete class');
      }
    }
  };

  const onSubmit = async (data: ClassFormInputs) => {
    try {
      const secArray = data.sectionsStr ? data.sectionsStr.split(',').map(s => s.trim()) : [];
      if (editingClass) {
        const classId = editingClass.customId || editingClass._id || editingClass.id;
        await updateClass.mutateAsync({
          path: 'classes',
          id: classId!,
          data: {
            name: data.name,
            sections: secArray,
            classTeacher: data.classTeacher,
            room: data.room,
            students: Number(data.students),
            academicYear: data.academicYear,
            status: data.status,
          },
        });
        toast.success(`Class ${data.name} updated successfully!`);
      } else {
        await createClass.mutateAsync({
          path: 'classes',
          data: {
            name: data.name,
            sections: secArray,
            classTeacher: data.classTeacher,
            room: data.room,
            students: Number(data.students),
            academicYear: data.academicYear,
            status: data.status,
          },
        });
        toast.success(`Class ${data.name} added successfully!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingClass(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save class details');
    }
  };

  const columns: ColumnDef<ClassItem>[] = [
    {
      accessorKey: 'name',
      header: 'Class Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {(row.getValue('name') as string || 'CL').slice(0, 3)}
          </div>
          <span className="font-semibold text-sm">Class {row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'sections',
      header: 'Sections',
      cell: ({ row }) => {
        const val = row.getValue('sections');
        const secList = Array.isArray(val) ? val : typeof val === 'string' ? val.split(',') : [];
        return (
          <div className="flex flex-wrap gap-1">
            {secList.map((s: string) => (
              <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{s.trim()}</span>
            ))}
          </div>
        );
      },
    },
    { accessorKey: 'classTeacher', header: 'Class Teacher', cell: ({ row }) => <span className="text-sm">{row.getValue('classTeacher') || 'Unassigned'}</span> },
    { accessorKey: 'room', header: 'Room No.', cell: ({ row }) => <span className="text-sm font-mono">{row.getValue('room')}</span> },
    { accessorKey: 'students', header: 'Students', cell: ({ row }) => <span className="font-semibold text-sm">{row.getValue('students') || 0}</span> },
    { accessorKey: 'academicYear', header: 'Academic Year', cell: ({ row }) => <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">{row.getValue('academicYear')}</span> },
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
            title="Edit Class"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClass(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Class"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalStudentsCount = classes.reduce((sum, c) => sum + (c.students || 0), 0);

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={`space-y-8 ${loadingClasses ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader
        title="Class Management"
        description="Manage academic classes, sections, class teachers, and classroom allocations."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Class"
      />

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load classes. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Classes" value={classes.length || 0} icon={Layout} description="active class blocks" />
        <StatCard title="Total Students" value={totalStudentsCount || 0} icon={Users} description="enrolled across classes" iconColor="text-blue-500" />
        <StatCard title="Class Teachers" value={classes.filter(c => c.classTeacher).length} icon={School} description="assigned teachers" iconColor="text-purple-500" />
        <StatCard title="Active Classes" value={classes.filter(c => c.status !== 'Inactive').length} icon={BookOpen} description="running this session" iconColor="text-green-500" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Classes & Sections</h3>
          <p className="text-xs text-muted-foreground">Comprehensive list of all school classes and assigned rooms</p>
        </div>
        <DataTable columns={columns} data={classes} searchKey="name" searchPlaceholder="Search classes..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class Details' : 'Add New Class'}
        description={editingClass ? 'Update class room, section, or teacher allocation.' : 'Create a new class grade and assign sections.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class Name / Grade *</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. 10th" />
              {errors.name && <span className="text-xs text-red-500">Class name is required</span>}
            </div>
            <div>
              <label className={labelClass}>Sections (comma-separated) *</label>
              <input {...register('sectionsStr', { required: true })} className={inputClass} placeholder="e.g. A, B, C" />
              {errors.sectionsStr && <span className="text-xs text-red-500">Sections required</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class Teacher *</label>
              <input {...register('classTeacher', { required: true })} className={inputClass} placeholder="e.g. Dr. Rajesh Kumar" />
            </div>
            <div>
              <label className={labelClass}>Room Number *</label>
              <input {...register('room', { required: true })} className={inputClass} placeholder="e.g. Room 101" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Total Students</label>
              <input type="number" {...register('students')} className={inputClass} placeholder="e.g. 40" />
            </div>
            <div>
              <label className={labelClass}>Academic Year *</label>
              <input {...register('academicYear', { required: true })} className={inputClass} placeholder="e.g. 2026-2027" />
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
                setEditingClass(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createClass.isPending || updateClass.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createClass.isPending || updateClass.isPending
                ? 'Saving…'
                : editingClass
                ? 'Update Class'
                : 'Add Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
