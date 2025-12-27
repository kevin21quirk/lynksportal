import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const businessNamesToDelete = [
  'The Cat Nanny Sitting Service'
];

async function deleteBusinesses() {
  const client = await pool.connect();
  
  try {
    console.log('Deleting specified businesses...\n');
    
    for (const businessName of businessNamesToDelete) {
      // Find the business
      const result = await client.query(
        'SELECT id, business_name, slug FROM businesses WHERE business_name = $1',
        [businessName]
      );
      
      if (result.rows.length > 0) {
        const business = result.rows[0];
        const businessId = business.id;
        
        // Delete related records first (CASCADE should handle this, but being explicit)
        await client.query('DELETE FROM social_links WHERE business_id = $1', [businessId]);
        await client.query('DELETE FROM custom_links WHERE business_id = $1', [businessId]);
        await client.query('DELETE FROM opening_hours WHERE business_id = $1', [businessId]);
        
        // Delete the business
        await client.query('DELETE FROM businesses WHERE id = $1', [businessId]);
        
        console.log(`✅ Deleted: ${business.business_name} (slug: ${business.slug})`);
      } else {
        console.log(`⚠️  Not found: ${businessName}`);
      }
    }
    
    console.log('\n✅ Deletion complete!');
  } catch (error) {
    console.error('Error deleting businesses:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteBusinesses();
