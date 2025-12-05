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

  console.log('Admin User ID:', admin.id);
  console.log('Admin Email:', admin.email);
  console.log('');

  // Update all businesses to be owned by admin
  const result = db.prepare('UPDATE businesses SET user_id = ?').run(admin.id);
  
  console.log('✅ Updated', result.changes, 'businesses to be owned by admin');
  console.log('');
  console.log('=================================');
  console.log('All businesses are now owned by:');
  console.log('Email:', admin.email);
  console.log('Password: Admin123!');
  console.log('=================================');
  console.log('');
  console.log('🎯 Login and view your dashboard at:');
  console.log('   http://localhost:3000/login');

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
