# Enhanced Business Card Builder - Isle Dance Template

## Overview
Complete redesign of the business card builder to match the Isle Dance example with full customization capabilities.

## New Features Required

### 1. Color Customization
- **Background Color** (outside card) - Currently using `primary_color`
- **Card Background Color** (inside content boxes) - New field needed
- **Text Color** - Automatic contrast calculation

### 2. New Sections to Add

#### A. Services Section
- Bulleted list with checkmark icons
- Multiple services can be added
- Displayed in white box with heading "OUR SERVICES"

#### B. Call-to-Action Section
- Custom heading (e.g., "JOIN A CLASS")
- Button text (e.g., "BOOK NOW")
- Button URL
- Button style customization

#### C. Policies Section
- Multiple policy documents
- Each policy has:
  - Title (e.g., "WORKSHOP POLICY")
  - PDF/document URL
  - Icon (document icon)
- Displayed as black buttons with white text

#### D. Map Integration
- Google Maps embed
- Business address display below map
- Section heading "OUR LOCATION"

#### E. Enhanced Gallery
- Already exists but needs better layout
- 3-column grid
- Responsive design

#### F. Category Display
- Show business category prominently
- White box with heading "CATEGORY"

#### G. Enhanced Description
- Full business description
- White box with heading "DESCRIPTION"
- Better typography

### 3. Database Schema Updates

New fields needed in `businesses` table:
```sql
- card_background_color (default: #FFFFFF)
- services (JSON array) - Already exists
- cta_heading (TEXT)
- cta_button_text (TEXT)
- cta_button_url (TEXT)
- policies (JSON array of {title, url})
- map_embed_url (TEXT)
- show_map (BOOLEAN)
- show_services (BOOLEAN)
- show_cta (BOOLEAN)
- show_policies (BOOLEAN)
```

### 4. Form Updates Needed

#### Create/Edit Business Forms:
1. **Color Settings Section**
   - Background Color picker (outside card)
   - Card Background Color picker (inside boxes)
   
2. **Services Section Builder**
   - Add/remove services
   - Text input for each service
   - Preview with checkmarks

3. **Call-to-Action Builder**
   - Heading input
   - Button text input
   - Button URL input
   - Toggle to show/hide

4. **Policies Builder**
   - Add/remove policies
   - Title input
   - URL input for each policy
   - Upload option for PDFs

5. **Map Settings**
   - Address input (already exists)
   - Google Maps embed URL
   - Toggle to show/hide map

6. **Section Visibility Toggles**
   - Show/hide each section
   - Reorder sections (future enhancement)

### 5. Display Template Updates

The business page (`/business/[slug]`) needs complete redesign:

**Layout Structure:**
```
┌─────────────────────────────────────┐
│   Background Color (customizable)   │
│  ┌───────────────────────────────┐  │
│  │  Logo + Business Name         │  │
│  │  (Cover Image)                │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  OUR LOCATION (Map)           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  CONTACTABLE HOURS            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  OUR SERVICES (Checkmarks)    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  JOIN A CLASS (CTA)           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  POLICIES (Buttons)           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  OUR GALLERY (Photos)         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  CATEGORY                     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  DESCRIPTION                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 6. Styling Guidelines

**From Isle Dance Example:**
- Background: Orange (#FF5722 or similar)
- Content boxes: White (#FFFFFF)
- Headings: White text, centered, uppercase, bold
- Content: Black text on white background
- Buttons: Black background, white text
- Checkmarks: Orange/red color matching background
- Rounded corners on all boxes
- Consistent padding and spacing

### 7. Implementation Priority

1. ✅ Add color pickers to create/edit forms
2. ✅ Add services section builder
3. ✅ Add CTA section builder
4. ✅ Add policies section builder
5. ✅ Add map integration
6. ✅ Update database schema
7. ✅ Update business display template
8. ✅ Test all features

## Files to Modify

1. `app/dashboard/create/page.tsx` - Add new form sections
2. `app/dashboard/edit/[id]/page.tsx` - Add new form sections
3. `app/business/[slug]/page.tsx` - Complete template redesign
4. `lib/database.ts` - Add new database fields
5. `app/api/businesses/route.ts` - Handle new fields

## Testing Checklist

- [ ] Color pickers work correctly
- [ ] Services can be added/removed
- [ ] CTA section displays correctly
- [ ] Policies section works with multiple documents
- [ ] Map embeds correctly
- [ ] All sections can be toggled on/off
- [ ] Mobile responsive design
- [ ] Colors apply correctly to background and cards
- [ ] All data saves and loads correctly
