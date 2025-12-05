const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  console.log('📊 Checking Business Ownership\n');
  
  // Get all users
  const users = db.prepare('SELECT id, email, full_name FROM users').all();
  console.log(`Total Users: ${users.length}\n`);
  
  users.forEach(user => {
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.full_name}`);
    console.log(`Email: ${user.email}`);
    
    const businesses = db.prepare('SELECT COUNT(*) as count FROM businesses WHERE user_id = ?').get(user.id);
    console.log(`Businesses: ${businesses.count}`);
    console.log('---');
  });
  
  console.log('\n📋 All Businesses:\n');
  
  const allBusinesses = db.prepare(`
    SELECT 
      b.id,
      b.business_name,
      b.user_id,
      u.email as owner_email,
      u.full_name as owner_name
    FROM businesses b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.id
  `).all();
  
  allBusinesses.forEach(biz => {
    console.log(`${biz.id}. ${biz.business_name}`);
    console.log(`   Owner: ${biz.owner_name || 'Unknown'} (${biz.owner_email || 'No email'})`);
    console.log(`   User ID: ${biz.user_id}`);
    console.log('');
  });

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
