import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTypes = searchParams.get('includeTypes') === 'true';

    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

    if (includeTypes) {
      const categoriesWithTypes = categories.map((category: any) => {
        const businessTypes = db.prepare('SELECT * FROM business_types WHERE category_id = ? ORDER BY name').all(category.id);
        return {
          ...category,
          businessTypes
        };
      });
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
