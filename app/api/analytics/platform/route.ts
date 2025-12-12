import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get platform analytics
    const platformAnalytics = await query(`
      SELECT * FROM platform_analytics
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `, [startDateStr, endDateStr]) as any[];

    // Get real-time active sessions (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const activeSessions = await queryOne(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM analytics_events
      WHERE timestamp > ?
    `, [thirtyMinutesAgo]) as any;

    // Get all events for detailed analysis
    const allEvents = await query(`
      SELECT 
        event,
        session_id,
        pathname,
        device_type,
        browser,
        region,
        country,
        timestamp
      FROM analytics_events
      WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ?
    `, [startDateStr, endDateStr]) as any[];

    // Calculate summary metrics
    const totalVisitors = allEvents.length;
    const uniqueVisitors = new Set(allEvents.map(e => e.session_id)).size;
    const pageViews = allEvents.filter(e => e.event === 'page_view').length;

    // Most viewed businesses
    const businessViews: Record<string, number> = {};
    allEvents.forEach(e => {
      if (e.pathname.startsWith('/business/')) {
        const slug = e.pathname.split('/')[2];
        if (slug) {
          businessViews[slug] = (businessViews[slug] || 0) + 1;
        }
      }
    });

    const topBusinesses = await Promise.all(
      Object.entries(businessViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(async ([slug, views]) => {
          const business = await queryOne('SELECT id, business_name, slug FROM businesses WHERE slug = ?', [slug]) as any;
          return {
            id: business?.id,
            name: business?.business_name || slug,
            slug,
            views,
          };
        })
    );

    // Top categories
    const categoryViews: Record<string, number> = {};
    const businesses = await query('SELECT slug, category_id FROM businesses') as any[];
    const categories = await query('SELECT id, name FROM categories') as any[];
    
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));
    const businessCategoryMap = new Map(businesses.map((b: any) => [b.slug, b.category_id]));

    allEvents.forEach(e => {
      if (e.pathname.startsWith('/business/')) {
        const slug = e.pathname.split('/')[2];
        const categoryId = businessCategoryMap.get(slug);
        if (categoryId) {
          const categoryName = categoryMap.get(categoryId) || 'Unknown';
          categoryViews[categoryName] = (categoryViews[categoryName] || 0) + 1;
        }
      }
    });

    const topCategories = Object.entries(categoryViews)
      .sort(([, a], [, b]) => b - a)
      .map(([name, views]) => ({ name, views }));

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {};
    allEvents.forEach(e => {
      if (e.device_type) {
        deviceBreakdown[e.device_type] = (deviceBreakdown[e.device_type] || 0) + 1;
      }
    });

    // Browser breakdown
    const browserBreakdown: Record<string, number> = {};
    allEvents.forEach(e => {
      if (e.browser) {
        browserBreakdown[e.browser] = (browserBreakdown[e.browser] || 0) + 1;
      }
    });

    // Region breakdown
    const regionBreakdown: Record<string, number> = {};
    allEvents.forEach(e => {
      if (e.region) {
        regionBreakdown[e.region] = (regionBreakdown[e.region] || 0) + 1;
      }
    });

    // Country breakdown
    const countryBreakdown: Record<string, number> = {};
    allEvents.forEach(e => {
      if (e.country) {
        countryBreakdown[e.country] = (countryBreakdown[e.country] || 0) + 1;
      }
    });

    // Peak hours
    const peakHours: Record<number, number> = {};
    allEvents.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    // Funnel analysis
    const homepageViews = allEvents.filter(e => e.pathname === '/' && e.event === 'page_view').length;
    const businessPageViews = allEvents.filter(e => e.pathname.startsWith('/business/') && e.event === 'page_view').length;
    const contactActions = allEvents.filter(e => 
      ['business_call', 'business_email', 'business_whatsapp', 'business_website_click'].includes(e.event)
    ).length;

    const funnel = [
      { stage: 'Homepage', count: homepageViews, percentage: 100 },
      { 
        stage: 'Business View', 
        count: businessPageViews, 
        percentage: homepageViews > 0 ? (businessPageViews / homepageViews * 100).toFixed(1) : 0 
      },
      { 
        stage: 'Contact Action', 
        count: contactActions, 
        percentage: businessPageViews > 0 ? (contactActions / businessPageViews * 100).toFixed(1) : 0 
      },
    ];

    // Daily data for charts
    const dailyData = platformAnalytics.map(a => ({
      date: a.date,
      visitors: a.unique_visitors,
      pageViews: a.page_views,
    }));

    // Fill in missing dates
    const dateMap = new Map(dailyData.map(d => [d.date, d]));
    const filledDailyData = [];
    const currentDate = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      filledDailyData.push(dateMap.get(dateStr) || {
        date: dateStr,
        visitors: 0,
        pageViews: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      summary: {
        totalVisitors,
        uniqueVisitors,
        pageViews,
        activeSessions: activeSessions.count || 0,
      },
      topBusinesses,
      topCategories,
      deviceBreakdown,
      browserBreakdown,
      regionBreakdown,
      countryBreakdown,
      peakHours,
      funnel,
      dailyData: filledDailyData,
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform analytics' },
      { status: 500 }
    );
  }
}
