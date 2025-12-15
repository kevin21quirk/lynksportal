-- ============================================
-- LYNKS Portal SaaS Add-on Modules Schema
-- ============================================

-- Add-on Products/Modules Table
CREATE TABLE IF NOT EXISTS addon_modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2),
  features JSONB, -- Array of feature descriptions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Subscriptions (which modules each business has)
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  addon_module_id INTEGER NOT NULL REFERENCES addon_modules(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, trial
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, addon_module_id)
);

-- ============================================
-- BOOKINGS & APPOINTMENTS SYSTEM
-- ============================================

-- Services that can be booked
CREATE TABLE IF NOT EXISTS booking_services (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL, -- e.g., 30, 60, 90
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'GBP',
  buffer_time_minutes INTEGER DEFAULT 0, -- Time between appointments
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7), -- Hex color for calendar display
  max_advance_booking_days INTEGER DEFAULT 30, -- How far in advance can book
  min_advance_booking_hours INTEGER DEFAULT 2, -- Minimum notice required
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff members who can provide services
CREATE TABLE IF NOT EXISTS booking_staff (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link services to staff (many-to-many)
CREATE TABLE IF NOT EXISTS booking_staff_services (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES booking_staff(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES booking_services(id) ON DELETE CASCADE,
  UNIQUE(staff_id, service_id)
);

-- Staff availability schedules
CREATE TABLE IF NOT EXISTS booking_staff_availability (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES booking_staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(staff_id, day_of_week, start_time)
);

-- Staff time off / blocked periods
CREATE TABLE IF NOT EXISTS booking_staff_time_off (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES booking_staff(id) ON DELETE CASCADE,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  reason VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actual bookings/appointments
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES booking_services(id),
  staff_id INTEGER REFERENCES booking_staff(id),
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed', -- pending, confirmed, cancelled, completed, no_show
  notes TEXT,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  confirmation_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking settings per business
CREATE TABLE IF NOT EXISTS booking_settings (
  id SERIAL PRIMARY KEY,
  business_id INTEGER UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  allow_online_booking BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false, -- Auto-confirm or require manual approval
  send_confirmation_email BOOLEAN DEFAULT true,
  send_reminder_email BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  cancellation_policy TEXT,
  booking_instructions TEXT,
  timezone VARCHAR(50) DEFAULT 'Europe/London',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- JOB LISTINGS / RECRUITMENT MODULE
-- ============================================

-- Job postings
CREATE TABLE IF NOT EXISTS job_listings (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  employment_type VARCHAR(50), -- full-time, part-time, contract, temporary, internship
  location VARCHAR(200),
  remote_option VARCHAR(50), -- on-site, remote, hybrid
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_currency VARCHAR(3) DEFAULT 'GBP',
  salary_period VARCHAR(20), -- hourly, monthly, yearly
  requirements TEXT, -- JSON array or text
  responsibilities TEXT, -- JSON array or text
  benefits TEXT, -- JSON array or text
  application_deadline TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- active, paused, closed, filled
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  job_listing_id INTEGER NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  applicant_name VARCHAR(200) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(50),
  resume_url TEXT, -- URL to uploaded resume/CV
  cover_letter TEXT,
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'new', -- new, reviewing, shortlisted, interviewed, offered, rejected, withdrawn
  notes TEXT, -- Internal notes from recruiter
  rating INTEGER, -- 1-5 star rating
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application custom questions (per job)
CREATE TABLE IF NOT EXISTS job_application_questions (
  id SERIAL PRIMARY KEY,
  job_listing_id INTEGER NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text', -- text, textarea, select, radio, checkbox
  options JSONB, -- For select/radio/checkbox types
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answers to custom questions
CREATE TABLE IF NOT EXISTS job_application_answers (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES job_application_questions(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruitment settings per business
CREATE TABLE IF NOT EXISTS recruitment_settings (
  id SERIAL PRIMARY KEY,
  business_id INTEGER UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  allow_public_listings BOOLEAN DEFAULT true,
  require_resume BOOLEAN DEFAULT true,
  require_cover_letter BOOLEAN DEFAULT false,
  send_confirmation_email BOOLEAN DEFAULT true,
  application_email VARCHAR(255), -- Where to send notifications
  company_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_business_subscriptions_business_id ON business_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_status ON business_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_booking_services_business_id ON booking_services(business_id);
CREATE INDEX IF NOT EXISTS idx_booking_staff_business_id ON booking_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_datetime ON bookings(start_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation_code ON bookings(confirmation_code);

CREATE INDEX IF NOT EXISTS idx_job_listings_business_id ON job_listings(business_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_status ON job_listings(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_slug ON job_listings(slug);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_listing_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- ============================================
-- SEED DATA - Default Add-on Modules
-- ============================================

INSERT INTO addon_modules (name, slug, description, monthly_price, yearly_price, features) VALUES
('Bookings & Appointments', 'bookings-appointments', 'Complete booking system with calendar, staff management, and customer notifications', 29.99, 299.99, 
  '["Online booking calendar", "Staff scheduling", "Email confirmations & reminders", "Customer management", "Service management", "Booking analytics"]'::jsonb),
('Job Listings & Recruitment', 'job-recruitment', 'Post jobs, manage applications, and streamline your hiring process', 19.99, 199.99,
  '["Unlimited job postings", "Application tracking", "Applicant management", "Custom application forms", "Email notifications", "Recruitment analytics"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
