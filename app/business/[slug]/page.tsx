'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Youtube,
  ExternalLink,
  Clock,
  UtensilsCrossed,
  ImageIcon,
  ArrowLeft,
  Briefcase,
  X,
  DollarSign
} from 'lucide-react';

interface Business {
  id: number;
  business_name: string;
  tagline: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  category_name: string;
  business_type_name: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  messenger_url: string;
  address: string;
  city: string;
  postcode: string;
  website_url: string;
  primary_color: string;
  secondary_color: string;
  container_background_color: string;
  card_background_color: string;
  hero_image_url: string;
  template_style: string;
  cta_heading: string;
  cta_button_text: string;
  cta_button_url: string;
  map_embed_url: string;
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface CustomLink {
  title: string;
  url: string;
  icon: string;
}

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube
};

const socialColors: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  tiktok: '#000000'
};

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<{url: string, caption: string}[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [policies, setPolicies] = useState<{title: string, url: string}[]>([]);
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [showJobListings, setShowJobListings] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadBusiness();
  }, [slug]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex, galleryImages.length]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const navigatePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const loadBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses?slug=${slug}&published=true`);
      const data = await response.json();

      if (data.length === 0) {
        setNotFound(true);
      } else {
        const businessData = data[0];
        setBusiness(businessData);
        
        // Load services from JSON field
        if (businessData.services) {
          try {
            const parsedServices = JSON.parse(businessData.services);
            setServices(parsedServices);
          } catch (e) {
            console.error('Error parsing services:', e);
          }
        }
        
        // Load gallery images
        const galleryResponse = await fetch(`/api/gallery-images?businessId=${businessData.id}`);
        const galleryData = await galleryResponse.json();
        setGalleryImages(galleryData.map((img: any) => ({
          url: img.image_url,
          caption: img.caption || ''
        })));
        
        // Load business hours
        const hoursResponse = await fetch(`/api/business-hours?businessId=${businessData.id}`);
        const hoursData = await hoursResponse.json();
        setBusinessHours(hoursData);
        
        // Load policies from JSON
        if (businessData.policies) {
          try {
            const parsedPolicies = JSON.parse(businessData.policies);
            setPolicies(parsedPolicies || []);
          } catch (e) {
            console.error('Error parsing policies:', e);
          }
        }

        // Load job listings if business has recruitment module
        const jobsResponse = await fetch(`/api/job-listings?businessId=${businessData.id}&status=active`);
        const jobsData = await jobsResponse.json();
        setJobListings(jobsData);
      }
    } catch (error) {
      console.error('Error loading business:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: '#dbf72c', borderTopColor: 'transparent' }}></div>
          <p className="mt-6 text-lg text-white font-medium">Loading your page...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-gray-400 mb-8 text-lg">The business you are looking for does not exist or is not published.</p>
          <a href="/" className="inline-block text-black px-8 py-4 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all" style={{ backgroundColor: '#dbf72c' }}>
            Browse All Businesses
          </a>
        </div>
      </div>
    );
  }

  const logoUrl = business.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.business_name)}&size=400&background=${business.primary_color.replace('#', '')}&color=fff&bold=true`;
  
  // Get colors from business data - Three-layer system
  const backgroundColor = business.primary_color || '#BF360C'; // Outside (dark orange)
  const containerBackgroundColor = business.container_background_color || '#FF8A65'; // Middle layer (light orange)
  const cardBackgroundColor = business.card_background_color || '#FFFFFF'; // Inner boxes (white)
  const accentColor = business.secondary_color || '#000000'; // Buttons (black)

  // Helper function to convert Google Maps share URL to embed URL
  const getGoogleMapsEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return it
    if (url.includes('google.com/maps/embed')) {
      return url;
    }
    
    // Try to extract coordinates or place ID from various Google Maps URL formats
    // Format: https://maps.app.goo.gl/... or https://www.google.com/maps/place/...
    // We'll use the URL directly in an iframe with output=embed
    if (url.includes('google.com/maps') || url.includes('maps.app.goo.gl')) {
      // Extract the essential part and create embed URL
      return url.replace('/place/', '/embed/place/').replace('?', '&').replace(/^([^?&]+)/, '$1?output=embed');
    }
    
    return url;
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-lg"
        >
          <ArrowLeft size={20} className="text-gray-900" />
          <span className="text-gray-900 font-bold">Back to Main</span>
        </button>
        
        {/* Card Container - Middle Layer */}
        <div className="rounded-3xl p-8 space-y-3" style={{ backgroundColor: containerBackgroundColor }}>
          
          {/* Logo - Larger size */}
          <div className="flex justify-center mb-4">
            <img 
              src={logoUrl} 
              alt={business.business_name}
              className="w-80 h-80 object-contain animate-logo-spin"
              style={{
                animation: 'logoRotate 1s ease-in-out'
              }}
            />
          </div>
          
          {/* Hero Image - Between Logo and Category */}
          {business.hero_image_url && (
            <div className="flex justify-center mb-4 -mt-12">
              <img 
                src={business.hero_image_url} 
                alt="Hero"
                className="rounded-2xl max-w-md w-full object-cover"
                style={{ maxHeight: '350px' }}
              />
            </div>
          )}
          
          <style jsx>{`
            @keyframes logoRotate {
              0% {
                transform: rotateY(0deg);
              }
              100% {
                transform: rotateY(360deg);
              }
            }
          `}</style>

          {/* Category */}
          <div>
            <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>CATEGORY</h2>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: cardBackgroundColor }}>
              <p className="text-gray-900 font-semibold">{business.category_name}</p>
              {business.business_type_name && (
                <p className="text-gray-600 text-sm mt-1">{business.business_type_name}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>DESCRIPTION</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <p className="text-gray-900 leading-relaxed text-center">{business.description}</p>
                {business.tagline && (
                  <p className="text-gray-600 italic mt-3 text-center">&quot;{business.tagline}&quot;</p>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>OUR SERVICES</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <ul className="space-y-3">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-center text-gray-900">
                      <span className="mr-3 text-2xl" style={{ color: backgroundColor }}>✓</span>
                      <span className="font-medium">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Call-to-Action */}
          {business.cta_heading && business.cta_button_text && business.cta_button_url && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>{business.cta_heading}</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <div className="text-center">
                  <a
                    href={business.cta_button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    {business.cta_button_text}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Policies */}
          {policies.length > 0 && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>POLICIES</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <div className="grid grid-cols-2 gap-4">
                  {policies.map((policy, index) => (
                    <a
                      key={index}
                      href={policy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-lg text-white font-bold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <span>📄</span>
                      <span>{policy.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {business.customLinks && business.customLinks.length > 0 && (
            <div>
              <h2 className="text-white text-lg font-bold mb-3">QUICK ACCESS</h2>
              <div className="space-y-3">
                {business.customLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div 
                      className="rounded-full py-3 px-6 text-center font-bold text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: business.primary_color }}
                    >
                      {link.title}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Section */}
          {galleryImages.length > 0 && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>OUR GALLERY</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((img, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <img 
                        src={img.url} 
                        alt={img.caption || `Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Section */}
          {(business.map_embed_url || business.address) && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>OUR LOCATION</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                {business.map_embed_url ? (
                  <iframe
                    src={getGoogleMapsEmbedUrl(business.map_embed_url)}
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : business.address ? (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(business.address + (business.city ? ', ' + business.city : '') + (business.postcode ? ' ' + business.postcode : ''))}`}
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : null}
                {business.address && (
                  <p className="text-center text-gray-900 mt-4 font-medium">
                    {business.address}{business.city && `, ${business.city}`}{business.postcode && ` ${business.postcode}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Business Hours */}
          {businessHours.length > 0 && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>CONTACTABLE HOURS</h2>
              <div className="rounded-xl p-8" style={{ backgroundColor: cardBackgroundColor }}>
                <div className="grid grid-cols-1 gap-4">
                  {businessHours.map((hours, index) => {
                    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const dayName = typeof hours.day_of_week === 'number' ? dayNames[hours.day_of_week] : hours.day_of_week;
                    const isClosed = hours.is_closed;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center justify-between py-3 px-4 rounded-lg border-l-4 transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: isClosed ? '#f3f4f6' : '#ffffff',
                          borderLeftColor: isClosed ? '#9ca3af' : '#dbf72c',
                          borderWidth: '0 0 0 4px'
                        }}
                      >
                        <span className="text-gray-900 font-bold text-lg" style={{ minWidth: '120px' }}>
                          {dayName}
                        </span>
                        <span 
                          className="font-semibold text-lg"
                          style={{ color: isClosed ? '#6b7280' : '#0c0f17' }}
                        >
                          {isClosed ? 'Closed' : `${hours.open_time} - ${hours.close_time}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {business.socialLinks && business.socialLinks.length > 0 && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>SOCIAL MEDIA</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <div className="flex flex-col items-center space-y-3">
                  {business.socialLinks.map((link, index) => {
                    const Icon = socialIcons[link.platform] || Globe;
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full max-w-md px-8 py-4 rounded-full flex items-center justify-center space-x-3 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#000000' }}
                      >
                        <Icon size={20} className="text-white" />
                        <span className="text-white font-bold uppercase">{link.platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>GET IN TOUCH</h2>
            <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
              <div className="flex flex-wrap justify-center gap-3">
                {business.phone && (
                  <a 
                    href={`tel:${business.phone}`}
                    className="px-8 py-3 rounded-full flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <Phone size={18} className="text-white" />
                    <span className="text-white font-bold text-sm">{business.phone}</span>
                  </a>
                )}
                {business.email && (
                  <a 
                    href={`mailto:${business.email}`}
                    className="px-8 py-3 rounded-full flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <Mail size={18} className="text-white" />
                    <span className="text-white font-bold text-sm uppercase">{business.email}</span>
                  </a>
                )}
                {business.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${business.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 rounded-full flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <Phone size={18} className="text-white" />
                    <span className="text-white font-bold text-sm uppercase">WhatsApp</span>
                  </a>
                )}
                {business.messenger_url && (
                  <a 
                    href={business.messenger_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 rounded-full flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <Mail size={18} className="text-white" />
                    <span className="text-white font-bold text-sm uppercase">Messenger</span>
                  </a>
                )}
                {business.website_url && (
                  <a 
                    href={business.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 rounded-full flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <Globe size={18} className="text-white" />
                    <span className="text-white font-bold text-sm uppercase">Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Job Listings Section */}
          {jobListings.length > 0 && (
            <div>
              <h2 className="text-white text-2xl mb-3 text-center uppercase" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900 }}>WE'RE HIRING</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: cardBackgroundColor }}>
                <p className="text-gray-900 text-center mb-4">
                  Join our team! We have {jobListings.length} open position{jobListings.length !== 1 ? 's' : ''}.
                </p>
                <button
                  onClick={() => setShowJobListings(true)}
                  className="w-full py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                >
                  <Briefcase size={20} />
                  View Current Openings
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Job Listings Modal */}
      {showJobListings && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Current Job Openings</h2>
              <button
                onClick={() => setShowJobListings(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {jobListings.map(job => (
                <div
                  key={job.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Briefcase size={16} />
                        {job.employment_type}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin size={16} />
                          {job.location}
                        </span>
                      )}
                      {job.remote_option && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs capitalize">
                          {job.remote_option}
                        </span>
                      )}
                      {(job.salary_min > 0 || job.salary_max > 0) && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <DollarSign size={16} />
                          £{job.salary_min > 0 ? job.salary_min.toLocaleString() : ''}
                          {job.salary_max > 0 && ` - £${job.salary_max.toLocaleString()}`}
                          {job.salary_period && ` / ${job.salary_period}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 whitespace-pre-line">{job.description}</p>

                  <div className="flex gap-3">
                    <a
                      href={`mailto:${business.email}?subject=Application for ${job.title}`}
                      className="px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                      style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                    >
                      Apply Now
                    </a>
                    {job.application_deadline && (
                      <span className="px-4 py-3 text-sm text-gray-400">
                        Apply by {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LYNKS Footer - Full Width */}
      <div className="w-full py-12" style={{ backgroundColor: '#DDF73D' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            {/* Logo and Description */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <img 
                  src="/footer-logo.png" 
                  alt="LYNKS" 
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
                <svg className="w-5 h-5" fill="#DCF72C" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/lynksportal/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="#DCF72C" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/lynks-portal" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="#DCF72C" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="https://www.google.com/search?q=lynksportal.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="#DCF72C" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </a>
            </div>

            {/* Active Portals */}
            <div className="mb-10">
              <h4 className="mb-2 text-black" style={{ fontSize: '23px', fontWeight: 400 }}>ACTIVE PORTALS</h4>
              <div className="flex justify-center">
                <a 
                  href="/" 
                  className="px-6 py-2 rounded-full bg-black text-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  style={{ color: '#DDF73D' }}
                >
                  <Globe size={20} /> ISLE OF MAN
                </a>
              </div>
            </div>

            {/* Coming Soon Portals */}
            <div className="mb-8">
              <h4 className="mb-2 text-black" style={{ fontSize: '23px', fontWeight: 400 }}>PORTALS COMING SOON!</h4>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-6 py-2 rounded-full bg-black text-lg font-medium flex items-center gap-2" style={{ color: '#DDF73D' }}>
                  <Globe size={20} /> UNITED KINGDOM
                </span>
                <span className="px-6 py-2 rounded-full bg-black text-lg font-medium flex items-center gap-2" style={{ color: '#DDF73D' }}>
                  <Globe size={20} /> REPUBLIC OF CYPRUS
                </span>
                <span className="px-6 py-2 rounded-full bg-black text-lg font-medium flex items-center gap-2" style={{ color: '#DDF73D' }}>
                  <Globe size={20} /> DUBAI UAE
                </span>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center text-lg text-black">
              <p>
                By using this website, you agree to our{' '}
                <a href="/terms" className="text-black hover:text-gray-800 underline">
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-black hover:text-gray-800 underline">
                  Privacy Policy
                </a>
                . If you do not agree with both, please{' '}
                <a href="#" className="text-black hover:text-gray-800 underline">
                  click here
                </a>
                {' '}to be redirected away from our site.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && galleryImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrevious();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Previous image"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div 
            className="max-w-7xl max-h-screen p-4 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[currentImageIndex].url}
              alt={galleryImages[currentImageIndex].caption || `Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {galleryImages[currentImageIndex].caption && (
              <p className="text-white text-center mt-4 text-lg">
                {galleryImages[currentImageIndex].caption}
              </p>
            )}
            <p className="text-gray-400 text-center mt-2">
              {currentImageIndex + 1} / {galleryImages.length}
            </p>
          </div>

          {/* Next Button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Next image"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
