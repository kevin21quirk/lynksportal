import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

// Create a test user if doesn't exist
const createTestUser = () => {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@lynksportal.com');
  
  if (!existingUser) {
    const result = db.prepare(`
      INSERT INTO users (email, password, full_name, subscription_status, subscription_plan)
      VALUES (?, ?, ?, ?, ?)
    `).run('demo@lynksportal.com', 'hashed_password', 'Demo User', 'active', 'monthly');
    
    return result.lastInsertRowid;
  }
  
  return (existingUser as any).id;
};

// Dummy businesses with real-looking data
const dummyBusinesses = [
  {
    business_name: 'Taste of Thai Restaurant',
    slug: 'taste-of-thai-restaurant',
    tagline: 'Authentic Thai Cuisine',
    description: 'Experience the authentic flavors of Thailand with our traditional recipes and fresh ingredients. Dine-in, takeaway, and delivery available.',
    logo_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
    category_id: 23, // Food & Drink
    business_type_id: null, // Will use first available type
    phone: '+44 1624 234567',
    email: 'hello@tasteofthai.im',
    address: '28 Strand Street',
    city: 'Douglas',
    postcode: 'IM1 2EL',
    website_url: 'https://tasteofthai.im',
    primary_color: '#DC143C',
    secondary_color: '#FFD700',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/tasteofthaiim' },
      { platform: 'instagram', url: 'https://instagram.com/tasteofthaiim' },
      { platform: 'tiktok', url: 'https://tiktok.com/@tasteofthaiim' }
    ],
    customLinks: [
      { title: '📱 Order Online', url: 'https://tasteofthai.im/order', icon: '📱' },
      { title: '📋 View Menu', url: 'https://tasteofthai.im/menu', icon: '📋' },
      { title: '🎉 Special Offers', url: 'https://tasteofthai.im/offers', icon: '🎉' }
    ]
  },
  {
    business_name: 'Ministry Fitness',
    slug: 'ministry-fitness',
    tagline: 'Transform Your Body & Mind',
    description: 'State-of-the-art fitness facility with personal training, group classes, and wellness programs. Join our community and achieve your fitness goals.',
    logo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop',
    category_id: 24, // Health & Wellness
    business_type_id: null, // Will use first available type
    phone: '+44 1624 345678',
    email: 'info@ministryfitness.im',
    address: '42 Circular Road',
    city: 'Douglas',
    postcode: 'IM1 1AG',
    website_url: 'https://ministryfitness.im',
    primary_color: '#E63946',
    secondary_color: '#1D3557',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/ministryfitness' },
      { platform: 'instagram', url: 'https://instagram.com/ministryfitness' },
      { platform: 'youtube', url: 'https://youtube.com/@ministryfitness' }
    ],
    customLinks: [
      { title: '💪 Join Now', url: 'https://ministryfitness.im/join', icon: '💪' },
      { title: '📅 Class Schedule', url: 'https://ministryfitness.im/classes', icon: '📅' },
      { title: '👤 Personal Training', url: 'https://ministryfitness.im/pt', icon: '👤' }
    ]
  },
  {
    business_name: 'Manx Crown Diamonds',
    slug: 'manx-crown-diamonds',
    tagline: 'Exquisite Jewelry & Timepieces',
    description: 'Luxury jewelry boutique offering stunning diamond rings, necklaces, watches, and bespoke pieces. Expert craftsmanship and personalized service.',
    logo_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=400&fit=crop',
    category_id: 26, // Retail & Shopping
    business_type_id: null, // Will use first available type
    phone: '+44 1624 567890',
    email: 'info@manxcrowndiamonds.com',
    address: '5 Duke Street',
    city: 'Douglas',
    postcode: 'IM1 2AY',
    website_url: 'https://manxcrowndiamonds.com',
    primary_color: '#9D4EDD',
    secondary_color: '#FFD60A',
    is_published: 1,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/manxcrowndiamonds' },
      { platform: 'facebook', url: 'https://facebook.com/manxcrowndiamonds' },
      { platform: 'pinterest', url: 'https://pinterest.com/manxcrowndiamonds' }
    ],
    customLinks: [
      { title: '💎 Browse Collection', url: 'https://manxcrowndiamonds.com/collection', icon: '💎' },
      { title: '💍 Engagement Rings', url: 'https://manxcrowndiamonds.com/engagement', icon: '💍' },
      { title: '✨ Bespoke Design', url: 'https://manxcrowndiamonds.com/bespoke', icon: '✨' }
    ]
  },
  {
    business_name: 'Securikey Locksmith',
    slug: 'securikey-locksmith',
    tagline: '24/7 Emergency Locksmith Services',
    description: 'Professional locksmith services for residential and commercial properties. Emergency lockouts, lock repairs, key cutting, and security upgrades.',
    logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop',
    category_id: 27, // Trades & Services
    business_type_id: null, // Will use first available type
    phone: '+44 1624 678901',
    email: 'help@securikey.im',
    address: '33 Peel Road',
    city: 'Douglas',
    postcode: 'IM1 4LR',
    website_url: 'https://securikey.im',
    primary_color: '#2A9D8F',
    secondary_color: '#264653',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/securikeyim' },
      { platform: 'twitter', url: 'https://twitter.com/securikeyim' }
    ],
    customLinks: [
      { title: '🚨 Emergency Service', url: 'tel:+441624678901', icon: '🚨' },
      { title: '🔑 Services', url: 'https://securikey.im/services', icon: '🔑' },
      { title: '💬 Get Quote', url: 'https://securikey.im/quote', icon: '💬' }
    ]
  },
  {
    business_name: 'Bob\'s Bar',
    slug: 'bobs-bar',
    tagline: 'Your Local Entertainment Spot',
    description: 'Welcome to Bob\'s Bar - the perfect place to unwind with friends. Enjoy great drinks, live music, and a vibrant atmosphere in the heart of Douglas.',
    logo_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=400&fit=crop',
    category_id: 23, // Food & Drink
    business_type_id: null, // Will use first available type
    phone: '+44 1624 789012',
    email: 'info@bobsbar.im',
    address: '22 North Quay',
    city: 'Douglas',
    postcode: 'IM1 4LE',
    website_url: 'https://bobsbar.im',
    primary_color: '#FF6B35',
    secondary_color: '#004E89',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/bobsbarim' },
      { platform: 'instagram', url: 'https://instagram.com/bobsbarim' }
    ],
    customLinks: [
      { title: '🍺 Drinks Menu', url: 'https://bobsbar.im/menu', icon: '🍺' },
      { title: '🎵 Live Music', url: 'https://bobsbar.im/events', icon: '🎵' },
      { title: '📅 Book a Table', url: 'https://bobsbar.im/booking', icon: '📅' }
    ]
  },
  {
    business_name: 'Mrs Yang\'s Restaurant',
    slug: 'mrs-yangs-restaurant',
    tagline: 'Authentic Asian Cuisine',
    description: 'Experience the finest Asian cuisine at Mrs Yang\'s Restaurant. From traditional Chinese dishes to modern fusion, we bring you authentic flavors and exceptional service.',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop',
    category_id: 23, // Food & Drink
    business_type_id: null, // Will use first available type
    phone: '+44 1624 890123',
    email: 'info@mrsyangs.im',
    address: '45 Duke Street',
    city: 'Douglas',
    postcode: 'IM1 2AZ',
    website_url: 'https://mrsyangs.im',
    primary_color: '#DC143C',
    secondary_color: '#FFD700',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/mrsyangsim' },
      { platform: 'instagram', url: 'https://instagram.com/mrsyangsim' }
    ],
    customLinks: [
      { title: '🍜 View Menu', url: 'https://mrsyangs.im/menu', icon: '🍜' },
      { title: '📱 Order Online', url: 'https://mrsyangs.im/order', icon: '📱' },
      { title: '📅 Reserve Table', url: 'https://mrsyangs.im/booking', icon: '📅' }
    ]
  },
  {
    business_name: 'Manx Structural Solutions',
    slug: 'manx-structural-solutions',
    tagline: 'Expert Structural Engineering & Construction',
    description: 'Professional structural engineering and construction services across the Isle of Man. From residential projects to commercial developments, we deliver quality workmanship and reliable solutions.',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=400&fit=crop',
    category_id: 27, // Trades & Services
    business_type_id: null, // Will use first available type
    phone: '+44 1624 901234',
    email: 'info@manxstructural.im',
    address: '78 Bucks Road',
    city: 'Douglas',
    postcode: 'IM1 3AF',
    website_url: 'https://manxstructural.im',
    primary_color: '#FF6B35',
    secondary_color: '#004E89',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/manxstructural' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/manxstructural' }
    ],
    customLinks: [
      { title: '🏗️ Our Services', url: 'https://manxstructural.im/services', icon: '🏗️' },
      { title: '📋 Get Quote', url: 'https://manxstructural.im/quote', icon: '📋' },
      { title: '📸 Portfolio', url: 'https://manxstructural.im/portfolio', icon: '📸' }
    ]
  },
  {
    business_name: 'HPM Groundworks',
    slug: 'hpm-groundworks',
    tagline: 'Professional Groundworks & Excavation',
    description: 'Expert groundworks and excavation services for residential and commercial projects. Quality workmanship and reliable service across the Isle of Man.',
    logo_url: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&h=400&fit=crop',
    category_id: 27, // Trades & Services
    business_type_id: null,
    phone: '+44 1624 111111',
    email: 'info@hpmgroundworks.im',
    address: '12 Industrial Estate',
    city: 'Douglas',
    postcode: 'IM1 5AA',
    website_url: 'https://hpmgroundworks.im',
    primary_color: '#FF6B35',
    secondary_color: '#004E89',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/hpmgroundworks' }
    ],
    customLinks: [
      { title: '🚜 Our Services', url: 'https://hpmgroundworks.im/services', icon: '🚜' },
      { title: '📞 Contact Us', url: 'https://hpmgroundworks.im/contact', icon: '📞' }
    ]
  },
  {
    business_name: 'The Cat Nanny Sitting Service',
    slug: 'the-cat-nanny-sitting-service',
    tagline: 'Professional Pet Care & Cat Sitting',
    description: 'Trusted cat sitting and pet care services. Your feline friends are in safe, loving hands while you\'re away.',
    logo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=400&fit=crop',
    category_id: 27, // Trades & Services
    business_type_id: null,
    phone: '+44 1624 222222',
    email: 'info@catnanny.im',
    address: '34 Circular Road',
    city: 'Douglas',
    postcode: 'IM1 1AG',
    website_url: 'https://catnanny.im',
    primary_color: '#9D4EDD',
    secondary_color: '#FFD60A',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/catnanny' },
      { platform: 'instagram', url: 'https://instagram.com/catnanny' }
    ],
    customLinks: [
      { title: '🐱 Our Services', url: 'https://catnanny.im/services', icon: '🐱' },
      { title: '📅 Book Now', url: 'https://catnanny.im/booking', icon: '📅' }
    ]
  },
  {
    business_name: 'Bowls & Rolls Sushi',
    slug: 'bowls-and-rolls-sushi',
    tagline: 'Fresh Sushi & Asian Bowls',
    description: 'Authentic Japanese sushi and Asian-inspired bowls made fresh daily. Dine-in, takeaway, and delivery available.',
    logo_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=400&fit=crop',
    category_id: 23, // Food & Drink
    business_type_id: null,
    phone: '+44 1624 333333',
    email: 'info@bowlsandrolls.im',
    address: '56 Strand Street',
    city: 'Douglas',
    postcode: 'IM1 2EL',
    website_url: 'https://bowlsandrolls.im',
    primary_color: '#DC143C',
    secondary_color: '#FFD700',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/bowlsandrolls' },
      { platform: 'instagram', url: 'https://instagram.com/bowlsandrolls' }
    ],
    customLinks: [
      { title: '🍱 View Menu', url: 'https://bowlsandrolls.im/menu', icon: '🍱' },
      { title: '📱 Order Online', url: 'https://bowlsandrolls.im/order', icon: '📱' }
    ]
  },
  {
    business_name: 'Michaline Cuts & Colours',
    slug: 'michaline-cuts-and-colours',
    tagline: 'Expert Hair Styling & Colouring',
    description: 'Professional hair salon offering expert cuts, colours, and styling. Transform your look with our experienced stylists.',
    logo_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop',
    category_id: 24, // Health & Wellness
    business_type_id: null,
    phone: '+44 1624 444444',
    email: 'info@michaline.im',
    address: '89 Duke Street',
    city: 'Douglas',
    postcode: 'IM1 2AY',
    website_url: 'https://michaline.im',
    primary_color: '#E63946',
    secondary_color: '#1D3557',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/michaline' },
      { platform: 'instagram', url: 'https://instagram.com/michaline' }
    ],
    customLinks: [
      { title: '✂️ Services', url: 'https://michaline.im/services', icon: '✂️' },
      { title: '📅 Book Appointment', url: 'https://michaline.im/booking', icon: '📅' }
    ]
  },
  {
    business_name: 'Dan Del Car Mann',
    slug: 'dan-del-car-mann',
    tagline: 'Quality Auto Repairs & Maintenance',
    description: 'Trusted automotive repair and maintenance services. From routine servicing to complex repairs, we keep your vehicle running smoothly.',
    logo_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=400&fit=crop',
    category_id: 22, // Automotive
    business_type_id: null,
    phone: '+44 1624 555555',
    email: 'info@dandelcarmann.im',
    address: '23 Peel Road',
    city: 'Douglas',
    postcode: 'IM1 4LR',
    website_url: 'https://dandelcarmann.im',
    primary_color: '#FF6B35',
    secondary_color: '#004E89',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/dandelcarmann' }
    ],
    customLinks: [
      { title: '🔧 Services', url: 'https://dandelcarmann.im/services', icon: '🔧' },
      { title: '📅 Book Service', url: 'https://dandelcarmann.im/booking', icon: '📅' }
    ]
  },
  {
    business_name: 'Refuge Coffee Bar & Bistro',
    slug: 'refuge-coffee-bar-and-bistro',
    tagline: 'Artisan Coffee & Fresh Bistro Food',
    description: 'Your local refuge for exceptional coffee and delicious bistro-style food. A warm, welcoming space to relax and enjoy quality refreshments.',
    logo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=400&fit=crop',
    category_id: 23, // Food & Drink
    business_type_id: null,
    phone: '+44 1624 666666',
    email: 'info@refugecoffee.im',
    address: '67 Victoria Street',
    city: 'Douglas',
    postcode: 'IM1 2LB',
    website_url: 'https://refugecoffee.im',
    primary_color: '#2A9D8F',
    secondary_color: '#264653',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/refugecoffee' },
      { platform: 'instagram', url: 'https://instagram.com/refugecoffee' }
    ],
    customLinks: [
      { title: '☕ Menu', url: 'https://refugecoffee.im/menu', icon: '☕' },
      { title: '📍 Visit Us', url: 'https://refugecoffee.im/location', icon: '📍' }
    ]
  },
  {
    business_name: 'Spellblind Designs',
    slug: 'spellblind-designs',
    tagline: 'Creative Design & Branding Solutions',
    description: 'Innovative graphic design and branding services. We bring your vision to life with stunning visual solutions.',
    logo_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop',
    category_id: 27, // Trades & Services
    business_type_id: null,
    phone: '+44 1624 777777',
    email: 'info@spellblind.im',
    address: '91 Athol Street',
    city: 'Douglas',
    postcode: 'IM1 1JA',
    website_url: 'https://spellblind.im',
    primary_color: '#9D4EDD',
    secondary_color: '#FFD60A',
    is_published: 1,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/spellblind' },
      { platform: 'facebook', url: 'https://facebook.com/spellblind' }
    ],
    customLinks: [
      { title: '🎨 Portfolio', url: 'https://spellblind.im/portfolio', icon: '🎨' },
      { title: '💬 Get Quote', url: 'https://spellblind.im/quote', icon: '💬' }
    ]
  },
  {
    business_name: 'Cornerstone Architects',
    slug: 'cornerstone-architects',
    tagline: 'Innovative Architectural Design',
    description: 'Award-winning architectural practice specializing in residential and commercial design. Creating spaces that inspire and endure.',
    logo_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=400&fit=crop',
    category_id: 25, // Professional Services
    business_type_id: null,
    phone: '+44 1624 888888',
    email: 'info@cornerstone.im',
    address: '45 Circular Road',
    city: 'Douglas',
    postcode: 'IM1 1AG',
    website_url: 'https://cornerstone.im',
    primary_color: '#0077B6',
    secondary_color: '#00B4D8',
    is_published: 1,
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/cornerstone' },
      { platform: 'instagram', url: 'https://instagram.com/cornerstone' }
    ],
    customLinks: [
      { title: '🏛️ Projects', url: 'https://cornerstone.im/projects', icon: '🏛️' },
      { title: '📞 Consultation', url: 'https://cornerstone.im/contact', icon: '📞' }
    ]
  },
  {
    business_name: 'The Anxiety Clinic',
    slug: 'the-anxiety-clinic',
    tagline: 'Professional Mental Health Support',
    description: 'Specialist clinic providing professional support for anxiety and mental health. Compassionate care in a safe, confidential environment.',
    logo_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop',
    category_id: 24, // Health & Wellness
    business_type_id: null,
    phone: '+44 1624 999999',
    email: 'info@anxietyclinic.im',
    address: '78 Bucks Road',
    city: 'Douglas',
    postcode: 'IM1 3AF',
    website_url: 'https://anxietyclinic.im',
    primary_color: '#2A9D8F',
    secondary_color: '#264653',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/anxietyclinic' }
    ],
    customLinks: [
      { title: '🧠 Our Services', url: 'https://anxietyclinic.im/services', icon: '🧠' },
      { title: '📅 Book Appointment', url: 'https://anxietyclinic.im/booking', icon: '📅' }
    ]
  }
];

