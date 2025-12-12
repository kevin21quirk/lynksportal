const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Adding whatsapp_number field to businesses table...');

try {
  // Add whatsapp_number column
  db.exec(`
    ALTER TABLE businesses ADD COLUMN whatsapp_number TEXT;
  `);
  
  console.log('✅ Successfully added whatsapp_number field');
  
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
