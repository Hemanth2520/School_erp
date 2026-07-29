import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { CreditCard, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Transaction = {
  id?: string;
  student: string;
  class: string;
  type: string;
  amount: number;
  method: string;
  date: string;
  status: string;
  receiptNo: string;
};

type CollectFeeForm = {
  student: string;
  class: string;
  type: string;
  amount: number;
  method: string;
  receiptNo: string;
};

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'Txn ID',
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id || 'TXN-101'}</span>,
  },
  {
    accessorKey: 'student',
    header: 'Student',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('student') as string || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-sm">{row.getValue('student')}</p>
          <p className="text-xs text-muted-foreground">{row.original.class}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'type', header: 'Fee Type' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-semibold text-sm">₹{(row.getValue('amount') as number || 0).toLocaleString()}</span>
    ),
  },
  { accessorKey: 'method', header: 'Method' },
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Completed'} />,
  },
  {
    accessorKey: 'receiptNo',
    header: 'Receipt',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue('receiptNo') || '—'}
      </span>
    ),
  },
];

export function Fees() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: transactions = [], isLoading: loadingTxns } = useApiList<Transaction>('transactions');
  const createTxn = useApiCreate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CollectFeeForm>();

  const totalCollected = transactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingAmount = transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + (t.amount || 0), 0);

  const onSubmit = async (data: CollectFeeForm) => {
    try {
      await createTxn.mutateAsync({
        path: 'transactions',
        data: {
          ...data,
          amount: Number(data.amount),
          status: 'Completed',
          date: new Date().toISOString().split('T')[0],
        },
      });
      toast.success(`Fee collected from ${data.student}!`);
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to record fee transaction');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingTxns ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader
        title="Fee Management"
        description="Manage fee collections, transactions, and financial reports."
        showImport
        onAdd={() => setIsModalOpen(true)}
        addEnabled
        addLabel="Collect Fee"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString()}`} icon={CreditCard} description="from completed payments" changeType="positive" />
        <StatCard title="Pending" value={`₹${pendingAmount.toLocaleString()}`} icon={Clock} description="from pending transactions" iconColor="text-yellow-600" />
        <StatCard title="Failed Transactions" value={transactions.filter(t => t.status === 'Failed').length} icon={TrendingDown} description="this month" iconColor="text-red-500" />
        <StatCard title="Total Transactions" value={transactions.length} icon={CheckCircle} description="recorded payments" iconColor="text-green-500" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">All Transactions</h3>
          <p className="text-xs text-muted-foreground">Complete payment history and records</p>
        </div>
        <DataTable columns={columns} data={transactions} searchKey="student" searchPlaceholder="Search by student name..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Collect Fee" description="Record a new fee collection payment transaction.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Student Name *</label>
              <input {...register('student', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
              {errors.student && <span className="text-xs text-red-500">Student is required</span>}
            </div>
            <div>
              <label className={labelClass}>Class & Section *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. 10th-A" />
            </div>
            <div>
              <label className={labelClass}>Fee Type *</label>
              <select {...register('type', { required: true })} className={inputClass}>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Admission Fee">Admission Fee</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Transport Fee">Transport Fee</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="Library Fee">Library Fee</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Amount (₹) *</label>
              <input type="number" {...register('amount', { required: true })} className={inputClass} placeholder="e.g. 15000" />
            </div>
            <div>
              <label className={labelClass}>Payment Method *</label>
              <select {...register('method', { required: true })} className={inputClass}>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Receipt Number *</label>
              <input {...register('receiptNo', { required: true })} className={inputClass} placeholder="e.g. REC-2026-001" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button disabled={createTxn.isPending} type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createTxn.isPending ? 'Processing…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
