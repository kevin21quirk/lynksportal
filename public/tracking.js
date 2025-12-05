/**
 * LynksPortal Analytics Tracking Module
 * Captures user interactions, page views, and engagement metrics
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiEndpoint: '/api/track',
    sessionCookieName: 'lynks_session_id',
    sessionDuration: 30 * 60 * 1000, // 30 minutes
    scrollDepthThresholds: [25, 50, 75, 100],
    heartbeatInterval: 15000, // 15 seconds
  };

  // State
  let sessionId = null;
  let pageLoadTime = Date.now();
  let scrollDepthTracked = new Set();
  let heartbeatTimer = null;
  let timeOnPage = 0;
  let gpsLocation = null;

  /**
   * Generate or retrieve session ID
   */
  function getSessionId() {
    if (sessionId) return sessionId;

    // Check for existing session cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === CONFIG.sessionCookieName) {
        sessionId = value;
        return sessionId;
      }
    }

    // Generate new session ID
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Set cookie with 30-minute expiry
    const expires = new Date(Date.now() + CONFIG.sessionDuration);
    document.cookie = `${CONFIG.sessionCookieName}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    
    return sessionId;
  }

  /**
   * Get device information
   */
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    // Detect browser
    let browser = 'unknown';
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';

    return {
      deviceType,
      browser,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  }

  /**
   * Request GPS location (optional)
   */
  function requestGPSLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        gpsLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        // Send location update event
        trackEvent('gps_location_granted', {
          location: gpsLocation,
        });
      },
      (error) => {
        console.log('GPS location denied or unavailable:', error.message);
        trackEvent('gps_location_denied', {
          error: error.message,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Send tracking event to server
   */
  function trackEvent(event, metadata = {}) {
    const data = {
      event,
      sessionId: getSessionId(),
      url: window.location.href,
      pathname: window.location.pathname,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      metadata: {
        ...metadata,
        device: getDeviceInfo(),
        gpsLocation,
      },
    };

    // Get userId from localStorage if logged in
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        data.userId = userData.id || userData.email;
      }
    } catch (e) {
      // User not logged in or localStorage unavailable
    }

    // Send using sendBeacon for reliability
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(CONFIG.apiEndpoint, blob);
    } else {
      // Fallback to fetch
      fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(err => console.error('Tracking error:', err));
    }
  }

  /**
   * Track page view
   */
  function trackPageView() {
    pageLoadTime = Date.now();
    timeOnPage = 0;
    scrollDepthTracked.clear();

    trackEvent('page_view', {
      title: document.title,
      loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : null,
    });
  }

  /**
   * Track scroll depth
   */
  function trackScrollDepth() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const scrollPercent = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 100;

    CONFIG.scrollDepthThresholds.forEach(threshold => {
      if (scrollPercent >= threshold && !scrollDepthTracked.has(threshold)) {
        scrollDepthTracked.add(threshold);
        trackEvent('scroll_depth', {
          depth: threshold,
          scrollPercent,
        });
      }
    });
  }

  /**
   * Track time on page (heartbeat)
   */
  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);

    heartbeatTimer = setInterval(() => {
      timeOnPage += CONFIG.heartbeatInterval / 1000; // seconds
      
      trackEvent('heartbeat', {
        timeOnPage,
        isActive: document.visibilityState === 'visible',
      });
    }, CONFIG.heartbeatInterval);
  }

  /**
   * Track button clicks and interactions
   */
  function trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [data-track]');
      if (!target) return;

      const metadata = {
        element: target.tagName,
        text: target.textContent?.trim().substring(0, 100),
        href: target.href || null,
        id: target.id || null,
        className: target.className || null,
      };

      // Track specific business interactions
      if (target.href) {
        if (target.href.startsWith('tel:')) {
          trackEvent('business_call', { phone: target.href.replace('tel:', ''), ...metadata });
        } else if (target.href.startsWith('mailto:')) {
          trackEvent('business_email', { email: target.href.replace('mailto:', ''), ...metadata });
        } else if (target.href.includes('wa.me') || target.href.includes('whatsapp')) {
          trackEvent('business_whatsapp', metadata);
        } else if (target.hostname !== window.location.hostname) {
          trackEvent('business_website_click', metadata);
        }
      }

      // Track custom data attributes
      if (target.dataset.track) {
        trackEvent(target.dataset.track, metadata);
      } else {
        trackEvent('click', metadata);
      }
    }, true);
  }

  /**
   * Track page exit
   */
  function trackPageExit() {
    const exitData = {
      timeOnPage: Math.round((Date.now() - pageLoadTime) / 1000),
      scrollDepth: Math.max(...Array.from(scrollDepthTracked), 0),
    };

    trackEvent('page_exit', exitData);
  }

  /**
   * Check if current page should be tracked
   */
  function shouldTrack() {
    const pathname = window.location.pathname;
    
    // Only track business pages and homepage
    const trackablePages = [
      '/business/',
      '/',
    ];
    
    // Don't track dashboard, admin, login, register pages
    const excludedPages = [
      '/dashboard',
      '/admin',
      '/login',
      '/register',
      '/api',
    ];
    
    // Check if page should be excluded
    for (const excluded of excludedPages) {
      if (pathname.startsWith(excluded)) {
        return false;
      }
    }
    
    // Check if it's homepage
    if (pathname === '/') {
      return true;
    }
    
    // Check if it's a business page
    if (pathname.startsWith('/business/')) {
      return true;
    }
    
    return false;
  }

  /**
   * Initialize tracking
   */
  function init() {
    // Only track if on trackable pages
    if (!shouldTrack()) {
      return;
    }

    sessionId = getSessionId();
    pageLoadTime = Date.now();

    // Track initial page view
    trackEvent('page_view', {
      title: document.title,
      referrer: document.referrer || 'direct',
    });

    // Start heartbeat
    startHeartbeat();

    // Track scroll depth
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 100);
    }, { passive: true });

    // Track clicks
    trackClicks();

    // Track page exit
    window.addEventListener('beforeunload', trackPageExit);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackPageExit();
      }
    });

    // Request GPS location after 2 seconds (non-intrusive)
    setTimeout(() => {
      if (window.location.pathname.includes('/business/')) {
        requestGPSLocation();
      }
    }, 2000);

    // Expose tracking function globally for manual tracking
    window.lynksTrack = trackEvent;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
