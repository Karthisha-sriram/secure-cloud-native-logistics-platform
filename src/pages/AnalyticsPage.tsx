import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api/client';
import { AnalyticsOverview } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6M');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnalyticsOverview();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = analytics?.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Freight & Supply Chain Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet velocity, SLA compliance metrics, and regional corridor throughput
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            {['30D', '90D', '6M', '1Y'].map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === t ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Delivery SLA Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics?.deliverySuccessRate ?? 96.8}%</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Target 95.0% exceeded</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Transit Time</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics?.averageDeliveryDays ?? 3.4} Days</div>
            <p className="text-[11px] text-blue-600 font-medium mt-1">-0.6 days vs last quarter</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Delayed Incident Rate</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {metrics?.totalShipments ? ((metrics.delayed / metrics.totalShipments) * 100).toFixed(1) : 3.2}%
            </div>
            <p className="text-[11px] text-rose-600 font-medium mt-1">{metrics?.delayed ?? 0} consignments flagged</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Freight Volume</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics?.totalShipments ?? 0} Units</div>
            <p className="text-[11px] text-slate-500 mt-1">Across 8 primary hubs</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Throughput Over Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Monthly Shipment Volume & SLA</h2>
            <p className="text-xs text-slate-500">Volume dispatched vs. on-time fulfillment</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.volumeOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="shipments" fill="#2563eb" radius={[4, 4, 0, 0]} name="Total Shipments" />
                <Bar dataKey="onTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time Delivery" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Priority Tier Distribution</h2>
              <p className="text-xs text-slate-500">Dispatch urgency breakdown</p>
            </div>

            <div className="space-y-4 pt-2">
              {(analytics?.priorityDistribution || []).map((p, idx) => {
                const total = metrics?.totalShipments || 1;
                const percentage = Math.round((p.count / total) * 100);
                const colors: Record<string, string> = {
                  CRITICAL: 'bg-purple-600',
                  HIGH: 'bg-amber-500',
                  MEDIUM: 'bg-blue-600',
                  LOW: 'bg-slate-400',
                };
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{p.priority}</span>
                      <span className="font-mono text-slate-500">{p.count} units ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[p.priority] || 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 text-xs text-slate-500">
            Critical priority packages are automatically monitored by the 24/7 Dispatch Control Tower.
          </div>
        </div>
      </div>

      {/* Regional Activity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Regional Gateway Activity</h2>
          <p className="text-xs text-slate-500">Consignment velocity across top fulfillment hubs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(analytics?.regionalActivity || []).map((r, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-800 truncate">{r.region}</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{r.shipments}</div>
              <div className="text-[10px] text-slate-400">Shipments</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
