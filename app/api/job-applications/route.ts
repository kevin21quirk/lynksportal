import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

// GET - Fetch applications for a job listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobListingId = searchParams.get('jobListingId');
    const id = searchParams.get('id');

    if (!jobListingId && !id) {
      return NextResponse.json(
        { error: 'Job listing ID or application ID required' },
        { status: 400 }
      );
    }

    let sql = 'SELECT * FROM job_applications WHERE 1=1';
    const params: any[] = [];

    if (id) {
      sql += ' AND id = ?';
      params.push(id);
    } else if (jobListingId) {
      sql += ' AND job_listing_id = ?';
      params.push(jobListingId);
    }

    sql += ' ORDER BY applied_at DESC';

    const applications = await query(sql, params);

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Submit a job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobListingId,
      applicantName,
      applicantEmail,
      applicantPhone,
      resumeUrl,
      coverLetter,
      linkedinUrl,
      portfolioUrl
    } = body;

    if (!jobListingId || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: 'Job listing ID, name, and email required' },
        { status: 400 }
      );
    }

    const applicationId = await insert(`
      INSERT INTO job_applications (
        job_listing_id,
        applicant_name,
        applicant_email,
        applicant_phone,
        resume_url,
        cover_letter,
        linkedin_url,
        portfolio_url,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `, [
      jobListingId,
      applicantName,
      applicantEmail,
      applicantPhone,
      resumeUrl,
      coverLetter,
      linkedinUrl,
      portfolioUrl
    ]);

    // Increment application count on job listing
    await query(`
      UPDATE job_listings 
      SET applications_count = applications_count + 1
      WHERE id = ?
    `, [jobListingId]);

    return NextResponse.json({ 
      success: true, 
      id: applicationId 
    });
  } catch (error) {
    console.error('Create job application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, rating } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE job_applications SET
        status = ?,
        notes = ?,
        rating = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, notes, rating, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update job application error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an application
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM job_applications WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job application error:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
