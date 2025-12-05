const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  console.log('📊 Checking Analytics Data\n');
  
  // Get all events
  const events = db.prepare('SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 20').all();
  
  console.log(`Total Events: ${events.length}\n`);
  console.log('=================================');
  console.log('Recent Events:\n');
  
  events.forEach((event, index) => {
    console.log(`Event ${index + 1}:`);
    console.log(`  Type: ${event.event}`);
    console.log(`  Session: ${event.session_id}`);
    console.log(`  Pathname: ${event.pathname}`);
    console.log(`  Region: ${event.region || 'N/A'}`);
    console.log(`  Device: ${event.device_type}`);
    console.log(`  Browser: ${event.browser}`);
    console.log(`  Timestamp: ${event.timestamp}`);
    
    if (event.metadata) {
      try {
        const meta = JSON.parse(event.metadata);
        if (meta.timeOnPage) {
          console.log(`  Time on Page: ${meta.timeOnPage}s`);
        }
      } catch (e) {}
    }
    console.log('');
  });
  
  console.log('=================================\n');
  
  // Check aggregated data
  const businessAnalytics = db.prepare('SELECT * FROM business_analytics').all();
  console.log(`Business Analytics Records: ${businessAnalytics.length}`);
  
  if (businessAnalytics.length > 0) {
    console.log('\nAggregated Data:');
    businessAnalytics.forEach(ba => {
      console.log(`  Business ID: ${ba.business_id}`);
      console.log(`  Date: ${ba.date}`);
      console.log(`  Views: ${ba.views}`);
      console.log(`  Unique Visitors: ${ba.unique_visitors}`);
      console.log(`  Avg Time: ${ba.avg_time_on_page}s`);
      console.log(`  Total Time: ${ba.total_time_on_page}s`);
      console.log('');
    });
  }
  
  console.log('=================================\n');
  
  // Check for heartbeat events
  const heartbeats = db.prepare('SELECT * FROM analytics_events WHERE event = ?').all('heartbeat');
  console.log(`Heartbeat Events: ${heartbeats.length}`);
  
  if (heartbeats.length > 0) {
    console.log('\nHeartbeat Details:');
    heartbeats.forEach(hb => {
      const meta = JSON.parse(hb.metadata || '{}');
      console.log(`  Session: ${hb.session_id}, Time: ${meta.timeOnPage}s`);
    });
  }

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
