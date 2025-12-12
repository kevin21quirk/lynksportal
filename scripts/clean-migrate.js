const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sqliteDb = new Database(path.join(__dirname, '..', 'lynks-portal.db'));

async function cleanAndMigrate() {
  const client = await pool.connect();
  
  try {
    console.log('Starting clean migration to Postgres...');
    console.log('Connected to:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]);
    
    // Drop all existing tables
    console.log('\nDropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS gallery_images CASCADE;
      DROP TABLE IF EXISTS opening_hours CASCADE;
      DROP TABLE IF EXISTS custom_links CASCADE;
      DROP TABLE IF EXISTS social_links CASCADE;
      DROP TABLE IF EXISTS business_analytics CASCADE;
      DROP TABLE IF EXISTS platform_analytics CASCADE;
      DROP TABLE IF EXISTS analytics_events CASCADE;
      DROP TABLE IF EXISTS businesses CASCADE;
      DROP TABLE IF EXISTS business_types CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✓ Dropped all existing tables');
    
    // Now run the migration
    await client.query('BEGIN');
    
    // Create all tables (same as before)
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subscription_status TEXT DEFAULT 'inactive',
        subscription_plan TEXT,
        subscription_start DATE,
        subscription_end DATE
      )
    `);
    console.log('✓ Created users table');

    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created categories table');

    await client.query(`
      CREATE TABLE business_types (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created business_types table');

    await client.query(`
      CREATE TABLE businesses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        tagline TEXT,
        description TEXT,
        logo_url TEXT,
        cover_image_url TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        business_type_id INTEGER REFERENCES business_types(id) ON DELETE SET NULL,
        portal TEXT DEFAULT 'iom',
        phone TEXT,
        email TEXT,
        whatsapp_number TEXT,
        messenger_url TEXT,
        address TEXT,
        city TEXT,
        postcode TEXT,
        country TEXT DEFAULT 'Isle of Man',
        website_url TEXT,
        template_style TEXT DEFAULT 'modern',
        primary_color TEXT DEFAULT '#dbf72c',
        secondary_color TEXT DEFAULT '#000000',
        container_background_color TEXT DEFAULT '#ffffff',
        card_background_color TEXT DEFAULT '#f5f5f5',
        hero_image_url TEXT,
        services TEXT,
        cta_text TEXT,
        cta_url TEXT,
        policies TEXT,
        map_embed_url TEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created businesses table');

    await client.query(`
      CREATE TABLE social_links (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created social_links table');

    await client.query(`
      CREATE TABLE custom_links (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created custom_links table');

    await client.query(`
      CREATE TABLE opening_hours (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        open_time TEXT,
        close_time TEXT,
        is_closed BOOLEAN DEFAULT false
      )
    `);
    console.log('✓ Created opening_hours table');

    await client.query(`
      CREATE TABLE gallery_images (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created gallery_images table');

    await client.query(`
      CREATE TABLE analytics_events (
        id TEXT PRIMARY KEY,
        event TEXT NOT NULL,
        session_id TEXT NOT NULL,
        user_id TEXT,
        url TEXT NOT NULL,
        pathname TEXT NOT NULL,
        referrer TEXT,
        user_agent TEXT,
        ip_address TEXT,
        region TEXT,
        country TEXT,
        city TEXT,
        latitude REAL,
        longitude REAL,
        device_type TEXT,
        browser TEXT,
        screen_width INTEGER,
        screen_height INTEGER,
        metadata TEXT,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created analytics_events table');

    await client.query(`
      CREATE INDEX idx_events_session ON analytics_events(session_id);
      CREATE INDEX idx_events_user ON analytics_events(user_id);
      CREATE INDEX idx_events_event ON analytics_events(event);
      CREATE INDEX idx_events_timestamp ON analytics_events(timestamp);
      CREATE INDEX idx_events_pathname ON analytics_events(pathname);
    `);
    console.log('✓ Created analytics indexes');

    await client.query(`
      CREATE TABLE business_analytics (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        calls INTEGER DEFAULT 0,
        emails INTEGER DEFAULT 0,
        whatsapp INTEGER DEFAULT 0,
        website_clicks INTEGER DEFAULT 0,
        avg_time_on_page REAL DEFAULT 0,
        total_time_on_page INTEGER DEFAULT 0,
        scroll_depth_avg REAL DEFAULT 0,
        top_hours TEXT,
        device_breakdown TEXT,
        region_breakdown TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_id, date)
      )
    `);
    console.log('✓ Created business_analytics table');

    await client.query(`
      CREATE TABLE platform_analytics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total_visitors INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        active_sessions INTEGER DEFAULT 0,
        top_businesses TEXT,
        top_categories TEXT,
        device_breakdown TEXT,
        browser_breakdown TEXT,
        region_breakdown TEXT,
        peak_hours TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created platform_analytics table');

    // Migrate data
    console.log('\nMigrating data from SQLite...');

    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password, full_name, created_at, subscription_status, subscription_plan, subscription_start, subscription_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [user.id, user.email, user.password, user.full_name, user.created_at, user.subscription_status, user.subscription_plan, user.subscription_start, user.subscription_end]
      );
    }
    console.log(`✓ Migrated ${users.length} users`);

    const categories = sqliteDb.prepare('SELECT * FROM categories').all();
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, icon, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.created_at]
      );
    }
    console.log(`✓ Migrated ${categories.length} categories`);

    const businessTypes = sqliteDb.prepare('SELECT * FROM business_types').all();
    for (const type of businessTypes) {
      await client.query(
        `INSERT INTO business_types (id, name, slug, category_id, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [type.id, type.name, type.slug, type.category_id, type.created_at]
      );
    }
    console.log(`✓ Migrated ${businessTypes.length} business types`);

    const businesses = sqliteDb.prepare('SELECT * FROM businesses').all();
    for (const biz of businesses) {
      await client.query(
        `INSERT INTO businesses (
          id, user_id, business_name, slug, tagline, description, logo_url, cover_image_url,
          category_id, business_type_id, portal, phone, email, whatsapp_number, messenger_url,
          address, city, postcode, country, website_url, template_style, primary_color,
          secondary_color, container_background_color, card_background_color, hero_image_url,
          services, cta_text, cta_url, policies, map_embed_url, is_published, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)`,
        [
          biz.id, biz.user_id, biz.business_name, biz.slug, biz.tagline, biz.description,
          biz.logo_url, biz.cover_image_url, biz.category_id, biz.business_type_id, biz.portal,
          biz.phone, biz.email, biz.whatsapp_number, biz.messenger_url, biz.address, biz.city,
          biz.postcode, biz.country, biz.website_url, biz.template_style, biz.primary_color,
          biz.secondary_color, biz.container_background_color, biz.card_background_color,
          biz.hero_image_url, biz.services, biz.cta_text, biz.cta_url, biz.policies,
          biz.map_embed_url, biz.is_published, biz.created_at, biz.updated_at
        ]
      );
    }
    console.log(`✓ Migrated ${businesses.length} businesses`);

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    
    // Verify
    const tableCheck = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    console.log('\nTables created:', tableCheck.rows.length);
    tableCheck.rows.forEach(row => console.log('  -', row.tablename));
    
    const bizCount = await client.query('SELECT COUNT(*) FROM businesses');
    console.log('\nBusinesses in database:', bizCount.rows[0].count);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    sqliteDb.close();
  }
}

cleanAndMigrate().catch(console.error);
