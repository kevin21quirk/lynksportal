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

async function setupAddonModules() {
  try {
    console.log('🚀 Setting up SaaS Add-on Modules...\n');
    
    // Read and execute the SQL schema file
    const schemaPath = path.join(__dirname, 'create-addon-modules-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSql);
    
    console.log('✅ Database schema created successfully!\n');
    
    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'addon_modules',
        'business_subscriptions',
        'booking_services',
        'booking_staff',
        'booking_staff_services',
        'booking_staff_availability',
        'booking_staff_time_off',
        'bookings',
        'booking_settings',
        'job_listings',
        'job_applications',
        'job_application_questions',
        'job_application_answers',
        'recruitment_settings'
      )
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Check if modules were seeded
    const modules = await pool.query('SELECT * FROM addon_modules ORDER BY id');
    console.log('\n💰 Available Add-on Modules:');
    modules.rows.forEach(module => {
      console.log(`  • ${module.name} (${module.slug})`);
      console.log(`    Monthly: £${module.monthly_price} | Yearly: £${module.yearly_price}`);
      console.log(`    ${module.description}\n`);
    });
    
    console.log('✅ Setup complete! Your SaaS add-on system is ready.');
    
  } catch (error) {
    console.error('❌ Error setting up add-on modules:', error);
  } finally {
    await pool.end();
  }
}

setupAddonModules();
