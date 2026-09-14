import React from 'react';
import { ShipmentStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, Truck, Package, Box, Navigation, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  switch (status) {
    case 'DELIVERED':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Delivered</span>
        </span>
      );
    case 'IN_TRANSIT':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse shrink-0" />
          <span>In Transit</span>
        </span>
      );
    case 'OUT_FOR_DELIVERY':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 ${sizeClasses[size]}`}
        >
          <Truck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Out for Delivery</span>
        </span>
      );
    case 'DELAYED':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Delayed</span>
        </span>
      );
    case 'ARRIVED_AT_FACILITY':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses[size]}`}
        >
          <Box className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>At Facility</span>
        </span>
      );
    case 'PICKED_UP':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}
        >
          <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Picked Up</span>
        </span>
      );
    case 'CREATED':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Created</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          id={`status-badge-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 ${sizeClasses[size]}`}
        >
          <XCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span
          id="status-badge-default"
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
