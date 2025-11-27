# ✅ Business Page Template - Complete Redesign

## 🎯 New Professional Template Structure

Based on the Mrs Tangs template image, I've completely redesigned the business page with a clean, structured layout.

---

## 📋 Template Sections (In Order)

### Black Outer Card Container
All sections are contained within a black rounded card with white section headings and white content areas.

### 1. **Logo** (Top)
- Centered company logo
- Large, clear display
- No background effects

### 2. **Category**
- **Heading**: White text on black background
- **Content**: White card showing category and business type
- Clean, simple display

### 3. **Description**
- **Heading**: "DESCRIPTION" in white
- **Content**: White card with full business description
- Includes tagline if available
- Professional typography

### 4. **Our Services**
- **Heading**: "OUR SERVICES" in white
- **Content**: White card with bulleted list
- Shows all services with icons
- Clean, readable format

### 5. **Quick Access**
- **Heading**: "QUICK ACCESS" in white
- **Content**: Colored button links (using primary color)
- One button per custom link
- Full-width rounded buttons
- Direct links to actions (Order Online, View Menu, etc.)

### 6. **Our Menus** (Restaurants Only)
- **Heading**: "OUR MENUS" in white
- **Content**: White card with 2x2 grid of menu images
- Only shows for food/restaurant businesses
- Hover zoom effect on images

### 7. **Our Gallery**
- **Heading**: "OUR GALLERY" in white
- **Content**: White card with 2x2 grid of images
- Shows business photos
- Hover zoom effect
- Rounded corners

### 8. **Our Location**
- **Heading**: "OUR LOCATION" in white
- **Content**: White card with:
  - Address with map pin icon
  - Embedded Google Maps
  - Interactive map view

### 9. **Our Hours**
- **Heading**: "OUR HOURS" in white
- **Content**: White card showing:
  - Monday through Sunday
  - Opening and closing times
  - Clean two-column layout

### 10. **Social Media**
- **Heading**: "SOCIAL MEDIA" in white
- **Content**: Colored circular icons
- Platform-specific colors (Facebook blue, Instagram pink, etc.)
- Centered layout
- Hover scale effect

### 11. **Get In Touch**
- **Heading**: "GET IN TOUCH" in white
- **Content**: White card with contact methods:
  - Phone number (clickable)
  - Email address (clickable)
  - Website link (clickable)
  - Icons for each contact method

### 12. **Footer**
- "Powered by LYNKS Portal" text
- Centered at bottom
- Gray text with lime-green brand name

---

## 🎨 Design Specifications

### Color Scheme:
- **Outer Card**: Black (`#000000`)
- **Section Headings**: White text on black background
- **Content Cards**: White background (`#FFFFFF`)
- **Text**: Dark gray/black on white cards
- **Buttons**: Business primary color
- **Social Icons**: Platform-specific colors

### Layout:
- **Max Width**: 448px (max-w-md)
- **Padding**: 24px (p-6)
- **Spacing**: 24px between sections (space-y-6)
- **Border Radius**: 24px (rounded-3xl)
- **Card Radius**: 12px (rounded-xl)

### Typography:
- **Section Headings**: 18px, bold, uppercase, white
- **Content Text**: 16px, medium weight, dark gray
- **Buttons**: 16px, bold, white on colored background

---

## 📱 Responsive Design

### Mobile-First:
- Single column layout
- Full-width sections
- Touch-friendly buttons (48px height)
- Readable text sizes

### Grid Layouts:
- Gallery: 2x2 grid
- Menus: 2x2 grid
- Hours: Two-column (day | time)

---

## 🔧 Technical Implementation

### File Structure:
```
app/
  business/
    [slug]/
      page.tsx  ← New template
```

