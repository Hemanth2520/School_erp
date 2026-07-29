import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatCard } from '../components/ui/StatCard';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type FeeType = {
  id?: string;
  name: string;
  description: string;
  amount: number;
  frequency: string;
  applicable: string;
  status: string;
};

type AddFeeTypeForm = {
  name: string;
  description: string;
  amount: number;
  frequency: string;
  applicable: string;
};

const columns: ColumnDef<FeeType>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id || 'FET-101'}</span> },
  {
    accessorKey: 'name',
    header: 'Fee Type',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <CreditCard className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
          <p className="text-xs text-muted-foreground">{row.original.description}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => <span className="font-semibold">₹{(row.getValue('amount') as number || 0).toLocaleString()}</span>,
  },
  { accessorKey: 'frequency', header: 'Frequency', cell: ({ row }) => <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{row.getValue('frequency')}</span> },
  { accessorKey: 'applicable', header: 'Applicable To' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Active'} /> },
];

export function FeeTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: feeTypes = [], isLoading: loadingFeeTypes } = useApiList<FeeType>('fee-types');
  const createFeeType = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddFeeTypeForm>();

  const totalAnnual = feeTypes.filter(f => f.frequency === 'Annual').reduce((s, f) => s + (f.amount || 0), 0);
  const totalMonthly = feeTypes.filter(f => f.frequency === 'Monthly').reduce((s, f) => s + (f.amount || 0), 0);

  const onSubmit = async (data: AddFeeTypeForm) => {
    try {
      await createFeeType.mutateAsync({
        path: 'fee-types',
        data: {
          ...data,
          amount: Number(data.amount),
          status: 'Active',
        },
      });
      toast.success(`Fee type "${data.name}" added!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add fee type');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingFeeTypes ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Fee Types" description="Define and manage all fee categories." onAdd={() => setIsModalOpen(true)} addEnabled addLabel="Add Fee Type" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Fee Types" value={feeTypes.length} icon={CreditCard} description="configured" />
        <StatCard title="Monthly Fees" value={`₹${totalMonthly.toLocaleString()}`} icon={CreditCard} iconColor="text-blue-500" description="per student/month" />
        <StatCard title="Annual Fees" value={`₹${totalAnnual.toLocaleString()}`} icon={CreditCard} iconColor="text-green-500" description="per student/year" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={feeTypes} searchKey="name" searchPlaceholder="Search fee types..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Fee Type" description="Define a new fee category or structure type.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Fee Type Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Laboratory Fee" />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input {...register('description')} className={inputClass} placeholder="e.g. Annual science lab maintenance fee" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Default Amount (₹) *</label>
              <input type="number" {...register('amount', { required: true })} className={inputClass} placeholder="e.g. 2500" />
            </div>
            <div>
              <label className={labelClass}>Billing Frequency *</label>
              <select {...register('frequency', { required: true })} className={inputClass}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Applicable To *</label>
            <input {...register('applicable', { required: true })} className={inputClass} placeholder="e.g. All Students, Science Stream, Hostellers" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createFeeType.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createFeeType.isPending ? 'Saving…' : 'Add Fee Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
