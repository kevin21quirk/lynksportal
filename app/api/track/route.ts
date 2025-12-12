import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { randomUUID } from 'crypto';

// IP Geolocation helper (using ip-api.com free tier)
async function getLocationFromIP(ip: string) {
  try {
    // Skip localhost/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        region: 'Local',
        country: 'Local',
        city: 'Local',
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) throw new Error('Geolocation API failed');

    const data = await response.json();

    if (data.status === 'success') {
      return {
        region: data.regionName || null,
        country: data.country || null,
        city: data.city || null,
        latitude: data.lat || null,
        longitude: data.lon || null,
      };
    }

    return {};
  } catch (error) {
    console.error('IP geolocation error:', error);
    return {};
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }

  // Fallback to localhost
  return '127.0.0.1';
}

// Aggregate business analytics
async function aggregateBusinessAnalytics(businessId: number, date: string) {
  try {
    const businessSlugPattern = `/business/%`;
    
    // Get all events for this business on this date
    const events = await query(`
      SELECT 
        event,
        session_id,
        device_type,
        region,
        metadata,
        timestamp
      FROM analytics_events
      WHERE pathname LIKE ?
        AND DATE(timestamp) = ?
    `, [businessSlugPattern, date]) as any[];

    if (events.length === 0) return;

    // Calculate metrics
    const uniqueVisitors = new Set(events.map(e => e.session_id)).size;
    const views = events.filter(e => e.event === 'page_view').length;
    const calls = events.filter(e => e.event === 'business_call').length;
    const emails = events.filter(e => e.event === 'business_email').length;
    const whatsapp = events.filter(e => e.event === 'business_whatsapp').length;
    const websiteClicks = events.filter(e => e.event === 'business_website_click').length;

    // Calculate average time on page
    const heartbeats = events.filter(e => e.event === 'heartbeat');
    const totalTime = heartbeats.reduce((sum, e) => {
      try {
        const meta = JSON.parse(e.metadata || '{}');
        return sum + (meta.timeOnPage || 0);
      } catch {
        return sum;
      }
    }, 0);
    const avgTimeOnPage = heartbeats.length > 0 ? totalTime / heartbeats.length : 0;

    // Calculate average scroll depth
    const scrollEvents = events.filter(e => e.event === 'scroll_depth');
    const scrollDepthAvg = scrollEvents.length > 0
      ? scrollEvents.reduce((sum, e) => {
          try {
            const meta = JSON.parse(e.metadata || '{}');
            return sum + (meta.depth || 0);
          } catch {
            return sum;
          }
        }, 0) / scrollEvents.length
      : 0;

    // Top hours
    const hourCounts: Record<number, number> = {};
    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.device_type) {
        deviceCounts[e.device_type] = (deviceCounts[e.device_type] || 0) + 1;
      }
    });

    // Region breakdown
    const regionCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.region) {
        regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
      }
    });

    // Upsert aggregated data
    await execute(`
      INSERT INTO business_analytics (
        business_id, date, views, unique_visitors, calls, emails, whatsapp,
        website_clicks, avg_time_on_page, total_time_on_page, scroll_depth_avg,
        top_hours, device_breakdown, region_breakdown, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(business_id, date) DO UPDATE SET
        views = excluded.views,
        unique_visitors = excluded.unique_visitors,
        calls = excluded.calls,
        emails = excluded.emails,
        whatsapp = excluded.whatsapp,
        website_clicks = excluded.website_clicks,
        avg_time_on_page = excluded.avg_time_on_page,
        total_time_on_page = excluded.total_time_on_page,
        scroll_depth_avg = excluded.scroll_depth_avg,
        top_hours = excluded.top_hours,
        device_breakdown = excluded.device_breakdown,
        region_breakdown = excluded.region_breakdown,
        updated_at = CURRENT_TIMESTAMP
    `, [
      businessId,
      date,
      views,
      uniqueVisitors,
      calls,
      emails,
      whatsapp,
      websiteClicks,
      avgTimeOnPage,
      totalTime,
      scrollDepthAvg,
      JSON.stringify(hourCounts),
      JSON.stringify(deviceCounts),
      JSON.stringify(regionCounts)
    ]);
  } catch (error) {
    console.error('Error aggregating business analytics:', error);
  }
}

