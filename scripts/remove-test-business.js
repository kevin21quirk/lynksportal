const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  // Find and delete test business
  const testBusiness = db.prepare('SELECT * FROM businesses WHERE business_name = ?').get('Test Business');
  
  if (testBusiness) {
    console.log('🗑️  Removing test business...');
    console.log('');
    console.log('Business:', testBusiness.business_name);
    console.log('ID:', testBusiness.id);
    console.log('Slug:', testBusiness.slug);
    console.log('');

    // Delete the business (this will cascade to related data)
    db.prepare('DELETE FROM businesses WHERE id = ?').run(testBusiness.id);
    
    console.log('✅ Test business removed!');
  } else {
    console.log('ℹ️  No test business found.');
  }

  console.log('');
  console.log('=================================');
  
  // Show remaining businesses
  const businesses = db.prepare('SELECT COUNT(*) as count FROM businesses').get();
  console.log(`You now have ${businesses.count} real businesses`);
  console.log('=================================');

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
