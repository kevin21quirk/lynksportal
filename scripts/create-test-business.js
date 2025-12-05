const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  // Get admin user
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@lynksportal.com');
  
  if (!admin) {
    console.log('❌ Admin user not found. Run create-admin.js first.');
    process.exit(1);
  }

  // Get a category
  const category = db.prepare('SELECT * FROM categories LIMIT 1').get();

  // Create test business
  const businessSlug = 'test-business-' + Date.now();
  
  const result = db.prepare(`
    INSERT INTO businesses (
      user_id, business_name, slug, tagline, description,
      category_id, phone, email, address, city, postcode,
      primary_color, secondary_color, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    admin.id,
    'Test Business',
    businessSlug,
    'Your Analytics Test Business',
    'This is a test business to demonstrate the analytics system. Visit this page to generate analytics data!',
    category.id,
    '+44 1234 567890',
    'test@business.com',
    '123 Test Street',
    'Douglas',
    'IM1 1AA',
    '#dbf72c',
    '#000000',
    1 // Published
  );

  console.log('✅ Test business created successfully!');
  console.log('');
  console.log('=================================');
  console.log('Business Name: Test Business');
  console.log('Business URL: http://localhost:3000/business/' + businessSlug);
  console.log('Analytics URL: http://localhost:3000/dashboard/analytics/' + result.lastInsertRowid);
  console.log('=================================');
  console.log('');
  console.log('💡 Visit the business URL to generate analytics data!');
  console.log('   Then check the analytics dashboard to see the data.');

} catch (error) {
  console.error('Error creating test business:', error);
} finally {
  db.close();
}
