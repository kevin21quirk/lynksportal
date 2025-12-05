'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Eye, Users, Clock, MousePointer, 
  Smartphone, Monitor, Tablet, TrendingUp, MapPin,
  Phone, Mail, MessageCircle, Globe, Download
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    totalActions: number;
  };
  actions: Array<{ type: string; count: number; icon: string }>;
  deviceBreakdown: Record<string, number>;
  regionBreakdown: Record<string, number>;
  peakHours: Record<number, number>;
  dailyData: Array<{ date: string; views: number; visitors: number; actions: number }>;
}

const COLORS = ['#dbf72c', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BusinessAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
    loadBusiness();
  }, [businessId, dateRange]);

  const loadBusiness = async () => {
    try {
      const res = await fetch(`/api/businesses?id=${businessId}`);
      const data = await res.json();
      if (data.length > 0) {
        setBusiness(data[0]);
      }
    } catch (error) {
      console.error('Error loading business:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/business/${businessId}?days=${dateRange}`);
      const data = await res.json();
      
      // Ensure data has required structure
      if (data.error) {
        console.error('API Error:', data.error);
        setAnalytics(null);
      } else {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    window.open(`/api/analytics/export/${format}?businessId=${businessId}&days=${dateRange}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mb-4"></div>
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-center">
          <p className="text-white text-xl mb-4">Failed to load analytics</p>
          <Link href="/dashboard" className="text-lime-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Prepare device data for pie chart
  const deviceData = analytics.deviceBreakdown 
    ? Object.entries(analytics.deviceBreakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  // Prepare peak hours data for bar chart
  const peakHoursData = analytics.peakHours
    ? Object.entries(analytics.peakHours)
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          visits: count,
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    : [];

  // Prepare region data
  const regionData = analytics.regionBreakdown
    ? Object.entries(analytics.regionBreakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c0f17' }}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-gray-400 hover:text-lime-400 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                {business && (
                  <p className="text-gray-400 mt-1">{business.business_name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>

              {/* Export Buttons */}
              <button
                onClick={() => exportData('csv')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:border-lime-400 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:border-lime-400 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-2">{(analytics.summary?.totalViews || 0).toLocaleString()}</div>
            <div className="text-blue-100 text-sm">Total Views</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-2">{(analytics.summary?.uniqueVisitors || 0).toLocaleString()}</div>
            <div className="text-green-100 text-sm">Unique Visitors</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-2">{analytics.summary?.avgTimeOnPage || 0}s</div>
            <div className="text-purple-100 text-sm">Avg. Time on Page</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <MousePointer className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-2">{(analytics.summary?.totalActions || 0).toLocaleString()}</div>
            <div className="text-orange-100 text-sm">Total Actions</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Views Chart */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Daily Views & Visitors</h3>
            {analytics.dailyData && analytics.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No daily data available yet
              </div>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Device Breakdown</h3>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No device data available yet
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Peak Hours */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Peak Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="visits" fill="#dbf72c" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Regions */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Top Regions</h3>
            <div className="space-y-3">
              {regionData.map((region, index) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{region.name}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">{region.value} visits</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Top Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.actions && analytics.actions.length > 0 ? analytics.actions.map((action, index) => (
              <div 
                key={action.type}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <div className="text-3xl font-bold text-white mb-2">{action.count}</div>
                <div className="text-gray-400 text-sm">{action.type}</div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                No action data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
