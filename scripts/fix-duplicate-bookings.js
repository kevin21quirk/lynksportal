const { Pool } = require('pg');

// Hardcode the connection string for this script
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://lynksportal_user:Lynks2024Secure!@localhost:5432/lynksportal';

async function fixDuplicates() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Find duplicate bookings (same confirmation code)
    const duplicatesQuery = `
      SELECT confirmation_code, COUNT(*) as count, array_agg(id) as ids
      FROM bookings
      GROUP BY confirmation_code
      HAVING COUNT(*) > 1
    `;
    
    const { rows: duplicates } = await pool.query(duplicatesQuery);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate bookings found');
      return;
    }

    console.log(`⚠️ Found ${duplicates.length} sets of duplicate bookings:`);
    console.table(duplicates);

    // For each set of duplicates, keep the first one and delete the rest
    for (const dup of duplicates) {
      const idsToDelete = dup.ids.slice(1); // Keep first, delete rest
      
      if (idsToDelete.length > 0) {
        console.log(`\nDeleting duplicate booking IDs: ${idsToDelete.join(', ')} (keeping ID: ${dup.ids[0]})`);
        
        const deleteQuery = `DELETE FROM bookings WHERE id = ANY($1)`;
        await pool.query(deleteQuery, [idsToDelete]);
      }
    }

    console.log('\n✅ Duplicate bookings cleaned up!');

    // Show remaining bookings
    const { rows: remaining } = await pool.query(`
      SELECT id, customer_name, confirmation_code, start_datetime 
      FROM bookings 
      ORDER BY start_datetime DESC 
      LIMIT 10
    `);
    
    console.log('\nRemaining bookings:');
    console.table(remaining);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixDuplicates();
