import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all users
    let users;
    try {
      users = db.prepare(`
        SELECT 
          id,
          email,
          full_name,
          created_at
        FROM users
        ORDER BY created_at DESC
      `).all() as any[];
    } catch (dbError) {
      console.error('Database error fetching users:', dbError);
      return NextResponse.json([], { status: 200 }); // Return empty array if table doesn't exist
    }

    if (!users || users.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Get businesses for each user
    const usersWithBusinesses = users.map(user => {
      let businesses = [];
      try {
        businesses = db.prepare(`
          SELECT 
            id,
            business_name,
            slug,
            is_published,
            created_at
          FROM businesses
          WHERE user_id = ?
          ORDER BY created_at DESC
        `).all(user.id) as any[];
      } catch (bizError) {
        console.error(`Error fetching businesses for user ${user.id}:`, bizError);
      }

      return {
        ...user,
        businesses: businesses || []
      };
    });

    return NextResponse.json(usersWithBusinesses);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
