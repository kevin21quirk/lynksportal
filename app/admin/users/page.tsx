'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, Building2, Mail, Calendar,
  Eye, Copy, Check, BarChart3, Edit, LayoutDashboard,
  Settings, ArrowUpRight, Search, CheckCircle, XCircle
} from 'lucide-react';

interface BusinessWithOwner {
  id: number;
  business_name: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  owner_email: string;
  owner_name: string;
  owner_id: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessWithOwner[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<number | null>(null);

  useEffect(() => {
    checkAdminAccess();
    loadBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [searchTerm, businesses]);

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

  const loadBusinesses = async () => {
    try {
      const res = await fetch('/api/admin/businesses-with-owners');
      if (!res.ok) {
        console.error('Failed to fetch businesses:', res.status);
        setBusinesses([]);
        return;
      }
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setBusinesses(data);
        setFilteredBusinesses(data);
      } else {
        console.error('Invalid response format:', data);
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    if (!searchTerm) {
      setFilteredBusinesses(businesses);
      return;
    }

    const filtered = businesses.filter(b => 
      b.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.owner_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  };


  const copyToClipboard = async (text: string, userId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(userId);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0c0f17' }}>
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">LYNKS Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/30"
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
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Business Accounts</h1>
                <p className="text-gray-400 mt-1">View all businesses and their owner login accounts</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-lime-400/10 rounded-lg border border-lime-400/30">
                <Building2 className="w-5 h-5 text-lime-400" />
                <span className="text-lime-400 font-semibold">{filteredBusinesses.length} Businesses</span>
              </div>
            </div>
          </div>
        </div>

      {/* Search Bar */}
      <div className="px-8 py-6 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name or owner email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
          />
        </div>
      </div>

      {/* Businesses Table */}
      <div className="px-8 py-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Business</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Owner Account</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Owner Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Created</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-white">{business.business_name}</div>
                      <div className="text-sm text-gray-400">/{business.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{business.owner_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{business.owner_email}</span>
                      <button
                        onClick={() => copyToClipboard(business.owner_email, business.id)}
                        className="text-gray-500 hover:text-lime-400 transition-colors"
                      >
                        {copiedEmail === business.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {business.is_published ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-sm">
                        <XCircle className="w-4 h-4" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">
                      {new Date(business.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/business/${business.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/analytics/${business.id}`}
                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                        title="Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/edit/${business.id}`}
                        className="p-2 text-gray-400 hover:text-lime-400 hover:bg-lime-400/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No businesses found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
