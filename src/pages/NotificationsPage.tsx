import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  ExternalLink,
  Filter,
  Check,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationType } from '../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD' && n.read) return false;
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SHIPMENT_DELAYED':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'DELIVERY_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'DOCUMENT_UPLOADED':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'SECURITY_ALERT':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-600" />;
    }
  };

  const handleItemClick = (id: string, linkTo?: string) => {
    markAsRead(id);
    if (linkTo) navigate(linkTo);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Notifications & Dispatch Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated event broadcasts for cargo tracking, delays, security, and POD receipts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'UNREAD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="w-full sm:w-48 bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-700"
        >
          <option value="ALL">All Event Types</option>
          <option value="SHIPMENT_STATUS">Shipment Updates</option>
          <option value="SHIPMENT_DELAYED">Delay Warnings</option>
          <option value="DELIVERY_COMPLETED">Deliveries Completed</option>
          <option value="DOCUMENT_UPLOADED">Documents Uploaded</option>
          <option value="SECURITY_ALERT">Security Alerts</option>
        </select>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Notifications</h3>
            <p className="mt-1">You are all caught up on alerts.</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif.id, notif.linkTo)}
              className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-4 hover:bg-slate-50 ${
                !notif.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notif.linkTo && (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
                        <span>Open Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    markAsRead(notif.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
