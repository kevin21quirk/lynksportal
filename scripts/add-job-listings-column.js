const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://lynksportal_user:Lynks2024Secure!@localhost:5432/lynksportal';

async function addColumn() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businesses' 
      AND column_name = 'show_job_listings'
    `;
    
    const { rows } = await pool.query(checkQuery);
    
    if (rows.length > 0) {
      console.log('✅ Column show_job_listings already exists');
      return;
    }

    // Add the column
    const alterQuery = `
      ALTER TABLE businesses 
      ADD COLUMN show_job_listings INTEGER DEFAULT 0
    `;
    
    await pool.query(alterQuery);
    console.log('✅ Added show_job_listings column to businesses table');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addColumn();
