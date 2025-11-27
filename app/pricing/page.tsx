'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Monthly Package',
      price: '£19.99',
      period: 'month',
      description: 'Charged at the start of each month',
      features: [
        'Enjoy full access to all platform features',
        'Perfect for individuals or small teams',
        'Flexibility without long-term commitment',
        'Manage your links and track performance',
        'Stay organised with ease'
      ]
    },
    {
      name: '12 Month Package',
      price: '£199.99',
      period: 'year',
      description: 'Get 2 months completely FREE',
      features: [
        'All features from Monthly Package',
        'Save £39.89 compared to monthly billing',
        'Best value for growing businesses',
        'Priority customer support',
        'Advanced analytics included'
      ],
      popular: true
    },
    {
      name: '24 Month Package',
      price: '£399.99',
      period: '2 years',
      description: 'Get 4 months completely FREE',
      features: [
        'All features from 12 Month Package',
        'Maximum savings - £79.77 off',
        'Perfect for established businesses',
        'Dedicated account manager',
        'Custom branding options'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/lynks logo landscape.jpg" 
                alt="LYNKS Portal" 
                width={180} 
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="px-6 py-2 rounded-full font-bold text-sm transition-all animate-pulse-glow hover:scale-105"
                style={{ backgroundColor: '#dbf72c', color: '#000' }}
              >
                Login / Signup
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#dbf72c' }}>
            Choose Your Package
          </h1>
          <p className="text-xl text-white">
            Transparent, straightforward pricing for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-gray-900 rounded-2xl border-2 p-8 ${
                plan.popular
                  ? 'shadow-xl scale-105'
                  : 'border-gray-800 hover:border-gray-700 hover:shadow-lg'
              } transition-all`}
              style={plan.popular ? { borderColor: '#dbf72c' } : {}}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-sm font-semibold text-gray-900" style={{ backgroundColor: '#dbf72c' }}>
                    Best value package!
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'shadow-lg hover:shadow-xl'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                style={plan.popular ? { backgroundColor: '#dbf72c', color: '#000' } : {}}
              >
                Buy Now
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-white mb-4">
            All packages include full access to our platform features
          </p>
          <p className="text-sm text-gray-400">
            Need help choosing? <Link href="/contact" className="font-bold underline" style={{ color: '#dbf72c' }}>Contact us</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20" style={{ backgroundColor: '#dbf72c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-black font-medium mb-6">
              LYNKS makes it easy for people to find what they need on mobile with simple, SEO optimised mini sites.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="https://www.facebook.com/LYNKSPortal/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800 font-medium transition-colors">
                Facebook
              </a>
              <a href="https://www.instagram.com/lynksportal/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800 font-medium transition-colors">
                Instagram
              </a>
              <a href="https://www.linkedin.com/company/lynks-portal" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800 font-medium transition-colors">
                Linkedin
              </a>
            </div>
            <div className="text-sm text-black pt-8 border-t border-black">
              2024 LYNKS Portal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
