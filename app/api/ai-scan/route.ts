import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('Scanning website:', url);

    // Fetch the website HTML
    let html;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`);
      }
      
      html = await response.text();
    } catch (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Unable to access the website. Please check the URL and try again.' },
        { status: 400 }
      );
    }

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Extract business name from title or h1
    let businessName = $('title').text().trim();
    if (!businessName || businessName.length > 100) {
      businessName = $('h1').first().text().trim() || 'Business Name';
    }
    // Clean up common title suffixes
    businessName = businessName.replace(/\s*[\|\-–]\s*.*/g, '').trim();

    // Extract tagline from meta description or first h2
    let tagline = $('meta[name="description"]').attr('content') || 
                  $('h2').first().text().trim() || '';
    tagline = tagline.substring(0, 100);

    // Extract description from meta description or first paragraph
    let description = $('meta[name="description"]').attr('content') || 
                      $('p').first().text().trim() || 
                      'Professional services tailored to your needs.';
    description = description.substring(0, 300);

    // Extract logo - look for common logo patterns
    let logoUrl = '';
    const logoSelectors = [
      'img[alt*="logo" i]',
      'img[class*="logo" i]',
      'img[id*="logo" i]',
      '.logo img',
      '#logo img',
      'header img',
      '.navbar-brand img'
    ];
    
    for (const selector of logoSelectors) {
      const img = $(selector).first();
      if (img.length) {
        logoUrl = img.attr('src') || '';
        break;
      }
    }
    
    // Convert relative URL to absolute
    if (logoUrl && !logoUrl.startsWith('http')) {
      logoUrl = new URL(logoUrl, parsedUrl.origin).href;
    }

    // Extract cover/hero image
    let coverImageUrl = '';
    const coverSelectors = [
      'img[class*="hero" i]',
      'img[class*="banner" i]',
      'img[class*="cover" i]',
      '.hero img',
      '.banner img',
      'section img'
    ];
    
    for (const selector of coverSelectors) {
      const img = $(selector).first();
      if (img.length) {
        coverImageUrl = img.attr('src') || '';
        break;
      }
    }
    
    if (coverImageUrl && !coverImageUrl.startsWith('http')) {
      coverImageUrl = new URL(coverImageUrl, parsedUrl.origin).href;
    }

    // Extract social media links
    const socialLinks: any[] = [];
    const socialPlatforms = {
      'facebook.com': 'facebook',
      'instagram.com': 'instagram',
      'twitter.com': 'twitter',
      'linkedin.com': 'linkedin',
      'youtube.com': 'youtube',
      'tiktok.com': 'tiktok'
    };

    $('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="youtube.com"], a[href*="tiktok.com"]').each((_: number, el: any) => {
      const href = $(el).attr('href');
      if (href) {
        for (const [domain, platform] of Object.entries(socialPlatforms)) {
          if (href.includes(domain) && !socialLinks.find(l => l.platform === platform)) {
            socialLinks.push({ platform, url: href });
            break;
          }
        }
      }
    });

    // Extract contact information
    let phone = '';
    let email = '';
    let address = '';

    // Phone - look for tel: links or common patterns
    $('a[href^="tel:"]').each((_: number, el: any) => {
      if (!phone) {
        phone = $(el).attr('href')?.replace('tel:', '') || '';
      }
    });
    
    if (!phone) {
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const bodyText = $('body').text();
      const match = bodyText.match(phoneRegex);
      if (match) phone = match[0];
    }

    // Email - look for mailto: links
    $('a[href^="mailto:"]').each((_: number, el: any) => {
      if (!email) {
        email = $(el).attr('href')?.replace('mailto:', '') || '';
      }
    });

    // Address - look for common patterns
    $('[class*="address" i], [id*="address" i]').each((_: number, el: any) => {
      if (!address) {
        address = $(el).text().trim();
      }
    });

    // Extract custom links (CTAs)
    const customLinks: any[] = [];
    const ctaKeywords = ['order', 'book', 'menu', 'contact', 'shop', 'buy', 'reserve', 'appointment'];
    
    $('a').each((_: number, el: any) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr('href');
      
      if (href && customLinks.length < 5) {
        for (const keyword of ctaKeywords) {
          if (text.includes(keyword) && href.startsWith('http')) {
            const icon = keyword === 'order' ? '🛒' :
                        keyword === 'book' || keyword === 'reserve' || keyword === 'appointment' ? '📅' :
                        keyword === 'menu' ? '📋' :
                        keyword === 'contact' ? '📧' :
                        keyword === 'shop' || keyword === 'buy' ? '🛍️' : '🔗';
            
            customLinks.push({
              title: $(el).text().trim().substring(0, 30),
              url: href,
              icon
            });
            break;
          }
        }
      }
    });

    // Extract services - look for service lists
    const services: string[] = [];
    const serviceKeywords = ['service', 'offering', 'what we do', 'our services'];
    
    $('ul, ol').each((_: number, list: any) => {
      const listText = $(list).text().toLowerCase();
      const hasServiceKeyword = serviceKeywords.some(keyword => 
        $(list).prev().text().toLowerCase().includes(keyword) ||
        $(list).parent().text().toLowerCase().includes(keyword)
      );
      
      if (hasServiceKeyword && services.length < 10) {
        $(list).find('li').each((_: number, item: any) => {
          const serviceText = $(item).text().trim();
          if (serviceText && serviceText.length < 100 && services.length < 10) {
            services.push(serviceText);
          }
        });
      }
    });

    // Extract gallery images - look for image galleries
    const galleryImages: any[] = [];
    const gallerySelectors = [
      '.gallery img',
      '[class*="gallery" i] img',
      '[id*="gallery" i] img',
      '.portfolio img',
      '[class*="portfolio" i] img'
    ];
    
    for (const selector of gallerySelectors) {
      $(selector).each((_: number, img: any) => {
        if (galleryImages.length < 8) {
          let imgUrl = $(img).attr('src') || '';
          if (imgUrl && !imgUrl.startsWith('http')) {
            imgUrl = new URL(imgUrl, parsedUrl.origin).href;
          }
          if (imgUrl && !galleryImages.find(g => g.url === imgUrl)) {
            galleryImages.push({
              url: imgUrl,
              caption: $(img).attr('alt') || ''
            });
          }
        }
      });
      if (galleryImages.length >= 4) break;
    }

    // Extract business hours - look for hours/schedule
    const businessHours: any[] = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hoursText = $('body').text();
    
    // Try to find hours section
    $('[class*="hours" i], [id*="hours" i], [class*="schedule" i]').each((_: number, el: any) => {
      const text = $(el).text();
      daysOfWeek.forEach(day => {
        if (text.includes(day) && businessHours.length < 7) {
          // Try to extract time pattern (e.g., "9:00 AM - 5:00 PM" or "9am-5pm")
          const dayRegex = new RegExp(`${day}[:\\s]*([\\d:]+\\s*[ap]m?\\s*[-–]\\s*[\\d:]+\\s*[ap]m?|closed)`, 'i');
          const match = text.match(dayRegex);
          
          if (match) {
            const timeStr = match[1].toLowerCase();
            if (timeStr.includes('closed')) {
              businessHours.push({
                day,
                open: '',
                close: '',
                closed: true
              });
            } else {
              // Parse times (simplified - just extract the pattern)
              const times = timeStr.match(/[\d:]+/g);
              if (times && times.length >= 2) {
                businessHours.push({
                  day,
                  open: times[0].includes(':') ? times[0] : `${times[0]}:00`,
                  close: times[1].includes(':') ? times[1] : `${times[1]}:00`,
                  closed: false
                });
              }
            }
          }
        }
      });
    });

    const scannedData = {
      businessName: businessName || 'Business Name',
      tagline: tagline || '',
      description: description || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      logoUrl: logoUrl || '',
      coverImageUrl: coverImageUrl || '',
      socialLinks: socialLinks.length > 0 ? socialLinks : [],
      customLinks: customLinks.length > 0 ? customLinks : [],
      services: services.length > 0 ? services : [],
      galleryImages: galleryImages.length > 0 ? galleryImages : [],
      businessHours: businessHours.length > 0 ? businessHours : []
    };

    console.log('Scan results:', scannedData);

    return NextResponse.json(scannedData);
  } catch (error) {
    console.error('AI scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan website. Please try again.' },
      { status: 500 }
    );
  }
}
