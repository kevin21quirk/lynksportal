'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  ImageIcon
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
  address: string;
  city: string;
  postcode: string;
  website_url: string;
  primary_color: string;
  secondary_color: string;
  template_style: string;
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
  const slug = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, [slug]);

  const loadBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses?slug=${slug}&published=true`);
      const data = await response.json();

      if (data.length === 0) {
        setNotFound(true);
      } else {
        setBusiness(data[0]);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: '#dbf72c', borderTopColor: 'transparent' }}></div>
          <p className="mt-6 text-lg text-white font-medium">Loading your page...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-gray-400 mb-8 text-lg">The business you're looking for doesn't exist or is not published.</p>
          <a href="/" className="inline-block text-black px-8 py-4 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all" style={{ backgroundColor: '#dbf72c' }}>
            Browse All Businesses
          </a>
        </div>
      </div>
    );
  }

  // Use placeholder images if not provided
  const logoUrl = business.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.business_name)}&size=400&background=${business.primary_color.replace('#', '')}&color=fff&bold=true`;
  
  // Check if restaurant/hospitality for menu section
  const isRestaurant = business.category_name?.toLowerCase().includes('food') || 
                       business.category_name?.toLowerCase().includes('restaurant') ||
                       business.business_type_name?.toLowerCase().includes('restaurant');

  // Mock gallery images (in real app, these would come from database)
  const galleryImages = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&h=300&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      {/* Main Container - Black Outer Card */}
      <div className="max-w-md mx-auto px-4">
        <div className="bg-black rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
          
          {/* 1. LOGO SECTION */}
          <div className="flex justify-center">
            <img 
              src={logoUrl} 
              alt={business.business_name}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* 2. CATEGORY SECTION */}
          <div>
            <h2 className="text-white text-lg font-bold mb-3">CATEGORY</h2>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-gray-900 font-semibold">{business.category_name}</p>
              {business.business_type_name && (
                <p className="text-gray-600 text-sm mt-1">{business.business_type_name}</p>
              )}
            </div>
          </div>

          {/* 3. DESCRIPTION SECTION */}
          {business.description && (
            <div>
              <h2 className="text-white text-lg font-bold mb-3">DESCRIPTION</h2>
              <div className="bg-white rounded-xl p-6">
                <p className="text-gray-900 leading-relaxed">{business.description}</p>
                {business.tagline && (
                  <p className="text-gray-600 italic mt-3">&quot;{business.tagline}&quot;</p>
                )}
              </div>
            </div>
          )}

          {/* 4. OUR SERVICES SECTION */}
          {business.customLinks && business.customLinks.length > 0 && (
            <div>
              <h2 className="text-white text-lg font-bold mb-3">OUR SERVICES</h2>
              <div className="bg-white rounded-xl p-6">
                <ul className="space-y-3">
                  {business.customLinks.map((link, index) => (
                    <li key={index} className="flex items-center text-gray-900">
                      <span className="mr-3 text-2xl">{link.icon}</span>
                      <span className="font-medium">{link.title.replace(/^[^\s]+\s/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 5. QUICK ACCESS SECTION */}
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

          {/* 6. OUR MENUS SECTION (Only for restaurants) */}
          {isRestaurant && (
            <div>
              <h2 className="text-white text-lg font-bold mb-3">OUR MENUS</h2>
              <div className="bg-white rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={img} 
                        alt={`Menu ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. OUR GALLERY SECTION */}
          <div>
            <h2 className="text-white text-lg font-bold mb-3">OUR GALLERY</h2>
            <div className="bg-white rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={img} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 8. OUR LOCATION SECTION */}
          {business.address && (
            <div>
              <h2 className="text-white text-lg font-bold mb-3">OUR LOCATION</h2>
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-gray-900 font-medium">{business.address}</p>
                    {business.city && <p className="text-gray-600">{business.city}</p>}
                    {business.postcode && <p className="text-gray-600">{business.postcode}</p>}
                  </div>
                </div>
                {/* Google Maps Embed */}
                <div className="rounded-lg overflow-hidden h-48">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(business.address + ', ' + business.city)}`}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {/* 9. OUR HOURS SECTION */}
          <div>
            <h2 className="text-white text-lg font-bold mb-3">OUR HOURS</h2>
            <div className="bg-white rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Monday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Tuesday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Wednesday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Thursday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Friday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Saturday</span>
                  <span className="text-gray-600">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* 10. SOCIAL MEDIA SECTION */}
          {business.socialLinks && business.socialLinks.length > 0 && (
            <div>
              <h2 className="text-white text-lg font-bold mb-3">SOCIAL MEDIA</h2>
              <div className="flex justify-center space-x-4">
                {business.socialLinks.map((link, index) => {
                  const Icon = socialIcons[link.platform] || Globe;
                  const platformColor = socialColors[link.platform] || business.primary_color;
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      style={{ backgroundColor: platformColor }}
                    >
                      <Icon size={24} className="text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* 11. GET IN TOUCH SECTION */}
          <div>
            <h2 className="text-white text-lg font-bold mb-3">GET IN TOUCH</h2>
            <div className="bg-white rounded-xl p-6 space-y-4">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`}
                  className="flex items-center space-x-3 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <Phone size={20} />
                  <span className="font-medium">{business.phone}</span>
                </a>
              )}
              {business.email && (
                <a 
                  href={`mailto:${business.email}`}
                  className="flex items-center space-x-3 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <Mail size={20} />
                  <span className="font-medium">{business.email}</span>
                </a>
              )}
              {business.website_url && (
                <a 
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <Globe size={20} />
                  <span className="font-medium">Visit Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6">
            <p className="text-gray-500 text-sm">
              Powered by <span className="font-bold" style={{ color: '#dbf72c' }}>LYNKS Portal</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
