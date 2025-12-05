import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const days = parseInt(searchParams.get('days') || '30');
    const includeEvents = searchParams.get('includeEvents') === 'true';

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    let exportData: any = {};

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

      exportData = {
        business: {
          id: business.id,
          name: business.business_name,
          slug: business.slug,
        },
        dateRange: {
          start: startDateStr,
          end: endDateStr,
        },
        analytics: analytics.map(row => ({
          date: row.date,
          views: row.views,
          uniqueVisitors: row.unique_visitors,
          calls: row.calls,
          emails: row.emails,
          whatsapp: row.whatsapp,
          websiteClicks: row.website_clicks,
          avgTimeOnPage: row.avg_time_on_page,
          totalTimeOnPage: row.total_time_on_page,
          scrollDepthAvg: row.scroll_depth_avg,
          topHours: row.top_hours ? JSON.parse(row.top_hours) : {},
          deviceBreakdown: row.device_breakdown ? JSON.parse(row.device_breakdown) : {},
          regionBreakdown: row.region_breakdown ? JSON.parse(row.region_breakdown) : {},
        })),
      };

      // Include raw events if requested
      if (includeEvents) {
        const events = db.prepare(`
          SELECT * FROM analytics_events
          WHERE pathname LIKE ?
            AND DATE(timestamp) >= ?
            AND DATE(timestamp) <= ?
          ORDER BY timestamp DESC
          LIMIT 1000
        `).all(`/business/${business.slug}%`, startDateStr, endDateStr) as any[];

        exportData.events = events.map(e => ({
          id: e.id,
          event: e.event,
          sessionId: e.session_id,
          userId: e.user_id,
          url: e.url,
          pathname: e.pathname,
          referrer: e.referrer,
          deviceType: e.device_type,
          browser: e.browser,
          region: e.region,
          country: e.country,
          city: e.city,
          metadata: e.metadata ? JSON.parse(e.metadata) : {},
          timestamp: e.timestamp,
        }));
      }

      const filename = `${business.slug}-analytics-${startDateStr}-to-${endDateStr}.json`;

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
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

      exportData = {
        platform: 'LYNKS Portal',
        dateRange: {
          start: startDateStr,
          end: endDateStr,
        },
        analytics: analytics.map(row => ({
          date: row.date,
          totalVisitors: row.total_visitors,
          uniqueVisitors: row.unique_visitors,
          pageViews: row.page_views,
          activeSessions: row.active_sessions,
          topBusinesses: row.top_businesses ? JSON.parse(row.top_businesses) : [],
          topCategories: row.top_categories ? JSON.parse(row.top_categories) : [],
          deviceBreakdown: row.device_breakdown ? JSON.parse(row.device_breakdown) : {},
          browserBreakdown: row.browser_breakdown ? JSON.parse(row.browser_breakdown) : {},
          regionBreakdown: row.region_breakdown ? JSON.parse(row.region_breakdown) : {},
          peakHours: row.peak_hours ? JSON.parse(row.peak_hours) : {},
        })),
      };

      // Include raw events if requested
      if (includeEvents) {
        const events = db.prepare(`
          SELECT * FROM analytics_events
          WHERE DATE(timestamp) >= ?
            AND DATE(timestamp) <= ?
          ORDER BY timestamp DESC
          LIMIT 5000
        `).all(startDateStr, endDateStr) as any[];

        exportData.events = events.map(e => ({
          id: e.id,
          event: e.event,
          sessionId: e.session_id,
          userId: e.user_id,
          url: e.url,
          pathname: e.pathname,
          referrer: e.referrer,
          deviceType: e.device_type,
          browser: e.browser,
          region: e.region,
          country: e.country,
          city: e.city,
          metadata: e.metadata ? JSON.parse(e.metadata) : {},
          timestamp: e.timestamp,
        }));
      }

      const filename = `platform-analytics-${startDateStr}-to-${endDateStr}.json`;

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('JSON export error:', error);
    return NextResponse.json(
      { error: 'Failed to export JSON' },
      { status: 500 }
    );
  }
}
