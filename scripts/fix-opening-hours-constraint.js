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

async function fixConstraint() {
  try {
    console.log('Adding unique constraint to opening_hours table...');
    
    // Add unique constraint on business_id and day_of_week
    await pool.query(`
      ALTER TABLE opening_hours 
      DROP CONSTRAINT IF EXISTS opening_hours_business_day_unique;
      
      ALTER TABLE opening_hours 
      ADD CONSTRAINT opening_hours_business_day_unique 
      UNIQUE (business_id, day_of_week);
    `);
    
    console.log('✅ Unique constraint added successfully!');
    
    // Verify constraints
    const constraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'opening_hours'
    `);
    
    console.log('\nCurrent opening_hours constraints:');
    constraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name} (${row.constraint_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixConstraint();
