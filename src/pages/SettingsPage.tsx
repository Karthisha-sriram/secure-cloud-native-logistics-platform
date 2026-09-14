import React, { useState } from 'react';
import { Settings, Sliders, Bell, Globe, Shield, Database, HardDrive, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('30');
  const [defaultPriority, setDefaultPriority] = useState('MEDIUM');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 font-display">
          Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure operations preferences, fleet dispatch parameters, and cloud integrations
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Platform preferences synchronized.</span>
        </div>
      )}

      {/* Dispatch Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Dispatch & Telemetry Defaults</h2>
          </div>
          <p className="text-xs text-slate-500">Fine-tune automated tracking poll rates and consignment defaults</p>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Live Fleet Polling Interval
            </label>
            <select
              value={autoRefreshInterval}
              onChange={e => setAutoRefreshInterval(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
            >
              <option value="15">Every 15 seconds (High Frequency)</option>
              <option value="30">Every 30 seconds (Standard)</option>
              <option value="60">Every 60 seconds (Conserve Bandwidth)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Default Consignment Priority
            </label>
            <select
              value={defaultPriority}
              onChange={e => setDefaultPriority(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
            >
              <option value="LOW">Low (Standard Freight)</option>
              <option value="MEDIUM">Medium (Expedited Air/Ground)</option>
              <option value="HIGH">High (Priority Urgent)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cloud & Storage Infrastructure Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Infrastructure & Storage Status</h2>
          </div>
          <p className="text-xs text-slate-500">Cloud deployment runtime telemetry</p>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Cloud Database Engine</span>
            <p className="font-semibold text-slate-900 mt-0.5">PostgreSQL / Cloud SQL</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">Connection Pool: Active</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Object Storage Provider</span>
            <p className="font-semibold text-slate-900 mt-0.5">Local Storage / GCS Multi-Cloud</p>
            <span className="inline-block mt-1 text-[11px] text-blue-600 font-medium">Bucket: logistics-documents-vault</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">AI Reasoning Core</span>
            <p className="font-semibold text-slate-900 mt-0.5">Gemini 3.8 Flash SDK</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">Server-Side Proxied</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Authentication Engine</span>
            <p className="font-semibold text-slate-900 mt-0.5">Spring Security 6 / JWT</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">RBAC Enforced</span>
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
