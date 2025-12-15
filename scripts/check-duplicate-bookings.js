const mysql = require('mysql2/promise');

async function checkDuplicates() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lynks2024!',
    database: 'lynksportal'
  });

  try {
    // Check for duplicate bookings
    const [bookings] = await connection.execute(`
      SELECT id, business_id, service_id, customer_name, start_datetime, confirmation_code 
      FROM bookings 
      ORDER BY start_datetime DESC 
      LIMIT 20
    `);

    console.log('Recent bookings:');
    console.table(bookings);

    // Check for duplicates by confirmation code
    const [duplicates] = await connection.execute(`
      SELECT confirmation_code, COUNT(*) as count
      FROM bookings
      GROUP BY confirmation_code
      HAVING count > 1
    `);

    if (duplicates.length > 0) {
      console.log('\n⚠️ Found duplicate confirmation codes:');
      console.table(duplicates);
    } else {
      console.log('\n✅ No duplicate confirmation codes found');
    }

    // Check for duplicate bookings (same customer, service, time)
    const [samebookings] = await connection.execute(`
      SELECT customer_name, service_id, start_datetime, COUNT(*) as count
      FROM bookings
      GROUP BY customer_name, service_id, start_datetime
      HAVING count > 1
    `);

    if (samebookings.length > 0) {
      console.log('\n⚠️ Found duplicate bookings (same customer/service/time):');
      console.table(samebookings);
    } else {
      console.log('\n✅ No duplicate bookings found');
    }

  } finally {
    await connection.end();
  }
}

checkDuplicates().catch(console.error);
