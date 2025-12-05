'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  ExternalLink,
  Settings,
  LogOut,
  Globe,
  Share2,
  BarChart3
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  full_name: string;
  subscription_status: string;
}

interface Business {
  id: number;
  business_name: string;
  slug: string;
  tagline: string;
  category_name: string;
  is_published: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadBusinesses(parsedUser.id);
  }, [router]);

  const loadBusinesses = async (userId: number) => {
    try {
      const response = await fetch(`/api/businesses?userId=${userId}`);
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await fetch(`/api/businesses?id=${id}`, {
        method: 'DELETE'
      });
      
      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business');
    }
  };

  const togglePublish = async (business: Business) => {
    try {
      await fetch('/api/businesses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: business.id,
          is_published: business.is_published ? 0 : 1
        })
      });

      setBusinesses(businesses.map(b => 
        b.id === business.id 
          ? { ...b, is_published: !b.is_published }
          : b
      ));
    } catch (error) {
      console.error('Error updating business:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image 
                src="/lynks logo landscape.jpg" 
                alt="LYNKS Portal" 
                width={150} 
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#dbf72c' }}>My Businesses</h1>
          <p className="text-white">Manage your business pages and social links</p>
        </div>

        {/* Subscription Status */}
        {user.subscription_status === 'inactive' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Activate Your Subscription
                </h3>
                <p className="text-yellow-700 mb-4">
                  Subscribe to publish your business pages and unlock all features.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block text-black px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#dbf72c' }}
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Create New Business Button */}
        <div className="mb-8">
          <Link
            href="/dashboard/create"
            className="inline-flex items-center space-x-2 text-black px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            style={{ backgroundColor: '#dbf72c' }}
          >
            <Plus size={20} />
            <span>Create New Business Page</span>
          </Link>
        </div>

        {/* Business List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#dbf72c' }}></div>
            <p className="mt-4 text-white">Loading your businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Globe className="mx-auto mb-4" style={{ color: '#dbf72c' }} size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              No businesses yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first business page to get started
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center space-x-2 text-black px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#dbf72c' }}
            >
              <Plus size={20} />
              <span>Create Business Page</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(business => (
              <div
                key={business.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {business.business_name}
                      </h3>
                      {business.tagline && (
                        <p className="text-sm text-gray-400">{business.tagline}</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      business.is_published
                        ? 'text-black'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                    style={business.is_published ? { backgroundColor: '#dbf72c' } : {}}>
                      {business.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                      {business.category_name}
                    </span>
                  </div>

                  <div className="text-sm text-gray-400 mb-4">
                    Created {new Date(business.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/analytics/${business.id}`}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                      title="View Analytics"
                    >
                      <BarChart3 size={16} />
                      <span>Analytics</span>
                    </Link>
                    <Link
                      href={`/dashboard/edit/${business.id}`}
                      className="flex-1 flex items-center justify-center space-x-1 text-black px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                      style={{ backgroundColor: '#dbf72c' }}
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Link>
                    
                    {business.is_published && (
                      <Link
                        href={`/business/${business.slug}`}
                        target="_blank"
                        className="flex items-center justify-center space-x-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        <ExternalLink size={16} />
                        <span>View</span>
                      </Link>
                    )}

                    <button
                      onClick={() => togglePublish(business)}
                      className={`flex items-center justify-center space-x-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        business.is_published
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'text-black hover:opacity-90'
                      }`}
                      style={!business.is_published ? { backgroundColor: '#dbf72c' } : {}}
                    >
                      <Eye size={16} />
                      <span>{business.is_published ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(business.id)}
                      className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
