import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Verify business exists
    const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(businessId) as any;
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get aggregated analytics
    const analytics = db.prepare(`
      SELECT * FROM business_analytics
      WHERE business_id = ?
        AND date >= ?
        AND date <= ?
      ORDER BY date ASC
    `).all(businessId, startDateStr, endDateStr) as any[];

    // Get raw events for detailed analysis
    const businessSlug = business.slug;
    const events = db.prepare(`
      SELECT 
        event,
        session_id,
        device_type,
        browser,
        region,
        country,
        city,
        metadata,
        timestamp
      FROM analytics_events
      WHERE pathname LIKE ?
        AND DATE(timestamp) >= ?
        AND DATE(timestamp) <= ?
      ORDER BY timestamp DESC
      LIMIT 1000
    `).all(`/business/${businessSlug}%`, startDateStr, endDateStr) as any[];

    // Calculate summary metrics
    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const uniqueVisitors = new Set(events.map(e => e.session_id)).size;
    const totalCalls = analytics.reduce((sum, a) => sum + a.calls, 0);
    const totalEmails = analytics.reduce((sum, a) => sum + a.emails, 0);
    const totalWhatsApp = analytics.reduce((sum, a) => sum + a.whatsapp, 0);
    const totalWebsiteClicks = analytics.reduce((sum, a) => sum + a.website_clicks, 0);

    // Calculate average time on page
    const avgTimeOnPage = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.avg_time_on_page, 0) / analytics.length
      : 0;

    // Aggregate device breakdown
    const deviceBreakdown: Record<string, number> = {};
    analytics.forEach(a => {
      if (a.device_breakdown) {
        try {
          const devices = JSON.parse(a.device_breakdown);
          if (devices && typeof devices === 'object') {
            Object.entries(devices).forEach(([device, count]) => {
              deviceBreakdown[device] = (deviceBreakdown[device] || 0) + (count as number);
            });
          }
        } catch (e) {}
      }
    });

    // If no device data from analytics, get from raw events
    if (Object.keys(deviceBreakdown).length === 0) {
      events.forEach(e => {
        if (e.device_type) {
          deviceBreakdown[e.device_type] = (deviceBreakdown[e.device_type] || 0) + 1;
        }
      });
    }

    // Aggregate region breakdown
    const regionBreakdown: Record<string, number> = {};
    analytics.forEach(a => {
      if (a.region_breakdown) {
        try {
          const regions = JSON.parse(a.region_breakdown);
          if (regions && typeof regions === 'object') {
            Object.entries(regions).forEach(([region, count]) => {
              regionBreakdown[region] = (regionBreakdown[region] || 0) + (count as number);
            });
          }
        } catch (e) {}
      }
    });

    // If no region data from analytics, get from raw events
    if (Object.keys(regionBreakdown).length === 0) {
      events.forEach(e => {
        if (e.region) {
          regionBreakdown[e.region] = (regionBreakdown[e.region] || 0) + 1;
        }
      });
    }

    // Aggregate peak hours
    const peakHours: Record<number, number> = {};
    analytics.forEach(a => {
      if (a.top_hours) {
        try {
          const hours = JSON.parse(a.top_hours);
          if (hours && typeof hours === 'object') {
            Object.entries(hours).forEach(([hour, count]) => {
              peakHours[parseInt(hour)] = (peakHours[parseInt(hour)] || 0) + (count as number);
            });
          }
        } catch (e) {}
      }
    });

    // If no peak hours data from analytics, get from raw events
    if (Object.keys(peakHours).length === 0) {
      events.forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        peakHours[hour] = (peakHours[hour] || 0) + 1;
      });
    }

    // Get top actions
    const actions = [
      { type: 'Calls', count: totalCalls, icon: '📞' },
      { type: 'Emails', count: totalEmails, icon: '✉️' },
      { type: 'WhatsApp', count: totalWhatsApp, icon: '💬' },
      { type: 'Website Clicks', count: totalWebsiteClicks, icon: '🌐' },
    ].sort((a, b) => b.count - a.count);

    // Prepare daily data for charts
    const dailyData = analytics.map(a => ({
      date: a.date,
      views: a.views,
      visitors: a.unique_visitors,
      actions: a.calls + a.emails + a.whatsapp + a.website_clicks,
    }));

    return NextResponse.json({
      summary: {
        totalViews,
        uniqueVisitors,
        avgTimeOnPage: Math.round(avgTimeOnPage),
        totalActions: totalCalls + totalEmails + totalWhatsApp + totalWebsiteClicks,
      },
      actions,
      deviceBreakdown,
      regionBreakdown,
      peakHours,
      dailyData,
      analytics,
      recentEvents: events.slice(0, 50),
    });
  } catch (error) {
    console.error('Business analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
