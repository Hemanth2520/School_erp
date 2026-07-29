import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Package, AlertTriangle, CheckCircle, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type InventoryItem = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  supplier: string;
  cost: number;
  location: string;
  lastPurchase: string;
  status: string;
};

type InventoryFormInputs = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  supplier: string;
  cost: number;
  location: string;
  status?: string;
};

export function Inventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const { data: inventory = [], isLoading: loadingInventory, error } = useApiList<InventoryItem>('inventory');
  const createItem = useApiCreate();
  const updateItem = useApiUpdate();
  const deleteItem = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InventoryFormInputs>({
    defaultValues: {
      category: 'Stationery',
      unit: 'Pcs',
      quantity: 50,
      minStock: 10,
      cost: 100,
    },
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    reset({
      name: '',
      category: 'Stationery',
      unit: 'Pcs',
      quantity: 50,
      minStock: 10,
      cost: 100,
      supplier: 'PaperWorld Ltd',
      location: 'Main Store Room',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setValue('name', item.name || '');
    setValue('category', item.category || 'Stationery');
    setValue('unit', item.unit || 'Pcs');
    setValue('quantity', item.quantity || 0);
    setValue('minStock', item.minStock || 10);
    setValue('cost', item.cost || 0);
    setValue('supplier', item.supplier || '');
    setValue('location', item.location || '');
    setValue('status', item.status || 'In Stock');
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    const id = item.customId || item._id || item.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete inventory item "${item.name}"?`)) {
      try {
        await deleteItem.mutateAsync({ path: 'inventory', id });
        toast.success(`Inventory item deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete item');
      }
    }
  };

  const onSubmit = async (data: InventoryFormInputs) => {
    try {
      const qty = Number(data.quantity);
      const minS = Number(data.minStock);
      const status = data.status || (qty <= 0 ? 'Out of Stock' : qty <= minS ? 'Low Stock' : 'In Stock');

      const payload = {
        ...data,
        quantity: qty,
        minStock: minS,
        cost: Number(data.cost),
        status,
        lastPurchase: new Date().toISOString().split('T')[0],
      };

      if (editingItem) {
        const id = editingItem.customId || editingItem._id || editingItem.id;
        await updateItem.mutateAsync({
          path: 'inventory',
          id: id!,
          data: payload,
        });
        toast.success(`Inventory item "${data.name}" updated!`);
      } else {
        await createItem.mutateAsync({
          path: 'inventory',
          data: payload,
        });
        toast.success(`Inventory item "${data.name}" added!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save inventory item');
    }
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'customId',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('customId') || row.original.id || 'INV-101'}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Item',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
          <p className="text-xs text-muted-foreground">{row.original.category}</p>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <div className="text-sm">
          <span className={`font-semibold ${(row.getValue('quantity') as number || 0) <= (row.original.minStock || 0) ? 'text-red-500' : ''}`}>{row.getValue('quantity')}</span>
          <span className="text-muted-foreground"> {row.original.unit || 'pcs'}</span>
        </div>
      ),
    },
    { accessorKey: 'minStock', header: 'Min Stock' },
    { accessorKey: 'supplier', header: 'Supplier' },
    {
      accessorKey: 'cost',
      header: 'Cost/Unit',
      cell: ({ row }) => <span className="text-sm font-medium">₹{row.getValue('cost')}</span>,
    },
    { accessorKey: 'location', header: 'Location' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'In Stock'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Item"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteItem(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Item"
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
    <div className={loadingInventory ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Inventory"
        description="Manage school inventory, stock, and supplies."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Item"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load inventory. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Items" value={inventory.length} icon={Package} description="categories tracked" />
        <StatCard title="In Stock" value={inventory.filter(i => i.status === 'In Stock').length} icon={CheckCircle} iconColor="text-green-500" description="items available" />
        <StatCard title="Low Stock" value={inventory.filter(i => i.status === 'Low Stock').length} icon={AlertTriangle} iconColor="text-yellow-600" description="items below minimum" />
        <StatCard title="Out of Stock" value={inventory.filter(i => i.status === 'Out of Stock').length} icon={TrendingDown} iconColor="text-red-500" description="need reorder" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={inventory} searchKey="name" searchPlaceholder="Search inventory items..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        description={editingItem ? 'Modify existing inventory item details.' : 'Add new stock or supplies to school inventory.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Item Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. A4 Paper Rim" />
            {errors.name && <span className="text-xs text-red-500">Item name is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <select {...register('category', { required: true })} className={inputClass}>
                <option value="Stationery">Stationery</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="Sports">Sports</option>
                <option value="IT Hardware">IT Hardware</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Unit *</label>
              <input {...register('unit', { required: true })} className={inputClass} placeholder="e.g. Box, Pcs, Rims" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Quantity *</label>
              <input type="number" {...register('quantity', { required: true })} className={inputClass} placeholder="e.g. 50" />
            </div>
            <div>
              <label className={labelClass}>Min Stock *</label>
              <input type="number" {...register('minStock', { required: true })} className={inputClass} placeholder="e.g. 10" />
            </div>
            <div>
              <label className={labelClass}>Cost/Unit (₹) *</label>
              <input type="number" {...register('cost', { required: true })} className={inputClass} placeholder="e.g. 250" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Supplier *</label>
              <input {...register('supplier', { required: true })} className={inputClass} placeholder="e.g. PaperWorld Ltd" />
            </div>
            <div>
              <label className={labelClass}>Storage Location *</label>
              <input {...register('location', { required: true })} className={inputClass} placeholder="e.g. Main Store Room, Shelf B" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createItem.isPending || updateItem.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createItem.isPending || updateItem.isPending
                ? 'Saving…'
                : editingItem
                ? 'Update Item'
                : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
