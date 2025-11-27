const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('🔧 Adding new business sections tables...\n');

try {
  // Create gallery_images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Created gallery_images table');

  // Create business_hours table
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      open_time TEXT,
      close_time TEXT,
      is_closed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
      UNIQUE(business_id, day_of_week)
    )
  `);
  console.log('✅ Created business_hours table');

  // Add services field to businesses table (JSON text field for services list)
  try {
    db.exec(`ALTER TABLE businesses ADD COLUMN services TEXT`);
    console.log('✅ Added services column to businesses table');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('ℹ️  Services column already exists');
    } else {
      throw e;
    }
  }

  console.log('\n🎉 Database migration completed successfully!');
  console.log('\nNew tables created:');
  console.log('  - gallery_images: Store business gallery photos');
  console.log('  - business_hours: Store operating hours for each day');
  console.log('  - businesses.services: JSON field for services list');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
