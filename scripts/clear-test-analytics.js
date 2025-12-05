const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

try {
  console.log('🧹 Cleaning up test analytics data...');
  console.log('');

  // Count existing data
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM analytics_events').get();
  const businessAnalyticsCount = db.prepare('SELECT COUNT(*) as count FROM business_analytics').get();
  const platformAnalyticsCount = db.prepare('SELECT COUNT(*) as count FROM platform_analytics').get();

  console.log('Current data:');
  console.log(`  - Analytics Events: ${eventCount.count}`);
  console.log(`  - Business Analytics: ${businessAnalyticsCount.count}`);
  console.log(`  - Platform Analytics: ${platformAnalyticsCount.count}`);
  console.log('');

  // Delete all test analytics data
  db.prepare('DELETE FROM analytics_events').run();
  db.prepare('DELETE FROM business_analytics').run();
  db.prepare('DELETE FROM platform_analytics').run();

  console.log('✅ All test analytics data cleared!');
  console.log('');
  console.log('=================================');
  console.log('Analytics tables are now empty');
  console.log('=================================');
  console.log('');
  console.log('📊 The system will now track REAL visitor data only.');
  console.log('');
  console.log('How to generate real data:');
  console.log('1. Visit business pages: http://localhost:3000/business/[slug]');
  console.log('2. Click buttons, scroll, interact with the page');
  console.log('3. The tracking.js script will capture real events');
  console.log('4. View analytics dashboards to see real data');
  console.log('');
  console.log('💡 All future analytics will be 100% real visitor data!');

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
