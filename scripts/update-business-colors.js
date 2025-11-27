const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

// Updated color schemes for each business
const colorUpdates = [
  {
    slug: 'limitless-cycles',
    primary_color: '#FF6B35',  // Orange
    secondary_color: '#004E89'  // Blue
  },
  {
    slug: 'taste-of-thai-restaurant',
    primary_color: '#DC143C',  // Crimson Red
    secondary_color: '#FFD700'  // Gold
  },
  {
    slug: 'ministry-fitness',
    primary_color: '#E63946',  // Red
    secondary_color: '#1D3557'  // Navy Blue
  },
  {
    slug: 'rightfit-recruitment',
    primary_color: '#0077B6',  // Professional Blue
    secondary_color: '#00B4D8'  // Light Blue
  },
  {
    slug: 'manx-crown-diamonds',
    primary_color: '#9D4EDD',  // Purple
    secondary_color: '#FFD60A'  // Gold
  },
  {
    slug: 'securikey-locksmith',
    primary_color: '#2A9D8F',  // Teal
    secondary_color: '#264653'  // Dark Teal
  }
];

console.log('Updating business colors...\n');

for (const update of colorUpdates) {
  try {
    const result = db.prepare(`
      UPDATE businesses 
      SET primary_color = ?, secondary_color = ?
      WHERE slug = ?
    `).run(update.primary_color, update.secondary_color, update.slug);
    
    if (result.changes > 0) {
      console.log(`✅ Updated ${update.slug}`);
      console.log(`   Primary: ${update.primary_color}`);
      console.log(`   Secondary: ${update.secondary_color}\n`);
    } else {
      console.log(`⚠️  Business not found: ${update.slug}\n`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${update.slug}:`, error.message);
  }
}

console.log('🎉 Color update complete!');
console.log('\nBusiness Color Themes:');
console.log('- Limitless Cycles: Orange & Blue (Sporty)');
console.log('- Taste of Thai: Red & Gold (Thai colors)');
console.log('- Ministry Fitness: Red & Navy (Energetic)');
console.log('- RightFit Recruitment: Blue & Light Blue (Professional)');
console.log('- Manx Crown Diamonds: Purple & Gold (Luxury)');
console.log('- Securikey Locksmith: Teal & Dark Teal (Trustworthy)');

db.close();
