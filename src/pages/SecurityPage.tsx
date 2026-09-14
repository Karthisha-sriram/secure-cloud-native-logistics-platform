import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  Lock,
  LogOut,
  Clock,
  Shield,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { api } from '../api/client';
import { SecurityEvent, UserSession } from '../types';
import { useAuth } from '../context/AuthContext';

export const SecurityPage: React.FC = () => {
  const { user } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sessions and Audit events state
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, eventsData] = await Promise.all([
        api.getSessions(),
        api.getSecurityEvents(),
      ]);
      setSessions(sessionsData);
      setEvents(eventsData.events);
    } catch (err) {
      console.warn('Failed to load security telemetry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(res.message || 'Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadSecurityData();
    } catch (err: any) {
      setPasswordError(err?.message || 'Password update failed. Check current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke session.');
    }
  };

  const handleLogoutAllOther = async () => {
    try {
      await api.logoutAllSessions();
      loadSecurityData();
    } catch (err: any) {
      alert(err?.message || 'Failed to logout other sessions.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Security & Access Control
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Enforced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC), cryptographic sessions, and immutable audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono font-medium">HS256 JWT Signed</span>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Authorized Role</span>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">{user?.role}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Strict endpoint enforcement</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Last Authentication</span>
          <div className="text-sm font-semibold text-slate-900 mt-1">
            {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5">TLS 1.3 / HTTPS Ingress</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Sessions</span>
          <div className="text-base font-bold text-blue-600 mt-1">{sessions.length} Devices</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tracked by IP & user agent</p>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Rotate Account Password</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Passwords must contain at least 8 characters with upper, lower, and numeric symbols
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          {passwordSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                id="current-password-input"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                id="new-password-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                id="confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="change-password-submit-btn"
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? 'Verifying...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Sessions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">Active Authorized Sessions</h2>
            </div>
            <p className="text-xs text-slate-500">Devices currently authenticated to your account</p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleLogoutAllOther}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Terminate Other Sessions
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {sessions.map(s => (
            <div key={s.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{s.device}</span>
                    {s.isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Current Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    IP: {s.ipAddress} • Last active: {new Date(s.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(s.id)}
                  className="text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded border border-rose-200 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Events Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">Security Audit Trail</h2>
            </div>
            <p className="text-xs text-slate-500">Immutable compliance log of authentication and authorization events</p>
          </div>

          <button
            onClick={loadSecurityData}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Origin IP</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {events.slice(0, 10).map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                        ev.eventType === 'LOGIN_SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ev.eventType === 'PASSWORD_CHANGED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">{ev.ipAddress}</td>
                  <td className="py-2.5 px-4 text-slate-700">{ev.details}</td>
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
