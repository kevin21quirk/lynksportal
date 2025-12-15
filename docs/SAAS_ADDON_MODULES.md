# LYNKS Portal - SaaS Add-on Modules

## Overview
LYNKS Portal now supports premium add-on modules that businesses can subscribe to for additional functionality beyond the basic business card/site.

## Available Modules

### 1. Bookings & Appointments System
**Price:** £29.99/month or £299.99/year

**Features:**
- Online booking calendar with real-time availability
- Staff management and scheduling
- Service management (duration, pricing, descriptions)
- Customer notifications (confirmations, reminders)
- Booking analytics and reporting
- Time-off management
- Buffer time between appointments
- Customizable booking settings

**Use Cases:**
- Salons & Spas
- Medical/Dental practices
- Consultants & Coaches
- Fitness trainers
- Any service-based business

### 2. Job Listings & Recruitment Module
**Price:** £19.99/month or £199.99/year

**Features:**
- Unlimited job postings
- Application tracking system
- Applicant management dashboard
- Custom application forms
- Resume/CV uploads
- Email notifications
- Recruitment analytics
- Application status workflow

**Use Cases:**
- Any business hiring employees
- Recruitment agencies
- HR departments
- Staffing companies

## Database Schema

### Core Tables

#### `addon_modules`
Defines available add-on products
- Pricing (monthly/yearly)
- Features list
- Active status

#### `business_subscriptions`
Tracks which businesses have which modules
- Subscription status (active, cancelled, trial, expired)
- Billing cycle
- Trial periods
- Current period dates

### Bookings Module Tables

#### `booking_services`
Services that can be booked
- Duration, price, description
- Buffer time between appointments
- Booking restrictions (min/max advance notice)

#### `booking_staff`
Staff members who provide services
- Contact information
- Availability schedules
- Service assignments

#### `bookings`
Actual appointments
- Customer details
- Date/time
- Status tracking
- Confirmation codes

#### `booking_settings`
Per-business configuration
- Auto-confirm or require approval
- Email notifications
- Cancellation policies
- Timezone

### Recruitment Module Tables

#### `job_listings`
Job postings
- Full job details (title, description, requirements)
- Employment type, location, salary
- Remote options
- Application deadline
- Status and analytics

#### `job_applications`
Applicant submissions
- Contact information
- Resume/CV
- Cover letter
- Status workflow (new → reviewing → shortlisted → interviewed → offered/rejected)
- Internal notes and ratings

#### `job_application_questions`
Custom questions per job posting
- Question types (text, select, checkbox, etc.)
- Required/optional
- Display order

## Implementation Roadmap

### Phase 1: Module Management (Current)
- [x] Database schema created
- [ ] API routes for module management
- [ ] Dashboard UI for viewing/managing subscriptions
- [ ] Module activation/deactivation

### Phase 2: Bookings System
- [ ] Service management UI
- [ ] Staff management UI
- [ ] Booking calendar interface
- [ ] Customer booking form (public-facing)
- [ ] Email notifications
- [ ] Analytics dashboard

### Phase 3: Recruitment System
- [ ] Job listing creation/management UI
- [ ] Application form builder
- [ ] Applicant tracking dashboard
- [ ] Application review interface
- [ ] Email notifications
- [ ] Analytics dashboard

### Phase 4: Payment Integration
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Billing portal
- [ ] Invoice generation
- [ ] Trial period handling

### Phase 5: Business Card Integration
- [ ] Display booking widget on business cards
- [ ] Display job listings on business cards
- [ ] Module-specific sections
- [ ] Public-facing interfaces

## Next Steps

1. **Create API Routes**
   - Module subscription management
   - Bookings CRUD operations
   - Job listings CRUD operations

2. **Build Dashboard UI**
   - Module marketplace/selection
   - Subscription management
   - Module-specific dashboards

3. **Integrate Payment System**
   - Stripe Connect or Checkout
   - Webhook handling
   - Subscription lifecycle

4. **Build Public Interfaces**
   - Booking widget for business cards
   - Job application forms
   - Public job listings page

## Pricing Strategy

**Bookings & Appointments:**
- Monthly: £29.99
- Yearly: £299.99 (save £60/year)

**Job Listings & Recruitment:**
- Monthly: £19.99
- Yearly: £199.99 (save £40/year)

**Bundle Discount (Future):**
- Both modules: £44.99/month or £449.99/year (save 10%)

## Technical Notes

- All tables use foreign keys with CASCADE delete
- Indexes added for performance on frequently queried fields
- JSONB used for flexible feature lists and custom data
- Timezone support for bookings
- Unique constraints prevent duplicate subscriptions
- Soft deletes not implemented (hard deletes with CASCADE)
