import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// GET - Fetch job listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
        jl.*,
        b.business_name,
        b.logo_url
      FROM job_listings jl
      JOIN businesses b ON jl.business_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (id) {
      sql += ' AND jl.id = ?';
      params.push(id);
    }

    if (businessId) {
      sql += ' AND jl.business_id = ?';
      params.push(businessId);
    }

    if (slug) {
      sql += ' AND jl.slug = ?';
      params.push(slug);
    }

    if (status) {
      sql += ' AND jl.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY jl.created_at DESC';

    const listings = await query(sql, params);

    // Get application count for each listing
    const listingsWithCounts = await Promise.all(listings.map(async (listing: any) => {
      const appCount = await query(
        'SELECT COUNT(*) as count FROM job_applications WHERE job_listing_id = ?',
        [listing.id]
      );
      return {
        ...listing,
        applications_count: appCount[0].count
      };
    }));

    return NextResponse.json(listingsWithCounts);
  } catch (error) {
    console.error('Get job listings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job listings' },
      { status: 500 }
    );
  }
}

// POST - Create a new job listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      title,
      description,
      employmentType,
      location,
      remoteOption,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline
    } = body;

    if (!businessId || !title || !description) {
      return NextResponse.json(
        { error: 'Business ID, title, and description required' },
        { status: 400 }
      );
    }

    const slug = slugify(title) + '-' + Date.now();

    const listingId = await insert(`
      INSERT INTO job_listings (
        business_id,
        title,
        slug,
        description,
        employment_type,
        location,
        remote_option,
        salary_min,
        salary_max,
        salary_currency,
        salary_period,
        requirements,
        responsibilities,
        benefits,
        application_deadline,
        status,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      businessId,
      title,
      slug,
      description,
      employmentType,
      location,
      remoteOption,
      salaryMin,
      salaryMax,
      salaryCurrency || 'GBP',
      salaryPeriod,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      'active'
    ]);

    return NextResponse.json({ 
      success: true, 
      id: listingId,
      slug 
    });
  } catch (error) {
    console.error('Create job listing error:', error);
    return NextResponse.json(
      { error: 'Failed to create job listing' },
      { status: 500 }
    );
  }
}

// PUT - Update a job listing
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      employmentType,
      location,
      remoteOption,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Job listing ID required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE job_listings SET
        title = ?,
        description = ?,
        employment_type = ?,
        location = ?,
        remote_option = ?,
        salary_min = ?,
        salary_max = ?,
        salary_currency = ?,
        salary_period = ?,
        requirements = ?,
        responsibilities = ?,
        benefits = ?,
        application_deadline = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title,
      description,
      employmentType,
      location,
      remoteOption,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      status,
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update job listing error:', error);
    return NextResponse.json(
      { error: 'Failed to update job listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a job listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Job listing ID required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM job_listings WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job listing error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job listing' },
      { status: 500 }
    );
  }
}
