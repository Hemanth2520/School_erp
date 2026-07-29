import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { TrendingDown, Receipt, ShoppingCart, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Expense = {
  id?: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paidBy: string;
  vendor: string;
  status: string;
  note?: string;
};

type AddExpenseForm = {
  title: string;
  category: string;
  amount: number;
  vendor: string;
  paidBy: string;
  note: string;
};

const columns: ColumnDef<Expense>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id || 'EXP-101'}</span> },
  {
    accessorKey: 'title',
    header: 'Expense',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.getValue('title')}</p>
        <p className="text-xs text-muted-foreground">{row.original.note || ''}</p>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ row }) => <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{row.getValue('category')}</span> },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold text-sm text-red-500">-₹{(row.getValue('amount') as number || 0).toLocaleString()}</span> },
  { accessorKey: 'vendor', header: 'Vendor' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'paidBy', header: 'Paid By' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Paid'} /> },
];

export function Expenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: expenses = [], isLoading: loadingExpenses } = useApiList<Expense>('expenses');
  const createExpense = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddExpenseForm>();

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const paid = expenses.filter(e => e.status === 'Paid').reduce((s, e) => s + (e.amount || 0), 0);
  const pending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + (e.amount || 0), 0);

  const onSubmit = async (data: AddExpenseForm) => {
    try {
      await createExpense.mutateAsync({
        path: 'expenses',
        data: {
          ...data,
          amount: Number(data.amount),
          status: 'Paid',
          date: new Date().toISOString().split('T')[0],
        },
      });
      toast.success(`Expense "${data.title}" recorded!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add expense');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingExpenses ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Expenses"
        description="Track school operational expenses and payments."
        onAdd={() => setIsModalOpen(true)}
        addEnabled
        addLabel="Add Expense"
        showImport
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Expenses" value={`₹${total.toLocaleString()}`} icon={TrendingDown} iconColor="text-red-500" description="this month" />
        <StatCard title="Paid" value={`₹${paid.toLocaleString()}`} icon={Receipt} iconColor="text-green-500" description="settled" />
        <StatCard title="Pending" value={`₹${pending.toLocaleString()}`} icon={ShoppingCart} iconColor="text-yellow-600" description="to be paid" />
        <StatCard title="Total Entries" value={expenses.length} icon={Wrench} iconColor="text-blue-500" description="expense records" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={expenses} searchKey="title" searchPlaceholder="Search expenses..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense Record" description="Record a new school expenditure.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Title / Description *</label>
            <input {...register('title', { required: true })} className={inputClass} placeholder="e.g. Electricity Bill" />
            {errors.title && <span className="text-xs text-red-500">Title is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <select {...register('category', { required: true })} className={inputClass}>
                <option value="Utilities">Utilities</option>
                <option value="Payroll">Payroll</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Supplies">Supplies</option>
                <option value="Transport">Transport</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Amount (₹) *</label>
              <input type="number" {...register('amount', { required: true })} className={inputClass} placeholder="e.g. 5000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vendor / Payee *</label>
              <input {...register('vendor', { required: true })} className={inputClass} placeholder="e.g. State Electricity Board" />
            </div>
            <div>
              <label className={labelClass}>Authorized / Paid By *</label>
              <input {...register('paidBy', { required: true })} className={inputClass} placeholder="e.g. Admin / Accounts" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes / Details</label>
            <textarea {...register('note')} rows={2} className={`${inputClass} resize-none`} placeholder="Additional details or invoice reference" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createExpense.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createExpense.isPending ? 'Saving…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
