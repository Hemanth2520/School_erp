import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Bus as BusIcon, Users, MapPin, AlertTriangle, Edit2, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Bus = {
  _id?: string;
  id?: string;
  customId?: string;
  busNo: string;
  driver: string;
  route: string;
  students: number;
  capacity: number;
  coordinator: string;
  lastService: string;
  status: string;
};

type RouteItem = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  distance: string;
  time: string;
  stops: string[] | string;
  students: number;
};

type BusFormInputs = {
  busNo: string;
  driver: string;
  route: string;
  capacity: number;
  students?: number;
  coordinator: string;
  status: string;
};

type RouteFormInputs = {
  name: string;
  distance: string;
  time: string;
  stopsStr: string;
  students: number;
};

export function Transport() {
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);

  const { data: buses = [], isLoading: loadingBuses, error: busError } = useApiList<Bus>('buses');
  const { data: routes = [], isLoading: loadingRoutes } = useApiList<RouteItem>('routes');

  const createBus = useApiCreate();
  const updateBus = useApiUpdate();
  const deleteBus = useApiDelete();

  const createRoute = useApiCreate();
  const updateRoute = useApiUpdate();
  const deleteRoute = useApiDelete();

  const { register: registerBus, handleSubmit: handleSubmitBus, reset: resetBus, setValue: setValueBus, formState: { errors: busErrors } } = useForm<BusFormInputs>({
    defaultValues: {
      capacity: 40,
      status: 'Active',
    },
  });

  const { register: registerRoute, handleSubmit: handleSubmitRoute, reset: resetRoute, setValue: setValueRoute, formState: { errors: routeErrors } } = useForm<RouteFormInputs>({
    defaultValues: {
      distance: '12 km',
      time: '45 mins',
      students: 25,
    },
  });

  // Bus Handlers
  const handleOpenAddBusModal = () => {
    setEditingBus(null);
    resetBus({
      busNo: '',
      driver: '',
      route: '',
      capacity: 40,
      coordinator: '',
      status: 'Active',
    });
    setIsBusModalOpen(true);
  };

  const handleOpenEditBusModal = (bus: Bus) => {
    setEditingBus(bus);
    setValueBus('busNo', bus.busNo || '');
    setValueBus('driver', bus.driver || '');
    setValueBus('route', bus.route || '');
    setValueBus('capacity', bus.capacity || 40);
    setValueBus('coordinator', bus.coordinator || '');
    setValueBus('status', bus.status || 'Active');
    setIsBusModalOpen(true);
  };

  const handleDeleteBus = async (bus: Bus) => {
    const id = bus.customId || bus._id || bus.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete bus ${bus.busNo}?`)) {
      try {
        await deleteBus.mutateAsync({ path: 'buses', id });
        toast.success('Bus removed from fleet.');
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete bus');
      }
    }
  };

  const onSubmitBus = async (data: BusFormInputs) => {
    try {
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        students: editingBus ? editingBus.students || 0 : 0,
        lastService: new Date().toISOString().split('T')[0],
      };

      if (editingBus) {
        const id = editingBus.customId || editingBus._id || editingBus.id;
        await updateBus.mutateAsync({
          path: 'buses',
          id: id!,
          data: payload,
        });
        toast.success(`Bus ${data.busNo} updated!`);
      } else {
        await createBus.mutateAsync({
          path: 'buses',
          data: payload,
        });
        toast.success(`Bus ${data.busNo} added!`);
      }

      resetBus();
      setIsBusModalOpen(false);
      setEditingBus(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save bus');
    }
  };

  // Route Handlers
  const handleOpenAddRouteModal = () => {
    setEditingRoute(null);
    resetRoute({
      name: '',
      distance: '12 km',
      time: '45 mins',
      stopsStr: 'Station, Main Market, School Campus',
      students: 25,
    });
    setIsRouteModalOpen(true);
  };

  const handleOpenEditRouteModal = (rt: RouteItem) => {
    setEditingRoute(rt);
    setValueRoute('name', rt.name || '');
    setValueRoute('distance', rt.distance || '');
    setValueRoute('time', rt.time || '');
    const stopsText = Array.isArray(rt.stops) ? rt.stops.join(', ') : rt.stops || '';
    setValueRoute('stopsStr', stopsText);
    setValueRoute('students', rt.students || 0);
    setIsRouteModalOpen(true);
  };

  const handleDeleteRoute = async (rt: RouteItem) => {
    const id = rt.customId || rt._id || rt.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete route "${rt.name}"?`)) {
      try {
        await deleteRoute.mutateAsync({ path: 'routes', id });
        toast.success('Route deleted.');
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete route');
      }
    }
  };

  const onSubmitRoute = async (data: RouteFormInputs) => {
    try {
      const stopsArray = data.stopsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name: data.name,
        distance: data.distance,
        time: data.time,
        stops: stopsArray,
        students: Number(data.students) || 0,
      };

      if (editingRoute) {
        const id = editingRoute.customId || editingRoute._id || editingRoute.id;
        await updateRoute.mutateAsync({
          path: 'routes',
          id: id!,
          data: payload,
        });
        toast.success(`Route "${data.name}" updated!`);
      } else {
        await createRoute.mutateAsync({
          path: 'routes',
          data: payload,
        });
        toast.success(`Route "${data.name}" created!`);
      }

      resetRoute();
      setIsRouteModalOpen(false);
      setEditingRoute(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save route');
    }
  };

  const busColumns: ColumnDef<Bus>[] = [
    {
      accessorKey: 'busNo',
      header: 'Bus No',
      cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue('busNo')}</span>,
    },
    { accessorKey: 'driver', header: 'Driver' },
    { accessorKey: 'route', header: 'Route' },
    {
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue('students') || 0}
          <span className="text-muted-foreground">/{row.original.capacity || 40}</span>
        </span>
      ),
    },
    { accessorKey: 'coordinator', header: 'Coordinator' },
    {
      accessorKey: 'lastService',
      header: 'Last Service',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.getValue('lastService') ? new Date(row.getValue('lastService')).toISOString().split('T')[0] : '—'}
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
            onClick={() => handleOpenEditBusModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Bus"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteBus(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Bus"
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
    <div className={`space-y-8 ${loadingBuses || loadingRoutes ? 'opacity-50 transition-opacity' : ''}`}>
      <PageHeader
        title="Transport Management"
        description="Manage school bus fleet, drivers, and transport routes."
        onAdd={handleOpenAddBusModal}
        addEnabled
        addLabel="Add Bus"
      />

      {busError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load transport data. Please retry.
        </p>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Buses" value={buses.length} icon={BusIcon} description="in fleet" />
        <StatCard title="Active" value={buses.filter(b => b.status === 'Active').length} icon={BusIcon} iconColor="text-green-500" description="buses running" />
        <StatCard title="Total Students" value={buses.reduce((s, b) => s + (b.students || 0), 0)} icon={Users} iconColor="text-blue-500" description="using transport" />
        <StatCard title="Maintenance" value={buses.filter(b => b.status === 'Maintenance').length} icon={AlertTriangle} iconColor="text-red-500" description="bus down" />
      </div>

      {/* Bus Fleet Data Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Bus Fleet</h3>
          <p className="text-xs text-muted-foreground">List of registered transport vehicles</p>
        </div>
        <DataTable columns={busColumns} data={buses} searchKey="busNo" searchPlaceholder="Search bus no..." />
      </div>

      {/* Routes Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-semibold">Transport Routes ({routes.length})</h2>
            <p className="text-xs text-muted-foreground">Pickup & drop route coverage with stops</p>
          </div>
          <button
            onClick={handleOpenAddRouteModal}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Route
          </button>
        </div>

        {routes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            No routes configured. Click "Add Route" above to create a transport route.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {routes.map(route => {
              const stopsList = Array.isArray(route.stops) ? route.stops : typeof route.stops === 'string' ? (route.stops as string).split(',') : [];

              return (
                <div key={route.customId || route._id || route.id || route.name} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{route.name}</h3>
                        <p className="text-xs text-muted-foreground">{route.distance || '10 km'} · {route.time || '40 mins'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRouteModal(route)}
                        className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                        title="Edit Route"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(route)}
                        className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete Route"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 my-3">
                    {stopsList.slice(0, 5).map((stop, i) => (
                      <div key={stop + i} className="flex items-center gap-2 text-xs">
                        <div className={`h-4 w-4 flex items-center justify-center rounded-full text-[9px] font-bold ${i === 0 || i === stopsList.length - 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          {i + 1}
                        </div>
                        <span className={i === 0 || i === stopsList.length - 1 ? 'font-medium' : 'text-muted-foreground'}>
                          {stop.trim()}
                        </span>
                      </div>
                    ))}
                    {stopsList.length > 5 && (
                      <p className="text-[10px] text-muted-foreground pl-6">+ {stopsList.length - 5} more stops</p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs">
                    <span className="text-muted-foreground">Students: <span className="font-medium text-foreground">{route.students || 0}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Add / Edit Bus */}
      <Modal
        isOpen={isBusModalOpen}
        onClose={() => {
          setIsBusModalOpen(false);
          setEditingBus(null);
        }}
        title={editingBus ? 'Edit Bus Details' : 'Add New Bus'}
        description={editingBus ? 'Modify existing bus profile.' : 'Register a new school bus in the fleet.'}
      >
        <form onSubmit={handleSubmitBus(onSubmitBus)} className="space-y-4">
          <div>
            <label className={labelClass}>Bus Registration / Number *</label>
            <input {...registerBus('busNo', { required: true })} className={inputClass} placeholder="e.g. MH-12-AB-1234" />
            {busErrors.busNo && <span className="text-xs text-red-500">Bus number is required</span>}
          </div>
          <div>
            <label className={labelClass}>Assigned Driver *</label>
            <input {...registerBus('driver', { required: true })} className={inputClass} placeholder="e.g. Ramesh Singh" />
          </div>
          <div>
            <label className={labelClass}>Route Name *</label>
            <input {...registerBus('route', { required: true })} className={inputClass} placeholder="e.g. Route 1 - Station to School" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Seating Capacity *</label>
              <input type="number" {...registerBus('capacity', { required: true })} className={inputClass} placeholder="e.g. 40" />
            </div>
            <div>
              <label className={labelClass}>Bus Coordinator *</label>
              <input {...registerBus('coordinator', { required: true })} className={inputClass} placeholder="e.g. Staff Coordinator" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select {...registerBus('status')} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsBusModalOpen(false);
                setEditingBus(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createBus.isPending || updateBus.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createBus.isPending || updateBus.isPending
                ? 'Saving…'
                : editingBus
                ? 'Update Bus'
                : 'Add Bus'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add / Edit Route */}
      <Modal
        isOpen={isRouteModalOpen}
        onClose={() => {
          setIsRouteModalOpen(false);
          setEditingRoute(null);
        }}
        title={editingRoute ? 'Edit Transport Route' : 'Add New Route'}
        description={editingRoute ? 'Modify existing route stops and details.' : 'Create a new transport route and stops.'}
      >
        <form onSubmit={handleSubmitRoute(onSubmitRoute)} className="space-y-4">
          <div>
            <label className={labelClass}>Route Name *</label>
            <input {...registerRoute('name', { required: true })} className={inputClass} placeholder="e.g. Route 4 - North City" />
            {routeErrors.name && <span className="text-xs text-red-500">Route name is required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Distance</label>
              <input {...registerRoute('distance')} className={inputClass} placeholder="e.g. 15 km" />
            </div>
            <div>
              <label className={labelClass}>Estimated Duration</label>
              <input {...registerRoute('time')} className={inputClass} placeholder="e.g. 50 mins" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Stops (comma-separated) *</label>
            <textarea
              {...registerRoute('stopsStr', { required: true })}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="e.g. Station, Market Square, City Mall, School Gate"
            />
          </div>
          <div>
            <label className={labelClass}>Allocated Students</label>
            <input type="number" {...registerRoute('students')} className={inputClass} placeholder="e.g. 30" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsRouteModalOpen(false);
                setEditingRoute(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createRoute.isPending || updateRoute.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createRoute.isPending || updateRoute.isPending
                ? 'Saving…'
                : editingRoute
                ? 'Update Route'
                : 'Create Route'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
