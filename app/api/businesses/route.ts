import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const businessType = searchParams.get('businessType');
    const portal = searchParams.get('portal') || 'iom';
    const published = searchParams.get('published');

    let query = `
      SELECT 
        b.*,
        c.name as category_name,
        bt.name as business_type_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN business_types bt ON b.business_type_id = bt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      query += ' AND b.user_id = ?';
      params.push(userId);
    }

    if (slug) {
      query += ' AND b.slug = ?';
      params.push(slug);
    }

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (businessType) {
      query += ' AND bt.slug = ?';
      params.push(businessType);
    }

    if (portal) {
      query += ' AND b.portal = ?';
      params.push(portal);
    }

    if (published === 'true') {
      query += ' AND b.is_published = 1';
    }

    query += ' ORDER BY b.created_at DESC';

    const businesses = db.prepare(query).all(...params);

    // Get social links for each business
    const businessesWithLinks = businesses.map((business: any) => {
      const socialLinks = db.prepare('SELECT * FROM social_links WHERE business_id = ? ORDER BY display_order').all(business.id);
      const customLinks = db.prepare('SELECT * FROM custom_links WHERE business_id = ? ORDER BY display_order').all(business.id);
      const openingHours = db.prepare('SELECT * FROM opening_hours WHERE business_id = ? ORDER BY day_of_week').all(business.id);
      
      return {
        ...business,
        socialLinks,
        customLinks,
        openingHours
      };
    });

    return NextResponse.json(businessesWithLinks);
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      businessName,
      tagline,
      description,
      categoryId,
      businessTypeId,
      portal = 'iom',
      phone,
      email,
      address,
      city,
      postcode,
      country = 'Isle of Man',
      websiteUrl,
      logoUrl,
      coverImageUrl,
      templateStyle = 'modern',
      primaryColor = '#3B82F6',
      secondaryColor = '#10B981'
    } = body;

    // Generate unique slug
    let slug = slugify(businessName);
    let counter = 1;
    while (db.prepare('SELECT id FROM businesses WHERE slug = ?').get(slug)) {
      slug = `${slugify(businessName)}-${counter}`;
      counter++;
    }

    const result = db.prepare(`
      INSERT INTO businesses (
        user_id, business_name, slug, tagline, description,
        category_id, business_type_id, portal, phone, email,
        address, city, postcode, country, website_url,
        logo_url, cover_image_url,
        template_style, primary_color, secondary_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, businessName, slug, tagline, description,
      categoryId, businessTypeId, portal, phone, email,
      address, city, postcode, country, websiteUrl,
      logoUrl, coverImageUrl,
      templateStyle, primaryColor, secondaryColor
    );

    const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Create business error:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    db.prepare(`
      UPDATE businesses 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, id);

    const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    db.prepare('DELETE FROM businesses WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    );
  }
}
