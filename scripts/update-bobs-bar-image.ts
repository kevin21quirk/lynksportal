import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Updating Bob\'s Bar cover image...\n');

const business = db.prepare('SELECT id, business_name FROM businesses WHERE slug = ?').get('bobs-bar');

if (business) {
  db.prepare(`
    UPDATE businesses 
    SET cover_image_url = ?
    WHERE slug = ?
  `).run('/Bobs Bar.jpg', 'bobs-bar');
  
  console.log(`✅ Updated cover image for Bob's Bar to /Bobs Bar.jpg`);
} else {
  console.log(`⚠️  Bob's Bar not found in database`);
}

console.log('\n🎉 Update completed!');
db.close();
