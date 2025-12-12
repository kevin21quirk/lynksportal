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

async function addMissingColumns() {
  try {
    console.log('Checking and adding missing columns to businesses table...');
    
    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS cta_heading TEXT,
      ADD COLUMN IF NOT EXISTS cta_button_text TEXT,
      ADD COLUMN IF NOT EXISTS cta_button_url TEXT,
      ADD COLUMN IF NOT EXISTS show_cta BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS show_map BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS show_policies BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ Missing columns added successfully!');
    
    // Verify columns exist
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businesses'
      ORDER BY ordinal_position
    `);
    
    console.log('\nCurrent businesses table columns:');
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addMissingColumns();
