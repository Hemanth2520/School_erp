import { useState, Fragment } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type TimetableItem = {
  _id?: string;
  id?: string;
  customId?: string;
  class: string;
  section?: string;
  day: string;
  period: string | number;
  subject: string;
  teacher: string;
  room: string;
};

type TimetableFormInputs = {
  class: string;
  section: string;
  day: string;
  period: string;
  subject: string;
  teacher: string;
  room: string;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const availableClasses = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const availablePeriods = [
  '8:00–8:45',
  '8:45–9:30',
  '9:30–10:15',
  '10:30–11:15',
  '11:15–12:00',
  '12:00–12:45',
  '1:30–2:15',
  '2:15–3:00',
];

const periodColors = [
  'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
  'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
];

export function Timetable() {
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedSection, setSelectedSection] = useState('A');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);

  const { data: timetableList = [], isLoading: loadingTimetable } = useApiList<TimetableItem>('timetable');

  const createTimetable = useApiCreate();
  const updateTimetable = useApiUpdate();
  const deleteTimetable = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TimetableFormInputs>({
    defaultValues: {
      class: '10th',
      section: 'A',
      day: 'Monday',
      period: '8:00–8:45',
    },
  });

  const handleOpenAddModal = (dayInit?: string, periodInit?: string) => {
    setEditingItem(null);
    reset({
      class: selectedClass,
      section: selectedSection,
      day: dayInit || 'Monday',
      period: periodInit || '8:00–8:45',
      subject: '',
      teacher: '',
      room: 'Room 101',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TimetableItem) => {
    setEditingItem(item);
    setValue('class', item.class || selectedClass);
    setValue('section', item.section || selectedSection);
    setValue('day', item.day || 'Monday');
    setValue('period', String(item.period || '8:00–8:45'));
    setValue('subject', item.subject || '');
    setValue('teacher', item.teacher || '');
    setValue('room', item.room || '');
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item: TimetableItem) => {
    const itemId = item.customId || item._id || item.id;
    if (!itemId) return;

    if (window.confirm(`Delete timetable entry for ${item.subject} (${item.day}, ${item.period})?`)) {
      try {
        await deleteTimetable.mutateAsync({ path: 'timetable', id: itemId });
        toast.success('Timetable entry deleted.');
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete timetable entry');
      }
    }
  };

  const onSubmit = async (data: TimetableFormInputs) => {
    try {
      if (editingItem) {
        const itemId = editingItem.customId || editingItem._id || editingItem.id;
        await updateTimetable.mutateAsync({
          path: 'timetable',
          id: itemId!,
          data,
        });
        toast.success(`Timetable entry updated for ${data.subject}!`);
      } else {
        await createTimetable.mutateAsync({
          path: 'timetable',
          data,
        });
        toast.success(`Timetable entry created for ${data.subject}!`);
      }
      reset();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save timetable entry');
    }
  };

  // Filter items for current selected class and section
  const currentItems = timetableList.filter(
    t => t.class === selectedClass && (!t.section || t.section === selectedSection)
  );

  // Helper map: [Day][Period] -> TimetableItem
  const getItemMap = (d: string, p: string) => {
    return currentItems.find(t => t.day === d && (String(t.period) === p || t.period === p));
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingTimetable ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Class Timetable"
        description="Schedule and manage weekly class periods across all grades."
        onAdd={() => handleOpenAddModal()}
        addEnabled
        addLabel="Create Timetable Entry"
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden mt-6">
        {/* Class and Section Filter Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Class {selectedClass} - Section {selectedSection} Schedule</h3>
              <p className="text-xs text-muted-foreground">Select a grade and section to view or update schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mr-2">Class:</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {availableClasses.map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mr-2">Section:</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {['A', 'B', 'C', 'Science', 'Commerce', 'Arts'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-36 sticky left-0 bg-muted/40 z-10">Period / Day</th>
                {days.map(day => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availablePeriods.map((period, pi) => (
                <Fragment key={period}>
                  {period === '10:30–11:15' && (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground bg-muted/30 border-y border-border">
                        ☕ Morning Refreshment Break — 10:15 AM to 10:30 AM
                      </td>
                    </tr>
                  )}
                  {period === '1:30–2:15' && (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground bg-muted/30 border-y border-border">
                        🍽️ Lunch Break — 12:45 PM to 1:30 PM
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-card z-10 border-r border-border/40">
                      <p className="text-xs font-bold text-foreground">Period {pi + 1}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{period}</p>
                    </td>
                    {days.map((day, di) => {
                      const item = getItemMap(day, period);
                      const colorClass = periodColors[(pi + di) % periodColors.length];

                      return (
                        <td key={day} className="px-2 py-2 text-center align-top relative group min-w-[130px]">
                          {item ? (
                            <div className={`rounded-xl border p-2.5 text-left relative transition-all group-hover:shadow-sm ${colorClass}`}>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <p className="text-xs font-bold leading-tight truncate">{item.subject}</p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenEditModal(item)}
                                    className="p-1 rounded hover:bg-background/80 text-foreground transition-colors"
                                    title="Edit Period"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item)}
                                    className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
                                    title="Delete Period"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-[10px] opacity-80 truncate">{item.teacher}</p>
                              <p className="text-[10px] opacity-60 font-mono mt-0.5">{item.room}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAddModal(day, period)}
                              className="w-full h-full min-h-[64px] rounded-xl border border-dashed border-border/60 hover:border-primary/50 flex flex-col items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-all text-xs"
                              title="Add Period Entry"
                            >
                              <Plus className="h-4 w-4 mb-0.5 opacity-60" />
                              <span className="text-[10px]">Add Entry</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Timetable Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Timetable Entry' : 'Create Timetable Entry'}
        description={editingItem ? 'Update class period details.' : 'Schedule a subject for a specific period and day.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class *</label>
              <select {...register('class', { required: true })} className={inputClass}>
                {availableClasses.map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Section *</label>
              <select {...register('section', { required: true })} className={inputClass}>
                {['A', 'B', 'C', 'Science', 'Commerce', 'Arts'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Day of Week *</label>
              <select {...register('day', { required: true })} className={inputClass}>
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Period / Time *</label>
              <select {...register('period', { required: true })} className={inputClass}>
                {availablePeriods.map((p, idx) => (
                  <option key={p} value={p}>Period {idx + 1} ({p})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Subject Name *</label>
            <input {...register('subject', { required: true })} className={inputClass} placeholder="e.g. Mathematics" />
            {errors.subject && <span className="text-xs text-red-500">Subject is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teacher Name *</label>
              <input {...register('teacher', { required: true })} className={inputClass} placeholder="e.g. Dr. Rajesh Kumar" />
              {errors.teacher && <span className="text-xs text-red-500">Teacher name required</span>}
            </div>
            <div>
              <label className={labelClass}>Room Number *</label>
              <input {...register('room', { required: true })} className={inputClass} placeholder="e.g. Room 101" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createTimetable.isPending || updateTimetable.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createTimetable.isPending || updateTimetable.isPending
                ? 'Saving…'
                : editingItem
                ? 'Update Entry'
                : 'Save Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
