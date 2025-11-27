const Database = require('better-sqlite3');
const path = require('path');

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
  
  return existingUser.id;
};

// Dummy businesses with real-looking data
const dummyBusinesses = [
  {
    business_name: 'Limitless Cycles',
    slug: 'limitless-cycles',
    tagline: 'Your Premier Bicycle Shop',
    description: 'Professional bicycle sales, repairs, and maintenance services. From mountain bikes to road bikes, we have everything you need for your cycling adventures.',
    logo_url: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&h=400&fit=crop',
    category_id: 1, // Automotive
    business_type_id: 1, // Bicycle Repair
    phone: '+44 1624 123456',
    email: 'info@limitlesscycles.com',
    address: '15 Victoria Street',
    city: 'Douglas',
    postcode: 'IM1 2LB',
    website_url: 'https://limitlesscycles.com',
    primary_color: '#dbf72c',
    secondary_color: '#000000',
    is_published: 1,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/limitlesscycles' },
      { platform: 'instagram', url: 'https://instagram.com/limitlesscycles' },
      { platform: 'twitter', url: 'https://twitter.com/limitlesscycles' }
    ],
    customLinks: [
      { title: '🛒 Shop Online', url: 'https://limitlesscycles.com/shop', icon: '🛒' },
      { title: '📅 Book a Service', url: 'https://limitlesscycles.com/booking', icon: '📅' },
      { title: '🚴 Cycling Events', url: 'https://limitlesscycles.com/events', icon: '🚴' }
    ]
  },
  {
    business_name: 'Taste of Thai Restaurant',
    slug: 'taste-of-thai-restaurant',
    tagline: 'Authentic Thai Cuisine',
    description: 'Experience the authentic flavors of Thailand with our traditional recipes and fresh ingredients. Dine-in, takeaway, and delivery available.',
    logo_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
    category_id: 2, // Food & Drink
    business_type_id: 5, // Restaurant
    phone: '+44 1624 234567',
    email: 'hello@tasteofthai.im',
    address: '28 Strand Street',
    city: 'Douglas',
    postcode: 'IM1 2EL',
    website_url: 'https://tasteofthai.im',
    primary_color: '#dbf72c',
    secondary_color: '#000000',
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
    category_id: 3, // Health & Wellness
    business_type_id: 6, // Fitness Gym
    phone: '+44 1624 345678',
    email: 'info@ministryfitness.im',
    address: '42 Circular Road',
    city: 'Douglas',
    postcode: 'IM1 1AG',
    website_url: 'https://ministryfitness.im',
    primary_color: '#dbf72c',
    secondary_color: '#000000',
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
    business_name: 'RightFit Recruitment',
    slug: 'rightfit-recruitment',
    tagline: 'Connecting Talent with Opportunity',
    description: 'Professional recruitment services specializing in placing top talent in the right roles. We work with businesses and job seekers across all industries.',
    logo_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=400&fit=crop',
    category_id: 4, // Professional Services
    business_type_id: 9, // Recruitment Services
    phone: '+44 1624 456789',
    email: 'contact@rightfitrecruitment.com',
    address: '10 Athol Street',
    city: 'Douglas',
    postcode: 'IM1 1JA',
    website_url: 'https://rightfitrecruitment.com',
    primary_color: '#dbf72c',
    secondary_color: '#000000',
    is_published: 1,
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/rightfit-recruitment' },
      { platform: 'facebook', url: 'https://facebook.com/rightfitrecruitment' },
      { platform: 'twitter', url: 'https://twitter.com/rightfitjobs' }
    ],
    customLinks: [
      { title: '💼 Current Vacancies', url: 'https://rightfitrecruitment.com/jobs', icon: '💼' },
      { title: '📝 Submit CV', url: 'https://rightfitrecruitment.com/apply', icon: '📝' },
      { title: '🏢 For Employers', url: 'https://rightfitrecruitment.com/employers', icon: '🏢' }
    ]
  },
  {
    business_name: 'Manx Crown Diamonds',
    slug: 'manx-crown-diamonds',
    tagline: 'Exquisite Jewelry & Timepieces',
    description: 'Luxury jewelry boutique offering stunning diamond rings, necklaces, watches, and bespoke pieces. Expert craftsmanship and personalized service.',
    logo_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=400&fit=crop',
    category_id: 5, // Retail & Shopping
    business_type_id: 11, // Jewelry Store
    phone: '+44 1624 567890',
    email: 'info@manxcrowndiamonds.com',
    address: '5 Duke Street',
    city: 'Douglas',
    postcode: 'IM1 2AY',
    website_url: 'https://manxcrowndiamonds.com',
    primary_color: '#dbf72c',
    secondary_color: '#000000',
    is_published: 1,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/manxcrowndiamonds' },
      { platform: 'facebook', url: 'https://facebook.com/manxcrowndiamonds' }
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
    category_id: 6, // Trades & Services
    business_type_id: 13, // Locksmith Services
    phone: '+44 1624 678901',
    email: 'help@securikey.im',
    address: '33 Peel Road',
    city: 'Douglas',
    postcode: 'IM1 4LR',
    website_url: 'https://securikey.im',
    primary_color: '#dbf72c',
    secondary_color: '#000000',
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
  }
];

const seedBusinesses = () => {
  const userId = createTestUser();
  
  console.log('Seeding dummy businesses...\n');
  
  for (const business of dummyBusinesses) {
    // Check if business already exists
    const existing = db.prepare('SELECT id FROM businesses WHERE slug = ?').get(business.slug);
    
    if (existing) {
      console.log(`⏭️  Business "${business.business_name}" already exists, skipping...`);
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
  console.log('\nYou can now view them at http://localhost:3000');
};

// Run the seeding
try {
  seedBusinesses();
} catch (error) {
  console.error('Error seeding businesses:', error);
} finally {
  db.close();
}
