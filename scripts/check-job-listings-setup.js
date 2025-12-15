const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://lynksportal_user:Lynks2024Secure!@localhost:5432/lynksportal';

async function checkSetup() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Checking job listings setup...\n');

    // Check businesses with show_job_listings enabled
    const businessQuery = `
      SELECT id, business_name, slug, show_job_listings 
      FROM businesses 
      WHERE show_job_listings = 1
    `;
    
    const { rows: businesses } = await pool.query(businessQuery);
    
    console.log(`Businesses with job listings enabled: ${businesses.length}`);
    if (businesses.length > 0) {
      console.table(businesses);
    }

    // Check active job listings
    const jobsQuery = `
      SELECT jl.id, jl.business_id, jl.title, jl.status, b.business_name
      FROM job_listings jl
      JOIN businesses b ON jl.business_id = b.id
      WHERE jl.status = 'active'
    `;
    
    const { rows: jobs } = await pool.query(jobsQuery);
    
    console.log(`\nActive job listings: ${jobs.length}`);
    if (jobs.length > 0) {
      console.table(jobs);
    }

    // Check if any business has both enabled AND active jobs
    const matchQuery = `
      SELECT b.id, b.business_name, b.slug, b.show_job_listings, COUNT(jl.id) as job_count
      FROM businesses b
      LEFT JOIN job_listings jl ON b.id = jl.business_id AND jl.status = 'active'
      WHERE b.show_job_listings = 1
      GROUP BY b.id, b.business_name, b.slug, b.show_job_listings
    `;
    
    const { rows: matches } = await pool.query(matchQuery);
    
    console.log('\nBusinesses with job listings enabled and their active job count:');
    if (matches.length > 0) {
      console.table(matches);
    } else {
      console.log('No businesses found with job listings enabled');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSetup();