// Aggregate platform analytics
async function aggregatePlatformAnalytics(date: string) {
  try {
    const events = await query(`
      SELECT 
        event,
        session_id,
        pathname,
        device_type,
        browser,
        region,
        timestamp
      FROM analytics_events
      WHERE DATE(timestamp) = ?
    `, [date]) as any[];

    if (events.length === 0) return;

    const uniqueVisitors = new Set(events.map(e => e.session_id)).size;
    const pageViews = events.filter(e => e.event === 'page_view').length;

    // Count active sessions (sessions with activity in last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const recentSessions = new Set(
      events.filter(e => e.timestamp > thirtyMinutesAgo).map(e => e.session_id)
    );

    // Top businesses
    const businessViews: Record<string, number> = {};
    events.forEach(e => {
      if (e.pathname.startsWith('/business/')) {
        const slug = e.pathname.split('/')[2];
        if (slug) {
          businessViews[slug] = (businessViews[slug] || 0) + 1;
        }
      }
    });

    const topBusinesses = Object.entries(businessViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([slug, views]) => ({ slug, views }));

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.device_type) {
        deviceCounts[e.device_type] = (deviceCounts[e.device_type] || 0) + 1;
      }
    });

    // Browser breakdown
    const browserCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.browser) {
        browserCounts[e.browser] = (browserCounts[e.browser] || 0) + 1;
      }
    });

    // Region breakdown
    const regionCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.region) {
        regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
      }
    });

    // Peak hours
    const hourCounts: Record<number, number> = {};
    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Upsert platform analytics
    await execute(`
      INSERT INTO platform_analytics (
        date, total_visitors, unique_visitors, page_views, active_sessions,
        top_businesses, device_breakdown, browser_breakdown, region_breakdown,
        peak_hours, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(date) DO UPDATE SET
        total_visitors = excluded.total_visitors,
        unique_visitors = excluded.unique_visitors,
        page_views = excluded.page_views,
        active_sessions = excluded.active_sessions,
        top_businesses = excluded.top_businesses,
        device_breakdown = excluded.device_breakdown,
        browser_breakdown = excluded.browser_breakdown,
        region_breakdown = excluded.region_breakdown,
        peak_hours = excluded.peak_hours,
        updated_at = CURRENT_TIMESTAMP
    `, [
      date,
      events.length,
      uniqueVisitors,
      pageViews,
      recentSessions.size,
      JSON.stringify(topBusinesses),
      JSON.stringify(deviceCounts),
      JSON.stringify(browserCounts),
      JSON.stringify(regionCounts),
      JSON.stringify(hourCounts)
    ]);
  } catch (error) {
    console.error('Error aggregating platform analytics:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event,
      sessionId,
      userId,
      url,
      pathname,
      referrer,
      userAgent,
      timestamp,
      metadata = {},
    } = body;

    // Validate required fields
    if (!event || !sessionId || !url || !pathname) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP
    const ipAddress = getClientIP(request);

    // Get location from GPS (if provided) or IP
    let location: any = {};
    
    if (metadata.gpsLocation) {
      location = {
        latitude: metadata.gpsLocation.latitude,
        longitude: metadata.gpsLocation.longitude,
      };
    } else {
      location = await getLocationFromIP(ipAddress);
    }

    // Extract device info from metadata
    const deviceInfo = metadata.device || {};

    // Generate event ID
    const eventId = randomUUID();

    // Insert event into database
    await execute(`
      INSERT INTO analytics_events (
        id, event, session_id, user_id, url, pathname, referrer,
        user_agent, ip_address, region, country, city, latitude, longitude,
        device_type, browser, screen_width, screen_height, metadata, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventId,
      event,
      sessionId,
      userId || null,
      url,
      pathname,
      referrer || null,
      userAgent || null,
      ipAddress,
      location.region || null,
      location.country || null,
      location.city || null,
      location.latitude || null,
      location.longitude || null,
      deviceInfo.deviceType || null,
      deviceInfo.browser || null,
      deviceInfo.screenWidth || null,
      deviceInfo.screenHeight || null,
      JSON.stringify(metadata),
      timestamp
    ]);

    // Trigger aggregation for business pages
    if (pathname.startsWith('/business/')) {
      const slug = pathname.split('/')[2];
      if (slug) {
        // Get business ID from slug
        const business = await queryOne('SELECT id FROM businesses WHERE slug = ?', [slug]) as any;
        if (business) {
          const today = new Date().toISOString().split('T')[0];
          // Run aggregation asynchronously (don't wait)
          setImmediate(() => {
            aggregateBusinessAnalytics(business.id, today);
          });
        }
      }
    }

    // Trigger platform analytics aggregation
    const today = new Date().toISOString().split('T')[0];
    setImmediate(() => {
      aggregatePlatformAnalytics(today);
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
