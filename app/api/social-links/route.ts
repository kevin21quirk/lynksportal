import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert } from '@/lib/db';

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

    const links = await query('SELECT * FROM social_links WHERE business_id = ? ORDER BY display_order', [businessId]);
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

    const linkId = await insert(`
      INSERT INTO social_links (business_id, platform, url, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?)
    `, [businessId, platform, url, displayOrder, isVisible]);

    const link = await queryOne('SELECT * FROM social_links WHERE id = ?', [linkId]);

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

    await query(`UPDATE social_links SET ${fields} WHERE id = ?`, [...values, id]);

    const link = await queryOne('SELECT * FROM social_links WHERE id = ?', [id]);

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
      await query('DELETE FROM social_links WHERE business_id = ?', [businessId]);
    } else if (id) {
      await query('DELETE FROM social_links WHERE id = ?', [id]);
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
