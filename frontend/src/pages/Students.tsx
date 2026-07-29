import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Users, UserCheck, UserX, Phone, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiStats, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Student = {
  _id?: string;
  id?: string;
  customId?: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  parentName: string;
  status: string;
  admissionDate: string;
  feeStatus: string;
  photo?: string;
};

type StudentFormInputs = {
  name: string;
  rollNo: string;
  class: string;
  section: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  parentName: string;
  feeStatus: string;
  status: string;
  address: string;
};

export function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { data: students = [], isLoading: loadingStudents, error } = useApiList<Student>('students');
  const { data: stats, isLoading: loadingStats } = useApiStats('students');

  const createStudent = useApiCreate();
  const updateStudent = useApiUpdate();
  const deleteStudent = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentFormInputs>({
    defaultValues: {
      feeStatus: 'Paid',
      status: 'Active',
    },
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    reset({
      name: '',
      rollNo: '',
      class: '',
      section: '',
      gender: '',
      dob: '',
      phone: '',
      email: '',
      parentName: '',
      feeStatus: 'Paid',
      status: 'Active',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setValue('name', student.name || '');
    setValue('rollNo', student.rollNo || '');
    setValue('class', student.class || '');
    setValue('section', student.section || '');
    setValue('gender', student.gender || '');
    setValue('dob', student.dob ? new Date(student.dob).toISOString().split('T')[0] : '');
    setValue('phone', student.phone || '');
    setValue('email', student.email || '');
    setValue('parentName', student.parentName || '');
    setValue('feeStatus', student.feeStatus || 'Paid');
    setValue('status', student.status || 'Active');
    setValue('address', student.address || '');
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (student: Student) => {
    const studentId = student.customId || student._id || student.id;
    if (!studentId) return;

    if (window.confirm(`Are you sure you want to delete student ${student.name}?`)) {
      try {
        await deleteStudent.mutateAsync({ path: 'students', id: studentId });
        toast.success(`Student ${student.name} deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete student');
      }
    }
  };

  const onSubmit = async (data: StudentFormInputs) => {
    try {
      if (editingStudent) {
        const studentId = editingStudent.customId || editingStudent._id || editingStudent.id;
        await updateStudent.mutateAsync({
          path: 'students',
          id: studentId!,
          data: {
            ...data,
          },
        });
        toast.success(`Student ${data.name} updated successfully!`);
      } else {
        await createStudent.mutateAsync({
          path: 'students',
          data: {
            ...data,
            admissionDate: new Date().toISOString().split('T')[0],
          },
        });
        toast.success(`Student ${data.name} added successfully!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save student details');
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'rollNo',
      header: 'Roll No',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('rollNo')}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('name') as string || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'class',
      header: 'Class',
      accessorFn: row => `${row.class || ''} ${row.section || ''}`.trim(),
    },
    { accessorKey: 'gender', header: 'Gender' },
    { accessorKey: 'parentName', header: 'Parent' },
    { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('phone')}</span> },
    { accessorKey: 'admissionDate', header: 'Admission Date' },
    {
      accessorKey: 'feeStatus',
      header: 'Fee Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('feeStatus') || 'Paid'} />,
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
            title="Edit Student"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteStudent(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Student"
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
    <div className={loadingStudents || loadingStats ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Student List"
        description="Manage all enrolled students and their details."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Student"
      />
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load students. Please sign in again or retry.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Students" value={stats?.total || students.length || 0} icon={Users} description="currently enrolled" />
        <StatCard title="Active" value={stats?.active || students.filter((s: any) => s.status !== 'Inactive').length || 0} icon={UserCheck} iconColor="text-green-500" description="students" />
        <StatCard title="Inactive" value={stats?.inactive || 0} icon={UserX} iconColor="text-red-500" description="students" />
        <StatCard title="Fee Pending" value={students.filter((s: Student) => s.feeStatus !== 'Paid').length} icon={Phone} iconColor="text-yellow-600" description="students have dues" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={students} searchKey="name" searchPlaceholder="Search by student name..." />
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
        description={editingStudent ? 'Update existing student record.' : 'Enter student details to register them in the system.'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
              {errors.name && <span className="text-xs text-red-500">Name is required</span>}
            </div>
            <div>
              <label className={labelClass}>Roll Number *</label>
              <input {...register('rollNo', { required: true })} className={inputClass} placeholder="e.g. STU-1001" />
              {errors.rollNo && <span className="text-xs text-red-500">Roll number is required</span>}
            </div>
            <div>
              <label className={labelClass}>Class *</label>
              <select {...register('class', { required: true })} className={inputClass}>
                <option value="">Select class</option>
                {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.class && <span className="text-xs text-red-500">Class is required</span>}
            </div>
            <div>
              <label className={labelClass}>Section *</label>
              <select {...register('section', { required: true })} className={inputClass}>
                <option value="">Select section</option>
                {['A','B','C','Science','Commerce','Arts'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.section && <span className="text-xs text-red-500">Section is required</span>}
            </div>
            <div>
              <label className={labelClass}>Gender *</label>
              <select {...register('gender', { required: true })} className={inputClass}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input type="date" {...register('dob', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input {...register('phone', { required: true })} className={inputClass} placeholder="10-digit phone" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" {...register('email', { required: true })} className={inputClass} placeholder="student@example.com" />
            </div>
            <div>
              <label className={labelClass}>Fee Status *</label>
              <select {...register('feeStatus', { required: true })} className={inputClass}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Student Status *</label>
              <select {...register('status', { required: true })} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Left">Left</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Parent Name *</label>
              <input {...register('parentName', { required: true })} className={inputClass} placeholder="Full name of parent" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea {...register('address', { required: true })} rows={2} className={`${inputClass} resize-none`} placeholder="Residential address" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createStudent.isPending || updateStudent.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createStudent.isPending || updateStudent.isPending
                ? 'Saving…'
                : editingStudent
                ? 'Update Student'
                : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
