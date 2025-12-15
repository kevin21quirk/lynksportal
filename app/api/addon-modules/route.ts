import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all available add-on modules
export async function GET(request: NextRequest) {
  try {
    const modules = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        monthly_price,
        yearly_price,
        features,
        is_active
      FROM addon_modules
      WHERE is_active = true
      ORDER BY monthly_price ASC
    `);

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Get addon modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-on modules' },
      { status: 500 }
    );
  }
}
