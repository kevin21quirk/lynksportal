const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('=== Checking SQLite Database for Business Hours ===\n');

// Check if opening_hours table exists
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='opening_hours'").all();
console.log('opening_hours table exists:', tables.length > 0);

if (tables.length > 0) {
  // Get count
  const count = db.prepare('SELECT COUNT(*) as count FROM opening_hours').get();
  console.log(`Total opening_hours records: ${count.count}`);
  
  // Get sample data
  const sample = db.prepare('SELECT * FROM opening_hours LIMIT 10').all();
  console.log('\nSample data:');
  sample.forEach(row => {
    console.log(row);
  });
  
  // Check which businesses have hours
  const businessesWithHours = db.prepare(`
    SELECT b.business_name, COUNT(oh.id) as hour_count
    FROM businesses b
    LEFT JOIN opening_hours oh ON b.id = oh.business_id
    GROUP BY b.id, b.business_name
    HAVING COUNT(oh.id) > 0
  `).all();
  
  console.log(`\n${businessesWithHours.length} businesses with hours:`);
  businessesWithHours.forEach(row => {
    console.log(`  - ${row.business_name}: ${row.hour_count} entries`);
  });
}

db.close();
