import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Truck, Package, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Supplier = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string | string[];
  totalOrders?: number;
  lastOrder?: string;
  status?: string;
};

type SupplierFormInputs = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesStr: string;
  status?: string;
};

export function Suppliers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading: loadingSuppliers, error } = useApiList<Supplier>('suppliers');
  const createSupplier = useApiCreate();
  const updateSupplier = useApiUpdate();
  const deleteSupplier = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupplierFormInputs>({
    defaultValues: {
      status: 'Active',
      categoriesStr: 'Stationery, General Supplies',
    },
  });

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    reset({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      categoriesStr: 'Stationery, General Supplies',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setValue('name', supplier.name || '');
    setValue('contactPerson', supplier.contactPerson || '');
    setValue('phone', supplier.phone || '');
    setValue('email', supplier.email || '');
    setValue('address', supplier.address || '');
    const catText = Array.isArray(supplier.categories)
      ? supplier.categories.join(', ')
      : supplier.categories || '';
    setValue('categoriesStr', catText);
    setValue('status', supplier.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    const id = supplier.customId || supplier._id || supplier.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete supplier vendor "${supplier.name}"?`)) {
      try {
        await deleteSupplier.mutateAsync({ path: 'suppliers', id });
        toast.success(`Supplier vendor deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete supplier');
      }
    }
  };

  const onSubmit = async (data: SupplierFormInputs) => {
    try {
      const categoriesArray = data.categoriesStr
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const payload = {
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
        categories: categoriesArray,
        status: data.status || 'Active',
        totalOrders: editingSupplier ? editingSupplier.totalOrders || 0 : 0,
        lastOrder: editingSupplier ? editingSupplier.lastOrder || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };

      if (editingSupplier) {
        const id = editingSupplier.customId || editingSupplier._id || editingSupplier.id;
        await updateSupplier.mutateAsync({
          path: 'suppliers',
          id: id!,
          data: payload,
        });
        toast.success(`Supplier "${data.name}" updated!`);
      } else {
        await createSupplier.mutateAsync({
          path: 'suppliers',
          data: payload,
        });
        toast.success(`Supplier "${data.name}" added!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save supplier vendor');
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={`space-y-8 ${loadingSuppliers ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader
        title="Suppliers"
        description="Manage vendor and supply chain partners."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Supplier"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load suppliers. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Suppliers" value={suppliers.length} icon={Truck} description="registered" />
        <StatCard title="Active" value={suppliers.filter(s => s.status === 'Active').length} icon={Package} iconColor="text-green-500" description="vendors" />
        <StatCard title="Total Orders" value={suppliers.reduce((s, v) => s + (v.totalOrders || 0), 0)} icon={Truck} iconColor="text-blue-500" description="all time" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {suppliers.map(supplier => {
          const catList = Array.isArray(supplier.categories)
            ? supplier.categories
            : typeof supplier.categories === 'string'
            ? supplier.categories.split(',')
            : [];

          return (
            <div key={supplier.customId || supplier._id || supplier.id || supplier.name} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{supplier.name}</h3>
                    <p className="text-xs text-muted-foreground">{supplier.contactPerson}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(supplier.status || 'Active') === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {supplier.status || 'Active'}
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(supplier)}
                    className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                    title="Edit Supplier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier)}
                    className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                    title="Delete Supplier"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3 shrink-0" /> {supplier.phone}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{supplier.email}</span>
                </div>
                <div className="col-span-2 text-muted-foreground truncate">{supplier.address}</div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {catList.map((cat: string) => (
                  <span key={cat} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {cat.trim()}
                  </span>
                ))}
              </div>

              <div className="flex justify-between pt-3 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">Total Orders: <span className="font-medium text-foreground">{supplier.totalOrders || 0}</span></span>
                <span className="text-muted-foreground">Last Order: <span className="font-medium text-foreground">{supplier.lastOrder || '—'}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Edit Supplier Vendor' : 'Add New Supplier'}
        description={editingSupplier ? 'Modify supplier contact info and category details.' : 'Register a new vendor/supplier in the system.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Company / Vendor Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. PaperWorld Pvt Ltd" />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>
          <div>
            <label className={labelClass}>Contact Person Name *</label>
            <input {...register('contactPerson', { required: true })} className={inputClass} placeholder="e.g. Rajesh Mehta" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone *</label>
              <input {...register('phone', { required: true })} className={inputClass} placeholder="10-digit phone" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" {...register('email', { required: true })} className={inputClass} placeholder="supplier@example.com" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Supply Categories (comma-separated) *</label>
            <input {...register('categoriesStr', { required: true })} className={inputClass} placeholder="e.g. Stationery, Lab Equipment, Furniture" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Address *</label>
            <textarea {...register('address', { required: true })} rows={2} className={`${inputClass} resize-none`} placeholder="Vendor office/warehouse address" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSupplier(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createSupplier.isPending || updateSupplier.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createSupplier.isPending || updateSupplier.isPending
                ? 'Saving…'
                : editingSupplier
                ? 'Update Supplier'
                : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
