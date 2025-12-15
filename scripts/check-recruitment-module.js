const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://lynksportal_user:Lynks2024Secure!@localhost:5432/lynksportal';

async function checkModule() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Check if business has job recruitment module subscription
    const subQuery = `
      SELECT bs.*, m.name as module_name, b.business_name
      FROM business_subscriptions bs
      JOIN modules m ON bs.module_id = m.id
      JOIN businesses b ON bs.business_id = b.id
      WHERE m.slug = 'job-recruitment'
      AND b.id = 29
    `;
    
    const { rows: subs } = await pool.query(subQuery);
    
    if (subs.length === 0) {
      console.log('❌ Business does not have Job Recruitment Module subscription');
      console.log('\nTo add job listings:');
      console.log('1. Go to Dashboard → Modules');
      console.log('2. Subscribe to "Job Recruitment" module');
      console.log('3. Then create job listings from the module');
    } else {
      console.log('✅ Business has Job Recruitment Module subscription');
      console.table(subs);
      console.log('\nTo add job listings:');
      console.log('1. Go to Dashboard → Modules → Job Recruitment');
      console.log('2. Click "Add New Job Listing"');
      console.log('3. Fill in job details and set status to "Active"');
      console.log('4. Save the job listing');
      console.log('5. Job will appear on your business card');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkModule();
