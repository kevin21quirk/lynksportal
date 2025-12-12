const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Adding messenger_url field to businesses table...');

try {
  // Add messenger_url column
  db.exec(`
    ALTER TABLE businesses ADD COLUMN messenger_url TEXT;
  `);
  
  console.log('✅ Successfully added messenger_url field');
  
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
