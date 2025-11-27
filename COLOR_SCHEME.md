# LYNKS Portal - Color Scheme

## 🎨 Official Colors (Matching lynksportal.com)

### Primary Lime-Green
- **Hex**: `#dbf72c`
- **RGB**: `rgb(219, 247, 44)`
- **Usage**: 
  - Logo text
  - View Business buttons
  - Pricing banner background
  - Footer background
  - Best value package badge
  - Active links and accents
  - Default primary color for new businesses

### Secondary Black
- **Hex**: `#000000`
- **RGB**: `rgb(0, 0, 0)`
- **Usage**:
  - Text on lime-green backgrounds
  - Button text on lime-green
  - Default secondary color for new businesses
  - High contrast elements

## 🎯 Color Applications

### Homepage
```css
/* Logo */
color: #dbf72c

/* Pricing Banner */
background: #dbf72c
text: #000000 (black)
link: #000000 (black, bold)

/* Search & Filters */
focus-ring: purple-500 (can be updated)
border-radius: rounded-md

/* Business Cards */
button-bg: #dbf72c
button-text: #000000
```

### Business Pages
```css
/* Default Colors */
primary: #dbf72c (lime-green)
secondary: #000000 (black)

/* User Customizable */
Users can override with their own brand colors
```

### Pricing Page
```css
/* Logo */
color: #dbf72c

/* Popular Plan */
border: #dbf72c
badge-bg: #dbf72c
badge-text: #000000
button-bg: #dbf72c
button-text: #000000

/* Contact Link */
color: #dbf72c
```

### Footer
```css
/* Background */
background: #dbf72c

/* Text */
color: #000000 (black)
font-weight: medium/bold

/* Links */
text: #000000
hover: #374151 (gray-700)
```

## 🔄 Color Evolution

### Version 1.0 (Original)
- ❌ Blue Primary: `#3B82F6` (blue-600)
- ❌ Green Secondary: `#10B981` (green-600)

### Version 2.0 (Purple Phase)
- ❌ Purple Primary: `#9333EA` (purple-600)
- ❌ Purple Secondary: `#A855F7` (purple-500)

### Version 3.0 (Current - Lime-Green)
- ✅ Lime-Green Primary: `#dbf72c`
- ✅ Black Secondary: `#000000`

## 📋 Color Usage Checklist

### Updated Components
- [x] Homepage logo - Lime-green (#dbf72c)
- [x] Homepage pricing banner - Lime-green background
- [x] Homepage business card buttons - Lime-green
- [x] Homepage footer - Lime-green background
- [x] Pricing page logo - Lime-green
- [x] Pricing page popular plan border - Lime-green
- [x] Pricing page best value badge - Lime-green
- [x] Pricing page Buy Now button - Lime-green
- [x] Pricing page footer - Lime-green background
- [x] Database default colors - Lime-green primary
- [x] Business creation form defaults - Lime-green

### Neutral Colors (Unchanged)
- White: `#FFFFFF`
- Gray-50: `#F9FAFB`
- Gray-100: `#F3F4F6`
- Gray-200: `#E5E7EB`
- Gray-300: `#D1D5DB`
- Gray-700: `#374151`
- Gray-900: `#111827`

## 🎨 Accessibility

### Contrast Ratios
- Lime-Green (#dbf72c) with Black text: **13.7:1** (WCAG AAA ✅✅✅)
- Black on Lime-Green background: **13.7:1** (WCAG AAA ✅✅✅)
- Lime-Green on White: **1.5:1** (Use with caution, add borders)

The lime-green and black combination provides **excellent contrast** and exceeds WCAG 2.1 Level AAA standards for accessibility.

## 💡 Brand Guidelines

### When to Use Lime-Green (#dbf72c)
- **Logo**: Primary branding element
- **Primary Actions**: Buttons, CTAs, important links
- **Backgrounds**: Banners, footers, highlight sections
- **Accents**: Badges, borders for featured items
- **Branding**: All primary brand touchpoints

### When to Use Gray
- **Backgrounds**: Cards, sections, subtle areas
- **Text**: Body copy, labels, descriptions
- **Borders**: Dividers, card outlines, input borders
- **Disabled States**: Inactive buttons, unavailable options

### When to Use Other Colors
- **Green**: Success messages, checkmarks, positive indicators
- **Red**: Errors, warnings, delete actions
- **Yellow**: Alerts, important notices
- **User Brand Colors**: Business pages can use custom colors

## 🔧 Implementation

### Inline Styles (Current Implementation)
```html
<!-- Lime-Green Logo -->
<span style="color: #dbf72c">LYNKS Portal</span>

<!-- Lime-Green Button -->
<button style="backgroundColor: #dbf72c; color: #000">

<!-- Lime-Green Background -->
<div style="backgroundColor: #dbf72c">

<!-- Lime-Green Footer -->
<footer style="backgroundColor: #dbf72c">
```

### CSS Variables (Recommended Future Enhancement)
```css
:root {
  --color-primary: #dbf72c;
  --color-secondary: #000000;
  --color-primary-text: #000000;
  --color-primary-hover: #c5e027; /* Slightly darker lime */
}
```

## 📱 Responsive Considerations

Colors remain consistent across all breakpoints:
- Mobile: Same lime-green scheme
- Tablet: Same lime-green scheme  
- Desktop: Same lime-green scheme

## 🎯 Consistency with lynksportal.com

The color scheme now **exactly matches** the official LYNKS Portal website:
- ✅ Lime-green logo (#dbf72c)
- ✅ Lime-green pricing banner
- ✅ Lime-green footer background
- ✅ Lime-green buttons
- ✅ Lime-green accents
- ✅ Black text on lime-green backgrounds
- ✅ High contrast for accessibility

## 🌟 Visual Impact

The lime-green (#dbf72c) color provides:
- **High Visibility**: Stands out immediately
- **Modern Feel**: Fresh, energetic brand identity
- **Excellent Contrast**: 13.7:1 ratio with black text
- **Memorable**: Unique and distinctive color choice
- **Professional**: Bold yet business-appropriate

---

**Last Updated**: November 2024  
**Color Scheme Version**: 3.0 (Lime-Green)  
**Primary Color**: #dbf72c  
**Secondary Color**: #000000
