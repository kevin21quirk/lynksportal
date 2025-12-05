# 🚀 Analytics System - Quick Start Guide

## Installation (One Command)

```bash
npm install recharts
```

That's it! The database tables are created automatically.

---

## Access Points

### Business Owner Analytics
**URL**: `/dashboard/analytics/[businessId]`

**How to Access**:
1. Login to your dashboard
2. Click the blue "Analytics" button on any business card
3. View your metrics!

### Admin Analytics
**URL**: `/admin/analytics`

**How to Access**:
1. Login to your account
2. Navigate to `/admin/analytics`
3. View platform-wide metrics!

---

## What Gets Tracked Automatically

✅ Every page view  
✅ Every button click  
✅ Phone calls (tel: links)  
✅ Emails (mailto: links)  
✅ WhatsApp clicks  
✅ External website clicks  
✅ Scroll depth (25%, 50%, 75%, 100%)  
✅ Time on page  
✅ Device type (mobile/tablet/desktop)  
✅ Browser type  
✅ Geographic location (via IP)  
✅ GPS location (optional, with permission)  

---

## Key Metrics Available

### Business Dashboards Show:
- 📊 Total views
- 👥 Unique visitors
- ⏱️ Average time on page
- 📞 Calls, emails, WhatsApp clicks
- 📱 Device breakdown
- 🌍 Geographic distribution
- 📈 Daily/weekly trends
- ⏰ Peak hours

### Admin Dashboard Shows:
- 🌐 Platform-wide traffic
- 🔥 Most viewed businesses
- 📊 Top categories
- 💻 Device & browser stats
- 🌍 Country breakdown
- 📉 Conversion funnel
- ⚡ Real-time active sessions

---

## Export Data

Click the **CSV** or **JSON** button on any analytics page to download data.

---

## Manual Event Tracking

Add custom tracking anywhere in your code:

```javascript
window.lynksTrack('button_clicked', {
  buttonName: 'Subscribe',
  location: 'header'
});
```

---

## Testing

1. Visit your site
2. Click around
3. Wait 1 minute
4. Check `/dashboard/analytics/[businessId]`
5. See your data!

---

## Troubleshooting

**No data showing?**
- Wait a few minutes for aggregation
- Check browser console for errors
- Verify tracking.js is loaded

**Charts not displaying?**
- Run: `npm install recharts`
- Restart your dev server

**Need help?**
- Check `ANALYTICS_COMPLETE.md` for full documentation
- Check `ANALYTICS_SETUP.md` for technical details

---

## Quick Commands

```bash
# Install dependencies
npm install recharts

# Start dev server
npm run dev

# Check database
sqlite3 lynks-portal.db "SELECT COUNT(*) FROM analytics_events;"
```

---

**That's it! Your analytics system is ready to go! 🎉**