### Key Features:
1. **Conditional Sections**: Menu section only shows for restaurants
2. **Dynamic Content**: All content from database
3. **Placeholder Images**: Gallery uses Unsplash placeholders
4. **Google Maps**: Embedded map with address
5. **Social Icons**: Platform-specific colors and icons
6. **Clickable Links**: Phone, email, website all clickable
7. **Hover Effects**: Subtle animations on interactive elements

### Data Sources:
- **Logo**: `business.logo_url`
- **Category**: `business.category_name`, `business.business_type_name`
- **Description**: `business.description`, `business.tagline`
- **Services**: `business.customLinks` (displayed as list)
- **Quick Access**: `business.customLinks` (as buttons)
- **Gallery**: Placeholder images (to be replaced with real gallery data)
- **Location**: `business.address`, `business.city`, `business.postcode`
- **Hours**: Mock data (to be replaced with real hours data)
- **Social**: `business.socialLinks`
- **Contact**: `business.phone`, `business.email`, `business.website_url`

---

## 🎯 Differences from Old Template

### Old Template:
- ❌ Cover image with overlay
- ❌ Floating profile card
- ❌ Glassmorphism effects
- ❌ Neon glow animations
- ❌ Scattered layout
- ❌ No clear structure

### New Template:
- ✅ Clean black card container
- ✅ White section headings
- ✅ White content cards
- ✅ Structured sections
- ✅ Professional appearance
- ✅ Easy to scan
- ✅ Mobile-optimized

---

## 📊 Section Visibility Logic

### Always Show:
- Logo
- Category
- Description
- Quick Access
- Gallery
- Location
- Hours
- Get In Touch
- Footer

### Conditional:
- **Our Services**: Only if `customLinks` exist
- **Our Menus**: Only if restaurant/food business
- **Social Media**: Only if `socialLinks` exist

---

## 🚀 Future Enhancements

### To Add:
1. **Real Gallery**: Upload and manage gallery images
2. **Real Hours**: Database table for business hours
3. **Menu Items**: Detailed menu with prices (for restaurants)
4. **Reviews**: Customer testimonials section
5. **Booking**: Appointment/reservation system
6. **Team**: Staff/team members section
7. **Pricing**: Service pricing table
8. **FAQ**: Frequently asked questions

### Database Changes Needed:
```sql
-- Gallery table
CREATE TABLE gallery_images (
  id INTEGER PRIMARY KEY,
  business_id INTEGER,
  image_url TEXT,
  caption TEXT,
  display_order INTEGER
);

-- Business hours table
CREATE TABLE business_hours (
  id INTEGER PRIMARY KEY,
  business_id INTEGER,
  day_of_week TEXT,
  open_time TEXT,
  close_time TEXT,
  is_closed BOOLEAN
);

-- Menu items table (for restaurants)
CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY,
  business_id INTEGER,
  name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,
  image_url TEXT
);
```

---

## 🎨 Example Business Pages

### Restaurant (Taste of Thai):
- Shows: Logo, Category, Description, Services, Quick Access, **Menus**, Gallery, Location, Hours, Social, Contact
- Red & Gold theme
- Menu section visible

### Bicycle Shop (Limitless Cycles):
- Shows: Logo, Category, Description, Services, Quick Access, Gallery, Location, Hours, Social, Contact
- Orange & Blue theme
- No menu section

### Fitness Gym (Ministry Fitness):
- Shows: Logo, Category, Description, Services, Quick Access, Gallery, Location, Hours, Social, Contact
- Red & Navy theme
- No menu section

---

## ✅ Result

The business page now has:
- ✅ **Professional structure** - Clear, organized sections
- ✅ **Clean design** - Black card with white sections
- ✅ **Easy to scan** - Logical flow from top to bottom
- ✅ **Mobile-optimized** - Perfect for phone viewing
- ✅ **Consistent styling** - Matches the template image
- ✅ **All required sections** - Complete business information
- ✅ **Conditional content** - Shows relevant sections only
- ✅ **Interactive elements** - Clickable links and buttons

**The template now matches the professional Mrs Tangs design!** 🎨
