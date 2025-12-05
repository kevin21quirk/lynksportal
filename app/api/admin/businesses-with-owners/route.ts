import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all businesses with their owner information
    const businesses = db.prepare(`
      SELECT 
        b.id,
        b.business_name,
        b.slug,
        b.is_published,
        b.created_at,
        b.user_id as owner_id,
        u.email as owner_email,
        u.full_name as owner_name
      FROM businesses b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `).all() as any[];

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses with owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
