import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch staff for a business
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

    const staff = await query(`
      SELECT * FROM booking_staff
      WHERE business_id = ?
      ORDER BY name ASC
    `, [businessId]);

    // Get services for each staff member
    const staffWithServices = await Promise.all(staff.map(async (member: any) => {
      const services = await query(`
        SELECT 
          bs.id,
          bs.name,
          bs.duration_minutes,
          bs.price
        FROM booking_staff_services bss
        JOIN booking_services bs ON bss.service_id = bs.id
        WHERE bss.staff_id = ?
      `, [member.id]);

      return {
        ...member,
        services
      };
    }));

    return NextResponse.json(staffWithServices);
  } catch (error) {
    console.error('Get booking staff error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      name,
      email,
      phone,
      avatarUrl,
      serviceIds
    } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { error: 'Business ID and name required' },
        { status: 400 }
      );
    }

    const staffId = await insert(`
      INSERT INTO booking_staff (
        business_id,
        name,
        email,
        phone,
        avatar_url
      ) VALUES (?, ?, ?, ?, ?)
    `, [businessId, name, email, phone, avatarUrl]);

    // Link services to staff
    if (serviceIds && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        await insert(`
          INSERT INTO booking_staff_services (staff_id, service_id)
          VALUES (?, ?)
        `, [staffId, serviceId]);
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: staffId 
    });
  } catch (error) {
    console.error('Create booking staff error:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}

// PUT - Update a staff member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      avatarUrl,
      isActive,
      serviceIds
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE booking_staff SET
        name = ?,
        email = ?,
        phone = ?,
        avatar_url = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, email, phone, avatarUrl, isActive, id]);

    // Update service assignments
    if (serviceIds !== undefined) {
      // Remove existing assignments
      await query('DELETE FROM booking_staff_services WHERE staff_id = ?', [id]);
      
      // Add new assignments
      if (serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          await insert(`
            INSERT INTO booking_staff_services (staff_id, service_id)
            VALUES (?, ?)
          `, [id, serviceId]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update booking staff error:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM booking_staff WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete booking staff error:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
