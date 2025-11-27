import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

const businessSlugsToDelete = ['limitless-cycles', 'rightfit-recruitment'];

console.log('Deleting specified businesses...\n');

for (const slug of businessSlugsToDelete) {
  const business = db.prepare('SELECT id, business_name FROM businesses WHERE slug = ?').get(slug);
  
  if (business) {
    const businessId = (business as any).id;
    const businessName = (business as any).business_name;
    
    // Delete related records first
    db.prepare('DELETE FROM social_links WHERE business_id = ?').run(businessId);
    db.prepare('DELETE FROM custom_links WHERE business_id = ?').run(businessId);
    db.prepare('DELETE FROM opening_hours WHERE business_id = ?').run(businessId);
    
    // Delete the business
    db.prepare('DELETE FROM businesses WHERE id = ?').run(businessId);
    
    console.log(`✅ Deleted: ${businessName}`);
  } else {
    console.log(`⚠️  Not found: ${slug}`);
  }
}

console.log('\n🎉 Deletion completed!');
db.close();
