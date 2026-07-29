import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type FeeStructureItem = {
  id?: string;
  class: string;
  tuitionFee: number;
  admissionFee: number;
  labFee: number;
  annualFee: number;
  totalAnnual: number;
  status: string;
};

type AddStructureForm = {
  class: string;
  tuitionFee: number;
  admissionFee: number;
  labFee: number;
  annualFee: number;
};

export function FeeStructure() {
  const [expanded, setExpanded] = useState<string | null>('10th');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: structures = [], isLoading: loadingStructures } = useApiList<FeeStructureItem>('fee-structures');
  const createStructure = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddStructureForm>();

  const onSubmit = async (data: AddStructureForm) => {
    try {
      const tuition = Number(data.tuitionFee || 0);
      const admission = Number(data.admissionFee || 0);
      const lab = Number(data.labFee || 0);
      const annual = Number(data.annualFee || 0);
      const total = (tuition * 12) + admission + lab + annual;

      await createStructure.mutateAsync({
        path: 'fee-structures',
        data: {
          ...data,
          tuitionFee: tuition,
          admissionFee: admission,
          labFee: lab,
          annualFee: annual,
          totalAnnual: total,
          status: 'Active',
        },
      });
      toast.success(`Fee structure for Class ${data.class} created!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add fee structure');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingStructures ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Fee Structure" description="View and manage fee structure across all classes." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Add Structure" />

      <div className="space-y-3 mt-6">
        {structures.map(item => (
          <div key={item.id || item.class} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(expanded === item.class ? null : item.class)}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Class {item.class}</p>
                  <p className="text-xs text-muted-foreground">Comprehensive Academic Fee</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Annual Total</p>
                  <p className="font-bold text-primary">₹{(item.totalAnnual || 0).toLocaleString()}</p>
                </div>
                {expanded === item.class ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {expanded === item.class && (
              <div className="border-t border-border p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground block">Tuition (Monthly)</span>
                    <span className="font-semibold text-foreground">₹{(item.tuitionFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground block">Admission (One-time)</span>
                    <span className="font-semibold text-foreground">₹{(item.admissionFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground block">Lab & Computer</span>
                    <span className="font-semibold text-foreground">₹{(item.labFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground block">Annual Dev Fee</span>
                    <span className="font-semibold text-foreground">₹{(item.annualFee || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fee Structure" description="Configure annual fee breakdown for a class.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Class / Grade *</label>
            <select {...register('class', { required: true })} className={inputClass}>
              <option value="">Select class</option>
              {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.class && <span className="text-xs text-red-500">Class is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Monthly Tuition Fee (₹) *</label>
              <input type="number" {...register('tuitionFee', { required: true })} className={inputClass} placeholder="e.g. 2500" />
            </div>
            <div>
              <label className={labelClass}>Admission Fee (₹)</label>
              <input type="number" {...register('admissionFee')} className={inputClass} placeholder="e.g. 5000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Lab & IT Fee (₹)</label>
              <input type="number" {...register('labFee')} className={inputClass} placeholder="e.g. 1500" />
            </div>
            <div>
              <label className={labelClass}>Annual Development Fee (₹)</label>
              <input type="number" {...register('annualFee')} className={inputClass} placeholder="e.g. 3000" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createStructure.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createStructure.isPending ? 'Saving…' : 'Add Fee Structure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
