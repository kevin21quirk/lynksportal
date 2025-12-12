import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

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

    const images = await query(`
      SELECT * FROM gallery_images 
      WHERE business_id = ? 
      ORDER BY display_order ASC
    `, [businessId]);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Get gallery images error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, imageUrl, caption, displayOrder } = body;

    if (!businessId || !imageUrl) {
      return NextResponse.json(
        { error: 'Business ID and image URL required' },
        { status: 400 }
      );
    }

    const imageId = await insert(`
      INSERT INTO gallery_images (business_id, image_url, display_order)
      VALUES (?, ?, ?)
    `, [businessId, imageUrl, displayOrder || 0]);

    return NextResponse.json({ 
      success: true, 
      id: imageId 
    });
  } catch (error) {
    console.error('Create gallery image error:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('businessId');

    if (businessId) {
      // Delete all images for a business
      await query('DELETE FROM gallery_images WHERE business_id = ?', [businessId]);
    } else if (id) {
      // Delete single image
      await query('DELETE FROM gallery_images WHERE id = ?', [id]);
    } else {
      return NextResponse.json(
        { error: 'Image ID or Business ID required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
}
