import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const days = parseInt(searchParams.get('days') || '30');

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    let csvContent = '';

    if (businessId) {
      // Export business analytics
      const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(businessId) as any;
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      const analytics = db.prepare(`
        SELECT * FROM business_analytics
        WHERE business_id = ?
          AND date >= ?
          AND date <= ?
        ORDER BY date ASC
      `).all(businessId, startDateStr, endDateStr) as any[];

      // CSV Header
      csvContent = 'Date,Views,Unique Visitors,Calls,Emails,WhatsApp,Website Clicks,Avg Time on Page,Scroll Depth Avg\n';

      // CSV Rows
      analytics.forEach(row => {
        csvContent += `${row.date},${row.views},${row.unique_visitors},${row.calls},${row.emails},${row.whatsapp},${row.website_clicks},${row.avg_time_on_page},${row.scroll_depth_avg}\n`;
      });

      const filename = `${business.slug}-analytics-${startDateStr}-to-${endDateStr}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Export platform analytics
      const analytics = db.prepare(`
        SELECT * FROM platform_analytics
        WHERE date >= ? AND date <= ?
        ORDER BY date ASC
      `).all(startDateStr, endDateStr) as any[];

      // CSV Header
      csvContent = 'Date,Total Visitors,Unique Visitors,Page Views,Active Sessions\n';

      // CSV Rows
      analytics.forEach(row => {
        csvContent += `${row.date},${row.total_visitors},${row.unique_visitors},${row.page_views},${row.active_sessions}\n`;
      });

      const filename = `platform-analytics-${startDateStr}-to-${endDateStr}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
