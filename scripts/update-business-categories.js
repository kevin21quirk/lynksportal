const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('🔧 Updating existing businesses with proper categories...\n');

try {
  // Get category IDs
  const foodCategory = db.prepare("SELECT id FROM categories WHERE name = 'Food & Drink'").get();
  const healthCategory = db.prepare("SELECT id FROM categories WHERE name = 'Health & Wellness'").get();
  const professionalCategory = db.prepare("SELECT id FROM categories WHERE name = 'Professional Services'").get();
  const retailCategory = db.prepare("SELECT id FROM categories WHERE name = 'Retail & Shopping'").get();
  const automotiveCategory = db.prepare("SELECT id FROM categories WHERE name = 'Automotive'").get();
  
  // Get business type IDs
  const thaiRestaurant = db.prepare("SELECT id FROM business_types WHERE name = 'Thai Restaurant'").get();
  const gym = db.prepare("SELECT id FROM business_types WHERE name = 'Gym & Fitness Center'").get();
  const jewelryStore = db.prepare("SELECT id FROM business_types WHERE name = 'Jewelry Store'").get();
  const bikeShop = db.prepare("SELECT id FROM business_types WHERE name = 'Bike Shop'").get();
  
  // Update businesses
  const updates = [
    { name: 'Taste of Thai Restaurant', categoryId: foodCategory?.id, typeId: thaiRestaurant?.id },
    { name: 'Ministry Fitness', categoryId: healthCategory?.id, typeId: gym?.id },
    { name: 'Manx Crown Diamonds', categoryId: retailCategory?.id, typeId: jewelryStore?.id },
    { name: 'Limitless Cycles', categoryId: retailCategory?.id, typeId: bikeShop?.id },
    { name: 'RightFit Recruitment', categoryId: professionalCategory?.id, typeId: null }
  ];
  
  for (const update of updates) {
    if (update.categoryId) {
      db.prepare(`
        UPDATE businesses 
        SET category_id = ?, business_type_id = ?
        WHERE business_name = ?
      `).run(update.categoryId, update.typeId, update.name);
      
      console.log(`✅ Updated ${update.name}`);
      console.log(`   Category ID: ${update.categoryId}`);
      console.log(`   Type ID: ${update.typeId || 'None'}\n`);
    }
  }
  
  // Show updated businesses
  const businesses = db.prepare(`
    SELECT 
      b.business_name,
      c.name as category_name,
      bt.name as business_type_name
    FROM businesses b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN business_types bt ON b.business_type_id = bt.id
  `).all();
  
  console.log('📊 Updated Businesses:');
  businesses.forEach(b => {
    console.log(`  - ${b.business_name}: ${b.category_name || 'No Category'} / ${b.business_type_name || 'No Type'}`);
  });
  
  console.log('\n🎉 Update completed successfully!');
  
} catch (error) {
  console.error('❌ Update failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
