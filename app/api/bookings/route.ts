import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// Generate a random confirmation code
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// GET - Fetch bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!businessId && !id) {
      return NextResponse.json(
        { error: 'Business ID or booking ID required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        b.*,
        bs.name as service_name,
        bs.duration_minutes,
        bs.price as service_price,
        bst.name as staff_name
      FROM bookings b
      JOIN booking_services bs ON b.service_id = bs.id
      LEFT JOIN booking_staff bst ON b.staff_id = bst.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (id) {
      sql += ' AND b.id = ?';
      params.push(id);
    } else if (businessId) {
      sql += ' AND b.business_id = ?';
      params.push(businessId);
    }

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (startDate) {
      sql += ' AND b.start_datetime >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND b.start_datetime <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY b.start_datetime ASC';

    const bookings = await query(sql, params);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      serviceId,
      staffId,
      customerName,
      customerEmail,
      customerPhone,
      startDatetime,
      endDatetime,
      notes,
      status
    } = body;

    if (!businessId || !serviceId || !customerName || !customerEmail || !startDatetime || !endDatetime) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const confirmationCode = generateConfirmationCode();

    const bookingId = await insert(`
      INSERT INTO bookings (
        business_id,
        service_id,
        staff_id,
        customer_name,
        customer_email,
        customer_phone,
        start_datetime,
        end_datetime,
        status,
        notes,
        confirmation_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      businessId,
      serviceId,
      staffId,
      customerName,
      customerEmail,
      customerPhone,
      startDatetime,
      endDatetime,
      status || 'confirmed',
      notes,
      confirmationCode
    ]);

    return NextResponse.json({ 
      success: true, 
      id: bookingId,
      confirmationCode
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PUT - Update a booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      serviceId,
      staffId,
      customerName,
      customerEmail,
      customerPhone,
      startDatetime,
      endDatetime,
      status,
      notes,
      cancellationReason
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE bookings SET
        service_id = ?,
        staff_id = ?,
        customer_name = ?,
        customer_email = ?,
        customer_phone = ?,
        start_datetime = ?,
        end_datetime = ?,
        status = ?,
        notes = ?,
        cancellation_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      serviceId,
      staffId,
      customerName,
      customerEmail,
      customerPhone,
      startDatetime,
      endDatetime,
      status,
      notes,
      cancellationReason,
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM bookings WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