const seedBusinesses = () => {
  const userId = createTestUser();
  
  console.log('Seeding dummy businesses...');
  
  for (const business of dummyBusinesses) {
    // Check if business already exists
    const existing = db.prepare('SELECT id FROM businesses WHERE slug = ?').get(business.slug);
    
    if (existing) {
      console.log(`Business "${business.business_name}" already exists, skipping...`);
      continue;
    }
    
    // Insert business
    const businessResult = db.prepare(`
      INSERT INTO businesses (
        user_id, business_name, slug, tagline, description,
        logo_url, cover_image_url, category_id, business_type_id,
        phone, email, address, city, postcode, website_url,
        primary_color, secondary_color, is_published, portal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      business.business_name,
      business.slug,
      business.tagline,
      business.description,
      business.logo_url,
      business.cover_image_url,
      business.category_id,
      business.business_type_id,
      business.phone,
      business.email,
      business.address,
      business.city,
      business.postcode,
      business.website_url,
      business.primary_color,
      business.secondary_color,
      business.is_published,
      'iom'
    );
    
    const businessId = businessResult.lastInsertRowid;
    
    // Insert social links
    for (const socialLink of business.socialLinks) {
      db.prepare(`
        INSERT INTO social_links (business_id, platform, url, display_order)
        VALUES (?, ?, ?, ?)
      `).run(businessId, socialLink.platform, socialLink.url, 0);
    }
    
    // Insert custom links
    for (let i = 0; i < business.customLinks.length; i++) {
      const link = business.customLinks[i];
      db.prepare(`
        INSERT INTO custom_links (business_id, title, url, icon, display_order)
        VALUES (?, ?, ?, ?, ?)
      `).run(businessId, link.title, link.url, link.icon, i);
    }
    
    console.log(`✅ Created business: ${business.business_name}`);
  }
  
  console.log('\n🎉 Dummy businesses seeded successfully!');
};

// Run the seeding
seedBusinesses();
db.close();
