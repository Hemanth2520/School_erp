import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { UserMinus, Calendar, School, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type LeftStudent = {
  _id?: string;
  id?: string;
  customId?: string;
  studentId?: string;
  name: string;
  class: string;
  section?: string;
  leftDate: string;
  reason: string;
  tcIssued: boolean;
  tcNo?: string;
  lastFee?: string;
  pendingFees: number;
};

type Student = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  class: string;
  section?: string;
  status?: string;
};

type LeftStudentFormInputs = {
  selectedStudentId?: string;
  name: string;
  class: string;
  section?: string;
  leftDate: string;
  reason: string;
  tcIssued: boolean;
  tcNo?: string;
  lastFee?: string;
  pendingFees: number;
  markStudentInactive?: boolean;
};

export function StudentLeftList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LeftStudent | null>(null);

  const { data: studentLeftList = [], isLoading: loadingLeft, error } = useApiList<LeftStudent>('students-left');
  const { data: studentsList = [] } = useApiList<Student>('students');

  const createLeft = useApiCreate();
  const updateLeft = useApiUpdate();
  const deleteLeft = useApiDelete();
  const updateStudent = useApiUpdate();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LeftStudentFormInputs>({
    defaultValues: {
      leftDate: new Date().toISOString().split('T')[0],
      tcIssued: false,
      pendingFees: 0,
      markStudentInactive: true,
    },
  });

  const selectedStudentId = watch('selectedStudentId');

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('selectedStudentId', val);
    if (!val) return;
    const found = studentsList.find(s => (s.customId || s._id || s.id) === val);
    if (found) {
      setValue('name', found.name);
      setValue('class', found.class);
      setValue('section', found.section || '');
    }
  };

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    reset({
      selectedStudentId: '',
      name: '',
      class: '',
      section: '',
      leftDate: new Date().toISOString().split('T')[0],
      reason: 'Relocated to another city',
      tcIssued: false,
      tcNo: '',
      lastFee: '',
      pendingFees: 0,
      markStudentInactive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: LeftStudent) => {
    setEditingRecord(rec);
    setValue('name', rec.name || '');
    setValue('class', rec.class || '');
    setValue('section', rec.section || '');
    setValue('leftDate', rec.leftDate ? new Date(rec.leftDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('reason', rec.reason || '');
    setValue('tcIssued', Boolean(rec.tcIssued));
    setValue('tcNo', rec.tcNo || '');
    setValue('lastFee', rec.lastFee || '');
    setValue('pendingFees', rec.pendingFees || 0);
    setValue('markStudentInactive', false);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (rec: LeftStudent) => {
    const recordId = rec.customId || rec._id || rec.id;
    if (!recordId) return;

    if (window.confirm(`Are you sure you want to delete the record for ${rec.name}?`)) {
      try {
        await deleteLeft.mutateAsync({ path: 'students-left', id: recordId });
        toast.success(`Left student record deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete record');
      }
    }
  };

  const onSubmit = async (data: LeftStudentFormInputs) => {
    try {
      const payload = {
        name: data.name,
        class: data.class,
        section: data.section,
        leftDate: data.leftDate,
        reason: data.reason,
        tcIssued: Boolean(data.tcIssued),
        tcNo: data.tcNo,
        lastFee: data.lastFee,
        pendingFees: Number(data.pendingFees) || 0,
        studentId: data.selectedStudentId || undefined,
      };

      if (editingRecord) {
        const recordId = editingRecord.customId || editingRecord._id || editingRecord.id;
        await updateLeft.mutateAsync({
          path: 'students-left',
          id: recordId!,
          data: payload,
        });
        toast.success(`Updated left student record for ${data.name}!`);
      } else {
        await createLeft.mutateAsync({
          path: 'students-left',
          data: payload,
        });

        // Optionally set student status to Inactive if selected from list
        if (data.markStudentInactive && data.selectedStudentId) {
          try {
            await updateStudent.mutateAsync({
              path: 'students',
              id: data.selectedStudentId,
              data: { status: 'Inactive' },
            });
          } catch {
            // non-blocking
          }
        }

        toast.success(`Recorded left student ${data.name}!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save left student record');
    }
  };

  const columns: ColumnDef<LeftStudent>[] = [
    {
      accessorKey: 'customId',
      header: 'Record ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue('customId') || row.original.id || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-xs">
            {(row.getValue('name') as string || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">
              Class {row.original.class} {row.original.section || ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'leftDate',
      header: 'Left Date',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.getValue('leftDate') ? new Date(row.getValue('leftDate')).toISOString().split('T')[0] : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('reason') || '—'}</span>,
    },
    {
      accessorKey: 'tcIssued',
      header: 'TC Issued',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            row.getValue('tcIssued') ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
          }`}
        >
          {row.getValue('tcIssued') ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: 'tcNo',
      header: 'TC No.',
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('tcNo') || '—'}</span>,
    },
    {
      accessorKey: 'pendingFees',
      header: 'Pending Fees',
      cell: ({ row }) => {
        const fees = Number(row.getValue('pendingFees')) || 0;
        return (
          <span className={`font-semibold text-sm ${fees > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {fees > 0 ? `₹${fees.toLocaleString()}` : '✓ Clear'}
          </span>
        );
      },
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

  const pendingTC = studentLeftList.filter(s => !s.tcIssued).length;
  const pendingFees = studentLeftList.filter(s => (s.pendingFees || 0) > 0).length;

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingLeft ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Student Left List"
        description="Records of students who have left the school."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Record Left Student"
        showExport
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load left student records. Please retry.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Left" value={studentLeftList.length} icon={UserMinus} iconColor="text-red-500" description="recorded" />
        <StatCard title="TC Pending" value={pendingTC} icon={School} iconColor="text-yellow-600" description="to be issued" />
        <StatCard title="Fee Pending" value={pendingFees} icon={Calendar} iconColor="text-red-500" description="students owe fees" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={studentLeftList} searchKey="name" searchPlaceholder="Search student by name..." />
      </div>

      {/* Record Left Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Left Student Record' : 'Record Left Student'}
        description={editingRecord ? 'Modify existing left student entry.' : 'Record details of a student leaving the school.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingRecord && (
            <div>
              <label className={labelClass}>Select Existing Student (Optional)</label>
              <select value={selectedStudentId || ''} onChange={handleStudentSelect} className={inputClass}>
                <option value="">-- Select from enrolled students --</option>
                {studentsList.map(s => {
                  const id = s.customId || s._id || s.id;
                  return (
                    <option key={id} value={id}>
                      {s.name} ({s.class} {s.section || ''})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Student Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Arjun Kumar" />
            {errors.name && <span className="text-xs text-red-500">Student name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. 7th" />
              {errors.class && <span className="text-xs text-red-500">Class required</span>}
            </div>
            <div>
              <label className={labelClass}>Section</label>
              <input {...register('section')} className={inputClass} placeholder="e.g. A" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Left Date *</label>
              <input type="date" {...register('leftDate', { required: true })} className={inputClass} />
              {errors.leftDate && <span className="text-xs text-red-500">Left date required</span>}
            </div>
            <div>
              <label className={labelClass}>Reason for Leaving *</label>
              <select {...register('reason', { required: true })} className={inputClass}>
                <option value="Relocated to another city">Relocated to another city</option>
                <option value="Admission to another school">Admission to another school</option>
                <option value="Personal / Family reasons">Personal / Family reasons</option>
                <option value="Completed Studies">Completed Studies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>TC Issued?</label>
              <select
                {...register('tcIssued')}
                className={inputClass}
                onChange={e => setValue('tcIssued', e.target.value === 'true')}
              >
                <option value="false">No (Pending)</option>
                <option value="true">Yes (Issued)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>TC Number (if issued)</label>
              <input {...register('tcNo')} className={inputClass} placeholder="e.g. TC-2024-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Pending Dues / Fees (₹)</label>
              <input type="number" {...register('pendingFees')} className={inputClass} placeholder="e.g. 0" />
            </div>
            <div>
              <label className={labelClass}>Last Fee Date</label>
              <input type="date" {...register('lastFee')} className={inputClass} />
            </div>
          </div>

          {!editingRecord && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="markInactive"
                {...register('markStudentInactive')}
                className="h-4 w-4 rounded border-input text-primary"
              />
              <label htmlFor="markInactive" className="text-xs text-foreground font-medium cursor-pointer">
                Automatically mark student status as "Inactive" in Students Directory
              </label>
            </div>
          )}

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
              disabled={createLeft.isPending || updateLeft.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createLeft.isPending || updateLeft.isPending
                ? 'Saving…'
                : editingRecord
                ? 'Update Record'
                : 'Record Left Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
