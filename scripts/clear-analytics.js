const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  console.log('🧹 Clearing Analytics Data\n');
  
  // Count current records
  const eventsCount = db.prepare('SELECT COUNT(*) as count FROM analytics_events').get();
  const businessCount = db.prepare('SELECT COUNT(*) as count FROM business_analytics').get();
  const platformCount = db.prepare('SELECT COUNT(*) as count FROM platform_analytics').get();
  
  console.log('Current Records:');
  console.log(`  Analytics Events: ${eventsCount.count}`);
  console.log(`  Business Analytics: ${businessCount.count}`);
  console.log(`  Platform Analytics: ${platformCount.count}\n`);
  
  // Clear all analytics data
  db.prepare('DELETE FROM analytics_events').run();
  db.prepare('DELETE FROM business_analytics').run();
  db.prepare('DELETE FROM platform_analytics').run();
  
  console.log('✅ All analytics data cleared!\n');
  console.log('Analytics will start fresh from your next visit.');
  console.log('Note: This does NOT delete businesses or users, only tracking data.\n');

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
