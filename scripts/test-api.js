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

async function testAPI() {
  try {
    // Simulate what the API does
    const sql = `
      SELECT 
        b.*,
        c.name as category_name,
        bt.name as business_type_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN business_types bt ON b.business_type_id = bt.id
      WHERE b.is_published = true AND b.portal = 'iom'
      ORDER BY b.created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(sql);
    
    if (result.rows.length > 0) {
      const business = result.rows[0];
      console.log('API would return:');
      console.log(JSON.stringify(business, null, 2));
      
      // Check which fields are present
      console.log('\n\nFields present:');
      Object.keys(business).forEach(key => {
        if (business[key] !== null) {
          console.log(`  ${key}: ${typeof business[key] === 'string' && business[key].length > 50 ? business[key].substring(0, 50) + '...' : business[key]}`);
        }
      });
      
      console.log('\n\nFields missing (NULL):');
      Object.keys(business).forEach(key => {
        if (business[key] === null) {
          console.log(`  ${key}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testAPI();
