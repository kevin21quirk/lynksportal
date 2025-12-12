const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Adding hero_image_url field to businesses table...');

try {
  // Add hero_image_url column
  db.exec(`
    ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;
  `);
  
  console.log('✅ Successfully added hero_image_url field');
  
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️  Column already exists, skipping...');
  } else {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

db.close();
console.log('Migration complete!');
