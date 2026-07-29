import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { FileText, CheckCircle, Clock, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Exam = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  class: string;
  type: string;
  startDate: string;
  endDate: string;
  totalMarks: number;
  status: string;
};

type ExamFormInputs = {
  name: string;
  class: string;
  type: string;
  startDate: string;
  endDate: string;
  totalMarks: number;
  status: string;
};

export function Exams() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const { data: exams = [], isLoading: loadingExams, error } = useApiList<Exam>('exams');
  const createExam = useApiCreate();
  const updateExam = useApiUpdate();
  const deleteExam = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExamFormInputs>({
    defaultValues: {
      type: 'Unit Test',
      status: 'Upcoming',
      totalMarks: 100,
    },
  });

  const handleOpenAddModal = () => {
    setEditingExam(null);
    reset({
      name: '',
      class: 'Class 10th',
      type: 'Unit Test',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalMarks: 100,
      status: 'Upcoming',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setValue('name', exam.name || '');
    setValue('class', exam.class || '');
    setValue('type', exam.type || 'Unit Test');
    setValue('startDate', exam.startDate ? new Date(exam.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('endDate', exam.endDate ? new Date(exam.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('totalMarks', exam.totalMarks || 100);
    setValue('status', exam.status || 'Upcoming');
    setIsModalOpen(true);
  };

  const handleDeleteExam = async (exam: Exam) => {
    const examId = exam.customId || exam._id || exam.id;
    if (!examId) return;

    if (window.confirm(`Are you sure you want to delete exam "${exam.name}"?`)) {
      try {
        await deleteExam.mutateAsync({ path: 'exams', id: examId });
        toast.success(`Exam deleted successfully.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete exam');
      }
    }
  };

  const onSubmit = async (data: ExamFormInputs) => {
    try {
      const payload = {
        ...data,
        totalMarks: Number(data.totalMarks),
      };

      if (editingExam) {
        const examId = editingExam.customId || editingExam._id || editingExam.id;
        await updateExam.mutateAsync({
          path: 'exams',
          id: examId!,
          data: payload,
        });
        toast.success(`Exam "${data.name}" updated!`);
      } else {
        await createExam.mutateAsync({
          path: 'exams',
          data: payload,
        });
        toast.success(`Exam "${data.name}" created!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingExam(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save exam');
    }
  };

  const columns: ColumnDef<Exam>[] = [
    {
      accessorKey: 'customId',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('customId') || row.original.id || 'EXM-101'}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Exam Name',
      cell: ({ row }) => <span className="font-medium text-sm">{row.getValue('name')}</span>,
    },
    { accessorKey: 'class', header: 'Class' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{row.getValue('type') || 'Exam'}</span>,
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => <span className="text-xs">{row.getValue('startDate') ? new Date(row.getValue('startDate')).toISOString().split('T')[0] : '—'}</span>,
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => <span className="text-xs">{row.getValue('endDate') ? new Date(row.getValue('endDate')).toISOString().split('T')[0] : '—'}</span>,
    },
    {
      accessorKey: 'totalMarks',
      header: 'Total Marks',
      cell: ({ row }) => <span className="font-medium">{row.getValue('totalMarks')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Upcoming'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Exam"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteExam(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Exam"
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
    <div className={loadingExams ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Exam Management"
        description="Create and manage examinations, schedules, and results."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Create Exam"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load exams. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Exams" value={exams.length} icon={FileText} description="this academic year" />
        <StatCard title="Upcoming" value={exams.filter(e => e.status === 'Upcoming').length} icon={Clock} iconColor="text-blue-500" description="scheduled" />
        <StatCard title="Completed" value={exams.filter(e => e.status === 'Completed').length} icon={CheckCircle} iconColor="text-green-500" description="finished" />
        <StatCard title="Scheduled" value={exams.filter(e => e.status === 'Scheduled').length} icon={CalendarDays} iconColor="text-purple-500" description="in planning" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={exams} searchKey="name" searchPlaceholder="Search exams..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExam(null);
        }}
        title={editingExam ? 'Edit Examination' : 'Create New Examination'}
        description={editingExam ? 'Modify existing examination details.' : 'Schedule a new examination term or unit test.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Exam Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Mid-Term Examination 2026" />
            {errors.name && <span className="text-xs text-red-500">Exam name is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class / Grades *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. Class 10th" />
            </div>
            <div>
              <label className={labelClass}>Exam Type *</label>
              <select {...register('type', { required: true })} className={inputClass}>
                <option value="Unit Test">Unit Test</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" {...register('startDate', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input type="date" {...register('endDate', { required: true })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Marks *</label>
              <input type="number" {...register('totalMarks', { required: true })} className={inputClass} placeholder="e.g. 100" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status', { required: true })} className={inputClass}>
                <option value="Upcoming">Upcoming</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingExam(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createExam.isPending || updateExam.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createExam.isPending || updateExam.isPending
                ? 'Saving…'
                : editingExam
                ? 'Update Exam'
                : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
