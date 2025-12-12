'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Phone, ArrowRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEarthAmericas } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faLinkedinIn, faGoogle } from '@fortawesome/free-brands-svg-icons';
import FadeInSection from './components/FadeInSection';

interface Business {
  id: number;
  business_name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  category_name: string;
  business_type_name: string;
  phone: string;
  email: string;
  city: string;
  primary_color: string;
  secondary_color: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  businessTypes: BusinessType[];
}

interface BusinessType {
  id: number;
  name: string;
  slug: string;
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [businessesRes, categoriesRes] = await Promise.all([
        fetch('/api/businesses?published=true&portal=iom'),
        fetch('/api/categories?includeTypes=true')
      ]);

      const businessesData = await businessesRes.json();
      const categoriesData = await categoriesRes.json();

      setBusinesses(businessesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = !selectedCategory || 
      business.category_name?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesBusinessType = !selectedBusinessType || 
      business.business_type_name?.toLowerCase() === selectedBusinessType.toLowerCase();
    const matchesSearch = !searchQuery || 
      business.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesBusinessType && matchesSearch;
  });

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c0f17' }}>
        {/* Header - matching lynksportal.com */}
        <FadeInSection>
      <header className="border-b border-gray-800" style={{ backgroundColor: '#0c0f17' }}>
        <div className="px-[50px] py-[20px]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <FadeInSection delay={0}>
            <Link href="/" className="flex items-center">
              <Image 
                src="/Asset 15.png" 
                alt="LYNKS Portal" 
                width={300} 
                height={300}
                className="w-[300px] h-auto"
                priority
              />
            </Link>
            </FadeInSection>
            
            {/* Navigation removed */}
          </div>
        </div>
        
        {/* Pricing Banner */}
        <FadeInSection delay={200}>
        <div style={{ backgroundColor: '#dbf72c' }} className="border-b border-gray-800">
          <div className="px-[50px] py-3">
            <p className="text-center text-lg text-black">
              "Making it easier than ever to find the things you want, all in one simple place."
            </p>
          </div>
        </div>
        </FadeInSection>
      </header>
      </FadeInSection>

      <div className="px-[50px] pt-[50px] pb-0">
        <div className="flex gap-[50px]">
          {/* Left Sidebar - Filters */}
          <aside className="w-1/5 flex-shrink-0">
            {/* Search Section */}
            <FadeInSection>
              <div style={{ marginBottom: '50px' }}>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#dbf72c' }}>SEARCH A BUSINESS</h2>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border-0 rounded-lg text-black placeholder-gray-500 text-lg focus:ring-2 focus:ring-lime-400 outline-none mb-3"
              />
              </div>
            </FadeInSection>

            {/* Business Category Section */}
            <FadeInSection delay={100}>
              <div className="mb-6">
              <h2 className="text-lg font-bold mb-3" style={{ color: '#dbf72c' }}>BUSINESS CATEGORY</h2>
              <div className="space-y-1">
                {selectedCategory ? (
                  // Show only selected category with option to clear
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => {
                          setSelectedCategory('');
                          setSelectedBusinessType('');
                        }}
                        className="w-5 h-5 rounded cursor-pointer appearance-none"
                        style={{
                          backgroundColor: '#dbf72c',
                          border: '2px solid #dbf72c',
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230c0f17\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E")',
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="text-white text-lg group-hover:text-lime-400 transition-colors">
                        {selectedCategory}
                      </span>
                    </label>
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedBusinessType('');
                      }}
                      className="mt-2 text-lg text-gray-400 hover:text-lime-400 transition-colors"
                    >
                      ← Change Category
                    </button>
                  </div>
                ) : (
                  // Show only categories that have businesses
                  categories
                    .filter(category => businesses.some(business => business.category_name === category.name))
                    .map(category => (
                    <label
                      key={category.id}
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategory(category.name);
                            setSelectedBusinessType('');
                          }
                        }}
                        className="w-5 h-5 rounded cursor-pointer appearance-none"
                        style={{
                          backgroundColor: 'transparent',
                          border: '2px solid #dbf72c'
                        }}
                      />
                      <span className="text-white text-lg group-hover:text-lime-400 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
              </div>
            </FadeInSection>

            {/* Business Type Section */}
            {selectedCategory && (
              <FadeInSection delay={200}>
                <div className="mb-6">
                <h2 className="text-lg font-bold mb-3" style={{ color: '#dbf72c' }}>BUSINESS TYPE</h2>
                {selectedCategoryData && selectedCategoryData.businessTypes && selectedCategoryData.businessTypes.length > 0 ? (
                  <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                    {selectedCategoryData.businessTypes.map(type => (
                      <label
                        key={type.id}
                        className="flex items-center space-x-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBusinessType === type.name}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBusinessType(type.name);
                            } else {
                              setSelectedBusinessType('');
                            }
                          }}
                          className="w-5 h-5 rounded cursor-pointer appearance-none"
                          style={{
                            backgroundColor: selectedBusinessType === type.name ? '#dbf72c' : 'transparent',
                            border: '2px solid #dbf72c',
                            ...(selectedBusinessType === type.name && {
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230c0f17\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E")',
                              backgroundSize: '100% 100%',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            })
                          }}
                        />
                        <span className="text-white text-lg group-hover:text-lime-400 transition-colors">
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-lg">No business types available for this category.</p>
                )}
                </div>
              </FadeInSection>
            )}
          </aside>

          {/* Main Content */}
          <div className="w-4/5">
            {/* Business Cards Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#dbf72c' }}></div>
                <p className="mt-4 text-white text-lg">Loading businesses...</p>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-white mb-2">No businesses found</h3>
                <p className="text-gray-400 text-lg mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedBusinessType('');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 rounded-full text-lg transition-all hover:scale-105"
                  style={{ backgroundColor: '#dbf72c', color: '#000' }}
                >
                  View All Businesses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[50px]">
                {filteredBusinesses.map((business, index) => {
                  const coverUrl = business.cover_image_url || business.logo_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop';
                  
                  return (
                    <FadeInSection key={business.id} delay={index * 100}>
                      <Link href={`/business/${business.slug}`}>
                        <div className="group bg-white border border-white overflow-hidden transition-all duration-300 cursor-pointer h-full" style={{ borderRadius: '14px' }}>
                        {/* Cover Image */}
                        <div className="relative aspect-square overflow-hidden" style={{ borderBottom: '1px solid #b1b1b1' }}>
                          <img 
                            src={coverUrl}
                            alt={business.business_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content */}
                        <div style={{ backgroundColor: 'white', padding: '20px' }}>
                          <div className="border rounded-3xl text-center" style={{ borderColor: '#b1b1b1', padding: '20px' }}>
                            <h3 className="text-lg font-bold transition-colors text-center uppercase" style={{ color: '#0c0f17', marginBottom: '2px' }}>
                              {business.business_name}
                            </h3>
                            
                            {/* Category */}
                            <div className="flex justify-center" style={{ marginBottom: '15px' }}>
                              <span className="text-lg text-center" style={{ color: '#0c0f17' }}>
                                {business.category_name || 'Business'}
                              </span>
                            </div>

                            {/* View Button */}
                            <div className="flex items-center justify-center">
                              <button className="px-6 py-2 rounded-full text-lg uppercase" style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}>
                                View Business
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      </Link>
                    </FadeInSection>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - matching lynksportal.com */}
      <footer style={{ backgroundColor: '#dbf72c', marginTop: '50px' }}>
        <FadeInSection>
        <div className="px-[50px] py-12 mx-auto" style={{ maxWidth: '848px' }}>
          {/* Logo and Description */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-4">
              <Image 
                src="/footer-logo.png" 
                alt="LYNKS" 
                width={125} 
                height={125}
                className="w-[125px] h-auto"
              />
            </div>
            <p className="text-black text-lg max-w-3xl mx-auto">
              LYNKS makes finding local businesses easier with our Business Card directory and mini websites, now in the Isle of Man, expanding soon.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-2 mb-8">
            <a 
              href="https://www.facebook.com/LYNKSPortal/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faFacebookF} style={{ color: '#DCF72C' }} />
            </a>
            <a 
              href="https://www.instagram.com/lynksportal/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faInstagram} style={{ color: '#DCF72C' }} />
            </a>
            <a 
              href="https://www.linkedin.com/company/lynks-portal" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faLinkedinIn} style={{ color: '#DCF72C' }} />
            </a>
            <a 
              href="https://www.google.com/search?q=lynksportal.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faGoogle} style={{ color: '#DCF72C' }} />
            </a>
          </div>

          {/* Active Portals */}
          <div className="text-center mb-10">
            <h4 className="mb-2 text-black" style={{ fontSize: '23px', fontWeight: 400 }}>ACTIVE PORTALS</h4>
            <div className="flex justify-center">
              <Link 
                href="/" 
                className="px-6 py-2 rounded-full bg-black text-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                style={{ color: '#DDF73D' }}
              >
                <FontAwesomeIcon icon={faEarthAmericas} /> ISLE OF MAN
              </Link>
            </div>
          </div>

          {/* Coming Soon Portals */}
          <div className="text-center mb-8">
            <h4 className="mb-2 text-black" style={{ fontSize: '23px', fontWeight: 400 }}>PORTALS COMING SOON!</h4>
            <div className="flex justify-center gap-3 flex-wrap">
              <span className="px-6 py-2 rounded-full bg-black text-lg font-medium flex items-center gap-2" style={{ color: '#DDF73D' }}>
                <FontAwesomeIcon icon={faEarthAmericas} /> UNITED KINGDOM
              </span>
              <span className="px-6 py-2 rounded-full bg-black text-lg font-medium flex items-center gap-2" style={{ color: '#DDF73D' }}>
                <FontAwesomeIcon icon={faEarthAmericas} /> REPUBLIC OF CYPRUS
              </span>
              <span className="px-6 py-2 rounded-full bg-black text-lg font-medium flex items-center gap-2" style={{ color: '#DDF73D' }}>
                <FontAwesomeIcon icon={faEarthAmericas} /> DUBAI UAE
              </span>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center text-lg text-black">
            <p>
              By using this website, you agree to our{' '}
              <Link href="/terms" className="text-black hover:text-gray-800 underline">
                Terms and Conditions
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-black hover:text-gray-800 underline">
                Privacy Policy
              </Link>
              . If you do not agree with both, please{' '}
              <a href="#" className="text-black hover:text-gray-800 underline">
                click here
              </a>
              {' '}to be redirected away from our site.
            </p>
          </div>
        </div>
        </FadeInSection>
      </footer>
    </div>
  );
}
