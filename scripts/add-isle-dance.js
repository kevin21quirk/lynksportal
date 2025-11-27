const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'lynks-portal.db'));

// First, let's get the Entertainment & Events category ID
const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Entertainment & Events');

if (!category) {
  console.error('Entertainment category not found');
  process.exit(1);
}

// Check if business already exists
const existing = db.prepare('SELECT id FROM businesses WHERE business_name = ?').get('Isle Dance');

if (existing) {
  console.log('Isle Dance already exists');
  process.exit(0);
}

// Insert the business
const insert = db.prepare(`
  INSERT INTO businesses (
    user_id,
    business_name,
    slug,
    tagline,
    description,
    category_id,
    logo_url,
    cover_image_url,
    phone,
    email,
    city,
    primary_color,
    secondary_color,
    is_published
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const result = insert.run(
  1,
  'Isle Dance',
  'isle-dance',
  'Dance and Entertainment Services',
  'Professional dance and entertainment services in the Isle of Man',
  category.id,
  '/Untitled-4-4.jpg',
  '/Untitled-4-4.jpg',
  '+44 1624 000000',
  'info@isledance.com',
  'Isle of Man',
  '#ff5722',
  '#ffffff',
  1
);

console.log('Isle Dance business added successfully with ID:', result.lastInsertRowid);

db.close();
