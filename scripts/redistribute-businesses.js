const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  console.log('🔄 Redistributing Businesses to Different Owners\n');
  
  // Get all users except admin
  const users = db.prepare('SELECT id, email, full_name FROM users WHERE email != ?').all('admin@lynksportal.com');
  const businesses = db.prepare('SELECT id, business_name FROM businesses ORDER BY id').all();
  
  console.log(`Found ${users.length} users (excluding admin)`);
  console.log(`Found ${businesses.length} businesses\n`);
  
  if (users.length === 0) {
    console.log('❌ No non-admin users found. All businesses will remain with admin.');
    return;
  }
  
  // Distribute businesses evenly among users
  let userIndex = 0;
  const updates = [];
  
  businesses.forEach((business, index) => {
    const user = users[userIndex];
    
    // Update business owner
    db.prepare('UPDATE businesses SET user_id = ? WHERE id = ?').run(user.id, business.id);
    
    updates.push({
      business: business.business_name,
      newOwner: user.email
    });
    
    // Move to next user (round-robin)
    userIndex = (userIndex + 1) % users.length;
  });
  
  console.log('✅ Businesses Redistributed:\n');
  updates.forEach(update => {
    console.log(`${update.business}`);
    console.log(`  → Now owned by: ${update.newOwner}\n`);
  });
  
  console.log('\n📊 Summary by User:\n');
  users.forEach(user => {
    const count = db.prepare('SELECT COUNT(*) as count FROM businesses WHERE user_id = ?').get(user.id);
    console.log(`${user.full_name} (${user.email}): ${count.count} businesses`);
  });
  
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM businesses WHERE user_id = (SELECT id FROM users WHERE email = ?)').get('admin@lynksportal.com');
  console.log(`Admin (admin@lynksportal.com): ${adminCount.count} businesses`);

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
