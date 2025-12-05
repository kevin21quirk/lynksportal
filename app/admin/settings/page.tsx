'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Building2, Users, BarChart3, Settings,
  ArrowUpRight, Globe, Mail, Bell, Shield, Database,
  Save, AlertCircle, CheckCircle
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'LYNKS Portal',
    siteTagline: 'Find Local Businesses in Isle of Man',
    contactEmail: 'admin@lynksportal.com',
    supportEmail: 'support@lynksportal.com',
    
    // Analytics Settings
    trackingEnabled: true,
    anonymizeIPs: false,
    dataRetentionDays: 90,
    
    // Email Settings
    emailNotifications: true,
    newBusinessAlert: true,
    weeklyReport: true,
    
    // Security Settings
    requireEmailVerification: false,
    allowPublicRegistration: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    
    // Business Settings
    autoPublishBusinesses: false,
    requireBusinessApproval: false,
    maxBusinessesPerUser: 10,
  });

  useEffect(() => {
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
    
    loadSettings();
  }, []);
  
  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };
  
  const handleSave = () => {
    setSaving(true);
    
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    setTimeout(() => {
      setSaving(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };
  
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/30"
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
        <div className="bg-gray-900/50 border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-gray-400 text-sm mt-1">Configure your platform</p>
            </div>
            
            {saveMessage && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                <CheckCircle className="w-5 h-5" />
                <span>{saveMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-lime-400 border-b-2 border-lime-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                General
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-lime-400 border-b-2 border-lime-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'email'
                  ? 'text-lime-400 border-b-2 border-lime-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-lime-400 border-b-2 border-lime-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'business'
                  ? 'text-lime-400 border-b-2 border-lime-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business
              </div>
            </button>
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Site Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Site Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.siteTagline}
                      onChange={(e) => updateSetting('siteTagline', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => updateSetting('contactEmail', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => updateSetting('supportEmail', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Settings */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Analytics Configuration</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Enable Tracking</div>
                      <div className="text-sm text-gray-400">Track visitor analytics across the platform</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.trackingEnabled}
                        onChange={(e) => updateSetting('trackingEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Anonymize IP Addresses</div>
                      <div className="text-sm text-gray-400">Remove last octet of IP addresses for privacy</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.anonymizeIPs}
                        onChange={(e) => updateSetting('anonymizeIPs', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Data Retention Period (days)
                    </label>
                    <input
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Analytics data older than this will be automatically deleted</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Email Notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Email Notifications</div>
                      <div className="text-sm text-gray-400">Enable all email notifications</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">New Business Alerts</div>
                      <div className="text-sm text-gray-400">Get notified when a new business is created</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.newBusinessAlert}
                        onChange={(e) => updateSetting('newBusinessAlert', e.target.checked)}
                        className="sr-only peer"
                        disabled={!settings.emailNotifications}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Weekly Reports</div>
                      <div className="text-sm text-gray-400">Receive weekly analytics summary</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.weeklyReport}
                        onChange={(e) => updateSetting('weeklyReport', e.target.checked)}
                        className="sr-only peer"
                        disabled={!settings.emailNotifications}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Security & Access</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Require Email Verification</div>
                      <div className="text-sm text-gray-400">Users must verify email before accessing platform</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Allow Public Registration</div>
                      <div className="text-sm text-gray-400">Anyone can create an account</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowPublicRegistration}
                        onChange={(e) => updateSetting('allowPublicRegistration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">Account locked after this many failed attempts</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Settings */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Business Management</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Auto-Publish Businesses</div>
                      <div className="text-sm text-gray-400">New businesses are automatically published</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoPublishBusinesses}
                        onChange={(e) => updateSetting('autoPublishBusinesses', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Require Business Approval</div>
                      <div className="text-sm text-gray-400">Admin must approve businesses before publishing</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireBusinessApproval}
                        onChange={(e) => updateSetting('requireBusinessApproval', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Businesses Per User
                    </label>
                    <input
                      type="number"
                      value={settings.maxBusinessesPerUser}
                      onChange={(e) => updateSetting('maxBusinessesPerUser', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-lime-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of businesses a user can create</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-gray-900 rounded-lg hover:bg-lime-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
