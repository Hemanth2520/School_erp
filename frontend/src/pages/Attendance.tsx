import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { UserCheck, UserX, Clock, Users, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type AttendanceRecord = {
  _id?: string;
  id?: string;
  customId?: string;
  date: string;
  rollNo?: string;
  studentName: string;
  class: string;
  subject: string;
  status: string;
};

type AttendanceFormInputs = {
  date: string;
  rollNo?: string;
  studentName: string;
  class: string;
  subject: string;
  status: string;
};

export function Attendance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const { data: attendanceList = [], isLoading: loadingAtt, error } = useApiList<AttendanceRecord>('attendance');

  const createAtt = useApiCreate();
  const updateAtt = useApiUpdate();
  const deleteAtt = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AttendanceFormInputs>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
    },
  });

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    reset({
      date: new Date().toISOString().split('T')[0],
      rollNo: '',
      studentName: '',
      class: '',
      subject: '',
      status: 'Present',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setValue('date', rec.date ? new Date(rec.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('rollNo', rec.rollNo || '');
    setValue('studentName', rec.studentName || '');
    setValue('class', rec.class || '');
    setValue('subject', rec.subject || '');
    setValue('status', rec.status || 'Present');
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (rec: AttendanceRecord) => {
    const recordId = rec.customId || rec._id || rec.id;
    if (!recordId) return;

    if (window.confirm(`Are you sure you want to delete attendance record for ${rec.studentName}?`)) {
      try {
        await deleteAtt.mutateAsync({ path: 'attendance', id: recordId });
        toast.success(`Attendance record deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete attendance record');
      }
    }
  };

  const onSubmit = async (data: AttendanceFormInputs) => {
    try {
      if (editingRecord) {
        const recordId = editingRecord.customId || editingRecord._id || editingRecord.id;
        await updateAtt.mutateAsync({
          path: 'attendance',
          id: recordId!,
          data,
        });
        toast.success(`Attendance updated for ${data.studentName}!`);
      } else {
        await createAtt.mutateAsync({
          path: 'attendance',
          data,
        });
        toast.success(`Attendance marked for ${data.studentName}!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save attendance');
    }
  };

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('date') ? new Date(row.getValue('date')).toISOString().split('T')[0] : '—'}</span>,
    },
    {
      accessorKey: 'rollNo',
      header: 'Roll No',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('rollNo') || '—'}</span>,
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('studentName') as string || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <p className="font-medium text-sm">{row.getValue('studentName')}</p>
        </div>
      ),
    },
    { accessorKey: 'class', header: 'Class' },
    { accessorKey: 'subject', header: 'Subject' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Present'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Record"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteRecord(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Record"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const present = attendanceList.filter(a => a.status === 'Present').length;
  const absent = attendanceList.filter(a => a.status === 'Absent').length;
  const late = attendanceList.filter(a => a.status === 'Late').length;
  const total = attendanceList.length || 1;
  const presentRate = Math.round((present / total) * 100);

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingAtt ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Attendance"
        description="Track student and teacher attendance records."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Mark Attendance"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load attendance records. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Records" value={attendanceList.length} icon={Users} description="attendance logged" />
        <StatCard title="Present" value={present} icon={UserCheck} iconColor="text-green-500" description={`${presentRate}% rate`} />
        <StatCard title="Absent" value={absent} icon={UserX} iconColor="text-red-500" description="students absent" />
        <StatCard title="Late" value={late} icon={Clock} iconColor="text-yellow-600" description="arrived late" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Attendance Log</h3>
          <p className="text-xs text-muted-foreground">Recent class attendance records</p>
        </div>
        <DataTable columns={columns} data={attendanceList} searchKey="studentName" searchPlaceholder="Search by student..." />
      </div>

      {/* Mark / Edit Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Attendance Record' : 'Mark Attendance'}
        description={editingRecord ? 'Modify existing attendance log.' : 'Record attendance for a student.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" {...register('date', { required: true })} className={inputClass} />
              {errors.date && <span className="text-xs text-red-500">Date is required</span>}
            </div>
            <div>
              <label className={labelClass}>Attendance Status *</label>
              <select {...register('status', { required: true })} className={inputClass}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Roll No</label>
              <input {...register('rollNo')} className={inputClass} placeholder="e.g. 101" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Student Name *</label>
              <input {...register('studentName', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
              {errors.studentName && <span className="text-xs text-red-500">Student name is required</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class & Section *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. 10th-A" />
              {errors.class && <span className="text-xs text-red-500">Class required</span>}
            </div>
            <div>
              <label className={labelClass}>Subject *</label>
              <input {...register('subject', { required: true })} className={inputClass} placeholder="e.g. Mathematics" />
              {errors.subject && <span className="text-xs text-red-500">Subject required</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRecord(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createAtt.isPending || updateAtt.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createAtt.isPending || updateAtt.isPending
                ? 'Saving…'
                : editingRecord
                ? 'Update Record'
                : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
