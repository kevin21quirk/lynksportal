import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    const links = db.prepare('SELECT * FROM social_links WHERE business_id = ? ORDER BY display_order').all(businessId);
    return NextResponse.json(links);
  } catch (error) {
    console.error('Get social links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, platform, url, displayOrder = 0, isVisible = true } = body;

    const result = db.prepare(`
      INSERT INTO social_links (business_id, platform, url, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?)
    `).run(businessId, platform, url, displayOrder, isVisible ? 1 : 0);

    const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Create social link error:', error);
    return NextResponse.json(
      { error: 'Failed to create social link' },
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

    db.prepare(`UPDATE social_links SET ${fields} WHERE id = ?`).run(...values, id);

    const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Update social link error:', error);
    return NextResponse.json(
      { error: 'Failed to update social link' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('businessId');

    // Delete by ID or all for a business
    if (businessId) {
      db.prepare('DELETE FROM social_links WHERE business_id = ?').run(businessId);
    } else if (id) {
      db.prepare('DELETE FROM social_links WHERE id = ?').run(id);
    } else {
      return NextResponse.json(
        { error: 'Link ID or Business ID required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete social link error:', error);
    return NextResponse.json(
      { error: 'Failed to delete social link' },
      { status: 500 }
    );
  }
}
