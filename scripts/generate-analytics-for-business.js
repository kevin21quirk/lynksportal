const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(__dirname, '..', 'lynks-portal.db');
const db = new Database(dbPath);

// Get business ID from command line or use default
const businessId = process.argv[2] || '28';

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

const devices = ['mobile', 'desktop', 'tablet'];
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
const regions = ['Isle of Man', 'England', 'Scotland', 'Wales', 'Ireland'];
const countries = ['United Kingdom', 'Ireland', 'United States'];
const events = ['page_view', 'click', 'scroll_depth', 'heartbeat', 'business_call', 'business_email', 'business_whatsapp'];

try {
  // Get business
  const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(businessId);
  
  if (!business) {
    console.log(`❌ Business with ID ${businessId} not found.`);
    process.exit(1);
  }

  console.log('Generating analytics for:', business.business_name);
  console.log('Business ID:', business.id);
  console.log('');

  // Generate events for the last 30 days
  const now = new Date();
  let totalEvents = 0;

  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Generate 10-50 events per day
    const eventsPerDay = randomInt(10, 50);
    
    for (let i = 0; i < eventsPerDay; i++) {
      const sessionId = `sess_${date.getTime()}_${randomInt(1000, 9999)}`;
      const timestamp = new Date(date);
      timestamp.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));
      
      const event = randomChoice(events);
      const deviceType = randomChoice(devices);
      const browser = randomChoice(browsers);
      const region = randomChoice(regions);
      const country = randomChoice(countries);
      
      const metadata = JSON.stringify({
        device: {
          deviceType,
          browser,
          screenWidth: randomInt(1024, 1920),
          screenHeight: randomInt(768, 1080),
        },
        ...(event === 'scroll_depth' && { depth: randomChoice([25, 50, 75, 100]) }),
        ...(event === 'heartbeat' && { timeOnPage: randomInt(10, 300) }),
      });

      db.prepare(`
        INSERT INTO analytics_events (
          id, event, session_id, url, pathname, user_agent,
          ip_address, region, country, device_type, browser,
          metadata, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        event,
        sessionId,
        `http://localhost:3000/business/${business.slug}`,
        `/business/${business.slug}`,
        `Mozilla/5.0 (${deviceType})`,
        '127.0.0.1',
        region,
        country,
        deviceType,
        browser,
        metadata,
        timestamp.toISOString()
      );
      
      totalEvents++;
    }
    
    process.stdout.write(`\rGenerated ${totalEvents} events...`);
  }

  console.log('\n');
  console.log('✅ Analytics data generated!');
  console.log('');
  console.log('=================================');
  console.log(`Business: ${business.business_name}`);
  console.log(`Total Events: ${totalEvents}`);
  console.log('Date Range: Last 30 days');
  console.log('=================================');
  console.log('');
  console.log('🎯 View analytics at:');
  console.log(`   http://localhost:3000/dashboard/analytics/${business.id}`);

} catch (error) {
  console.error('Error generating analytics:', error);
} finally {
  db.close();
}
