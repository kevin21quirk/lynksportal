const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://lynksportal_user:Lynks2024Secure!@localhost:5432/lynksportal';

async function activateJob() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Update job listing status to active
    const updateQuery = `
      UPDATE job_listings 
      SET status = 'active'
      WHERE id = 1
    `;
    
    await pool.query(updateQuery);
    console.log('✅ Job listing status updated to "active"');

    // Verify the update
    const verifyQuery = `
      SELECT jl.id, jl.title, jl.status, b.business_name
      FROM job_listings jl
      JOIN businesses b ON jl.business_id = b.id
      WHERE jl.id = 1
    `;
    
    const { rows } = await pool.query(verifyQuery);
    console.log('\nUpdated job listing:');
    console.table(rows);

    console.log('\n✅ Job listing is now active and will appear on your business card!');
    console.log('Visit your business card to see the "WE\'RE HIRING" section.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

activateJob();
