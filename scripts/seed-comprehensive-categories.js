const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('🔧 Seeding comprehensive business categories and types...\n');

// Comprehensive categories with their business types
const categoriesData = [
  {
    name: 'Automotive',
    slug: 'automotive',
    types: [
      'Auto Repair & Maintenance',
      'Car Dealership',
      'Car Wash & Detailing',
      'Tire Shop',
      'Auto Parts Store',
      'Body Shop',
      'Oil Change Service',
      'Towing Service',
      'Vehicle Inspection',
      'Auto Glass Repair'
    ]
  },
  {
    name: 'Food & Drink',
    slug: 'food-drink',
    types: [
      'Restaurant',
      'Café',
      'Bar & Pub',
      'Fast Food',
      'Bakery',
      'Food Truck',
      'Catering Service',
      'Brewery',
      'Wine Bar',
      'Ice Cream Shop',
      'Juice Bar',
      'Pizza Place',
      'Sushi Restaurant',
      'Chinese Restaurant',
      'Indian Restaurant',
      'Italian Restaurant',
      'Mexican Restaurant',
      'Thai Restaurant',
      'Vegan Restaurant',
      'Steakhouse'
    ]
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    types: [
      'Gym & Fitness Center',
      'Yoga Studio',
      'Spa & Massage',
      'Chiropractor',
      'Physiotherapy',
      'Dental Clinic',
      'Medical Clinic',
      'Pharmacy',
      'Optometrist',
      'Mental Health Services',
      'Nutritionist',
      'Personal Trainer',
      'Pilates Studio',
      'Acupuncture',
      'Naturopathy'
    ]
  },
  {
    name: 'Professional Services',
    slug: 'professional-services',
    types: [
      'Accountant',
      'Lawyer',
      'Financial Advisor',
      'Real Estate Agent',
      'Insurance Agency',
      'Marketing Agency',
      'Consulting',
      'Architect',
      'Engineering Services',
      'IT Services',
      'Web Design',
      'Graphic Design',
      'Photography',
      'Videography',
      'Translation Services'
    ]
  },
  {
    name: 'Retail & Shopping',
    slug: 'retail-shopping',
    types: [
      'Clothing Store',
      'Shoe Store',
      'Jewelry Store',
      'Electronics Store',
      'Furniture Store',
      'Home Decor',
      'Bookstore',
      'Gift Shop',
      'Toy Store',
      'Sports Equipment',
      'Pet Store',
      'Florist',
      'Hardware Store',
      'Grocery Store',
      'Convenience Store'
    ]
  },
  {
    name: 'Trades & Services',
    slug: 'trades-services',
    types: [
      'Plumber',
      'Electrician',
      'Carpenter',
      'Painter',
      'Landscaping',
      'Roofing',
      'HVAC Services',
      'Cleaning Service',
      'Pest Control',
      'Locksmith',
      'Handyman',
      'Moving Company',
      'Window Cleaning',
      'Carpet Cleaning',
      'Pool Maintenance'
    ]
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    types: [
      'Hair Salon',
      'Barber Shop',
      'Nail Salon',
      'Beauty Salon',
      'Spa',
      'Makeup Artist',
      'Tattoo & Piercing',
      'Tanning Salon',
      'Waxing Studio',
      'Eyelash Extensions',
      'Skincare Clinic'
    ]
  },
  {
    name: 'Education & Training',
    slug: 'education-training',
    types: [
      'Tutoring Service',
      'Music Lessons',
      'Dance Studio',
      'Art Classes',
      'Language School',
      'Driving School',
      'Martial Arts',
      'Cooking Classes',
      'Computer Training',
      'Professional Development'
    ]
  },
  {
    name: 'Entertainment & Events',
    slug: 'entertainment-events',
    types: [
      'Event Planning',
      'DJ Services',
      'Band & Musicians',
      'Wedding Services',
      'Party Supplies',
      'Photo Booth Rental',
      'Entertainment Venue',
      'Cinema',
      'Bowling Alley',
      'Arcade',
      'Escape Room'
    ]
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    types: [
      'Interior Design',
      'Home Renovation',
      'Garden Center',
      'Landscaping Design',
      'Tree Services',
      'Lawn Care',
      'Fencing',
      'Decking',
      'Paving',
      'Garage Doors'
    ]
  },
  {
    name: 'Pet Services',
    slug: 'pet-services',
    types: [
      'Veterinary Clinic',
      'Pet Grooming',
      'Dog Training',
      'Pet Sitting',
      'Dog Walking',
      'Pet Boarding',
      'Aquarium Services',
      'Pet Photography'
    ]
  },
  {
    name: 'Travel & Accommodation',
    slug: 'travel-accommodation',
    types: [
      'Hotel',
      'Bed & Breakfast',
      'Vacation Rental',
      'Travel Agency',
      'Tour Operator',
      'Car Rental',
      'Airport Transfer'
    ]
  },
  {
    name: 'Sports & Recreation',
    slug: 'sports-recreation',
    types: [
      'Sports Club',
      'Golf Course',
      'Tennis Club',
      'Swimming Pool',
      'Rock Climbing',
      'Ski Resort',
      'Bike Shop',
      'Outdoor Adventure',
      'Sports Coaching'
    ]
  },
  {
    name: 'Technology & Electronics',
    slug: 'technology-electronics',
    types: [
      'Computer Repair',
      'Phone Repair',
      'Software Development',
      'IT Support',
      'Electronics Repair',
      'Data Recovery',
      'Network Services'
    ]
  },
  {
    name: 'Construction & Building',
    slug: 'construction-building',
    types: [
      'General Contractor',
      'Architectural Services',
      'Bespoke Garden Room Design',
      'Building Surveyor',
      'Quantity Surveyor',
      'Structural Engineer',
      'Project Management'
    ]
  }
];

try {
  // Clear existing categories and types
  console.log('Clearing existing categories and business types...');
  db.prepare('DELETE FROM business_types').run();
  db.prepare('DELETE FROM categories').run();
  
  // Insert categories and their types
  for (const category of categoriesData) {
    console.log(`\n📁 Adding category: ${category.name}`);
    
    const result = db.prepare(`
      INSERT INTO categories (name, slug, icon)
      VALUES (?, ?, ?)
    `).run(category.name, category.slug, '📂');
    
    const categoryId = result.lastInsertRowid;
    
    console.log(`   ✅ Category ID: ${categoryId}`);
    console.log(`   Adding ${category.types.length} business types...`);
    
    for (const typeName of category.types) {
      const typeSlug = typeName.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      db.prepare(`
        INSERT INTO business_types (category_id, name, slug)
        VALUES (?, ?, ?)
      `).run(categoryId, typeName, typeSlug);
    }
    
    console.log(`   ✅ Added ${category.types.length} types`);
  }
  
  // Show summary
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const totalTypes = db.prepare('SELECT COUNT(*) as count FROM business_types').get().count;
  
  console.log('\n🎉 Seeding completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   Total Categories: ${totalCategories}`);
  console.log(`   Total Business Types: ${totalTypes}`);
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
