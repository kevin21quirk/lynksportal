import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Updating Mrs Yang\'s Restaurant cover image...\n');

const business = db.prepare('SELECT id, business_name FROM businesses WHERE slug = ?').get('mrs-yangs-restaurant');

if (business) {
  db.prepare(`
    UPDATE businesses 
    SET cover_image_url = ?
    WHERE slug = ?
  `).run('/mrsy-yangs.jpg', 'mrs-yangs-restaurant');
  
  console.log(`✅ Updated cover image for Mrs Yang's Restaurant to /mrsy-yangs.jpg`);
} else {
  console.log(`⚠️  Mrs Yang's Restaurant not found in database`);
}

console.log('\n🎉 Update completed!');
db.close();
