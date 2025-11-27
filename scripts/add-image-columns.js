const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  console.log('Adding logo_url and cover_image_url columns to businesses table...');
  
  // Check if columns already exist
  const columns = db.prepare('PRAGMA table_info(businesses)').all();
  const hasLogoUrl = columns.some(col => col.name === 'logo_url');
  const hasCoverImageUrl = columns.some(col => col.name === 'cover_image_url');
  
  if (!hasLogoUrl) {
    db.prepare('ALTER TABLE businesses ADD COLUMN logo_url TEXT').run();
    console.log('✅ Added logo_url column');
  } else {
    console.log('ℹ️  logo_url column already exists');
  }
  
  if (!hasCoverImageUrl) {
    db.prepare('ALTER TABLE businesses ADD COLUMN cover_image_url TEXT').run();
    console.log('✅ Added cover_image_url column');
  } else {
    console.log('ℹ️  cover_image_url column already exists');
  }
  
  console.log('\n✅ Migration completed successfully!');
  console.log('\nYou can now:');
  console.log('1. Upload logo and cover images when creating a business');
  console.log('2. Use AI Scan to automatically extract images from websites');
  console.log('3. Images will display on business cards and business pages');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
