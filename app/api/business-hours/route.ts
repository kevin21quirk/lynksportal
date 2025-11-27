import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'lynks-portal.db'));

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

    const hours = db.prepare(`
      SELECT * FROM business_hours 
      WHERE business_id = ? 
      ORDER BY 
        CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END
    `).all(businessId);

    return NextResponse.json(hours);
  } catch (error) {
    console.error('Get business hours error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business hours' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, dayOfWeek, openTime, closeTime, isClosed } = body;

    if (!businessId || !dayOfWeek) {
      return NextResponse.json(
        { error: 'Business ID and day of week required' },
        { status: 400 }
      );
    }

    // Use INSERT OR REPLACE to handle duplicates
    const result = db.prepare(`
      INSERT OR REPLACE INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
      VALUES (?, ?, ?, ?, ?)
    `).run(businessId, dayOfWeek, openTime, closeTime, isClosed ? 1 : 0);

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Create business hours error:', error);
    return NextResponse.json(
      { error: 'Failed to create business hours' },
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
      // Delete all hours for a business
      db.prepare('DELETE FROM business_hours WHERE business_id = ?').run(businessId);
    } else if (id) {
      // Delete single hour entry
      db.prepare('DELETE FROM business_hours WHERE id = ?').run(id);
    } else {
      return NextResponse.json(
        { error: 'ID or Business ID required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete business hours error:', error);
    return NextResponse.json(
      { error: 'Failed to delete business hours' },
      { status: 500 }
    );
  }
}
