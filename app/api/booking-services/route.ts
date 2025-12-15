import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch services for a business
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

    const services = await query(`
      SELECT * FROM booking_services
      WHERE business_id = ?
      ORDER BY name ASC
    `, [businessId]);

    return NextResponse.json(services);
  } catch (error) {
    console.error('Get booking services error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      name,
      description,
      durationMinutes,
      price,
      currency,
      bufferTimeMinutes,
      color,
      maxAdvanceBookingDays,
      minAdvanceBookingHours
    } = body;

    if (!businessId || !name || !durationMinutes) {
      return NextResponse.json(
        { error: 'Business ID, name, and duration required' },
        { status: 400 }
      );
    }

    const serviceId = await insert(`
      INSERT INTO booking_services (
        business_id,
        name,
        description,
        duration_minutes,
        price,
        currency,
        buffer_time_minutes,
        color,
        max_advance_booking_days,
        min_advance_booking_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      businessId,
      name,
      description,
      durationMinutes,
      price,
      currency || 'GBP',
      bufferTimeMinutes || 0,
      color || '#3b82f6',
      maxAdvanceBookingDays || 30,
      minAdvanceBookingHours || 2
    ]);

    return NextResponse.json({ 
      success: true, 
      id: serviceId 
    });
  } catch (error) {
    console.error('Create booking service error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      durationMinutes,
      price,
      currency,
      bufferTimeMinutes,
      isActive,
      color,
      maxAdvanceBookingDays,
      minAdvanceBookingHours
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE booking_services SET
        name = ?,
        description = ?,
        duration_minutes = ?,
        price = ?,
        currency = ?,
        buffer_time_minutes = ?,
        is_active = ?,
        color = ?,
        max_advance_booking_days = ?,
        min_advance_booking_hours = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name,
      description,
      durationMinutes,
      price,
      currency,
      bufferTimeMinutes,
      isActive,
      color,
      maxAdvanceBookingDays,
      minAdvanceBookingHours,
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update booking service error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM booking_services WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete booking service error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
