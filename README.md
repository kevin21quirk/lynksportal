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
- **Business Management** - Create, edit, and manage multiple business pages
- **Link Management** - Add/edit social and custom links with drag-and-drop ordering
- **Publish Control** - Publish or unpublish pages instantly
- **Analytics Ready** - Built-in structure for future analytics integration

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

- `/` - Homepage with business directory
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Business management dashboard
- `/dashboard/create` - Create new business page
- `/business/[slug]` - Public business page (Linktree-style)

## 🔐 Authentication

Users must register and login to create business pages. Authentication uses:
- Bcrypt for password hashing
- LocalStorage for session management
- Protected routes for dashboard access

## 🌐 API Endpoints

- `POST /api/auth` - Login and registration
- `GET/POST/PUT/DELETE /api/businesses` - Business CRUD operations
- `GET/POST/PUT/DELETE /api/social-links` - Social link management
- `GET/POST/PUT/DELETE /api/custom-links` - Custom link management
- `GET /api/categories` - Get categories and business types

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

## 🚧 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Analytics dashboard
- [ ] QR code generation for business pages
- [ ] Email notifications
- [ ] Advanced SEO tools
- [ ] Multi-portal support (UK, Cyprus, Dubai)
- [ ] Business reviews and ratings
- [ ] Appointment booking integration

## 📝 License

This project is proprietary software for LYNKS Portal.

## 🤝 Support

For support, email support@lynksportal.com or visit https://lynksportal.com

---

Built with ❤️ for small businesses everywhere
