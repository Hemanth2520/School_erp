import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Send } from 'lucide-react';
import { useApiCreate } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  publishDate: z.string().min(1, 'Publish date is required'),
});

type NoticeFormData = z.infer<typeof schema>;

export function CreateNotice() {
  const { register, handleSubmit, formState: { errors } } = useForm<NoticeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'Medium',
      category: 'Event',
      targetAudience: 'All',
      publishDate: new Date().toISOString().split('T')[0],
    },
  });
  const createNotice = useApiCreate();
  const navigate = useNavigate();

  const onSubmit = async (data: NoticeFormData) => {
    try {
      await createNotice.mutateAsync({ path: 'notices', data: { ...data, date: data.publishDate, status: 'Published' } });
      toast.success(`Notice "${data.title}" created successfully!`);
      navigate('/notices');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Unable to publish notice');
    }
  };

  const fieldClass = (error?: { message?: string }) =>
    `w-full rounded-lg border ${error ? 'border-red-400 focus:ring-red-400/30' : 'border-input focus:ring-primary/30'} bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`;

  const labelClass = 'block text-xs font-medium text-foreground mb-1';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <div>
      <PageHeader title="Create Notice" description="Publish a new notice or announcement to students, parents, or staff." showExport={false} />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 max-w-3xl space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Notice Details</h2>
          </div>

          <div>
            <label className={labelClass}>Notice Title *</label>
            <input {...register('title')} className={fieldClass(errors.title)} placeholder="e.g. Annual Sports Day 2024" />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Category *</label>
              <select {...register('category')} className={fieldClass(errors.category)}>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
                <option value="Meeting">Meeting</option>
                <option value="Academic">Academic</option>
                <option value="General">General</option>
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Target Audience *</label>
              <select {...register('targetAudience')} className={fieldClass(errors.targetAudience)}>
                <option value="All">All (Students, Parents & Staff)</option>
                <option value="Students">Students Only</option>
                <option value="Parents">Parents Only</option>
                <option value="Staff">Staff Only</option>
              </select>
              {errors.targetAudience && <p className={errorClass}>{errors.targetAudience.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Priority *</label>
              <select {...register('priority')} className={fieldClass(errors.priority)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {errors.priority && <p className={errorClass}>{errors.priority.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Publish Date *</label>
            <input type="date" {...register('publishDate')} className={fieldClass(errors.publishDate)} />
            {errors.publishDate && <p className={errorClass}>{errors.publishDate.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Notice Body Content *</label>
            <textarea {...register('content')} className={`${fieldClass(errors.content)} resize-none`} rows={6} placeholder="Detailed announcement description..." />
            {errors.content && <p className={errorClass}>{errors.content.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button disabled={createNotice.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              <Send className="h-4 w-4" /> {createNotice.isPending ? 'Publishing…' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
