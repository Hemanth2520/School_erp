import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type IssueItem = {
  _id?: string;
  id?: string;
  customId?: string;
  itemName: string;
  quantity: number;
  issuedTo: string;
  department: string;
  issueDate: string;
  returnDate?: string;
  status: string;
  purpose: string;
};

type InventoryItem = {
  name: string;
};

type IssueNewItemFormInputs = {
  itemName: string;
  quantity: number;
  issuedTo: string;
  department: string;
  purpose: string;
  issueDate: string;
  returnDate?: string;
  status: string;
};

const DEFAULT_DEPARTMENTS = [
  'Mathematics Department',
  'Physics Department',
  'Chemistry Department',
  'Biology Department',
  'Computer & IT Science',
  'Administration & Principal Office',
  'Library',
  'Sports & Physical Education',
  'Maintenance & Housekeeping',
];

export function IssueItems() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueItem | null>(null);

  const { data: issues = [], isLoading: loadingIssues, error } = useApiList<IssueItem>('inventory-issues');
  const { data: inventoryList = [] } = useApiList<InventoryItem>('inventory');

  const createIssue = useApiCreate();
  const updateIssue = useApiUpdate();
  const deleteIssue = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IssueNewItemFormInputs>({
    defaultValues: {
      quantity: 1,
      issueDate: new Date().toISOString().split('T')[0],
      department: 'Mathematics Department',
      status: 'Issued',
    },
  });

  const handleOpenAddModal = () => {
    setEditingIssue(null);
    reset({
      itemName: inventoryList[0]?.name || 'A4 Paper Ream',
      quantity: 1,
      issuedTo: '',
      department: 'Mathematics Department',
      purpose: 'Classroom teaching & printouts',
      issueDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      status: 'Issued',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: IssueItem) => {
    setEditingIssue(item);
    setValue('itemName', item.itemName || '');
    setValue('quantity', item.quantity || 1);
    setValue('issuedTo', item.issuedTo || '');
    setValue('department', item.department || 'Mathematics Department');
    setValue('purpose', item.purpose || '');
    setValue('issueDate', item.issueDate ? new Date(item.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('returnDate', item.returnDate ? new Date(item.returnDate).toISOString().split('T')[0] : '');
    setValue('status', item.status || 'Issued');
    setIsModalOpen(true);
  };

  const handleDeleteIssue = async (item: IssueItem) => {
    const id = item.customId || item._id || item.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete issue record for ${item.itemName}?`)) {
      try {
        await deleteIssue.mutateAsync({ path: 'inventory-issues', id });
        toast.success(`Inventory issue record deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete issue record');
      }
    }
  };

  const onSubmit = async (data: IssueNewItemFormInputs) => {
    try {
      const payload = {
        ...data,
        quantity: Number(data.quantity) || 1,
        returnDate: data.returnDate || undefined,
      };

      if (editingIssue) {
        const id = editingIssue.customId || editingIssue._id || editingIssue.id;
        await updateIssue.mutateAsync({
          path: 'inventory-issues',
          id: id!,
          data: payload,
        });
        toast.success(`Issue record for "${data.itemName}" updated!`);
      } else {
        await createIssue.mutateAsync({
          path: 'inventory-issues',
          data: payload,
        });
        toast.success(`Inventory item "${data.itemName}" issued successfully!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingIssue(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save issue record');
    }
  };

  const columns: ColumnDef<IssueItem>[] = [
    {
      accessorKey: 'customId',
      header: 'Issue ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue('customId') || row.original.id || 'ISI-101'}
        </span>
      ),
    },
    {
      accessorKey: 'itemName',
      header: 'Item',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.getValue('itemName')}</p>
          <p className="text-xs text-muted-foreground">{row.original.purpose}</p>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('quantity')}</span>,
    },
    { accessorKey: 'issuedTo', header: 'Issued To' },
    { accessorKey: 'department', header: 'Department' },
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
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.getValue('returnDate') ? new Date(row.getValue('returnDate')).toISOString().split('T')[0] : '—'}
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
        title="Issue Items"
        description="Track items issued from inventory to staff and departments with return schedules."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Issue Item"
        showExport
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load item issue logs. Please retry.</p>}

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={issues} searchKey="itemName" searchPlaceholder="Search issued items..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIssue(null);
        }}
        title={editingIssue ? 'Edit Issued Item Record' : 'Issue Inventory Item'}
        description={editingIssue ? 'Modify details of an issued inventory item.' : 'Record an inventory item issued to a staff member or department.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Select Inventory Item *</label>
            {inventoryList.length > 0 ? (
              <select {...register('itemName', { required: true })} className={inputClass}>
                {inventoryList.map(inv => (
                  <option key={inv.name} value={inv.name}>
                    {inv.name}
                  </option>
                ))}
              </select>
            ) : (
              <input {...register('itemName', { required: true })} className={inputClass} placeholder="e.g. A4 Paper Ream / Projector" />
            )}
            {errors.itemName && <span className="text-xs text-red-500">Item name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity Issued *</label>
              <input type="number" {...register('quantity', { required: true })} className={inputClass} placeholder="e.g. 5" />
            </div>
            <div>
              <label className={labelClass}>Issued To (Staff Name) *</label>
              <input {...register('issuedTo', { required: true })} className={inputClass} placeholder="e.g. Dr. John Mathew" />
              {errors.issuedTo && <span className="text-xs text-red-500">Issued person name is required</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department / Section *</label>
              <select {...register('department', { required: true })} className={inputClass}>
                {DEFAULT_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Issue Date *</label>
              <input type="date" {...register('issueDate', { required: true })} className={inputClass} />
              {errors.issueDate && <span className="text-xs text-red-500">Issue date required</span>}
            </div>
            <div>
              <label className={labelClass}>Expected Return Date (Optional)</label>
              <input type="date" {...register('returnDate')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Purpose of Issue *</label>
            <input {...register('purpose', { required: true })} className={inputClass} placeholder="e.g. Term end exam printing / Lab experiment" />
            {errors.purpose && <span className="text-xs text-red-500">Purpose is required</span>}
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
                : 'Issue Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
