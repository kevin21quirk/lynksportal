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

async function checkHours() {
  try {
    // Get a sample business
    const businesses = await pool.query('SELECT id, business_name FROM businesses LIMIT 1');
    if (businesses.rows.length === 0) {
      console.log('No businesses found');
      return;
    }
    
    const business = businesses.rows[0];
    console.log(`\nChecking hours for: ${business.business_name} (ID: ${business.id})`);
    
    // Check opening_hours table structure
    console.log('\n=== Opening Hours Table Structure ===');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'opening_hours'
      ORDER BY ordinal_position
    `);
    console.log('Columns:', columns.rows);
    
    // Get hours for this business
    console.log('\n=== Business Hours Data ===');
    const hours = await pool.query('SELECT * FROM opening_hours WHERE business_id = $1 ORDER BY day_of_week', [business.id]);
    console.log(`Found ${hours.rows.length} hour entries:`);
    hours.rows.forEach(row => {
      console.log(row);
    });
    
    // Check all businesses with hours
    console.log('\n=== All Businesses with Hours ===');
    const allHours = await pool.query(`
      SELECT b.business_name, COUNT(oh.id) as hour_count
      FROM businesses b
      LEFT JOIN opening_hours oh ON b.id = oh.business_id
      GROUP BY b.id, b.business_name
      HAVING COUNT(oh.id) > 0
    `);
    console.log(`${allHours.rows.length} businesses have hours:`);
    allHours.rows.forEach(row => {
      console.log(`  - ${row.business_name}: ${row.hour_count} entries`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkHours();
