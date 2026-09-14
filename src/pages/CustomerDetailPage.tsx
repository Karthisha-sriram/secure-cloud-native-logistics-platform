import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { api } from '../api/client';
import { Customer, Shipment } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<(Customer & { shipments: Shipment[]; stats: any }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCustomerById(id);
      setCustomer(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customer profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        <span>Loading customer account and shipment history...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-rose-900">Customer Account Unavailable</h3>
        <p className="text-xs text-rose-700 mt-1">{error || 'Account not found.'}</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium"
        >
          Return to Customers
        </button>
      </div>
    );
  }

  const stats = customer.stats || {
    totalShipments: customer.shipments?.length || 0,
    activeShipments: customer.shipments?.filter(s => s.currentStatus !== 'DELIVERED' && s.currentStatus !== 'CANCELLED').length || 0,
    deliveredShipments: customer.shipments?.filter(s => s.currentStatus === 'DELIVERED').length || 0,
    successRate: 100,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-display">
                {customer.company}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {customer.accountStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account ID: <span className="font-mono">{customer.id}</span> • Member since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/shipments/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Consignment for Shipper</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Consignments</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalShipments}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active In Transit</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.activeShipments}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Delivered Completed</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.deliveredShipments}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Fulfillment SLA Rate</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats.successRate}%</div>
        </div>
      </div>

      {/* Account Info Details Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Primary Shipper Profile & Contact Details</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Primary Contact</span>
            <p className="font-semibold text-slate-900 mt-0.5">{customer.name}</p>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Corporate Email</span>
            <p className="font-semibold text-slate-900 mt-0.5">{customer.email}</p>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Direct Phone</span>
            <p className="font-semibold text-slate-900 mt-0.5">{customer.phone}</p>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-400 block text-[11px]">Dispatch / Headquarters Address</span>
            <p className="font-medium text-slate-900 mt-0.5">{customer.address}, {customer.city}, {customer.country}</p>
          </div>
          {customer.notes && (
            <div>
              <span className="text-slate-400 block text-[11px]">Account Notes</span>
              <p className="text-slate-600 mt-0.5">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer's Shipments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Shipment History for {customer.company}</h2>
            <p className="text-xs text-slate-500">All consignments linked to this billing account</p>
          </div>
        </div>

        {(!customer.shipments || customer.shipments.length === 0) ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No shipments have been dispatched for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">ETA</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {customer.shipments.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/shipments/${s.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 group-hover:underline">
                      {s.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.origin.split(',')[0]} → {s.destination.split(',')[0]}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium max-w-xs truncate">
                      {s.packageDescription}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={s.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.currentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {s.expectedDeliveryDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.id}`);
                        }}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
