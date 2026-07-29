import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Users, CreditCard, CheckCircle, Clock, Edit2, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiStats, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type StaffMember = {
  _id?: string;
  id?: string;
  customId?: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  joinDate?: string;
  salary: number;
  status: string;
  type: string;
};

type PayrollEntry = {
  _id?: string;
  id?: string;
  customId?: string;
  employeeName: string;
  month: string;
  basicSalary: number;
  hra: number;
  deductions: number;
  netSalary: number;
  status: string;
  paidOn?: string;
};

type StaffFormInputs = {
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  type: string;
  phone: string;
  salary: number;
  status: string;
};

type PayrollFormInputs = {
  employeeName: string;
  month: string;
  basicSalary: number;
  hra: number;
  deductions: number;
  status: string;
  paidOn?: string;
};

export function Staff() {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingPayroll, setEditingPayroll] = useState<PayrollEntry | null>(null);

  const { data: staff = [], isLoading: loadingStaff, error: staffError } = useApiList<StaffMember>('staff');
  const { data: stats } = useApiStats('staff');
  const { data: payroll = [], isLoading: loadingPayroll } = useApiList<PayrollEntry>('payroll');

  const createStaff = useApiCreate();
  const updateStaff = useApiUpdate();
  const deleteStaff = useApiDelete();

  const createPayroll = useApiCreate();
  const updatePayroll = useApiUpdate();
  const deletePayroll = useApiDelete();

  const { register: registerStaff, handleSubmit: handleSubmitStaff, reset: resetStaff, setValue: setValueStaff, formState: { errors: staffErrors } } = useForm<StaffFormInputs>({
    defaultValues: {
      type: 'Full-time',
      status: 'Active',
      salary: 35000,
    },
  });

  const { register: registerPayroll, handleSubmit: handleSubmitPayroll, reset: resetPayroll, setValue: setValuePayroll, formState: { errors: payrollErrors } } = useForm<PayrollFormInputs>({
    defaultValues: {
      month: 'March 2026',
      basicSalary: 30000,
      hra: 5000,
      deductions: 2000,
      status: 'Paid',
    },
  });

  // Staff Modal Handlers
  const handleOpenAddStaffModal = () => {
    setEditingStaff(null);
    resetStaff({
      name: '',
      employeeId: `STF-${Math.floor(100 + Math.random() * 900)}`,
      designation: 'Accountant',
      department: 'Administration',
      type: 'Full-time',
      phone: '',
      salary: 35000,
      status: 'Active',
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaffModal = (member: StaffMember) => {
    setEditingStaff(member);
    setValueStaff('name', member.name || '');
    setValueStaff('employeeId', member.employeeId || member.customId || '');
    setValueStaff('designation', member.designation || '');
    setValueStaff('department', member.department || '');
    setValueStaff('type', member.type || 'Full-time');
    setValueStaff('phone', member.phone || '');
    setValueStaff('salary', member.salary || 0);
    setValueStaff('status', member.status || 'Active');
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    const id = member.customId || member._id || member.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete staff member "${member.name}"?`)) {
      try {
        await deleteStaff.mutateAsync({ path: 'staff', id });
        toast.success(`Staff record deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete staff record');
      }
    }
  };

  const onSubmitStaff = async (data: StaffFormInputs) => {
    try {
      const payload = {
        ...data,
        salary: Number(data.salary) || 0,
        joinDate: editingStaff ? editingStaff.joinDate || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };

      if (editingStaff) {
        const id = editingStaff.customId || editingStaff._id || editingStaff.id;
        await updateStaff.mutateAsync({
          path: 'staff',
          id: id!,
          data: payload,
        });
        toast.success(`Staff record for ${data.name} updated!`);
      } else {
        await createStaff.mutateAsync({
          path: 'staff',
          data: payload,
        });
        toast.success(`Staff member ${data.name} registered!`);
      }

      resetStaff();
      setIsStaffModalOpen(false);
      setEditingStaff(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save staff record');
    }
  };

  // Payroll Modal Handlers
  const handleOpenAddPayrollModal = () => {
    setEditingPayroll(null);
    resetPayroll({
      employeeName: staff[0]?.name || '',
      month: 'March 2026',
      basicSalary: 30000,
      hra: 5000,
      deductions: 2000,
      status: 'Paid',
      paidOn: new Date().toISOString().split('T')[0],
    });
    setIsPayrollModalOpen(true);
  };

  const handleOpenEditPayrollModal = (entry: PayrollEntry) => {
    setEditingPayroll(entry);
    setValuePayroll('employeeName', entry.employeeName || '');
    setValuePayroll('month', entry.month || 'March 2026');
    setValuePayroll('basicSalary', entry.basicSalary || 0);
    setValuePayroll('hra', entry.hra || 0);
    setValuePayroll('deductions', entry.deductions || 0);
    setValuePayroll('status', entry.status || 'Paid');
    setValuePayroll('paidOn', entry.paidOn ? new Date(entry.paidOn).toISOString().split('T')[0] : '');
    setIsPayrollModalOpen(true);
  };

  const handleDeletePayroll = async (entry: PayrollEntry) => {
    const id = entry.customId || entry._id || entry.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete payroll record for ${entry.employeeName}?`)) {
      try {
        await deletePayroll.mutateAsync({ path: 'payroll', id });
        toast.success(`Payroll record deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete payroll record');
      }
    }
  };

  const onSubmitPayroll = async (data: PayrollFormInputs) => {
    try {
      const basic = Number(data.basicSalary) || 0;
      const hraVal = Number(data.hra) || 0;
      const dedVal = Number(data.deductions) || 0;
      const netSalary = basic + hraVal - dedVal;

      const payload = {
        employeeName: data.employeeName,
        month: data.month,
        basicSalary: basic,
        hra: hraVal,
        deductions: dedVal,
        netSalary,
        status: data.status,
        paidOn: data.paidOn || undefined,
      };

      if (editingPayroll) {
        const id = editingPayroll.customId || editingPayroll._id || editingPayroll.id;
        await updatePayroll.mutateAsync({
          path: 'payroll',
          id: id!,
          data: payload,
        });
        toast.success(`Payroll record for ${data.employeeName} updated!`);
      } else {
        await createPayroll.mutateAsync({
          path: 'payroll',
          data: payload,
        });
        toast.success(`Payroll entry generated for ${data.employeeName}!`);
      }

      resetPayroll();
      setIsPayrollModalOpen(false);
      setEditingPayroll(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save payroll entry');
    }
  };

  const staffColumns: ColumnDef<StaffMember>[] = [
    {
      accessorKey: 'employeeId',
      header: 'Emp ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue('employeeId') || row.original.customId || 'STF-101'}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Staff Member',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('name') as string || 'ST').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">{row.original.type}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'department', header: 'Department' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.getValue('joinDate') ? new Date(row.getValue('joinDate')).toISOString().split('T')[0] : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'salary',
      header: 'Salary (₹)',
      cell: ({ row }) => <span className="font-semibold text-sm">₹{(row.getValue('salary') as number || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Active'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditStaffModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Staff Member"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteStaff(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Staff Member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const payrollColumns: ColumnDef<PayrollEntry>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee Name',
      cell: ({ row }) => <span className="font-medium text-sm">{row.getValue('employeeName')}</span>,
    },
    { accessorKey: 'month', header: 'Month / Cycle' },
    {
      accessorKey: 'basicSalary',
      header: 'Basic (₹)',
      cell: ({ row }) => <span>₹{(row.getValue('basicSalary') as number || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'hra',
      header: 'HRA (₹)',
      cell: ({ row }) => <span>₹{(row.getValue('hra') as number || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'deductions',
      header: 'Deductions (₹)',
      cell: ({ row }) => <span className="text-red-500">-₹{(row.getValue('deductions') as number || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'netSalary',
      header: 'Net Salary (₹)',
      cell: ({ row }) => <span className="font-bold text-sm text-green-600">₹{(row.getValue('netSalary') as number || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Paid'} />,
    },
    {
      accessorKey: 'paidOn',
      header: 'Paid On',
      cell: ({ row }) => <span className="text-muted-foreground text-xs font-mono">{row.getValue('paidOn') ? new Date(row.getValue('paidOn')).toISOString().split('T')[0] : '—'}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditPayrollModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Payroll Record"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeletePayroll(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Payroll Record"
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
    <div className={`space-y-10 ${loadingStaff || loadingPayroll ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader
        title="Staff & Payroll Management"
        description="Manage all staff profiles, employee records, and monthly salary disbursement."
        showImport
        onAdd={handleOpenAddStaffModal}
        addEnabled
        addLabel="Add Staff Member"
      />

      {staffError && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load staff records. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Staff" value={stats?.total || staff.length} icon={Users} description="all personnel" />
        <StatCard title="Active" value={stats?.active || staff.filter((s: any) => s.status !== 'Inactive').length} icon={CheckCircle} iconColor="text-green-500" description="staff members" />
        <StatCard title="Payroll Paid" value={payroll.filter((p: PayrollEntry) => p.status === 'Paid').length} icon={CreditCard} iconColor="text-blue-500" description="this month" />
        <StatCard title="Payroll Pending" value={payroll.filter((p: PayrollEntry) => p.status === 'Pending').length} icon={Clock} iconColor="text-yellow-600" description="awaiting payment" />
      </div>

      {/* ALL STAFF TABLE */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">All Staff Directory</h3>
            <p className="text-xs text-muted-foreground">List of non-teaching and administrative staff</p>
          </div>
        </div>
        <DataTable columns={staffColumns} data={staff} searchKey="name" searchPlaceholder="Search staff by name..." />
      </div>

      {/* PAYROLL TABLE */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Payroll Records</h3>
            <p className="text-xs text-muted-foreground">Monthly salary disbursement & slips</p>
          </div>
          <button
            onClick={handleOpenAddPayrollModal}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Process Salary / Slip
          </button>
        </div>
        <DataTable columns={payrollColumns} data={payroll} searchKey="employeeName" searchPlaceholder="Search payroll by name..." />
      </div>

      {/* Modal 1: Staff Member Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        title={editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
        description={editingStaff ? 'Modify staff details or salary.' : 'Enter details to register non-teaching or administrative staff.'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitStaff(onSubmitStaff)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...registerStaff('name', { required: true })} className={inputClass} placeholder="e.g. Ramesh Chandra" />
              {staffErrors.name && <span className="text-xs text-red-500">Name is required</span>}
            </div>
            <div>
              <label className={labelClass}>Employee ID *</label>
              <input {...registerStaff('employeeId', { required: true })} className={inputClass} placeholder="e.g. STF-201" />
            </div>
            <div>
              <label className={labelClass}>Designation *</label>
              <input {...registerStaff('designation', { required: true })} className={inputClass} placeholder="e.g. Accountant, Librarian" />
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <input {...registerStaff('department', { required: true })} className={inputClass} placeholder="e.g. Administration, Accounts" />
            </div>
            <div>
              <label className={labelClass}>Staff Type *</label>
              <select {...registerStaff('type', { required: true })} className={inputClass}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input {...registerStaff('phone', { required: true })} className={inputClass} placeholder="10-digit phone" />
            </div>
            <div>
              <label className={labelClass}>Monthly Salary (₹) *</label>
              <input type="number" {...registerStaff('salary', { required: true })} className={inputClass} placeholder="e.g. 30000" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...registerStaff('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsStaffModalOpen(false);
                setEditingStaff(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createStaff.isPending || updateStaff.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createStaff.isPending || updateStaff.isPending
                ? 'Saving…'
                : editingStaff
                ? 'Update Staff'
                : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Payroll Entry Modal */}
      <Modal
        isOpen={isPayrollModalOpen}
        onClose={() => {
          setIsPayrollModalOpen(false);
          setEditingPayroll(null);
        }}
        title={editingPayroll ? 'Edit Payroll Slip' : 'Process Salary / Slip'}
        description={editingPayroll ? 'Modify salary slip breakdown or payment status.' : 'Generate a monthly salary slip for a staff member.'}
      >
        <form onSubmit={handleSubmitPayroll(onSubmitPayroll)} className="space-y-4">
          <div>
            <label className={labelClass}>Employee Name *</label>
            {staff.length > 0 ? (
              <select {...registerPayroll('employeeName', { required: true })} className={inputClass}>
                {staff.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.designation})
                  </option>
                ))}
              </select>
            ) : (
              <input {...registerPayroll('employeeName', { required: true })} className={inputClass} placeholder="e.g. Ramesh Chandra" />
            )}
            {payrollErrors.employeeName && <span className="text-xs text-red-500">Employee name is required</span>}
          </div>

          <div>
            <label className={labelClass}>Month / Cycle *</label>
            <input {...registerPayroll('month', { required: true })} className={inputClass} placeholder="e.g. March 2026" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Basic Salary (₹) *</label>
              <input type="number" {...registerPayroll('basicSalary', { required: true })} className={inputClass} placeholder="30000" />
            </div>
            <div>
              <label className={labelClass}>HRA Allowances (₹)</label>
              <input type="number" {...registerPayroll('hra')} className={inputClass} placeholder="5000" />
            </div>
            <div>
              <label className={labelClass}>Deductions (₹)</label>
              <input type="number" {...registerPayroll('deductions')} className={inputClass} placeholder="2000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Payment Status *</label>
              <select {...registerPayroll('status')} className={inputClass}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Paid On Date</label>
              <input type="date" {...registerPayroll('paidOn')} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsPayrollModalOpen(false);
                setEditingPayroll(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createPayroll.isPending || updatePayroll.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createPayroll.isPending || updatePayroll.isPending
                ? 'Processing…'
                : editingPayroll
                ? 'Update Slip'
                : 'Process Salary'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
