const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addIndexes() {
  try {
    console.log('Adding database indexes for performance...');
    
    // Add indexes on foreign keys
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
      CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON businesses(category_id);
      CREATE INDEX IF NOT EXISTS idx_businesses_business_type_id ON businesses(business_type_id);
      CREATE INDEX IF NOT EXISTS idx_businesses_portal ON businesses(portal);
      CREATE INDEX IF NOT EXISTS idx_businesses_is_published ON businesses(is_published);
      CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
      
      CREATE INDEX IF NOT EXISTS idx_social_links_business_id ON social_links(business_id);
      CREATE INDEX IF NOT EXISTS idx_custom_links_business_id ON custom_links(business_id);
      CREATE INDEX IF NOT EXISTS idx_opening_hours_business_id ON opening_hours(business_id);
      CREATE INDEX IF NOT EXISTS idx_gallery_images_business_id ON gallery_images(business_id);
      
      CREATE INDEX IF NOT EXISTS idx_business_types_category_id ON business_types(category_id);
      CREATE INDEX IF NOT EXISTS idx_business_types_slug ON business_types(slug);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    `);
    
    console.log('✅ All indexes created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addIndexes();
