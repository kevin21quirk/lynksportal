import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lynks-portal.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      subscription_status TEXT DEFAULT 'inactive',
      subscription_plan TEXT,
      subscription_start DATE,
      subscription_end DATE
    )
  `);

  // Business Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Business Types
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Businesses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      business_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tagline TEXT,
      description TEXT,
      logo_url TEXT,
      cover_image_url TEXT,
      category_id INTEGER,
      business_type_id INTEGER,
      portal TEXT DEFAULT 'iom',
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      postcode TEXT,
      country TEXT DEFAULT 'Isle of Man',
      website_url TEXT,
      template_style TEXT DEFAULT 'modern',
      primary_color TEXT DEFAULT '#dbf72c',
      secondary_color TEXT DEFAULT '#000000',
      is_published BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL
    )
  `);

  // Social Links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    )
  `);

  // Custom Links table (like Linktree)
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      display_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    )
  `);

  // Opening Hours table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opening_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      open_time TEXT,
      close_time TEXT,
      is_closed BOOLEAN DEFAULT 0,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    )
  `);

  // Analytics Events table
  db.exec(`
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
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for analytics queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_events_event ON analytics_events(event);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_events_pathname ON analytics_events(pathname);
  `);

  // Business Analytics Aggregated table
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
      UNIQUE(business_id, date)
    )
  `);

  // Platform Analytics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
    
    const categories = [
      ['Automotive', 'automotive', '🚗'],
      ['Food & Drink', 'food-drink', '🍽️'],
      ['Health & Wellness', 'health-wellness', '💪'],
      ['Professional Services', 'professional-services', '💼'],
      ['Retail & Shopping', 'retail-shopping', '🛍️'],
      ['Trades & Services', 'trades-services', '🔧']
    ];
    
    categories.forEach(cat => insertCategory.run(cat));
  }

  // Seed initial business types
  const typeCount = db.prepare('SELECT COUNT(*) as count FROM business_types').get() as { count: number };
  
  if (typeCount.count === 0) {
    const insertType = db.prepare('INSERT INTO business_types (name, slug, category_id) VALUES (?, ?, ?)');
    
    const businessTypes = [
      ['Bicycle Repair & Maintenance', 'bicycle-repair', 1],
      ['Car Dealership', 'car-dealership', 1],
      ['Chinese & Asian Dining', 'chinese-asian-dining', 2],
      ['Coffee Bar & Bistro', 'coffee-bar-bistro', 2],
      ['Restaurant', 'restaurant', 2],
      ['Fitness Gym', 'fitness-gym', 3],
      ['Hair Salon', 'hair-salon', 3],
      ['Cat Sitting & Care', 'cat-sitting', 4],
      ['Recruitment Services', 'recruitment-services', 4],
      ['Architectural Services', 'architectural-services', 4],
      ['Jewelry Store', 'jewelry-store', 5],
      ['Retail Shop', 'retail-shop', 5],
      ['Locksmith Services', 'locksmith-services', 6],
      ['Garden Design', 'garden-design', 6],
      ['Groundworks', 'groundworks', 6]
    ];
    
    businessTypes.forEach(type => insertType.run(type));
  }
}

// Initialize on import
initDatabase();

export default db;
