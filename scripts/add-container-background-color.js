const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Adding container_background_color field to businesses table...');

try {
  // Add container_background_color column
  db.exec(`
    ALTER TABLE businesses ADD COLUMN container_background_color TEXT DEFAULT '#FF8A65';
  `);
  
  console.log('✅ Successfully added container_background_color field');
  console.log('Default value: #FF8A65 (light orange)');
  
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
