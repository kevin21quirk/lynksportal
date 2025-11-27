const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

console.log('🔧 Adding business types to all businesses...\n');

try {
  // Get all businesses without types
  const businesses = db.prepare(`
    SELECT b.id, b.business_name, b.category_id, c.name as category_name
    FROM businesses b
    LEFT JOIN categories c ON b.category_id = c.id
  `).all();
  
  console.log('📊 Current Businesses:');
  businesses.forEach(b => {
    console.log(`  ${b.business_name}: ${b.category_name || 'No Category'}`);
  });
  console.log('');
  
  // Get business type IDs
  const getTypeId = (typeName) => {
    const type = db.prepare("SELECT id FROM business_types WHERE name = ?").get(typeName);
    return type?.id;
  };
  
  // Define business type assignments
  const typeAssignments = {
    'Taste of Thai Restaurant': 'Thai Restaurant',
    'Ministry Fitness': 'Gym & Fitness Center',
    'Manx Crown Diamonds': 'Jewelry Store',
    'Limitless Cycles': 'Bike Shop',
    'RightFit Recruitment': 'Consulting',
    'Securikey Locksmith': 'Locksmith',
    'Yellowbush': 'Marketing Agency',
    'AI Bridge Solutions': 'IT Services'
  };
  
  // Also assign categories to businesses that don't have them
  const categoryAssignments = {
    'Securikey Locksmith': 'Trades & Services',
    'Yellowbush': 'Professional Services',
    'AI Bridge Solutions': 'Technology & Electronics'
  };
  
  // Update each business
  for (const [businessName, typeName] of Object.entries(typeAssignments)) {
    const typeId = getTypeId(typeName);
    
    if (typeId) {
      // Check if business needs category too
      const categoryName = categoryAssignments[businessName];
      if (categoryName) {
        const category = db.prepare("SELECT id FROM categories WHERE name = ?").get(categoryName);
        if (category) {
          db.prepare(`
            UPDATE businesses 
            SET category_id = ?, business_type_id = ?
            WHERE business_name = ?
          `).run(category.id, typeId, businessName);
          
          console.log(`✅ Updated ${businessName}`);
          console.log(`   Category: ${categoryName} (ID: ${category.id})`);
          console.log(`   Type: ${typeName} (ID: ${typeId})\n`);
        }
      } else {
        // Just update type
        db.prepare(`
          UPDATE businesses 
          SET business_type_id = ?
          WHERE business_name = ?
        `).run(typeId, businessName);
        
        console.log(`✅ Updated ${businessName}`);
        console.log(`   Type: ${typeName} (ID: ${typeId})\n`);
      }
    } else {
      console.log(`⚠️  Could not find type: ${typeName} for ${businessName}\n`);
    }
  }
  
  // Show final results
  console.log('📊 Final Business List:');
  const finalBusinesses = db.prepare(`
    SELECT 
      b.business_name,
      c.name as category_name,
      bt.name as business_type_name
    FROM businesses b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN business_types bt ON b.business_type_id = bt.id
    ORDER BY b.business_name
  `).all();
  
  finalBusinesses.forEach(b => {
    console.log(`  ${b.business_name}`);
    console.log(`    Category: ${b.category_name || '❌ Missing'}`);
    console.log(`    Type: ${b.business_type_name || '❌ Missing'}\n`);
  });
  
  // Count completeness
  const complete = finalBusinesses.filter(b => b.category_name && b.business_type_name).length;
  const total = finalBusinesses.length;
  
  console.log(`✅ ${complete}/${total} businesses have both category and type`);
  
  if (complete === total) {
    console.log('🎉 All businesses are complete!');
  } else {
    console.log('⚠️  Some businesses still need category/type assignment');
  }
  
} catch (error) {
  console.error('❌ Update failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
