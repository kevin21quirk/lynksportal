const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkBusinessData() {
  try {
    // Get a sample business with all fields
    const result = await pool.query(`
      SELECT * FROM businesses 
      WHERE is_published = true 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      const business = result.rows[0];
      console.log('Sample business data:');
      console.log('ID:', business.id);
      console.log('Name:', business.business_name);
      console.log('Slug:', business.slug);
      console.log('Tagline:', business.tagline);
      console.log('Description:', business.description);
      console.log('Phone:', business.phone);
      console.log('Email:', business.email);
      console.log('WhatsApp:', business.whatsapp_number);
      console.log('Messenger URL:', business.messenger_url);
      console.log('Address:', business.address);
      console.log('City:', business.city);
      console.log('Postcode:', business.postcode);
      console.log('Website:', business.website_url);
      console.log('Logo URL:', business.logo_url);
      console.log('Cover Image:', business.cover_image_url);
      console.log('Hero Image:', business.hero_image_url);
      console.log('Primary Color:', business.primary_color);
      console.log('Secondary Color:', business.secondary_color);
      console.log('Container BG:', business.container_background_color);
      console.log('Card BG:', business.card_background_color);
      console.log('Services:', business.services);
      console.log('CTA Text:', business.cta_text);
      console.log('CTA URL:', business.cta_url);
      console.log('Policies:', business.policies);
      console.log('Map Embed:', business.map_embed_url);
      console.log('Published:', business.is_published);
      
      // Check for NULL values
      const nullFields = [];
      Object.keys(business).forEach(key => {
        if (business[key] === null) {
          nullFields.push(key);
        }
      });
      
      if (nullFields.length > 0) {
        console.log('\nNULL fields:', nullFields.join(', '));
      }
    } else {
      console.log('No published businesses found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkBusinessData();
