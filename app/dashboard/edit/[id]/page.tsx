'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Upload,
  Sparkles,
  Loader
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface Category {
  id: number;
  name: string;
  businessTypes: BusinessType[];
}

interface BusinessType {
  id: number;
  name: string;
}

interface SocialLink {
  id?: number;
  platform: string;
  url: string;
  displayOrder: number;
}

interface CustomLink {
  id?: number;
  title: string;
  url: string;
  icon: string;
  displayOrder: number;
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    description: '',
    categoryId: '',
    businessTypeId: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    messengerUrl: '',
    address: '',
    city: '',
    postcode: '',
    websiteUrl: '',
    logoUrl: '',
    heroImageUrl: '',
    coverImageUrl: '',
    primaryColor: '#BF360C',
    secondaryColor: '#000000',
    containerBackgroundColor: '#FF8A65',
    cardBackgroundColor: '#FFFFFF'
  });

  const [aiScanning, setAiScanning] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  
  // New sections
  const [services, setServices] = useState<string[]>(['']);
  const [galleryImages, setGalleryImages] = useState<{id?: number, url: string, caption: string}[]>([]);
  const [businessHours, setBusinessHours] = useState([
    { day: 'Monday', open: '09:00', close: '17:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
    { day: 'Friday', open: '09:00', close: '17:00', closed: false },
    { day: 'Saturday', open: '10:00', close: '16:00', closed: false },
    { day: 'Sunday', open: '', close: '', closed: true }
  ]);
  
  // Phase 2 sections
  const [ctaHeading, setCtaHeading] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');
  const [ctaButtonUrl, setCtaButtonUrl] = useState('');
  const [policies, setPolicies] = useState<{title: string, url: string}[]>([]);
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [showCta, setShowCta] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadCategories();
    loadBusiness();
  }, [router, businessId]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeTypes=true');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses?id=${businessId}`);
      const data = await response.json();
      
      if (data.length > 0) {
        const business = data[0];
        setFormData({
          businessName: business.business_name || '',
          tagline: business.tagline || '',
          description: business.description || '',
          categoryId: business.category_id?.toString() || '',
          businessTypeId: business.business_type_id?.toString() || '',
          phone: business.phone || '',
          email: business.email || '',
          whatsappNumber: business.whatsapp_number || '',
          messengerUrl: business.messenger_url || '',
          address: business.address || '',
          city: business.city || '',
          postcode: business.postcode || '',
          websiteUrl: business.website_url || '',
          logoUrl: business.logo_url || '',
          heroImageUrl: business.hero_image_url || '',
          coverImageUrl: business.cover_image_url || '',
          primaryColor: business.primary_color || '#BF360C',
          secondaryColor: business.secondary_color || '#000000',
          containerBackgroundColor: business.container_background_color || '#FF8A65',
          cardBackgroundColor: business.card_background_color || '#FFFFFF'
        });
        
        setSocialLinks(business.socialLinks || []);
        setCustomLinks(business.customLinks || []);
        
        // Load services from JSON field
        if (business.services) {
          try {
            const parsedServices = JSON.parse(business.services);
            setServices(parsedServices.length > 0 ? parsedServices : ['']);
          } catch (e) {
            console.error('Error parsing services:', e);
          }
        }
        
        // Load gallery images
        const galleryResponse = await fetch(`/api/gallery-images?businessId=${businessId}`);
        const galleryData = await galleryResponse.json();
        setGalleryImages(galleryData.map((img: any) => ({
          id: img.id,
          url: img.image_url,
          caption: img.caption || ''
        })));
        
        // Load business hours
        const hoursResponse = await fetch(`/api/business-hours?businessId=${businessId}`);
        const hoursData = await hoursResponse.json();
        if (hoursData.length > 0) {
          // Map day numbers back to day names
          const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          setBusinessHours(hoursData.map((h: any) => ({
            day: dayNames[h.day_of_week] || h.day_of_week,
            open: h.open_time || '',
            close: h.close_time || '',
            closed: h.is_closed
          })));
        }
        
        // Load Phase 2 sections
        setCtaHeading(business.cta_heading || '');
        setCtaButtonText(business.cta_button_text || '');
        setCtaButtonUrl(business.cta_button_url || '');
        setMapEmbedUrl(business.map_embed_url || '');
        setShowCta(business.show_cta === 1);
        setShowPolicies(business.show_policies === 1);
        setShowMap(business.show_map === 1);
        
        // Load policies from JSON
        if (business.policies) {
          try {
            const parsedPolicies = JSON.parse(business.policies);
            setPolicies(parsedPolicies || []);
          } catch (e) {
            console.error('Error parsing policies:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading business:', error);
      alert('Failed to load business details');
    } finally {
      setLoadingBusiness(false);
    }
  };

  const handleAIScan = async () => {
    if (!formData.websiteUrl) {
      alert('Please enter a website URL first');
      return;
    }

    setAiScanning(true);
    try {
      const response = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.websiteUrl })
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          ...formData,
          businessName: data.businessName || formData.businessName,
          tagline: data.tagline || formData.tagline,
          description: data.description || formData.description,
          phone: data.phone || formData.phone,
          email: data.email || formData.email,
          address: data.address || formData.address,
          logoUrl: data.logoUrl || formData.logoUrl,
          coverImageUrl: data.coverImageUrl || formData.coverImageUrl
        });

        if (data.socialLinks && data.socialLinks.length > 0) {
          setSocialLinks(data.socialLinks.map((link: any, index: number) => ({
            platform: link.platform,
            url: link.url,
            displayOrder: index
          })));
        }

        if (data.customLinks && data.customLinks.length > 0) {
          setCustomLinks(data.customLinks.map((link: any, index: number) => ({
            title: link.title,
            url: link.url,
            icon: link.icon || '🔗',
            displayOrder: index
          })));
        }

        alert('Business details, images, and social links auto-filled from website!');
      } else {
        alert(data.error || 'Failed to scan website');
      }
    } catch (error) {
      alert('Error scanning website. Please try again.');
    } finally {
      setAiScanning(false);
    }
  };

  const handleImageUpload = (field: 'logoUrl' | 'heroImageUrl' | 'coverImageUrl', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'facebook', url: '', displayOrder: socialLinks.length }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const addCustomLink = () => {
    setCustomLinks([...customLinks, { title: '', url: '', icon: '🔗', displayOrder: customLinks.length }]);
  };

  const removeCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const updateCustomLink = (index: number, field: string, value: string) => {
    const updated = [...customLinks];
    updated[index] = { ...updated[index], [field]: value };
    setCustomLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Update business
      const businessResponse = await fetch('/api/businesses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: businessId,
          business_name: formData.businessName,
          tagline: formData.tagline,
          description: formData.description,
          category_id: formData.categoryId,
          business_type_id: formData.businessTypeId,
          phone: formData.phone,
          email: formData.email,
          whatsapp_number: formData.whatsappNumber,
          messenger_url: formData.messengerUrl,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          website_url: formData.websiteUrl,
          logo_url: formData.logoUrl,
          hero_image_url: formData.heroImageUrl,
          cover_image_url: formData.coverImageUrl,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          container_background_color: formData.containerBackgroundColor,
          card_background_color: formData.cardBackgroundColor
        })
      });

      if (!businessResponse.ok) {
        throw new Error('Failed to update business');
      }

      // Delete existing social links and add new ones
      await fetch(`/api/social-links?businessId=${businessId}`, {
        method: 'DELETE'
      });

      for (const link of socialLinks) {
        if (link.url) {
          await fetch('/api/social-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: parseInt(businessId),
              ...link
            })
          });
        }
      }

      // Delete existing custom links and add new ones
      await fetch(`/api/custom-links?businessId=${businessId}`, {
        method: 'DELETE'
      });

      for (const link of customLinks) {
        if (link.title && link.url) {
          await fetch('/api/custom-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: parseInt(businessId),
              ...link
            })
          });
        }
      }

      // Update services
      if (services.filter(s => s.trim()).length > 0) {
        await fetch('/api/businesses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: businessId,
            services: JSON.stringify(services.filter(s => s.trim()))
          })
        });
      }

      // Delete existing gallery images and add new ones
      await fetch(`/api/gallery-images?businessId=${businessId}`, {
        method: 'DELETE'
      });

      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        if (img.url) {
          await fetch('/api/gallery-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: parseInt(businessId),
              imageUrl: img.url,
              caption: img.caption || '',
              displayOrder: i
            })
          });
        }
      }

      // Delete existing business hours and add new ones
      await fetch(`/api/business-hours?businessId=${businessId}`, {
        method: 'DELETE'
      });

      // Map day names to numbers (1=Monday, 7=Sunday)
      const dayMap: { [key: string]: number } = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 7
      };

      for (const hours of businessHours) {
        await fetch('/api/business-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: parseInt(businessId),
            dayOfWeek: dayMap[hours.day],
            openTime: hours.closed ? null : hours.open,
            closeTime: hours.closed ? null : hours.close,
            isClosed: hours.closed
          })
        });
      }

      // Update Phase 2 sections
      await fetch('/api/businesses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: businessId,
          cta_heading: ctaHeading,
          cta_button_text: ctaButtonText,
          cta_button_url: ctaButtonUrl,
          policies: JSON.stringify(policies),
          map_embed_url: mapEmbedUrl,
          show_cta: showCta ? 1 : 0,
          show_policies: showPolicies ? 1 : 0,
          show_map: showMap ? 1 : 0
        })
      });

      alert('Business updated successfully!');
      router.push(user.email === 'admin@lynksportal.com' ? '/admin/dashboard' : '/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);

  if (!user || loadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: '#dbf72c', borderTopColor: 'transparent' }}></div>
          <p className="mt-6 text-lg text-white font-medium">Loading business...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c0f17' }}>
      {/* Header */}
      <header className="border-b border-gray-800 shadow-sm" style={{ backgroundColor: '#0c0f17' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={user?.email === 'admin@lynksportal.com' ? '/admin/dashboard' : '/dashboard'} className="inline-flex items-center space-x-2 text-white hover:text-lime-400 transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#dbf72c' }}>Edit Business Page</h1>
          <p className="text-white">Update your business information and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Website Scanner */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Sparkles style={{ color: '#dbf72c' }} size={24} />
              <span>AI Website Scanner</span>
            </h2>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <button
                type="button"
                onClick={handleAIScan}
                disabled={aiScanning || !formData.websiteUrl}
                className="px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                style={{ backgroundColor: '#dbf72c', color: '#000' }}
              >
                {aiScanning ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>AI Scan</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">Enter your website URL and let AI auto-fill your business details</p>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="My Awesome Business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="A short, catchy tagline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="Tell people about your business..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, businessTypeId: '' })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.businessTypeId}
                    onChange={(e) => setFormData({ ...formData, businessTypeId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                    disabled={!selectedCategory}
                  >
                    <option value="">Select a type</option>
                    {selectedCategory?.businessTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Image Uploads */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Business Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Logo Image
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-lime-400 transition-colors">
                  {formData.logoUrl ? (
                    <div className="relative">
                      <img src={formData.logoUrl} alt="Logo" className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-gray-700" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-4" style={{ color: '#dbf72c' }} size={48} />
                      <label className="cursor-pointer">
                        <span className="text-lime-400 hover:text-lime-300 font-bold">
                          Upload Logo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('logoUrl', file);
                          }}
                        />
                      </label>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 5MB</p>
                      <p className="text-gray-500 text-xs mt-1">Recommended: Square image, 400x400px</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hero Image (Between Logo & Category)
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-lime-400 transition-colors">
                  {formData.heroImageUrl ? (
                    <div className="relative">
                      <img src={formData.heroImageUrl} alt="Hero" className="w-full h-32 mx-auto rounded-lg object-cover mb-4 border-2 border-gray-700" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, heroImageUrl: '' })}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        Remove Hero Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-4" style={{ color: '#dbf72c' }} size={48} />
                      <label className="cursor-pointer">
                        <span className="text-lime-400 hover:text-lime-300 font-bold">
                          Upload Hero Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('heroImageUrl', file);
                          }}
                        />
                      </label>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 5MB</p>
                      <p className="text-gray-500 text-xs mt-1">Recommended: Portrait or square, 600x600px</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-lime-400 transition-colors">
                  {formData.coverImageUrl ? (
                    <div className="relative">
                      <img src={formData.coverImageUrl} alt="Cover" className="w-full h-32 mx-auto rounded-lg object-cover mb-4 border-2 border-gray-700" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImageUrl: '' })}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        Remove Cover
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-4" style={{ color: '#dbf72c' }} size={48} />
                      <label className="cursor-pointer">
                        <span className="text-lime-400 hover:text-lime-300 font-bold">
                          Upload Cover Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('coverImageUrl', file);
                          }}
                        />
                      </label>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 5MB</p>
                      <p className="text-gray-500 text-xs mt-1">Recommended: Wide image, 1200x400px</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">💡 Tip: AI Scan can automatically detect and import images from your website!</p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="+44 1234 567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="info@business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="+44 1234 567890"
                  />
                  <p className="text-gray-400 text-sm mt-2">💡 Include country code for WhatsApp link to work properly</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Facebook Messenger URL
                  </label>
                  <input
                    type="url"
                    value={formData.messengerUrl}
                    onChange={(e) => setFormData({ ...formData, messengerUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="https://m.me/yourusername"
                  />
                  <p className="text-gray-400 text-sm mt-2">💡 Get your Messenger link from Facebook Page settings</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="Douglas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="IM1 1AA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="https://www.mybusiness.com"
                />
                <p className="text-gray-400 text-sm mt-1">Already entered above? This is for display on your business page.</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Social Media Links</h2>
              <button
                type="button"
                onClick={addSocialLink}
                className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg font-bold transition-colors"
                style={{ backgroundColor: '#dbf72c' }}
              >
                <Plus size={18} />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {socialLinks.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No social links added yet. Click "Add Link" to get started or use AI Scan to auto-detect them!
                </p>
              )}
            </div>
          </div>

          {/* Custom Links (Linktree style) */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Custom Links</h2>
              <button
                type="button"
                onClick={addCustomLink}
                className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg font-bold transition-colors"
                style={{ backgroundColor: '#dbf72c' }}
              >
                <Plus size={18} />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-4">
              {customLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={link.icon}
                    onChange={(e) => updateCustomLink(index, 'icon', e.target.value)}
                    className="w-16 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:ring-2 focus:border-transparent outline-none"
                    placeholder="🔗"
                  />
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateCustomLink(index, 'title', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="Link Title"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomLink(index)}
                    className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {customLinks.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No custom links added yet. Click "Add Link" to create Linktree-style buttons or use AI Scan!
                </p>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Services</h2>
              <button
                type="button"
                onClick={() => setServices([...services, ''])}
                className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg font-bold transition-colors"
                style={{ backgroundColor: '#dbf72c' }}
              >
                <Plus size={18} />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => {
                      const newServices = [...services];
                      newServices[index] = e.target.value;
                      setServices(newServices);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="e.g., Haircut, Massage, Consultation"
                  />
                  <button
                    type="button"
                    onClick={() => setServices(services.filter((_, i) => i !== index))}
                    className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {services.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No services added yet. Click "Add Service"!
                </p>
              )}
            </div>
          </div>

          {/* Call-to-Action Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Call-to-Action Button</h2>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCta}
                  onChange={(e) => setShowCta(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-white">Show Section</span>
              </label>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={ctaHeading}
                  onChange={(e) => setCtaHeading(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="e.g., JOIN A CLASS, BOOK NOW, GET STARTED"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="e.g., BOOK NOW, Sign Up, Contact Us"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Button URL
                </label>
                <input
                  type="url"
                  value={ctaButtonUrl}
                  onChange={(e) => setCtaButtonUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Policies Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Policy Documents</h2>
                <p className="text-gray-400 text-sm mt-1">Add links to your policies (PDFs or web pages)</p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPolicies}
                    onChange={(e) => setShowPolicies(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-white">Show Section</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPolicies([...policies, { title: '', url: '' }])}
                  className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg font-bold transition-colors"
                  style={{ backgroundColor: '#dbf72c' }}
                >
                  <Plus size={18} />
                  <span>Add Policy</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {policies.map((policy, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={policy.title}
                    onChange={(e) => {
                      const newPolicies = [...policies];
                      newPolicies[index].title = e.target.value;
                      setPolicies(newPolicies);
                    }}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="Policy Title (e.g., Privacy Policy)"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={policy.url}
                      onChange={(e) => {
                        const newPolicies = [...policies];
                        newPolicies[index].url = e.target.value;
                        setPolicies(newPolicies);
                      }}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                      placeholder="https://... or /path/to/policy.pdf"
                    />
                    <button
                      type="button"
                      onClick={() => setPolicies(policies.filter((_, i) => i !== index))}
                      className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {policies.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No policies added yet. Click "Add Policy" to get started!
                </p>
              )}
            </div>
          </div>

          {/* Map Integration Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Location Map</h2>
                <p className="text-gray-400 text-sm mt-1">Embed a Google Maps location on your business card</p>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMap}
                  onChange={(e) => setShowMap(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-white">Show Map</span>
              </label>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Google Maps Embed URL or iframe HTML
                </label>
                <textarea
                  value={mapEmbedUrl}
                  onChange={(e) => {
                    const input = e.target.value;
                    // Extract URL from iframe if full HTML is pasted
                    const srcMatch = input.match(/src=["']([^"']+)["']/);
                    if (srcMatch) {
                      setMapEmbedUrl(srcMatch[1]);
                    } else {
                      setMapEmbedUrl(input);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                  placeholder="Paste the full iframe HTML or just the URL"
                  rows={3}
                />
                <p className="text-gray-400 text-sm mt-2">
                  💡 Go to Google Maps → Find your location → Click Share → Embed a map → Paste the entire iframe code here (or just the URL)
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Images Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Gallery Images</h2>
              <button
                type="button"
                onClick={() => setGalleryImages([...galleryImages, { url: '', caption: '' }])}
                className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg font-bold transition-colors"
                style={{ backgroundColor: '#dbf72c' }}
              >
                <Plus size={18} />
                <span>Add Image</span>
              </button>
            </div>

            <div className="space-y-4">
              {galleryImages.map((img, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <input
                      type="url"
                      value={img.url}
                      onChange={(e) => {
                        const newImages = [...galleryImages];
                        newImages[index].url = e.target.value;
                        setGalleryImages(newImages);
                      }}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                      className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => {
                      const newImages = [...galleryImages];
                      newImages[index].caption = e.target.value;
                      setGalleryImages(newImages);
                    }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="Image caption (optional)"
                  />
                </div>
              ))}

              {galleryImages.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No gallery images added yet. Click "Add Image"!
                </p>
              )}
            </div>
          </div>

          {/* Business Hours Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Business Hours</h2>

            <div className="space-y-4">
              {businessHours.map((hours, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-32">
                    <span className="text-white font-medium">{hours.day}</span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => {
                        const newHours = [...businessHours];
                        newHours[index].closed = e.target.checked;
                        setBusinessHours(newHours);
                      }}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-lime-400 focus:ring-2 focus:ring-lime-400"
                    />
                    <span className="text-gray-400 text-sm">Closed</span>
                  </label>
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => {
                          const newHours = [...businessHours];
                          newHours[index].open = e.target.value;
                          setBusinessHours(newHours);
                        }}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => {
                          const newHours = [...businessHours];
                          newHours[index].close = e.target.value;
                          setBusinessHours(newHours);
                        }}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Theme Colors */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Theme Colors</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Background Color (Outside Card)
                </label>
                <p className="text-gray-400 text-sm mb-2">This color appears outside your business card</p>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="h-12 w-20 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                    placeholder="#FF5722"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Card Container Color (Middle Layer)
                </label>
                <p className="text-gray-400 text-sm mb-2">This color appears as the card container background (like the light orange in Isle Dance)</p>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.containerBackgroundColor}
                    onChange={(e) => setFormData({ ...formData, containerBackgroundColor: e.target.value })}
                    className="h-12 w-20 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.containerBackgroundColor}
                    onChange={(e) => setFormData({ ...formData, containerBackgroundColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                    placeholder="#FF8A65"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Content Box Color (Inner Boxes)
                </label>
                <p className="text-gray-400 text-sm mb-2">This color appears inside each content section (like the white boxes in Isle Dance)</p>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.cardBackgroundColor}
                    onChange={(e) => setFormData({ ...formData, cardBackgroundColor: e.target.value })}
                    className="h-12 w-20 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.cardBackgroundColor}
                    onChange={(e) => setFormData({ ...formData, cardBackgroundColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Accent Color
                </label>
                <p className="text-gray-400 text-sm mb-2">Used for buttons and highlights</p>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="h-12 w-20 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-700 rounded-lg font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 text-black px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#dbf72c' }}
            >
              <Save size={20} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
