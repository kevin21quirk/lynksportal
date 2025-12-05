const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  // Get all businesses
  const businesses = db.prepare('SELECT * FROM businesses').all();
  
  if (businesses.length === 0) {
    console.log('❌ No businesses found in database.');
    console.log('');
    console.log('Run: node scripts/create-test-business.js');
  } else {
    console.log('✅ Found', businesses.length, 'business(es):');
    console.log('');
    console.log('=================================');
    
    businesses.forEach(business => {
      console.log(`ID: ${business.id}`);
      console.log(`Name: ${business.business_name}`);
      console.log(`Slug: ${business.slug}`);
      console.log(`Owner ID: ${business.user_id}`);
      console.log(`Published: ${business.is_published ? 'Yes' : 'No'}`);
      console.log(`Business URL: http://localhost:3000/business/${business.slug}`);
      console.log(`Analytics URL: http://localhost:3000/dashboard/analytics/${business.id}`);
      console.log('---------------------------------');
    });
    
    console.log('=================================');
  }
  
  // Check analytics events
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM analytics_events').get();
  console.log('');
  console.log(`📊 Total Analytics Events: ${eventCount.count}`);

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
