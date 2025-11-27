# LYNKS Portal - Quick Start Guide

## 🎯 Getting Started in 5 Minutes

### 1. Access the Application
The development server is running at: **http://localhost:3000**

### 2. Create Your First Account
1. Click **"Sign Up"** in the top right
2. Fill in your details:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
3. Agree to Terms and Conditions
4. Click **"Create Account"**

### 3. Create Your First Business Page
1. After login, you'll be redirected to the Dashboard
2. Click **"Create New Business Page"**
3. Fill in the business information:

#### Basic Information
- **Business Name**: Your company name
- **Tagline**: A short, catchy phrase
- **Description**: Tell people about your business
- **Category**: Choose from 6 categories
- **Business Type**: Select specific type

#### Contact Information
- Phone number
- Email address
- Full address (street, city, postcode)
- Website URL (optional)

#### Social Media Links
- Click **"Add Link"** to add social platforms
- Choose platform (Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok)
- Paste your social media URL
- Add multiple platforms

#### Custom Links (Linktree-style)
- Click **"Add Link"** in Custom Links section
- Choose an emoji icon (🔗, 📱, 💼, etc.)
- Enter link title (e.g., "Book Appointment", "View Menu", "Shop Now")
- Enter destination URL
- Add unlimited custom buttons

#### Theme Colors
- Pick your primary brand color
- Pick your secondary color
- Colors will be used throughout your page

4. Click **"Create Business Page"**

### 4. Manage Your Business Page
From the dashboard you can:
- ✏️ **Edit** - Modify any information
- 👁️ **Publish/Unpublish** - Control visibility
- 🔗 **View** - See your live public page
- 🗑️ **Delete** - Remove a business page

### 5. View Your Public Page
1. Click the **"View"** button on a published business
2. Your page will open in a new tab
3. Share the URL with customers!

## 📱 Your Business Page URL Format
```
http://localhost:3000/business/your-business-name
```

The URL is automatically generated from your business name (spaces become hyphens, special characters removed).

## 🎨 Customization Tips

### Choose Great Colors
- Use your brand colors for consistency
- Primary color: Main buttons and accents
- Secondary color: Category badges and highlights

### Write Compelling Content
- **Tagline**: Keep it under 10 words
- **Description**: 2-3 sentences about what makes you unique
- **Custom Links**: Use action words ("Shop Now", "Book Today", "Get Quote")

### Optimize for Mobile
- Test your page on mobile devices
- Keep link titles short and clear
- Use recognizable emojis

## 🔍 Finding Businesses

### Browse the Directory
1. Go to the homepage (http://localhost:3000)
2. Use the search bar to find businesses
3. Filter by category using the buttons
4. Click any business card to view their page

### Search Features
- Search by business name
- Search by description keywords
- Filter by category
- Filter by business type

## 📊 Database Location
Your data is stored in: `lynks-portal.db` (SQLite database in the project root)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎯 Test Accounts (for development)

You can create test accounts with any email/password combination. The system will:
- Hash passwords securely with bcrypt
- Store user data in SQLite
- Maintain separate business pages per user

## 📝 Next Steps

1. **Create Multiple Businesses**: Users can create unlimited business pages
2. **Experiment with Themes**: Try different color combinations
3. **Add Rich Content**: Use emojis and clear descriptions
4. **Share Your Pages**: Send the URL to customers

## 🚀 Going Live

To deploy to production:
1. Set up a production database
2. Configure environment variables
3. Deploy to Vercel, Netlify, or your preferred host
4. Update the domain in the code

## 💡 Pro Tips

- **Use High-Quality Images**: Upload a logo for better branding (feature ready, just needs file upload implementation)
- **Keep Links Updated**: Regularly check that all URLs work
- **Monitor Performance**: Check which links get the most clicks (analytics coming soon)
- **SEO Optimization**: Use descriptive business names and descriptions

## ❓ Common Questions

**Q: Can I create multiple business pages?**
A: Yes! Create unlimited business pages from one account.

**Q: How do I change my business URL?**
A: The URL is generated from your business name. Edit the business name to change the URL.

**Q: Can I unpublish a page temporarily?**
A: Yes! Use the "Unpublish" button to hide a page without deleting it.

**Q: What happens if I delete a business?**
A: All associated data (links, settings) is permanently deleted. This cannot be undone.

## 🆘 Need Help?

- Check the main README.md for technical details
- Review the database schema in lib/database.ts
- Examine API endpoints in app/api/
- Contact support: support@lynksportal.com

---

Happy linking! 🎉
