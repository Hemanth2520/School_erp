import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Calendar, Clock, Edit2, Trash2, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type ExamScheduleItem = {
  _id?: string;
  id?: string;
  customId?: string;
  examId?: string;
  examName?: string;
  exam?: string; // fallback
  class: string;
  subject: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  room?: string;
  invigilator?: string;
};

type Exam = {
  _id?: string;
  id?: string;
  name: string;
  class?: string;
  type?: string;
};

type ClassItem = {
  name: string;
};

type SubjectItem = {
  name: string;
};

type TeacherItem = {
  name: string;
};

type ExamScheduleFormInputs = {
  examName: string;
  class: string;
  subject: string;
  date: string;
  startTime: string;
  duration: string;
  room: string;
  invigilator: string;
};

export function ExamSchedule() {
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamScheduleItem | null>(null);

  const { data: scheduleList = [], isLoading: loadingSchedule, error } = useApiList<ExamScheduleItem>('exam-schedules');
  const { data: examsList = [] } = useApiList<Exam>('exams');
  const { data: classesList = [] } = useApiList<ClassItem>('classes');
  const { data: subjectsList = [] } = useApiList<SubjectItem>('subjects');
  const { data: teachersList = [] } = useApiList<TeacherItem>('teachers');

  const createSchedule = useApiCreate();
  const updateSchedule = useApiUpdate();
  const deleteSchedule = useApiDelete();
  const createExam = useApiCreate();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExamScheduleFormInputs>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      duration: '2 hrs',
      room: 'Hall A',
    },
  });

  const { register: registerNewExam, handleSubmit: handleSubmitNewExam, reset: resetNewExam } = useForm<{ name: string; class: string; type: string }>();

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    reset({
      examName: examsList[0]?.name || 'Unit Test 1',
      class: classesList[0]?.name || '10th A',
      subject: subjectsList[0]?.name || 'Mathematics',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      duration: '2 hrs',
      room: 'Hall A',
      invigilator: teachersList[0]?.name || 'Dr. John Mathew',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ExamScheduleItem) => {
    setEditingSchedule(item);
    setValue('examName', item.examName || item.exam || '');
    setValue('class', item.class || '');
    setValue('subject', item.subject || '');
    setValue('date', item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('startTime', item.startTime || item.time || '10:00 AM');
    setValue('duration', item.duration || '2 hrs');
    setValue('room', item.room || 'Hall A');
    setValue('invigilator', item.invigilator || '');
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = async (item: ExamScheduleItem) => {
    const id = item.customId || item._id || item.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete exam schedule for ${item.subject}?`)) {
      try {
        await deleteSchedule.mutateAsync({ path: 'exam-schedules', id });
        toast.success('Exam schedule deleted.');
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete schedule');
      }
    }
  };

  const onSubmitSchedule = async (data: ExamScheduleFormInputs) => {
    try {
      const payload = {
        examName: data.examName,
        exam: data.examName,
        class: data.class,
        subject: data.subject,
        date: data.date,
        startTime: data.startTime,
        time: data.startTime,
        duration: data.duration,
        room: data.room,
        invigilator: data.invigilator,
      };

      if (editingSchedule) {
        const id = editingSchedule.customId || editingSchedule._id || editingSchedule.id;
        await updateSchedule.mutateAsync({
          path: 'exam-schedules',
          id: id!,
          data: payload,
        });
        toast.success(`Exam schedule updated for ${data.subject}!`);
      } else {
        await createSchedule.mutateAsync({
          path: 'exam-schedules',
          data: payload,
        });
        toast.success(`Exam schedule created for ${data.subject}!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingSchedule(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save exam schedule');
    }
  };

  const onSubmitCreateExam = async (data: { name: string; class: string; type: string }) => {
    try {
      await createExam.mutateAsync({
        path: 'exams',
        data: {
          ...data,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          totalMarks: 100,
          status: 'Upcoming',
        },
      });
      toast.success(`Exam "${data.name}" created!`);
      resetNewExam();
      setIsNewExamModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create exam');
    }
  };

  // Filter schedules by selected exam and class
  const filteredSchedule = scheduleList.filter(s => {
    const matchesExam = !selectedExamFilter || (s.examName || s.exam) === selectedExamFilter;
    const matchesClass = !selectedClassFilter || s.class === selectedClassFilter;
    return matchesExam && matchesClass;
  });

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingSchedule ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Exam Schedule"
        description="View and manage examination timetables by class, subject, and room venue."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Create Exam Schedule"
        showExport
        actions={
          <button
            onClick={() => setIsNewExamModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" /> New Exam Term
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load exam schedules. Please retry.
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={selectedExamFilter}
          onChange={e => setSelectedExamFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
        >
          <option value="">All Exams ({examsList.length})</option>
          {examsList.map(e => (
            <option key={e._id || e.id || e.name} value={e.name}>
              {e.name}
            </option>
          ))}
        </select>

        <select
          value={selectedClassFilter}
          onChange={e => setSelectedClassFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Classes</option>
          {classesList.map(c => (
            <option key={c.name} value={c.name}>
              Class {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {filteredSchedule.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            No exam schedules found. Click "Create Exam Schedule" above to add a new slot.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Exam Name', 'Date', 'Subject', 'Class', 'Time & Duration', 'Room', 'Invigilator', 'Actions'].map(h => (
                  <th key={h} className="h-11 px-4 text-left text-xs font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((s, i) => (
                <tr key={s.customId || s._id || s.id || i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground text-xs">
                    {s.examName || s.exam || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-xs">
                        {s.date ? new Date(s.date).toISOString().split('T')[0] : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">{s.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">Class {s.class}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{s.startTime || s.time || '10:00 AM'}</span>
                      {s.duration && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground ml-1">{s.duration}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{s.room || 'Hall A'}</td>
                  <td className="px-4 py-3 text-xs">{s.invigilator || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit Schedule"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(s)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal 1: Create / Edit Exam Schedule */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        title={editingSchedule ? 'Edit Exam Schedule Slot' : 'Create Exam Schedule'}
        description={editingSchedule ? 'Modify existing exam schedule details.' : 'Schedule an examination slot for a class and subject.'}
      >
        <form onSubmit={handleSubmit(onSubmitSchedule)} className="space-y-4">
          <div>
            <label className={labelClass}>Examination Term / Name *</label>
            {examsList.length > 0 ? (
              <select {...register('examName', { required: true })} className={inputClass}>
                {examsList.map(e => (
                  <option key={e._id || e.id || e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            ) : (
              <input {...register('examName', { required: true })} className={inputClass} placeholder="e.g. Unit Test 1" />
            )}
            {errors.examName && <span className="text-xs text-red-500">Exam name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class & Section *</label>
              {classesList.length > 0 ? (
                <select {...register('class', { required: true })} className={inputClass}>
                  {classesList.map(c => (
                    <option key={c.name} value={c.name}>
                      Class {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. 10th A" />
              )}
              {errors.class && <span className="text-xs text-red-500">Class required</span>}
            </div>

            <div>
              <label className={labelClass}>Subject *</label>
              {subjectsList.length > 0 ? (
                <select {...register('subject', { required: true })} className={inputClass}>
                  {subjectsList.map(sub => (
                    <option key={sub.name} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...register('subject', { required: true })} className={inputClass} placeholder="e.g. Mathematics" />
              )}
              {errors.subject && <span className="text-xs text-red-500">Subject required</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Exam Date *</label>
              <input type="date" {...register('date', { required: true })} className={inputClass} />
              {errors.date && <span className="text-xs text-red-500">Date required</span>}
            </div>

            <div>
              <label className={labelClass}>Start Time *</label>
              <input {...register('startTime', { required: true })} className={inputClass} placeholder="e.g. 10:00 AM" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duration</label>
              <input {...register('duration')} className={inputClass} placeholder="e.g. 2 hrs" />
            </div>

            <div>
              <label className={labelClass}>Room / Hall Venue</label>
              <input {...register('room')} className={inputClass} placeholder="e.g. Hall A / Lab 1" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Invigilator / Supervisor</label>
            {teachersList.length > 0 ? (
              <select {...register('invigilator')} className={inputClass}>
                <option value="">-- Select Teacher / Invigilator --</option>
                {teachersList.map(t => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <input {...register('invigilator')} className={inputClass} placeholder="e.g. Dr. John Mathew" />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSchedule(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createSchedule.isPending || updateSchedule.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createSchedule.isPending || updateSchedule.isPending
                ? 'Saving…'
                : editingSchedule
                ? 'Update Schedule'
                : 'Create Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: New Exam Term */}
      <Modal
        isOpen={isNewExamModalOpen}
        onClose={() => setIsNewExamModalOpen(false)}
        title="Create New Exam Term"
        description="Add a new examination master term (e.g. Final Examination 2026)."
      >
        <form onSubmit={handleSubmitNewExam(onSubmitCreateExam)} className="space-y-4">
          <div>
            <label className={labelClass}>Exam Name *</label>
            <input {...registerNewExam('name', { required: true })} className={inputClass} placeholder="e.g. Unit Test 2 / Mid-Term 2026" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class / Grades *</label>
              <input {...registerNewExam('class', { required: true })} className={inputClass} placeholder="e.g. All Classes / 10th" />
            </div>

            <div>
              <label className={labelClass}>Exam Type *</label>
              <select {...registerNewExam('type', { required: true })} className={inputClass}>
                <option value="Unit Test">Unit Test</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsNewExamModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createExam.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createExam.isPending ? 'Saving…' : 'Create Exam Term'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
