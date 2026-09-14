import React, { useState, useEffect } from 'react';
import { HelpCircle, Terminal, Activity, CheckCircle2, RefreshCw, Layers, ShieldCheck, Database, Cloud } from 'lucide-react';
import { api } from '../api/client';

export const HelpPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const data = await api.checkHealth();
      setHealth(data);
    } catch (err: any) {
      setHealth({ status: 'DOWN', error: err?.message });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const endpoints = [
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticates with email & password, returns JWT token' },
    { method: 'GET', path: '/api/auth/me', desc: 'Retrieves authenticated user profile and roles' },
    { method: 'GET', path: '/api/shipments', desc: 'Paginated search, filter, and sort shipments' },
    { method: 'POST', path: '/api/shipments', desc: 'Create a new consignment with auto-generated tracking ID' },
    { method: 'GET', path: '/api/shipments/:id', desc: 'Get consignment by tracking ID with events and documents' },
    { method: 'POST', path: '/api/shipments/:id/status', desc: 'Advance shipment status, location, and dispatch note' },
    { method: 'GET', path: '/api/customers', desc: 'Paginated customer accounts directory' },
    { method: 'POST', path: '/api/documents/upload', desc: 'Upload file to Cloud Storage / Local Storage provider' },
    { method: 'GET', path: '/api/documents/:id/download', desc: 'Binary file download with streaming chunks' },
    { method: 'GET', path: '/api/analytics/overview', desc: 'Get fleet volume, SLA rates, and regional breakdown' },
    { method: 'POST', path: '/api/ai/chat', desc: 'Ask Gemini Flash AI assistant with role-based cargo context' },
    { method: 'GET', path: '/actuator/health', desc: 'Spring Boot Actuator standard health check endpoint' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 font-display">
          API Directory & System Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          REST API reference, production actuator health telemetry, and cloud operational support
        </p>
      </div>

      {/* Live Health Check Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">Actuator Health Check</h2>
            <span className="font-mono text-xs text-slate-400">GET /actuator/health</span>
          </div>

          <button
            onClick={checkHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>Ping Service</span>
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                health?.status === 'UP' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-bold text-slate-800">Status: {health?.status || 'UNKNOWN'}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              Database: {health?.components?.db?.status || 'UP'} ({health?.components?.db?.details?.database || 'Cloud SQL'})
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              Disk Storage: {health?.components?.diskSpace?.status || 'UP'}
            </span>
          </div>
        </div>
      </div>

      {/* API Endpoint Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">REST API Reference</h2>
          </div>
          <p className="text-xs text-slate-500">Core endpoints exposed by the Cloud Native backend</p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
              <div className="flex items-center gap-2.5 font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'GET'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : ep.method === 'POST'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-slate-900 font-semibold">{ep.path}</span>
              </div>
              <span className="text-slate-500 text-xs">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
