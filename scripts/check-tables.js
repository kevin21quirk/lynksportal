const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
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

async function checkTables() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('Connecting to:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]);
    
    // Check all schemas
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata
      ORDER BY schema_name
    `);
    console.log('\nSchemas:', schemas.rows.map(r => r.schema_name).join(', '));
    
    // Check tables in all schemas
    const allTables = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      ORDER BY schemaname, tablename
    `);
    
    console.log('\nAll tables:');
    allTables.rows.forEach(row => {
      console.log(`  ${row.schemaname}.${row.tablename}`);
    });
    
    console.log('\nTotal tables:', allTables.rows.length);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();
