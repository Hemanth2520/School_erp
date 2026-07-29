import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserCheck, Plus } from 'lucide-react';
import { useApiCreate } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  agencyName: z.string().min(2, 'Agency name required'),
  contactPerson: z.string().min(2, 'Contact person name required'),
  phone: z.string().regex(/^\d{10}$/, 'Enter valid 10-digit phone number'),
  email: z.string().email('Valid email required'),
  area: z.string().min(2, 'Operating area required'),
  commission: z.string().min(1, 'Commission percentage required'),
});

type AgentFormData = z.infer<typeof schema>;

export function CreateAgent() {
  const { register, handleSubmit, formState: { errors } } = useForm<AgentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commission: '5%',
    },
  });
  const createAgent = useApiCreate();
  const navigate = useNavigate();

  const onSubmit = async (data: AgentFormData) => {
    try {
      await createAgent.mutateAsync({ path: 'agents', data: { ...data, name: data.agencyName } });
      toast.success(`Agent agency "${data.agencyName}" registered successfully!`);
      navigate('/agents');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Unable to register agent');
    }
  };

  const fieldClass = (error?: { message?: string }) =>
    `w-full rounded-lg border ${error ? 'border-red-400 focus:ring-red-400/30' : 'border-input focus:ring-primary/30'} bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`;

  const labelClass = 'block text-xs font-medium text-foreground mb-1';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <div>
      <PageHeader title="Create Admission Agent" description="Register a new admission partner agency or consultant." showExport={false} />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Agent Profile Details</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Agency Name *</label>
              <input {...register('agencyName')} className={fieldClass(errors.agencyName)} placeholder="e.g. Apex Admissions" />
              {errors.agencyName && <p className={errorClass}>{errors.agencyName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Contact Person *</label>
              <input {...register('contactPerson')} className={fieldClass(errors.contactPerson)} placeholder="e.g. Rajesh Shah" />
              {errors.contactPerson && <p className={errorClass}>{errors.contactPerson.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register('phone')} className={fieldClass(errors.phone)} placeholder="10-digit mobile" />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Email Address *</label>
              <input {...register('email')} className={fieldClass(errors.email)} placeholder="agency@example.com" />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Target Region / Area *</label>
              <input {...register('area')} className={fieldClass(errors.area)} placeholder="e.g. Pune North" />
              {errors.area && <p className={errorClass}>{errors.area.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Commission Rate *</label>
              <input {...register('commission')} className={fieldClass(errors.commission)} placeholder="e.g. 5%" />
              {errors.commission && <p className={errorClass}>{errors.commission.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button disabled={createAgent.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              <Plus className="h-4 w-4" /> {createAgent.isPending ? 'Registering…' : 'Register Agent'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
