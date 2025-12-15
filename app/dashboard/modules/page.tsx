'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

interface AddonModule {
  id: number;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  is_active: boolean;
}

interface Subscription {
  id: number;
  business_id: number;
  addon_module_id: number;
  module_name: string;
  module_slug: string;
  status: string;
  billing_cycle: string;
  trial_ends_at: string | null;
  current_period_end: string;
  monthly_price: number;
  yearly_price: number;
}

export default function ModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<AddonModule[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get user's businesses
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const businessesRes = await fetch(`/api/businesses?userId=${userId}`);
      const businesses = await businessesRes.json();
      
      if (!businesses || businesses.length === 0) {
        setLoading(false);
        return;
      }

      const businessId = businesses[0].id;

      // Load available modules
      const modulesRes = await fetch('/api/addon-modules');
      const modulesData = await modulesRes.json();
      setModules(modulesData);

      // Load user's subscriptions
      const subsRes = await fetch(`/api/business-subscriptions?businessId=${businessId}`);
      const subsData = await subsRes.json();
      setSubscriptions(subsData);

      // Initialize billing cycle selections to monthly
      const initialCycles: { [key: number]: string } = {};
      modulesData.forEach((module: AddonModule) => {
        initialCycles[module.id] = 'monthly';
      });
      setSelectedBillingCycle(initialCycles);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (moduleId: number) => {
    try {
      setSubscribing(moduleId);

      const userId = localStorage.getItem('userId');
      const businessesRes = await fetch(`/api/businesses?userId=${userId}`);
      const businesses = await businessesRes.json();
      const businessId = businesses[0].id;

      const billingCycle = selectedBillingCycle[moduleId] || 'monthly';

      const response = await fetch('/api/business-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          addonModuleId: moduleId,
          billingCycle,
          trialDays: 14 // 14-day free trial
        })
      });

      if (response.ok) {
        await loadData(); // Reload to show new subscription
        alert('Successfully subscribed! You have a 14-day free trial.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('Failed to subscribe');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/business-subscriptions?id=${subscriptionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadData();
        alert('Subscription cancelled successfully');
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription');
    }
  };

  const isSubscribed = (moduleId: number) => {
    return subscriptions.some(
      sub => sub.addon_module_id === moduleId && 
      (sub.status === 'active' || sub.status === 'trial')
    );
  };

  const getSubscription = (moduleId: number) => {
    return subscriptions.find(
      sub => sub.addon_module_id === moduleId && 
      (sub.status === 'active' || sub.status === 'trial')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#dbf72c' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c0f17' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 px-4 py-2 rounded-lg text-white hover:bg-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Add-on Modules</h1>
          <p className="text-gray-400 text-lg">
            Enhance your business with premium features
          </p>
        </div>

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Your Active Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions
                .filter(sub => sub.status === 'active' || sub.status === 'trial')
                .map(sub => (
                  <div
                    key={sub.id}
                    className="bg-gray-800 rounded-xl p-6 border-2"
                    style={{ borderColor: '#dbf72c' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{sub.module_name}</h3>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{ 
                            backgroundColor: sub.status === 'trial' ? '#fbbf24' : '#dbf72c',
                            color: '#0c0f17'
                          }}
                        >
                          {sub.status === 'trial' ? 'Free Trial' : 'Active'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCancelSubscription(sub.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="text-gray-400 text-sm space-y-1">
                      <p>Billing: {sub.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}</p>
                      <p>
                        {sub.status === 'trial' && sub.trial_ends_at
                          ? `Trial ends: ${new Date(sub.trial_ends_at).toLocaleDateString()}`
                          : `Next billing: ${new Date(sub.current_period_end).toLocaleDateString()}`
                        }
                      </p>
                      <p className="text-white font-semibold mt-2">
                        £{sub.billing_cycle === 'yearly' ? sub.yearly_price : sub.monthly_price}
                        /{sub.billing_cycle === 'yearly' ? 'year' : 'month'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Available Modules */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Available Modules</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {modules.map(module => {
              const subscribed = isSubscribed(module.id);
              const subscription = getSubscription(module.id);
              const billingCycle = selectedBillingCycle[module.id] || 'monthly';
              const price = billingCycle === 'yearly' ? module.yearly_price : module.monthly_price;
              const savings = billingCycle === 'yearly' 
                ? (module.monthly_price * 12 - module.yearly_price).toFixed(2)
                : null;

              return (
                <div
                  key={module.id}
                  className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <h3 className="text-2xl font-bold text-white mb-3">{module.name}</h3>
                  <p className="text-gray-400 mb-6">{module.description}</p>

                  {/* Pricing Toggle */}
                  {!subscribed && (
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-4 bg-gray-900 rounded-lg p-1">
                        <button
                          onClick={() => setSelectedBillingCycle({ ...selectedBillingCycle, [module.id]: 'monthly' })}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            billingCycle === 'monthly'
                              ? 'bg-white text-gray-900'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setSelectedBillingCycle({ ...selectedBillingCycle, [module.id]: 'yearly' })}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            billingCycle === 'yearly'
                              ? 'bg-white text-gray-900'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Yearly
                        </button>
                      </div>
                      {savings && (
                        <p className="text-center text-sm mt-2" style={{ color: '#dbf72c' }}>
                          Save £{savings} per year
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">£{price}</span>
                      <span className="text-gray-400">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#dbf72c' }} />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  {subscribed ? (
                    <div className="space-y-3">
                      <button
                        className="w-full py-3 px-6 rounded-lg font-semibold transition-all"
                        style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                        onClick={() => router.push(`/dashboard/modules/${module.slug}`)}
                      >
                        Manage Module
                      </button>
                      {subscription?.status === 'trial' && (
                        <p className="text-center text-sm text-gray-400">
                          Free trial until {new Date(subscription.trial_ends_at!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(module.id)}
                      disabled={subscribing === module.id}
                      className="w-full py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                    >
                      {subscribing === module.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Subscribing...
                        </span>
                      ) : (
                        'Start 14-Day Free Trial'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
