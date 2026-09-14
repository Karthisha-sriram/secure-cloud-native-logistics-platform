import React from 'react';
import { ShipmentPriority } from '../../types';

interface PriorityBadgeProps {
  priority: ShipmentPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  switch (priority) {
    case 'CRITICAL':
      return (
        <span
          id={`priority-badge-${priority.toLowerCase()}`}
          className={`inline-flex items-center font-semibold rounded uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses[size]}`}
        >
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span
          id={`priority-badge-${priority.toLowerCase()}`}
          className={`inline-flex items-center font-semibold rounded uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}
        >
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          id={`priority-badge-${priority.toLowerCase()}`}
          className={`inline-flex items-center font-medium rounded uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}
        >
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          id={`priority-badge-${priority.toLowerCase()}`}
          className={`inline-flex items-center font-medium rounded uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses[size]}`}
        >
          Low
        </span>
      );
  }
};
