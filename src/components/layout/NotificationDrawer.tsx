import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCheck, ExternalLink, AlertTriangle, CheckCircle2, FileText, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationType } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

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

  const handleClick = (id: string, linkTo?: string) => {
    markAsRead(id);
    if (linkTo) {
      navigate(linkTo);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="notification-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All alerts caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  id="notif-mark-all-read-btn"
                  onClick={() => markAllAsRead()}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                id="notif-drawer-close-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No notifications recorded yet.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  id={`notif-item-${notif.id}`}
                  onClick={() => handleClick(notif.id, notif.linkTo)}
                  className={`p-4 transition-colors cursor-pointer flex items-start gap-3.5 hover:bg-slate-50/80 ${
                    !notif.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-xs">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400">
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      {notif.linkTo && (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <button
              id="notif-view-all-page-btn"
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Go to Notifications Center →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
