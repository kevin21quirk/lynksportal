const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Adding enhanced business card fields...\n');

try {
  // Add new columns to businesses table
  const newColumns = [
    { name: 'card_background_color', type: 'TEXT DEFAULT "#FFFFFF"' },
    { name: 'services', type: 'TEXT' }, // JSON array
    { name: 'cta_heading', type: 'TEXT' },
    { name: 'cta_button_text', type: 'TEXT' },
    { name: 'cta_button_url', type: 'TEXT' },
    { name: 'policies', type: 'TEXT' }, // JSON array
    { name: 'map_embed_url', type: 'TEXT' },
    { name: 'show_map', type: 'BOOLEAN DEFAULT 1' },
    { name: 'show_services', type: 'BOOLEAN DEFAULT 1' },
    { name: 'show_cta', type: 'BOOLEAN DEFAULT 0' },
    { name: 'show_policies', type: 'BOOLEAN DEFAULT 0' },
    { name: 'show_gallery', type: 'BOOLEAN DEFAULT 1' },
    { name: 'show_description', type: 'BOOLEAN DEFAULT 1' },
    { name: 'show_category', type: 'BOOLEAN DEFAULT 1' }
  ];

  newColumns.forEach(column => {
    try {
      db.exec(`ALTER TABLE businesses ADD COLUMN ${column.name} ${column.type}`);
      console.log(`✓ Added column: ${column.name}`);
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log(`- Column already exists: ${column.name}`);
      } else {
        console.error(`✗ Error adding ${column.name}:`, error.message);
      }
    }
  });

  console.log('\n✓ Database migration completed successfully!');
  
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}
