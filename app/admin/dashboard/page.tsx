'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Building2, Users, BarChart3, Settings,
  Eye, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Globe, Clock, MousePointer, Activity
} from 'lucide-react';

interface DashboardStats {
  totalBusinesses: number;
  publishedBusinesses: number;
  totalUsers: number;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  totalActions: number;
  businessesChange: number;
  usersChange: number;
  viewsChange: number;
  visitorsChange: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    loadDashboardStats();
  }, []);

  const checkAdminAccess = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.email !== 'admin@lynksportal.com') {
      router.push('/dashboard');
      return;
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Load businesses
      const businessRes = await fetch('/api/businesses');
      const businesses = await businessRes.json();
      
      // Load users
      const usersRes = await fetch('/api/admin/users');
      const users = await usersRes.json();
      
      // Load analytics
      const analyticsRes = await fetch('/api/analytics/platform?days=30');
      const analytics = await analyticsRes.json();

      setStats({
        totalBusinesses: businesses.length,
        publishedBusinesses: businesses.filter((b: any) => b.is_published).length,
        totalUsers: users.length,
        totalViews: analytics.summary?.pageViews || 0,
        uniqueVisitors: analytics.summary?.uniqueVisitors || 0,
        avgTimeOnPage: Math.round((analytics.summary?.avgTimeOnPage || 0) / 60), // Convert to minutes
        totalActions: analytics.summary?.totalActions || 0,
        businessesChange: 12.5, // Mock data - calculate from previous period
        usersChange: 8.3,
        viewsChange: 24.7,
        visitorsChange: 18.2,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0c0f17' }}>
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">LYNKS Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/30"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>

          <Link
            href="/admin/businesses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Businesses</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Users</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="font-medium">Exit Admin</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-gray-900/50 border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
              <p className="text-gray-400 text-sm mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Businesses */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats!.businessesChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats!.businessesChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(stats!.businessesChange)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.totalBusinesses?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-400">Total Businesses</div>
              <div className="text-xs text-gray-500 mt-2">
                {stats!.publishedBusinesses} published
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats!.usersChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats!.usersChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(stats!.usersChange)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.totalUsers?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-400">Total Users</div>
              <div className="text-xs text-gray-500 mt-2">
                Registered accounts
              </div>
            </div>

            {/* Total Views */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${(stats?.viewsChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(stats?.viewsChange || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(stats?.viewsChange || 0)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.totalViews?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-400">Total Views</div>
              <div className="text-xs text-gray-500 mt-2">
                Platform-wide
              </div>
            </div>

            {/* Unique Visitors */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${(stats?.visitorsChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(stats?.visitorsChange || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(stats?.visitorsChange || 0)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.uniqueVisitors?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-400">Unique Visitors</div>
              <div className="text-xs text-gray-500 mt-2">
                Last 30 days
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Avg Time on Page */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.avgTimeOnPage || 0}m</div>
                  <div className="text-sm text-gray-400">Avg. Time on Page</div>
                </div>
              </div>
            </div>

            {/* Total Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{(stats.totalActions || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Actions</div>
                </div>
              </div>
            </div>

            {/* Published Rate */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-lime-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.totalBusinesses > 0 ? Math.round((stats.publishedBusinesses / stats.totalBusinesses) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Published Rate</div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/businesses"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 hover:border-lime-400"
              >
                <Building2 className="w-8 h-8 text-lime-400" />
                <div>
                  <div className="font-semibold text-white">Manage Businesses</div>
                  <div className="text-sm text-gray-400">View all businesses</div>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 hover:border-lime-400"
              >
                <Users className="w-8 h-8 text-lime-400" />
                <div>
                  <div className="font-semibold text-white">Manage Users</div>
                  <div className="text-sm text-gray-400">View all users</div>
                </div>
              </Link>

              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 hover:border-lime-400"
              >
                <BarChart3 className="w-8 h-8 text-lime-400" />
                <div>
                  <div className="font-semibold text-white">View Analytics</div>
                  <div className="text-sm text-gray-400">Platform metrics</div>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 hover:border-lime-400"
              >
                <Settings className="w-8 h-8 text-lime-400" />
                <div>
                  <div className="font-semibold text-white">Settings</div>
                  <div className="text-sm text-gray-400">System config</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
