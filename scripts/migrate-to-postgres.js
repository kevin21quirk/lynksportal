const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sqliteDb = new Database(path.join(__dirname, '..', 'lynks-portal.db'));

async function migrateToPostgres() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration to Postgres...');
    
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
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

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created categories table');

    // Create business_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_types (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created business_types table');

    // Create businesses table with ALL fields including new ones
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
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
    console.log('✓ Created businesses table with all enhanced fields');

    // Create social_links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_links (
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

    // Create custom_links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_links (
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

    // Create opening_hours table
    await client.query(`
      CREATE TABLE IF NOT EXISTS opening_hours (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        open_time TEXT,
        close_time TEXT,
        is_closed BOOLEAN DEFAULT false
      )
    `);
    console.log('✓ Created opening_hours table');

    // Create gallery_images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created gallery_images table');

    // Create analytics_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
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

    // Create indexes for analytics
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_event ON analytics_events(event);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_pathname ON analytics_events(pathname);
    `);
    console.log('✓ Created analytics indexes');

    // Create business_analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_analytics (
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

    // Create platform_analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS platform_analytics (
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

    // Migrate data from SQLite to Postgres
    console.log('\nMigrating data from SQLite...');

    // Migrate users
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password, full_name, created_at, subscription_status, subscription_plan, subscription_start, subscription_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, user.password, user.full_name, user.created_at, user.subscription_status, user.subscription_plan, user.subscription_start, user.subscription_end]
      );
    }
    console.log(`✓ Migrated ${users.length} users`);

    // Migrate categories
    const categories = sqliteDb.prepare('SELECT * FROM categories').all();
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, icon, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.created_at]
      );
    }
    console.log(`✓ Migrated ${categories.length} categories`);

    // Migrate business_types
    const businessTypes = sqliteDb.prepare('SELECT * FROM business_types').all();
    for (const type of businessTypes) {
      await client.query(
        `INSERT INTO business_types (id, name, slug, category_id, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [type.id, type.name, type.slug, type.category_id, type.created_at]
      );
    }
    console.log(`✓ Migrated ${businessTypes.length} business types`);

    // Migrate businesses
    const businesses = sqliteDb.prepare('SELECT * FROM businesses').all();
    for (const biz of businesses) {
      await client.query(
        `INSERT INTO businesses (
          id, user_id, business_name, slug, tagline, description, logo_url, cover_image_url,
          category_id, business_type_id, portal, phone, email, whatsapp_number, messenger_url,
          address, city, postcode, country, website_url, template_style, primary_color,
          secondary_color, container_background_color, card_background_color, hero_image_url,
          services, cta_text, cta_url, policies, map_embed_url, is_published, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
        ON CONFLICT (slug) DO NOTHING`,
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

    // Migrate social_links (only for businesses that exist)
    const socialLinks = sqliteDb.prepare('SELECT * FROM social_links').all();
    let migratedSocialLinks = 0;
    for (const link of socialLinks) {
      try {
        await client.query(
          `INSERT INTO social_links (id, business_id, platform, url, display_order, is_visible, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [link.id, link.business_id, link.platform, link.url, link.display_order, link.is_visible, link.created_at]
        );
        migratedSocialLinks++;
      } catch (e) {
        // Skip links for non-existent businesses
        console.log(`  Skipped social link for business_id ${link.business_id} (business doesn't exist)`);
      }
    }
    console.log(`✓ Migrated ${migratedSocialLinks} social links`);

    // Migrate opening_hours (only for businesses that exist)
    const openingHours = sqliteDb.prepare('SELECT * FROM opening_hours').all();
    let migratedOpeningHours = 0;
    for (const hours of openingHours) {
      try {
        await client.query(
          `INSERT INTO opening_hours (id, business_id, day_of_week, open_time, close_time, is_closed)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [hours.id, hours.business_id, hours.day_of_week, hours.open_time, hours.close_time, hours.is_closed]
        );
        migratedOpeningHours++;
      } catch (e) {
        console.log(`  Skipped opening hours for business_id ${hours.business_id}`);
      }
    }
    console.log(`✓ Migrated ${migratedOpeningHours} opening hours`);

    // Check if gallery_images table exists in SQLite
    try {
      const galleryImages = sqliteDb.prepare('SELECT * FROM gallery_images').all();
      let migratedGalleryImages = 0;
      for (const img of galleryImages) {
        try {
          await client.query(
            `INSERT INTO gallery_images (id, business_id, image_url, display_order, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [img.id, img.business_id, img.image_url, img.display_order, img.created_at]
          );
          migratedGalleryImages++;
        } catch (e) {
          console.log(`  Skipped gallery image for business_id ${img.business_id}`);
        }
      }
      console.log(`✓ Migrated ${migratedGalleryImages} gallery images`);
    } catch (e) {
      console.log('✓ No gallery images to migrate');
    }

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    
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

migrateToPostgres().catch(console.error);
