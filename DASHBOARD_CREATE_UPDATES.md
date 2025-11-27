# Dashboard Create Page Updates

## Changes Needed

### 1. Dark Theme
- Background: Black
- Cards: Gray-900 with gray-800 borders
- Text: White labels, white inputs
- Buttons: Lime-green primary buttons

### 2. Image Upload Section
Add after Basic Information section:

```tsx
{/* Image Uploads */}
<div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
  <h2 className="text-xl font-bold text-white mb-6">Images</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Logo Upload */}
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        Logo Image
      </label>
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-lime-400 transition-colors">
        {formData.logoUrl ? (
          <div className="relative">
            <img src={formData.logoUrl} alt="Logo" className="w-32 h-32 mx-auto rounded-full object-cover mb-4" />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, logoUrl: '' })}
              className="text-red-500 hover:text-red-400 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto mb-4" style={{ color: '#dbf72c' }} size={48} />
            <label className="cursor-pointer">
              <span className="text-lime-400 hover:text-lime-300 font-medium">
                Upload Logo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('logoUrl', file);
                }}
              />
            </label>
            <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
    </div>

    {/* Cover Image Upload */}
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        Cover Image
      </label>
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-lime-400 transition-colors">
        {formData.coverImageUrl ? (
          <div className="relative">
            <img src={formData.coverImageUrl} alt="Cover" className="w-full h-32 mx-auto rounded-lg object-cover mb-4" />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverImageUrl: '' })}
              className="text-red-500 hover:text-red-400 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto mb-4" style={{ color: '#dbf72c' }} size={48} />
            <label className="cursor-pointer">
              <span className="text-lime-400 hover:text-lime-300 font-medium">
                Upload Cover
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('coverImageUrl', file);
                }}
              />
            </label>
            <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
```

### 3. AI Website Scanner
Add after Website URL field:

```tsx
<div className="flex items-end gap-4">
  <div className="flex-1">
    <label className="block text-sm font-medium text-white mb-2">
      Website URL
    </label>
    <input
      type="url"
      value={formData.websiteUrl}
      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
      placeholder="https://yourwebsite.com"
    />
  </div>
  <button
    type="button"
    onClick={handleAIScan}
    disabled={aiScanning || !formData.websiteUrl}
    className="px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    style={{ backgroundColor: '#dbf72c', color: '#000' }}
  >
    {aiScanning ? (
      <>
        <Loader className="animate-spin" size={20} />
        <span>Scanning...</span>
      </>
    ) : (
      <>
        <Sparkles size={20} />
        <span>AI Scan</span>
      </>
    )}
  </button>
</div>
```

### 4. Update All Form Sections

Replace all white cards with:
```tsx
className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6"
```

Replace all labels with:
```tsx
className="block text-sm font-medium text-white mb-2"
```

Replace all inputs with:
```tsx
className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
```

Replace all select dropdowns with:
```tsx
className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:border-transparent outline-none"
```

### 5. Update Buttons

Primary buttons:
```tsx
className="px-6 py-3 rounded-lg font-bold transition-all"
style={{ backgroundColor: '#dbf72c', color: '#000' }}
```

Secondary buttons:
```tsx
className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
```

Delete buttons:
```tsx
className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
```

### 6. Section Headers

```tsx
<h2 className="text-xl font-bold text-white mb-6">Section Title</h2>
```

### 7. Helper Text

```tsx
<p className="text-gray-400 text-sm mt-1">Helper text here</p>
```

## API Endpoint Needed

Create `/api/ai-scan/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // In production, use a web scraping service or AI API
    // For now, return mock data
    const mockData = {
      businessName: 'Scanned Business',
      tagline: 'AI-generated tagline',
      description: 'This is an AI-generated description based on the website content.',
      phone: '+1234567890',
      email: 'contact@business.com',
      address: '123 Main St'
    };

    return NextResponse.json(mockData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to scan website' },
      { status: 500 }
    );
  }
}
```

## Complete Color Scheme

```css
/* Backgrounds */
--bg-main: #000000
--bg-card: #1F2937 (gray-900)
--bg-input: #374151 (gray-800)

/* Borders */
--border-card: #374151 (gray-800)
--border-input: #4B5563 (gray-700)

/* Text */
--text-primary: #FFFFFF
--text-secondary: #9CA3AF (gray-400)
--text-placeholder: #6B7280 (gray-500)

/* Accent */
--accent-primary: #dbf72c (lime-green)
--accent-hover: #bef264 (lime-300)

/* Buttons */
--btn-primary-bg: #dbf72c
--btn-primary-text: #000000
--btn-secondary-bg: #374151 (gray-800)
--btn-secondary-text: #FFFFFF
--btn-danger-bg: #DC2626 (red-600)
```

## Features Summary

✅ Black background theme
✅ Dark gray cards with borders
✅ White text throughout
✅ Lime-green primary buttons
✅ Logo upload with preview
✅ Cover image upload with preview
✅ AI website scanner button
✅ Auto-fill business details from website
✅ Consistent styling across all sections
✅ Proper focus states
✅ Loading states for AI scanning
✅ Image preview and remove functionality
