# LYNKS Portal

A modern business directory and social link management platform inspired by Linktree and Yellow Pages. LYNKS Portal allows businesses to create beautiful, customizable pages with social media links, contact information, and custom buttons - all while being discoverable in a searchable directory.

## 🚀 Features

### For Businesses
- **Custom Business Pages** - Create Linktree-style pages with unlimited custom links
- **Social Media Integration** - Connect all your social platforms (Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok)
- **Contact Information** - Display phone, email, address, and website
- **Customizable Themes** - Choose your brand colors and customize the look
- **Category & Type Classification** - Organize by industry and business type
- **SEO Optimized** - Each business gets a unique, SEO-friendly URL

### For Users
- **Business Directory** - Browse businesses by category and location
- **Advanced Search** - Find exactly what you're looking for
- **Category Filtering** - Filter by Automotive, Food & Drink, Health & Wellness, Professional Services, Retail, and Trades
- **Mobile Responsive** - Perfect experience on all devices

### Admin Dashboard
- **Platform Overview** - Real-time statistics for businesses, users, and analytics
- **Business Management** - View and manage all businesses across the platform
- **User Management** - See all user accounts and their associated businesses
- **Platform Analytics** - Comprehensive analytics with visitor tracking, device breakdown, and funnel analysis
- **Settings Configuration** - Control platform settings including security, email, and business rules
- **Role-Based Access** - Complete separation between admin and regular user access

### User Dashboard
- **Personal Business Management** - Create, edit, and manage your own business pages
- **Link Management** - Add/edit social and custom links with drag-and-drop ordering
- **Publish Control** - Publish or unpublish your pages instantly
- **Business Analytics** - View detailed analytics for your businesses only

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Icons**: Lucide React
- **Authentication**: Custom JWT-based auth
- **Animations**: Framer Motion ready

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lynks-portal
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Schema

The application uses SQLite with the following main tables:
- **users** - User accounts and authentication
- **categories** - Business categories (6 default categories)
- **business_types** - Specific business types within categories
- **businesses** - Business pages and information
- **social_links** - Social media links for businesses
- **custom_links** - Custom Linktree-style buttons
- **opening_hours** - Business operating hours

## 🎨 Color Scheme

The application uses a blue-green gradient theme matching lynksportal.com:
- Primary: Blue (#3B82F6)
- Secondary: Green (#10B981)
- Customizable per business page

## 📱 Key Pages

### Public Pages
- `/` - Homepage with business directory
- `/login` - User login
- `/register` - User registration
- `/business/[slug]` - Public business page (Linktree-style)

### User Dashboard
- `/dashboard` - User's business management dashboard
- `/dashboard/create` - Create new business page
- `/dashboard/edit/[id]` - Edit business page
- `/dashboard/analytics/[id]` - Business analytics

### Admin Dashboard
- `/admin/dashboard` - Platform overview and statistics
- `/admin/businesses` - All businesses management
- `/admin/users` - User account management
- `/admin/analytics` - Platform-wide analytics
- `/admin/settings` - Platform configuration

## 🔐 Authentication & Access Control

### User Authentication
Users must register and login to create business pages. Authentication uses:
- Bcrypt for password hashing
- LocalStorage for session management
- Protected routes for dashboard access

### Admin Access
- Admin email: `admin@lynksportal.com`
- Automatic redirect to admin dashboard on login
- Full platform access and management capabilities
- Separate admin interface with sidebar navigation

### User Access
- Regular users redirected to personal dashboard
- Can only view/edit their own businesses
- Cannot access admin routes
- Business data filtered by user ID

## 🌐 API Endpoints

### Authentication
- `POST /api/auth` - Login and registration

### Business Management
- `GET/POST/PUT/DELETE /api/businesses` - Business CRUD operations
- `GET/POST/PUT/DELETE /api/social-links` - Social link management
- `GET/POST/PUT/DELETE /api/custom-links` - Custom link management
- `GET /api/categories` - Get categories and business types

### Admin Endpoints
- `GET /api/admin/users` - Get all users with their businesses
- `GET /api/admin/businesses-with-owners` - Get all businesses with owner information
- `GET /api/analytics/platform` - Platform-wide analytics data
- `GET /api/analytics/[businessId]` - Individual business analytics

## 📊 Default Categories

1. 🚗 Automotive
2. 🍽️ Food & Drink
3. 💪 Health & Wellness
4. 💼 Professional Services
5. 🛍️ Retail & Shopping
6. 🔧 Trades & Services

## 🎯 Subscription Plans (Ready for Integration)

- **Monthly**: £19.99/month
- **12 Month**: £199.99/year (2 months free)
- **24 Month**: £399.99/2 years (4 months free)

## ✅ Completed Features

- ✅ Admin dashboard with platform overview
- ✅ User management system
- ✅ Business management with owner tracking
- ✅ Platform-wide analytics with real-time tracking
- ✅ Role-based access control (Admin vs User)
- ✅ Settings configuration panel
- ✅ Business analytics tracking
- ✅ Responsive design for all devices

## 🚧 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] QR code generation for business pages
- [ ] Email notifications system
- [ ] Advanced SEO tools
- [ ] Multi-portal support (UK, Cyprus, Dubai)
- [ ] Business reviews and ratings
- [ ] Appointment booking integration
- [ ] Export analytics reports

## 📝 License

This project is proprietary software for LYNKS Portal.

## 🤝 Support

For support, email support@lynksportal.com or visit https://lynksportal.com

---

Built with ❤️ for small businesses everywhere
