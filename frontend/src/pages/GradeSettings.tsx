import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type GradeSetting = {
  id?: string;
  grade: string;
  minPercent: number;
  maxPercent: number;
  points: number;
  description: string;
};

type AddGradeForm = {
  grade: string;
  minPercent: number;
  maxPercent: number;
  points: number;
  description: string;
};

const gradeColors: Record<string, string> = {
  'A+': 'text-green-600 bg-green-500/10',
  'A': 'text-green-500 bg-green-500/10',
  'B+': 'text-blue-600 bg-blue-500/10',
  'B': 'text-blue-500 bg-blue-500/10',
  'C+': 'text-yellow-600 bg-yellow-500/10',
  'C': 'text-yellow-500 bg-yellow-500/10',
  'D': 'text-orange-500 bg-orange-500/10',
  'F': 'text-red-600 bg-red-500/10',
};

export function GradeSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: gradeSettings = [], isLoading: loadingGrades } = useApiList<GradeSetting>('grade-settings');
  const createGrade = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddGradeForm>();

  const onSubmit = async (data: AddGradeForm) => {
    try {
      await createGrade.mutateAsync({
        path: 'grade-settings',
        data: {
          ...data,
          minPercent: Number(data.minPercent),
          maxPercent: Number(data.maxPercent),
          points: Number(data.points),
        },
      });
      toast.success(`Grade "${data.grade}" added to grading scale!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add grade setting');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingGrades ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Grade Settings" description="Configure grading scale and grade point system." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Add Grade" showExport={false} />

      <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Grading Scale</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Standard academic grading system configuration</p>
        </div>
        <div className="divide-y divide-border/50">
          {gradeSettings.map(g => (
            <div key={g.id || g.grade} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${gradeColors[g.grade] || 'bg-primary/10 text-primary'}`}>
                {g.grade}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{g.description}</p>
                <p className="text-xs text-muted-foreground">{g.minPercent}% – {g.maxPercent}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{g.points} pts</p>
                <p className="text-xs text-muted-foreground">Grade Points</p>
              </div>
              <div className="w-40 hidden sm:block">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${g.maxPercent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{g.minPercent}–{g.maxPercent}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Grade Scale Setting" description="Configure a new grade benchmark in the system.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Grade Code *</label>
              <input {...register('grade', { required: true })} className={inputClass} placeholder="e.g. A+" />
              {errors.grade && <span className="text-xs text-red-500">Grade code is required</span>}
            </div>
            <div>
              <label className={labelClass}>Grade Points *</label>
              <input type="number" {...register('points', { required: true })} className={inputClass} placeholder="e.g. 10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Percentage (%) *</label>
              <input type="number" {...register('minPercent', { required: true })} className={inputClass} placeholder="e.g. 91" />
            </div>
            <div>
              <label className={labelClass}>Max Percentage (%) *</label>
              <input type="number" {...register('maxPercent', { required: true })} className={inputClass} placeholder="e.g. 100" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <input {...register('description', { required: true })} className={inputClass} placeholder="e.g. Outstanding Performance" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createGrade.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createGrade.isPending ? 'Saving…' : 'Add Grade'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
