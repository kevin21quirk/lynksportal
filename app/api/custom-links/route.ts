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

    const links = await query('SELECT * FROM custom_links WHERE business_id = ? ORDER BY display_order', [businessId]);
    return NextResponse.json(links);
  } catch (error) {
    console.error('Get custom links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, title, url, icon = '🔗', displayOrder = 0, isVisible = true } = body;

    const linkId = await insert(`
      INSERT INTO custom_links (business_id, title, url, icon, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [businessId, title, url, icon, displayOrder, isVisible]);

    const link = await queryOne('SELECT * FROM custom_links WHERE id = ?', [linkId]);

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Create custom link error:', error);
    return NextResponse.json(
      { error: 'Failed to create custom link' },
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

    await query(`UPDATE custom_links SET ${fields} WHERE id = ?`, [...values, id]);

    const link = await queryOne('SELECT * FROM custom_links WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Update custom link error:', error);
    return NextResponse.json(
      { error: 'Failed to update custom link' },
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
      await query('DELETE FROM custom_links WHERE business_id = ?', [businessId]);
    } else if (id) {
      await query('DELETE FROM custom_links WHERE id = ?', [id]);
    } else {
      return NextResponse.json(
        { error: 'Link ID or Business ID required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete custom link error:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom link' },
      { status: 500 }
    );
  }
}
