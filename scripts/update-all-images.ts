import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('Updating business cover images...\n');

const imageUpdates = [
  { slug: 'hpm-groundworks', image: '/hpm-limited.jpg' },
  { slug: 'the-cat-nanny-sitting-service', image: '/the-cat-nanny.jpg' },
  { slug: 'securikey-locksmith', image: '/securikey-locksmith.jpg' },
  { slug: 'taste-of-thai-restaurant', image: '/taste-of-thai-restaurant.jpg' },
  { slug: 'bowls-and-rolls-sushi', image: '/bowls-and-rolls.jpg' },
  { slug: 'manx-crown-diamonds', image: '/manx-crown-diamonds.jpg' },
  { slug: 'michaline-cuts-and-colours', image: '/michaline-cuts-and-colours.jpg' },
  { slug: 'dan-del-car-mann', image: '/dan-del-car-mann.jpg' },
  { slug: 'refuge-coffee-bar-and-bistro', image: '/refuge.jpg' },
  { slug: 'spellblind-designs', image: '/spellbind.jpg' },
  { slug: 'cornerstone-architects', image: '/corner-stone-architects.jpg' },
  { slug: 'the-anxiety-clinic', image: '/victoria-at-the-anxiety-clinic.jpg' }
];

for (const update of imageUpdates) {
  const business = db.prepare('SELECT id, business_name FROM businesses WHERE slug = ?').get(update.slug);
  
  if (business) {
    db.prepare(`
      UPDATE businesses 
      SET cover_image_url = ?
      WHERE slug = ?
    `).run(update.image, update.slug);
    
    console.log(`✅ Updated: ${(business as any).business_name} -> ${update.image}`);
  } else {
    console.log(`⚠️  Not found: ${update.slug}`);
  }
}

console.log('\n🎉 All images updated successfully!');
db.close();
