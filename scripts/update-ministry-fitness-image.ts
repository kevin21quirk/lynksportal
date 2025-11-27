import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Updating Ministry Fitness cover image...\n');

const business = db.prepare('SELECT id, business_name FROM businesses WHERE slug = ?').get('ministry-fitness');

if (business) {
  db.prepare(`
    UPDATE businesses 
    SET cover_image_url = ?
    WHERE slug = ?
  `).run('/ministry-fitness-gym.jpg', 'ministry-fitness');
  
  console.log(`✅ Updated cover image for Ministry Fitness to /ministry-fitness-gym.jpg`);
} else {
  console.log(`⚠️  Ministry Fitness not found in database`);
}

console.log('\n🎉 Update completed!');
db.close();
