import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ArrowUpRight,
  Plus,
  FileUp,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Truck,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../api/client';
import { AnalyticsOverview, Shipment } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsData, shipmentsData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getShipments({ page: 1, size: 5, sortBy: 'createdAt', sortDir: 'desc' }),
      ]);
      setAnalytics(analyticsData);
      setRecentShipments(shipmentsData.content);
    } catch (err: any) {
      setError(err?.message || 'Failed to load logistics telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = analytics?.metrics;

  const statCards = [
    {
      id: 'stat-total-shipments',
      label: 'Total Shipments',
      value: metrics?.totalShipments ?? 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      action: () => navigate('/shipments'),
      subtext: 'Across all global hubs',
    },
    {
      id: 'stat-in-transit',
      label: 'In Transit',
      value: metrics?.inTransit ?? 0,
      icon: Navigation,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      action: () => navigate('/shipments?status=IN_TRANSIT'),
      subtext: 'Active carrier corridors',
    },
    {
      id: 'stat-delivered',
      label: 'Delivered',
      value: metrics?.delivered ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      action: () => navigate('/shipments?status=DELIVERED'),
      subtext: 'Signed & confirmed POD',
    },
    {
      id: 'stat-delayed',
      label: 'Delayed',
      value: metrics?.delayed ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      action: () => navigate('/shipments?status=DELAYED'),
      subtext: 'Requires dispatch attention',
    },
    {
      id: 'stat-pending',
      label: 'Pending / Facility',
      value: metrics?.pending ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      action: () => navigate('/shipments?status=CREATED'),
      subtext: 'Sort & staging queues',
    },
    {
      id: 'stat-active-customers',
      label: 'Active Customers',
      value: metrics?.activeCustomers ?? 0,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      action: () => (hasRole('ADMIN', 'OPERATIONS_MANAGER') ? navigate('/customers') : navigate('/shipments')),
      subtext: 'Accounts with active orders',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating telemetry from Cloud SQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-rose-900">Dashboard Unavailable</h3>
        <p className="text-xs text-rose-700 mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Operations Control Center
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live Fleet
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, {user?.name}. Viewing logistics data for {user?.company}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
            <button
              id="dashboard-new-shipment-btn"
              onClick={() => navigate('/shipments/new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Shipment</span>
            </button>
          )}

          {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
            <button
              id="dashboard-upload-doc-btn"
              onClick={() => navigate('/documents')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <FileUp className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Upload Document</span>
            </button>
          )}

          <button
            id="dashboard-refresh-btn"
            onClick={fetchDashboardData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid (Clickable navigation as mandated in prompt) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={card.action}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-500 line-clamp-1">{card.label}</span>
                <div className={`p-1.5 rounded-lg border shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {card.value}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span className="truncate">{card.subtext}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row: Volume Over Time & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Volume Over Time */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Shipment Volume Over Time</h2>
              <p className="text-xs text-slate-500">Historical delivery throughput and carrier fulfillment</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Total Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">On-Time SLA</span>
              </div>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.volumeOverTime || []}>
                <defs>
                  <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="shipments" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorShipments)" />
                <Area type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOnTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-900">Status Distribution</h2>
            <p className="text-xs text-slate-500">Active consignment breakdown</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {(analytics?.statusDistribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Shipments Table with direct navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent Shipments Activity</h2>
            <p className="text-xs text-slate-500">Latest consignments processed through the freight network</p>
          </div>
          <button
            id="dashboard-view-all-shipments-btn"
            onClick={() => navigate('/shipments')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>View All Shipments</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ETA</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No recent shipments available.
                  </td>
                </tr>
              ) : (
                recentShipments.map(s => (
                  <tr
                    key={s.id}
                    id={`recent-shipment-row-${s.id}`}
                    onClick={() => navigate(`/shipments/${s.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 group-hover:underline">
                      {s.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {s.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {s.origin.split(',')[0]} → {s.destination.split(',')[0]}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={s.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.currentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {s.expectedDeliveryDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.id}`);
                        }}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
