import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { BookOpen, CheckCircle, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type BookIssue = {
  _id?: string;
  id?: string;
  customId?: string;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: string;
};

type BookItem = {
  title: string;
};

type LibMember = {
  name: string;
  cardId?: string;
};

type IssueBookFormInputs = {
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: string;
};

export function BookIssues() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<BookIssue | null>(null);

  const { data: bookIssues = [], isLoading: loadingIssues, error } = useApiList<BookIssue>('book-issues');
  const { data: booksList = [] } = useApiList<BookItem>('books');
  const { data: membersList = [] } = useApiList<LibMember>('library-members');

  const createIssue = useApiCreate();
  const updateIssue = useApiUpdate();
  const deleteIssue = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IssueBookFormInputs>({
    defaultValues: {
      fine: 0,
      status: 'Issued',
      issueDate: new Date().toISOString().split('T')[0],
    },
  });

  const activeCount = bookIssues.filter(b => b.status === 'Issued').length;
  const overdueCount = bookIssues.filter(b => b.status === 'Overdue').length;

  const handleOpenAddModal = () => {
    setEditingIssue(null);

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);

    reset({
      bookTitle: booksList[0]?.title || '',
      memberName: membersList[0]?.name || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: defaultDueDate.toISOString().split('T')[0],
      returnDate: '',
      fine: 0,
      status: 'Issued',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (issueItem: BookIssue) => {
    setEditingIssue(issueItem);
    setValue('bookTitle', issueItem.bookTitle || '');
    setValue('memberName', issueItem.memberName || '');
    setValue('issueDate', issueItem.issueDate ? new Date(issueItem.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('dueDate', issueItem.dueDate ? new Date(issueItem.dueDate).toISOString().split('T')[0] : '');
    setValue('returnDate', issueItem.returnDate ? new Date(issueItem.returnDate).toISOString().split('T')[0] : '');
    setValue('fine', issueItem.fine || 0);
    setValue('status', issueItem.status || 'Issued');
    setIsModalOpen(true);
  };

  const handleDeleteIssue = async (issueItem: BookIssue) => {
    const id = issueItem.customId || issueItem._id || issueItem.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete book issue record for "${issueItem.bookTitle}"?`)) {
      try {
        await deleteIssue.mutateAsync({ path: 'book-issues', id });
        toast.success(`Book issue record deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete book issue record');
      }
    }
  };

  const onSubmit = async (data: IssueBookFormInputs) => {
    try {
      const payload = {
        ...data,
        fine: Number(data.fine) || 0,
        returnDate: data.returnDate || undefined,
      };

      if (editingIssue) {
        const id = editingIssue.customId || editingIssue._id || editingIssue.id;
        await updateIssue.mutateAsync({
          path: 'book-issues',
          id: id!,
          data: payload,
        });
        toast.success(`Book issue record updated!`);
      } else {
        await createIssue.mutateAsync({
          path: 'book-issues',
          data: payload,
        });
        toast.success(`Book "${data.bookTitle}" issued to ${data.memberName}!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingIssue(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save book issue record');
    }
  };

  const columns: ColumnDef<BookIssue>[] = [
    {
      accessorKey: 'customId',
      header: 'Issue ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue('customId') || row.original.id || 'ISS-101'}
        </span>
      ),
    },
    {
      accessorKey: 'bookTitle',
      header: 'Book Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium text-sm">{row.getValue('bookTitle')}</span>
        </div>
      ),
    },
    { accessorKey: 'memberName', header: 'Issued To' },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.getValue('issueDate') ? new Date(row.getValue('issueDate')).toISOString().split('T')[0] : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-xs font-medium">
          {row.getValue('dueDate') ? new Date(row.getValue('dueDate')).toISOString().split('T')[0] : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs font-mono">
          {row.getValue('returnDate') ? new Date(row.getValue('returnDate')).toISOString().split('T')[0] : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'fine',
      header: 'Fine (₹)',
      cell: ({ row }) => (
        <span className={`font-semibold text-xs ${(row.getValue('fine') as number || 0) > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {(row.getValue('fine') as number || 0) > 0 ? `₹${row.getValue('fine')}` : '₹0'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Issued'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Issue Record"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteIssue(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Issue Record"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingIssues ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Book Issues & Circulation"
        description="Track book circulation, issuance, return schedules, and overdue fines."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Issue Book"
        showExport
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load book issue logs. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-3 mb-2">
        <StatCard title="Active Issues" value={activeCount} icon={BookOpen} description="books out" />
        <StatCard title="Overdue Books" value={overdueCount} icon={AlertCircle} iconColor="text-red-500" description="past due date" />
        <StatCard title="Total Circulation" value={bookIssues.length} icon={CheckCircle} iconColor="text-green-500" description="all records" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={bookIssues} searchKey="bookTitle" searchPlaceholder="Search by book title..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIssue(null);
        }}
        title={editingIssue ? 'Edit Book Issue Record' : 'Issue Library Book'}
        description={editingIssue ? 'Modify book issue record details or fine.' : 'Record a new book issuance to a student or staff cardholder.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Book Title *</label>
            {booksList.length > 0 ? (
              <select {...register('bookTitle', { required: true })} className={inputClass}>
                {booksList.map(b => (
                  <option key={b.title} value={b.title}>
                    {b.title}
                  </option>
                ))}
              </select>
            ) : (
              <input {...register('bookTitle', { required: true })} className={inputClass} placeholder="e.g. Higher Engineering Mathematics" />
            )}
            {errors.bookTitle && <span className="text-xs text-red-500">Book title is required</span>}
          </div>

          <div>
            <label className={labelClass}>Member / Student Name *</label>
            {membersList.length > 0 ? (
              <select {...register('memberName', { required: true })} className={inputClass}>
                {membersList.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.cardId || 'LIB'})
                  </option>
                ))}
              </select>
            ) : (
              <input {...register('memberName', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma (LIB-101)" />
            )}
            {errors.memberName && <span className="text-xs text-red-500">Member name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Issue Date *</label>
              <input type="date" {...register('issueDate', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Due Date *</label>
              <input type="date" {...register('dueDate', { required: true })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Return Date (Optional)</label>
              <input type="date" {...register('returnDate')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fine Amount (₹)</label>
              <input type="number" {...register('fine')} className={inputClass} placeholder="e.g. 0" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={inputClass}>
                <option value="Issued">Issued</option>
                <option value="Returned">Returned</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingIssue(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createIssue.isPending || updateIssue.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createIssue.isPending || updateIssue.isPending
                ? 'Processing…'
                : editingIssue
                ? 'Update Record'
                : 'Issue Book'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
