import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Star, Award, TrendingUp, Users, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/ui/Badge';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Merit = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  category: string;
  description: string;
  points: number;
  status: string;
};

type MeritFormInputs = {
  name: string;
  category: string;
  description: string;
  points: number;
  status: string;
};

const categoryColors: Record<string, string> = {
  Academic: 'bg-blue-500/10 text-blue-600',
  Sports: 'bg-green-500/10 text-green-600',
  Discipline: 'bg-purple-500/10 text-purple-600',
  Social: 'bg-yellow-500/10 text-yellow-700',
};

export function Assessment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMerit, setEditingMerit] = useState<Merit | null>(null);

  const { data: merits = [], isLoading: loadingMerits, error } = useApiList<Merit>('merits');

  const createMerit = useApiCreate();
  const updateMerit = useApiUpdate();
  const deleteMerit = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MeritFormInputs>({
    defaultValues: {
      category: 'Academic',
      points: 20,
      status: 'Active',
    },
  });

  const handleOpenAddModal = () => {
    setEditingMerit(null);
    reset({
      name: '',
      category: 'Academic',
      description: '',
      points: 20,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (merit: Merit) => {
    setEditingMerit(merit);
    setValue('name', merit.name || '');
    setValue('category', merit.category || 'Academic');
    setValue('description', merit.description || '');
    setValue('points', merit.points || 0);
    setValue('status', merit.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteMerit = async (merit: Merit) => {
    const id = merit.customId || merit._id || merit.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete merit category "${merit.name}"?`)) {
      try {
        await deleteMerit.mutateAsync({ path: 'merits', id });
        toast.success(`Merit category deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete merit category');
      }
    }
  };

  const onSubmit = async (data: MeritFormInputs) => {
    try {
      const payload = {
        ...data,
        points: Number(data.points) || 0,
      };

      if (editingMerit) {
        const id = editingMerit.customId || editingMerit._id || editingMerit.id;
        await updateMerit.mutateAsync({
          path: 'merits',
          id: id!,
          data: payload,
        });
        toast.success(`Merit category "${data.name}" updated!`);
      } else {
        await createMerit.mutateAsync({
          path: 'merits',
          data: payload,
        });
        toast.success(`Merit category "${data.name}" added!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingMerit(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save merit category');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingMerits ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Child Assessment & Merits"
        description="Manage student merit points, achievement badges, and behavioral assessments."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Merit Category"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load merits. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Merits" value={merits.length} icon={Star} description="categories" />
        <StatCard title="Total Points" value={merits.reduce((s, m) => s + (m.points || 0), 0)} icon={Award} iconColor="text-yellow-500" description="across all merits" />
        <StatCard title="Students Awarded" value="28" icon={Users} iconColor="text-blue-500" description="this month" />
        <StatCard title="Avg Points/Student" value="14" icon={TrendingUp} iconColor="text-green-500" description="this quarter" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {merits.map(merit => (
          <div key={merit.customId || merit._id || merit.id || merit.name} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[merit.category] || 'bg-muted text-muted-foreground'}`}>
                  {merit.category}
                </span>
                <button
                  onClick={() => handleOpenEditModal(merit)}
                  className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                  title="Edit Merit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMerit(merit)}
                  className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                  title="Delete Merit"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-sm mb-1">{merit.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{merit.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{merit.points} pts</span>
              </div>
              <StatusBadge status={merit.status || 'Active'} />
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMerit(null);
        }}
        title={editingMerit ? 'Edit Merit Category' : 'Add Merit Category'}
        description={editingMerit ? 'Modify merit criteria or point allocation.' : 'Define a new merit achievement category and reward points.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Merit Category Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Science Fair Champion" />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category Type *</label>
              <select {...register('category', { required: true })} className={inputClass}>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Discipline">Discipline</option>
                <option value="Social">Social / Service</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Merit Points *</label>
              <input type="number" {...register('points', { required: true })} className={inputClass} placeholder="e.g. 50" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status *</label>
            <select {...register('status')} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <textarea {...register('description', { required: true })} rows={2} className={`${inputClass} resize-none`} placeholder="Brief criteria for earning this merit" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingMerit(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createMerit.isPending || updateMerit.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMerit.isPending || updateMerit.isPending
                ? 'Saving…'
                : editingMerit
                ? 'Update Merit'
                : 'Add Merit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
