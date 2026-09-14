import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  ArrowUpDown,
  X,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/client';
import { Shipment, ShipmentPriority, ShipmentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ShipmentsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state synced with URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Deletion modal state
  const [deletingShipment, setDeletingShipment] = useState<Shipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if URL query params change externally
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const st = searchParams.get('status') || 'ALL';
    const pr = searchParams.get('priority') || 'ALL';
    setSearch(s);
    setStatusFilter(st);
    setPriorityFilter(pr);
  }, [searchParams]);

  const loadShipments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getShipments({
        search: search.trim(),
        status: statusFilter,
        priority: priorityFilter,
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir,
      });
      setShipments(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch shipments.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, priorityFilter, currentPage, sortBy, sortDir]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      newParams.set('search', search.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (newStatus !== 'ALL') {
      newParams.set('status', newStatus);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriorityFilter(newPriority);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (newPriority !== 'ALL') {
      newParams.set('priority', newPriority);
    } else {
      newParams.delete('priority');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCurrentPage(1);
    setSearchParams({});
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingShipment) return;
    setIsDeleting(true);
    try {
      await api.deleteShipment(deletingShipment.id);
      setDeletingShipment(null);
      loadShipments();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete shipment.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isFilterActive = search !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Shipment Consignment Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking, multimodal freight status, and automated chain of custody
          </p>
        </div>

        {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
          <button
            id="shipments-create-btn"
            onClick={() => navigate('/shipments/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shipment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="shipments-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Tracking ID, customer, origin, or destination..."
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg pl-9 pr-8 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              id="shipments-status-filter"
              value={statusFilter}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-full md:w-44 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="ARRIVED_AT_FACILITY">At Facility</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="DELAYED">Delayed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Priority Dropdown */}
            <select
              id="shipments-priority-filter"
              value={priorityFilter}
              onChange={e => handlePriorityChange(e.target.value)}
              className="w-full md:w-36 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Reset Filters */}
            {isFilterActive && (
              <button
                id="shipments-clear-filters-btn"
                onClick={clearAllFilters}
                className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
                title="Clear all active filters"
              >
                Reset
              </button>
            )}

            <button
              id="shipments-refresh-btn"
              onClick={loadShipments}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shrink-0"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Active Filter Pill Tags */}
        {isFilterActive && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
            <span className="font-medium">Applied Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Search: "{search}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Status: {statusFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleStatusChange('ALL')} />
              </span>
            )}
            {priorityFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Priority: {priorityFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handlePriorityChange('ALL')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Shipments Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-rose-600 text-xs">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span>Retrieving shipment records from PostgreSQL...</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Shipments Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching freight shipments found with your selected search criteria and filters.
            </p>
            {isFilterActive && (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
                  <th className="py-3 px-4">
                    Tracking ID
                  </th>
                  <th className="py-3 px-4">
                    Customer
                  </th>
                  <th className="py-3 px-4">
                    Origin
                  </th>
                  <th className="py-3 px-4">
                    Destination
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('expectedDeliveryDate')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Estimated Delivery</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Created</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {shipments.map(s => (
                  <tr
                    key={s.id}
                    id={`shipment-row-${s.id}`}
                    onClick={() => navigate(`/shipments/${s.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 group-hover:underline">
                      {s.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {s.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={s.origin}>
                      {s.origin}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={s.destination}>
                      {s.destination}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.currentStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={s.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {s.expectedDeliveryDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`shipment-action-view-${s.id}`}
                          onClick={() => navigate(`/shipments/${s.id}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
                          <button
                            id={`shipment-action-edit-${s.id}`}
                            onClick={() => navigate(`/shipments/${s.id}/edit`)}
                            className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Shipment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {hasRole('ADMIN') && (
                          <button
                            id={`shipment-action-delete-${s.id}`}
                            onClick={() => setDeletingShipment(s)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Shipment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Working Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingShipment}
        title="Confirm Shipment Deletion"
        message={`Are you sure you want to permanently delete shipment record ${deletingShipment?.id} (${deletingShipment?.customerName})? This will also remove associated timeline events.`}
        confirmLabel="Delete Shipment"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingShipment(null)}
      />
    </div>
  );
};
