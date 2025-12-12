import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTypes = searchParams.get('includeTypes') === 'true';

    const categories = await query('SELECT * FROM categories ORDER BY name');

    if (includeTypes) {
      const categoriesWithTypes = await Promise.all(categories.map(async (category: any) => {
        const businessTypes = await query('SELECT * FROM business_types WHERE category_id = ? ORDER BY name', [category.id]);
        return {
          ...category,
          businessTypes
        };
      }));
      return NextResponse.json(categoriesWithTypes);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
