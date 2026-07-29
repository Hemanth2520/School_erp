import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { UserCheck, Users, DollarSign, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Agent = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  area?: string;
  commission?: string;
  totalAdmissions?: number;
  pendingPayment?: number;
  status?: string;
};

type AgentFormInputs = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  area: string;
  commission: string;
  status: string;
};

export function Agents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const { data: agents = [], isLoading, error } = useApiList<Agent>('agents');
  const createAgent = useApiCreate();
  const updateAgent = useApiUpdate();
  const deleteAgent = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AgentFormInputs>({
    defaultValues: {
      commission: '5%',
      status: 'Active',
    },
  });

  const handleOpenAddModal = () => {
    setEditingAgent(null);
    reset({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      area: '',
      commission: '5%',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setValue('name', agent.name || '');
    setValue('contactPerson', agent.contactPerson || '');
    setValue('phone', agent.phone || '');
    setValue('email', agent.email || '');
    setValue('area', agent.area || '');
    setValue('commission', agent.commission || '5%');
    setValue('status', agent.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteAgent = async (agent: Agent) => {
    const agentId = agent.customId || agent._id || agent.id;
    if (!agentId) return;

    if (window.confirm(`Are you sure you want to delete agency "${agent.name}"?`)) {
      try {
        await deleteAgent.mutateAsync({ path: 'agents', id: agentId });
        toast.success(`Agent agency deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete agent');
      }
    }
  };

  const onSubmit = async (data: AgentFormInputs) => {
    try {
      const payload = {
        ...data,
        totalAdmissions: editingAgent ? editingAgent.totalAdmissions || 0 : 0,
        pendingPayment: editingAgent ? editingAgent.pendingPayment || 0 : 0,
      };

      if (editingAgent) {
        const agentId = editingAgent.customId || editingAgent._id || editingAgent.id;
        await updateAgent.mutateAsync({
          path: 'agents',
          id: agentId!,
          data: payload,
        });
        toast.success(`Agent agency "${data.name}" updated!`);
      } else {
        await createAgent.mutateAsync({
          path: 'agents',
          data: payload,
        });
        toast.success(`Agent agency "${data.name}" registered!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingAgent(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save agent profile');
    }
  };

  const columns: ColumnDef<Agent>[] = [
    {
      accessorKey: 'customId',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('customId') || row.original.id || 'AGT-101'}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Agency',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.getValue('name')}</p>
          <p className="text-xs text-muted-foreground">{row.original.contactPerson || 'Contact Person'}</p>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'area', header: 'Area / Region' },
    { accessorKey: 'commission', header: 'Commission' },
    {
      accessorKey: 'totalAdmissions',
      header: 'Admissions',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('totalAdmissions') || 0}</span>,
    },
    {
      accessorKey: 'pendingPayment',
      header: 'Pending Payment',
      cell: ({ row }) => (
        <span className={`font-medium text-sm ${(row.getValue('pendingPayment') as number) > 0 ? 'text-red-500' : 'text-green-600'}`}>
          ₹{((row.getValue('pendingPayment') as number) || 0).toLocaleString()}
        </span>
      ),
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
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Agent"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteAgent(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Agent"
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
    <div className={isLoading ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Agent Management"
        description="Manage admission partner agencies and commission performance."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Create Agent"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load agents. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Agents" value={agents.length} icon={Users} description="registered" />
        <StatCard title="Active" value={agents.filter(a => a.status === 'Active').length} icon={UserCheck} iconColor="text-green-500" description="agents" />
        <StatCard title="Total Admissions" value={agents.reduce((s, a) => s + (a.totalAdmissions || 0), 0)} icon={TrendingUp} iconColor="text-blue-500" description="via agents" />
        <StatCard title="Pending Payment" value={`₹${agents.reduce((s, a) => s + (a.pendingPayment || 0), 0).toLocaleString()}`} icon={DollarSign} iconColor="text-yellow-600" description="to be paid" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={agents} searchKey="name" searchPlaceholder="Search agents..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAgent(null);
        }}
        title={editingAgent ? 'Edit Admission Agent' : 'Create Admission Agent'}
        description={editingAgent ? 'Modify agent agency profile details.' : 'Register a new admission partner agency or consultant.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Agency Name *</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Apex Admissions" />
            {errors.name && <span className="text-xs text-red-500">Agency name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Person *</label>
              <input {...register('contactPerson', { required: true })} className={inputClass} placeholder="e.g. Rajesh Shah" />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register('phone', { required: true })} className={inputClass} placeholder="10-digit mobile" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" {...register('email', { required: true })} className={inputClass} placeholder="agency@example.com" />
            </div>
            <div>
              <label className={labelClass}>Target Region / Area *</label>
              <input {...register('area', { required: true })} className={inputClass} placeholder="e.g. Pune North" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Commission Rate *</label>
              <input {...register('commission', { required: true })} className={inputClass} placeholder="e.g. 5%" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAgent(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createAgent.isPending || updateAgent.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createAgent.isPending || updateAgent.isPending
                ? 'Saving…'
                : editingAgent
                ? 'Update Agent'
                : 'Create Agent'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
