'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Eye, Activity, TrendingUp, Smartphone,
  Monitor, Globe, MapPin, Clock, Download, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  FunnelChart, Funnel, LabelList
} from 'recharts';

interface PlatformAnalytics {
  summary: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    activeSessions: number;
  };
  topBusinesses: Array<{ id: number; name: string; slug: string; views: number }>;
  topCategories: Array<{ name: string; views: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  regionBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  peakHours: Record<number, number>;
  funnel: Array<{ stage: string; count: number; percentage: number }>;
  dailyData: Array<{ date: string; visitors: number; pageViews: number }>;
}

const COLORS = ['#dbf72c', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // For now, allow all logged-in users to view analytics
      // In production, add role check: if (parsedUser.role !== 'admin') router.push('/dashboard');
    } else {
      router.push('/login');
      return;
    }

    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/platform?days=${dateRange}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mb-4"></div>
          <p className="text-white text-lg">Loading platform analytics...</p>
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

  // Prepare data for charts
  const deviceData = Object.entries(analytics.deviceBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const browserData = Object.entries(analytics.browserBreakdown).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value).slice(0, 6);

  const peakHoursData = Object.entries(analytics.peakHours)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      visits: count,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  const countryData = Object.entries(analytics.countryBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c0f17' }}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
              <p className="text-gray-400 mt-1">System-wide performance metrics</p>
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

              <Link
                href="/admin/users"
                className="px-4 py-2 bg-lime-400 text-gray-900 rounded-lg hover:bg-lime-300 transition-colors font-semibold flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Users
              </Link>

              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:border-lime-400 transition-colors"
              >
                Back to Admin Dashboard
              </Link>
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
            <div className="text-4xl font-bold mb-2">{analytics.summary.pageViews.toLocaleString()}</div>
            <div className="text-blue-100 text-sm">Total Page Views</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-2">{analytics.summary.uniqueVisitors.toLocaleString()}</div>
            <div className="text-green-100 text-sm">Unique Visitors</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-4xl font-bold mb-2">{analytics.summary.activeSessions.toLocaleString()}</div>
            <div className="text-purple-100 text-sm">Active Sessions</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-2">{analytics.summary.totalVisitors.toLocaleString()}</div>
            <div className="text-orange-100 text-sm">Total Visitors</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Traffic */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Daily Traffic</h3>
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
                  dataKey="pageViews" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Page Views"
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
          </div>

          {/* Conversion Funnel */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {analytics.funnel.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{stage.stage}</span>
                    <span className="text-gray-400">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stage.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Device Breakdown */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Device Breakdown</h3>
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
          </div>

          {/* Browser Breakdown */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Browser Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browserData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
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
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
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

          {/* Top Countries */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Top Countries</h3>
            <div className="space-y-3">
              {countryData.map((country, index) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{country.name}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">{country.value} visits</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Businesses and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Businesses */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Most Viewed Businesses</h3>
            <div className="space-y-3">
              {analytics.topBusinesses.map((business, index) => (
                <Link
                  key={business.slug}
                  href={`/business/${business.slug}`}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-white">{business.name}</span>
                  </div>
                  <div className="text-gray-400">{business.views} views</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Top Categories</h3>
            <div className="space-y-3">
              {analytics.topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-white">{category.name}</span>
                  </div>
                  <div className="text-gray-400">{category.views} views</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
