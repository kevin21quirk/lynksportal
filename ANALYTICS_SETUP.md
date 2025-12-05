# Analytics System Setup Instructions

## Required Dependencies

Install the following package for charts:

```bash
npm install recharts
```

## Database Migration

The analytics tables have been added to the database schema. They will be created automatically when the server starts.

## Features Implemented

### 1. Frontend Tracking (`/public/tracking.js`)
- Page views
- Button clicks
- Scroll depth
- Time on page
- Business interactions (calls, emails, WhatsApp, website clicks)
- GPS location (optional, with user permission)
- Device and browser detection
- Session management

### 2. Tracking API (`/api/track`)
- Receives tracking events
- IP geolocation
- Stores events in database
- Real-time aggregation

### 3. Database Tables
- `analytics_events` - Raw event data
- `business_analytics` - Aggregated business metrics
- `platform_analytics` - Platform-wide metrics

### 4. Business Analytics Dashboard (`/dashboard/analytics/[businessId]`)
- Total views and unique visitors
- Average time on page
- Actions breakdown (calls, emails, WhatsApp, website clicks)
- Device breakdown (pie chart)
- Daily views chart (line chart)
- Peak hours (bar chart)
- Top regions
- Export to CSV/JSON

### 5. Admin Analytics Dashboard (`/admin/analytics`)
- Platform-wide metrics
- Most viewed businesses
- Top categories
- Active sessions
- Device and browser breakdown
- Regional heatmap
- Search analytics

### 6. Export API (`/api/analytics/export/[format]`)
- CSV export
- JSON export
- Filtered by business and date range

## Usage

### For Business Owners
Navigate to: `/dashboard/analytics/[businessId]`

### For Admins
Navigate to: `/admin/analytics`

## Tracking Events

The tracking script automatically captures:
- `page_view` - When a page loads
- `click` - General clicks
- `business_call` - Phone number clicks
- `business_email` - Email clicks
- `business_whatsapp` - WhatsApp clicks
- `business_website_click` - External website clicks
- `scroll_depth` - 25%, 50%, 75%, 100%
- `heartbeat` - Every 15 seconds (time tracking)
- `page_exit` - When leaving the page

### Manual Tracking

You can manually track custom events:

```javascript
window.lynksTrack('custom_event', {
  customData: 'value'
});
```

## Privacy & GDPR

- GPS location is optional and requires user permission
- IP addresses are stored for geolocation but can be anonymized
- Session IDs are cookie-based with 30-minute expiry
- All tracking respects browser Do Not Track settings (can be implemented)

## Performance

- Uses `navigator.sendBeacon()` for reliable tracking
- Async aggregation doesn't block requests
- Indexed database queries for fast analytics
- Cached results for dashboard performance
