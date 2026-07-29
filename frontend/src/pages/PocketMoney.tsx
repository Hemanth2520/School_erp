import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { students } from '../data/mockData';
import { Wallet, Plus, Minus, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatCard } from '../components/ui/StatCard';

const pocketMoneyData = students.map((s, i) => ({
  ...s,
  balance: [2500, 1200, 5000, 800, 3500, 0, 1500, 2000][i % 8],
  lastTransaction: ['2024-06-10', '2024-06-08', '2024-06-12', '2024-06-05', '2024-06-11', '—', '2024-06-09', '2024-06-13'][i % 8],
  guardianLimit: [3000, 2000, 5000, 1500, 4000, 1000, 2000, 2500][i % 8],
}));

type PMEntry = typeof pocketMoneyData[0];

const columns: ColumnDef<PMEntry>[] = [
  {
    accessorKey: 'name',
    header: 'Student',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {(row.getValue('name') as string).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
          <p className="text-xs text-muted-foreground">Class {row.original.class} {row.original.section}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'balance',
    header: 'Current Balance',
    cell: ({ row }) => (
      <span className={`font-bold text-sm ${(row.getValue('balance') as number) > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
        ₹{(row.getValue('balance') as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: 'guardianLimit',
    header: 'Monthly Limit',
    cell: ({ row }) => <span className="text-sm">₹{(row.getValue('guardianLimit') as number).toLocaleString()}</span>,
  },
  { accessorKey: 'lastTransaction', header: 'Last Transaction' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button onClick={() => toast.success(`Credit ₹100 to ${row.original.name}`)} className="flex items-center gap-1 text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20 px-2 py-1 rounded-md transition-colors">
          <Plus className="h-3 w-3" /> Credit
        </button>
        <button onClick={() => toast.error(`Debit from ${row.original.name}`)} className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600 hover:bg-red-500/20 px-2 py-1 rounded-md transition-colors">
          <Minus className="h-3 w-3" /> Debit
        </button>
      </div>
    ),
  },
];

export function PocketMoney() {
  const totalBalance = pocketMoneyData.reduce((s, p) => s + p.balance, 0);

  return (
    <div>
      <PageHeader title="Pocket Money" description="Manage student pocket money accounts and transactions." showExport />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Balance" value={`₹${totalBalance.toLocaleString()}`} icon={Wallet} description="across all students" />
        <StatCard title="Active Accounts" value={pocketMoneyData.filter(p => p.balance > 0).length} icon={Wallet} iconColor="text-green-500" description="students with balance" />
        <StatCard title="Zero Balance" value={pocketMoneyData.filter(p => p.balance === 0).length} icon={History} iconColor="text-yellow-600" description="students" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={pocketMoneyData} searchKey="name" searchPlaceholder="Search student..." />
      </div>
    </div>
  );
}
