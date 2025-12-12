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

    const hours = await query(`
      SELECT * FROM opening_hours 
      WHERE business_id = ? 
      ORDER BY day_of_week
    `, [businessId]);

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

    const hoursId = await insert(`
      INSERT INTO opening_hours (business_id, day_of_week, open_time, close_time, is_closed)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (business_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time,
        close_time = EXCLUDED.close_time,
        is_closed = EXCLUDED.is_closed
    `, [businessId, dayOfWeek, openTime, closeTime, isClosed]);

    return NextResponse.json({ 
      success: true, 
      id: hoursId 
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
      await query('DELETE FROM opening_hours WHERE business_id = ?', [businessId]);
    } else if (id) {
      // Delete single hour entry
      await query('DELETE FROM opening_hours WHERE id = ?', [id]);
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
