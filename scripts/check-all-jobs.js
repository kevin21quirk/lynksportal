const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://lynksportal_user:Lynks2024Secure!@localhost:5432/lynksportal';

async function checkJobs() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Check all job listings
    const jobsQuery = `
      SELECT jl.*, b.business_name
      FROM job_listings jl
      JOIN businesses b ON jl.business_id = b.id
      ORDER BY jl.created_at DESC
    `;
    
    const { rows: jobs } = await pool.query(jobsQuery);
    
    console.log(`Total job listings in database: ${jobs.length}\n`);
    
    if (jobs.length === 0) {
      console.log('❌ No job listings found in the database');
      console.log('\n📋 To create job listings:');
      console.log('1. Go to Dashboard → Modules → Job Recruitment');
      console.log('2. Click "Add New Job Listing"');
      console.log('3. Fill in the job details');
      console.log('4. Set status to "Active"');
      console.log('5. Click Save');
      console.log('\nOnce you have active job listings, they will appear on your business card.');
    } else {
      console.log('Job listings found:');
      console.table(jobs.map(j => ({
        id: j.id,
        business: j.business_name,
        title: j.title,
        status: j.status,
        created: j.created_at
      })));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkJobs();
