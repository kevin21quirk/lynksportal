const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

// Admin credentials
const adminEmail = 'admin@lynksportal.com';
const adminPassword = 'Admin123!';
const adminName = 'Admin User';

// Hash password
const hashedPassword = bcrypt.hashSync(adminPassword, 10);

try {
  // Check if admin already exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  
  if (existing) {
    console.log('❌ Admin user already exists!');
    console.log('Email:', adminEmail);
    console.log('Use the existing password or delete the user first.');
  } else {
    // Insert admin user
    const result = db.prepare(`
      INSERT INTO users (email, password, full_name, subscription_status, subscription_plan)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminEmail, hashedPassword, adminName, 'active', 'enterprise');
    
    console.log('✅ Admin account created successfully!');
    console.log('');
    console.log('=================================');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('=================================');
    console.log('');
    console.log('Login at: http://localhost:3000/login');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
  }
} catch (error) {
  console.error('Error creating admin:', error);
} finally {
  db.close();
}
