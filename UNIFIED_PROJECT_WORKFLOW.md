# Speedy Van - Unified Project Workflow

## Overview
This document outlines the complete workflow for the Speedy Van application, covering all user roles, processes, and system interactions from initial customer visit to order completion and driver management.

---

## 1. Homepage & Customer Journey

### 1.1 Homepage Workflow
```
Customer Visits Homepage
    ↓
Landing Page Display
    - Hero section with booking CTA
    - Service overview
    - Pricing calculator preview
    - Customer testimonials
    - Company information
    ↓
Customer Actions:
    - Browse services
    - Use pricing calculator
    - View testimonials
    - Contact information
    - Start booking process
```

### 1.2 Customer Registration & Authentication
```
New Customer Flow:
Customer clicks "Book Now"
    ↓
Registration Options:
    - Guest booking (phone + email)
    - Create account
    - Social login (Google/Facebook)
    ↓
Account Creation:
    - Personal details
    - Contact information
    - Verification (SMS/Email)
    ↓
Profile Setup Complete

Returning Customer Flow:
    - Login with credentials
    - Password recovery option
    - Remember device option
```

---

## 2. Customer Portal Workflow

### 2.1 Customer Dashboard
```
Customer Logs In
    ↓
Dashboard Display:
    - Active bookings
    - Booking history
    - Profile summary
    - Quick book option
    - Notifications
    - Support chat
    ↓
Customer Options:
    - Create new booking
    - View booking details
    - Track active orders
    - Manage profile
    - View invoices
    - Contact support
```

### 2.2 Customer Profile Management
```
Profile Access
    ↓
Editable Information:
    - Personal details
    - Contact information
    - Addresses (saved locations)
    - Payment methods
    - Preferences
    - Communication settings
    ↓
Save Changes
    ↓
Confirmation & Update
```

---

## 3. Booking Process Workflow (Streamlined 2-Step Process)

### 3.1 Main Booking Flow
```
Customer Initiates Booking
    ↓
Step 1: Where & What (Comprehensive Details)
    - Pickup address (with autocomplete) + Use current location 
    - Delivery address (with autocomplete) + Use current location 
    - Property details (pickup & delivery)
    - Item categories and quantity
    - Service type selection
    - Date & time scheduling
    - Real-time pricing calculation
    ↓
Step 2: Customer Details & Payment (Auto-Confirmation)
    - Customer information
    - Contact verification
    - Payment method selection (Stripe)
    - Terms & privacy acceptance
    - Special instructions
    - Payment processing
    ↓
Payment Success → Automatic Booking Confirmation → Success Page
    - Webhook-triggered confirmation
    - Automatic email & SMS notifications
    - Admin notifications
    - Booking status: CONFIRMED
```

### 3.2 Booking Validation & Processing
```
Booking Submitted
    ↓
System Validation:
    - Address verification
    - Time slot availability
    - Driver availability
    - Pricing calculation
    ↓
Payment Processing:
    - Stripe payment gateway
    - Payment confirmation
    - Receipt generation
    ↓
Booking Creation:
    - Database record creation
    - Unique booking ID generation
    - Status: "Confirmed"
```

---

## 4. Confirmation System (SMS & Email)

### 4.1 Customer Confirmation Workflow
```
Booking Confirmed
    ↓
Immediate Notifications:
    SMS Confirmation:
        - Booking ID
        - Date & time
        - Driver contact (when assigned)
        - Tracking link
    
    Email Confirmation:
        - Detailed booking summary
        - Invoice/receipt
        - Terms and conditions
        - Contact information
        - Tracking portal access
    ↓
Follow-up Notifications:
    - 24h before: Reminder SMS/Email
    - 2h before: Driver assignment notification
    - On arrival: Driver arrival notification
    - On completion: Service completion confirmation
```

### 4.2 Notification Templates
```
SMS Templates:
    - Booking confirmation
    - Driver assignment
    - Driver en route
    - Arrival notification
    - Completion confirmation
    - Payment receipt

Email Templates:
    - Booking confirmation with details
    - Invoice and receipt
    - Driver assignment with contact
    - Service completion summary
    - Feedback request
    - Special offers/promotions
```

---

## 5. Driver Portal Workflow

### 5.1 Driver Registration & Onboarding
```
Driver Application Process:
    ↓
Initial Application:
    - Personal information
    - Contact details
    - Vehicle information
    - License verification
    - Insurance documents
    ↓
Background Checks:
    - Document verification
    - Reference checks
    - Driving record review
    ↓
Training & Certification:
    - Platform training
    - Safety protocols
    - Customer service guidelines
    ↓
Account Activation:
    - Profile creation
    - App access granted
    - Equipment provision
```

### 5.2 Driver Dashboard
```
Driver Logs In
    ↓
Dashboard Display:
    - Available jobs
    - Assigned bookings
    - Today's schedule
    - Earnings summary
    - Performance metrics
    - Notifications
    ↓
Driver Actions:
    - Accept/decline jobs
    - Update availability
    - Navigate to locations
    - Update job status
    - Communicate with customers
    - Submit completion reports
```

### 5.3 Job Management Workflow
```
Job Assignment Process:
    ↓
System assigns job to available driver
    ↓
Driver receives notification
    ↓
Driver Actions:
    - Accept job (30-second window)
    - Decline job (with reason)
    ↓
If Accepted:
    - Job details displayed
    - Navigation to pickup
    - Customer contact information
    - Special instructions
    ↓
Job Execution:
    - En route status update
    - Arrival confirmation
    - Loading process
    - Transit updates
    - Delivery confirmation
    - Photo evidence (if required)
    - Customer signature
    ↓
Job Completion:
    - Final status update
    - Earnings calculation
    - Customer feedback request
```

---

## 6. Driver Employment & Management

### 6.1 Driver Recruitment Workflow
```
Recruitment Process:
    ↓
Job Posting:
    - Online job boards
    - Company website
    - Referral program
    ↓
Application Screening:
    - Initial application review
    - Qualification verification
    - Interview scheduling
    ↓
Interview Process:
    - Phone/video interview
    - In-person assessment
    - Vehicle inspection
    ↓
Background Verification:
    - Identity verification
    - Criminal background check
    - Driving record check
    - Reference verification
    ↓
Onboarding:
    - Contract signing
    - Training program
    - Equipment provision
    - System access setup
```

### 6.2 Driver Performance Management
```
Performance Monitoring:
    ↓
Key Metrics Tracking:
    - On-time performance
    - Customer ratings
    - Completion rates
    - Safety incidents
    - Communication quality
    ↓
Performance Reviews:
    - Weekly performance reports
    - Monthly evaluations
    - Feedback sessions
    - Training recommendations
    ↓
Recognition & Rewards:
    - Performance bonuses
    - Driver of the month
    - Incentive programs
    - Career advancement
```

---

## 7. Admin Dashboard & Functions

### 7.1 Admin Portal Overview
```
Admin Login
    ↓
Main Dashboard:
    - Real-time metrics
    - Active bookings
    - Driver status
    - Revenue analytics
    - System alerts
    - Performance KPIs
    ↓
Admin Modules:
    - Booking Management
    - Driver Management
    - Customer Management
    - Financial Management
    - Reporting & Analytics
    - System Configuration
    - Content Management
```

### 7.2 Booking Management
```
Booking Administration:
    ↓
Booking Overview:
    - All bookings list
    - Status filtering
    - Search functionality
    - Bulk actions
    ↓
Booking Actions:
    - View details
    - Edit booking
    - Assign/reassign driver
    - Cancel booking
    - Process refunds
    - Handle disputes
    ↓
Special Cases:
    - Emergency bookings
    - Priority handling
    - Customer complaints
    - Failed deliveries
```

### 7.3 Driver Management
```
Driver Administration:
    ↓
Driver Database:
    - Active drivers list
    - Driver profiles
    - Performance metrics
    - Availability status
    ↓
Driver Actions:
    - Approve new drivers
    - Suspend/activate accounts
    - Update driver information
    - Assign training
    - Process payments
    ↓
Fleet Management:
    - Vehicle tracking
    - Maintenance scheduling
    - Insurance management
    - Equipment allocation
```

### 7.4 Financial Management
```
Financial Operations:
    ↓
Revenue Management:
    - Payment processing
    - Invoice generation
    - Refund processing
    - Commission calculations
    ↓
Driver Payments:
    - Earnings calculation
    - Payment scheduling
    - Bonus distribution
    - Tax documentation
    ↓
Financial Reporting:
    - Daily revenue reports
    - Monthly summaries
    - Profit/loss analysis
    - Tax reporting
```

---

## 8. Order Lifecycle Management

### 8.1 Complete Order Lifecycle
```
Order Creation
    ↓
Status: "Pending Confirmation"
    - Payment processing
    - Initial validation
    ↓
Status: "Confirmed"
    - Payment successful
    - Order in system
    - Customer notifications sent
    ↓
Status: "Driver Assignment"
    - Available drivers notified
    - Driver selection process
    - Assignment confirmation
    ↓
Status: "Driver Assigned"
    - Driver details shared with customer
    - Pickup preparation
    - Customer notifications
    ↓
Status: "En Route to Pickup"
    - Driver navigation active
    - Real-time tracking
    - ETA updates
    ↓
Status: "Arrived at Pickup"
    - Driver arrival confirmation
    - Customer notification
    - Loading preparation
    ↓
Status: "Loading in Progress"
    - Item verification
    - Loading documentation
    - Photos if required
    ↓
Status: "In Transit"
    - Real-time tracking
    - Route optimization
    - Delivery ETA updates
    ↓
Status: "Arrived at Delivery"
    - Delivery location reached
    - Customer notification
    - Unloading preparation
    ↓
Status: "Delivery in Progress"
    - Item unloading
    - Delivery verification
    - Customer confirmation
    ↓
Status: "Completed"
    - Final confirmation
    - Payment finalization
    - Receipt generation
    - Feedback request
    ↓
Status: "Closed"
    - All processes complete
    - Archive order
    - Analytics update
```

### 8.2 Exception Handling
```
Order Exceptions:
    ↓
Driver Cancellation:
    - Automatic reassignment
    - Customer notification
    - Delay compensation
    ↓
Customer Cancellation:
    - Cancellation policy check
    - Refund processing
    - Driver notification
    ↓
Delivery Issues:
    - Customer unavailable
    - Address problems
    - Access restrictions
    - Alternative solutions
    ↓
Payment Issues:
    - Failed payments
    - Dispute resolution
    - Refund processing
    - Account suspension
```

---

## 9. Communication & Support System

### 9.1 Customer Support Workflow
```
Support Request:
    ↓
Channel Options:
    - Live chat
    - Phone support
    - Email support
    - In-app messaging
    ↓
Ticket Creation:
    - Issue categorization
    - Priority assignment
    - Agent assignment
    - Response timeline
    ↓
Resolution Process:
    - Investigation
    - Solution implementation
    - Customer communication
    - Follow-up confirmation
```

### 9.2 Real-time Communication
```
Communication Channels:
    ↓
Customer-Driver:
    - In-app messaging
    - Phone calls
    - Status updates
    - Location sharing
    ↓
Customer-Support:
    - Live chat
    - Ticket system
    - Phone support
    - FAQ resources
    ↓
Driver-Admin:
    - Support tickets
    - Emergency contact
    - Performance feedback
    - Training requests
```

---

## 10. Analytics & Reporting

### 10.1 Business Intelligence
```
Data Collection:
    ↓
Key Metrics:
    - Booking volume
    - Revenue trends
    - Customer satisfaction
    - Driver performance
    - Operational efficiency
    ↓
Reporting Dashboard:
    - Real-time analytics
    - Historical trends
    - Predictive insights
    - Performance benchmarks
    ↓
Decision Support:
    - Business optimization
    - Resource allocation
    - Growth strategies
    - Risk management
```

---

## 11. System Integration Points

### 11.1 External Integrations
```
Payment Gateway (Stripe):
    - Payment processing
    - Subscription management
    - Refund handling
    - Financial reporting

SMS Service (TheSMSWorks):
    - Booking confirmations
    - Status updates
    - Emergency notifications
    - Marketing messages

Email Service (ZeptoMail):
    - Transactional emails
    - Marketing campaigns
    - System notifications
    - Receipt delivery

Maps Integration (Mapbox):
    - Address autocomplete
    - Route optimization
    - Real-time tracking
    - Distance calculations

Weather API:
    - Weather-based pricing
    - Service advisories
    - Route planning
    - Safety alerts
```

### 11.2 Internal System Flow
```
Frontend (Next.js) ↔ Backend API (Node.js) ↔ Database (PostgreSQL)
    ↕                    ↕                      ↕
Real-time Updates    Business Logic         Data Storage
(Pusher)            Processing              & Retrieval
    ↕                    ↕                      ↕
Mobile App          External APIs           Analytics
Notifications       Integration             Reporting
```

---

## 12. Security & Compliance

### 12.1 Data Protection Workflow
```
Data Collection:
    - GDPR compliance
    - Consent management
    - Data minimization
    ↓
Data Processing:
    - Encryption at rest
    - Encryption in transit
    - Access controls
    ↓
Data Storage:
    - Secure databases
    - Regular backups
    - Audit trails
    ↓
Data Access:
    - Role-based permissions
    - Authentication required
    - Activity logging
```

---

## 13. Monitoring & Maintenance

### 13.1 System Health Monitoring
```
Real-time Monitoring:
    - Application performance
    - Database performance
    - API response times
    - Error tracking
    ↓
Alerting System:
    - Critical error alerts
    - Performance degradation
    - Security incidents
    - Capacity warnings
    ↓
Maintenance Procedures:
    - Regular updates
    - Security patches
    - Performance optimization
    - Backup verification
```

---# ======================================================
#  Example Environment Variables — Speedy Van Web App
# ======================================================

# ------------------------
# Public Frontend Config
# ------------------------
NEXT_PUBLIC_MAPBOX_TOKEN=pk_your_mapbox_token_here
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CUSTOM_KEY=your-custom-key-here

# ------------------------
# NextAuth (Authentication)
# ------------------------
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# ------------------------
# Database (Postgres)
# ------------------------
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# ------------------------
# The SMS Works
# ------------------------
THESMSWORKS_KEY=your-smsworks-key
THESMSWORKS_SECRET=your-smsworks-secret

# ------------------------
# JWT & Logging
# ------------------------
JWT_SECRET=your-jwt-secret
LOG_LEVEL=debug

# ------------------------
# Weather API
# ------------------------
NEXT_PUBLIC_WEATHER_API_KEY=your-weather-api-key

# ------------------------
# Email & Notifications
# ------------------------
SENDGRID_API_KEY=your-sendgrid-api-key
ZEPTO_API_URL=https://api.zeptomail.eu/v1.1/email
ZEPTO_API_KEY=your-zeptomail-api-key
MAIL_FROM=noreply@your-domain.com
SUPPORT_EMAIL=support@your-domain.com
SUPPORT_REPLY_TO=support@your-domain.com

# fallback
ZEPTO_HOST=smtp.zeptomail.eu
ZEPTO_PORT=587
ZEPTO_USER=emailapikey
ZEPTO_PASS=your-zeptomail-smtp-pass

# ------------------------
# Stripe
# ------------------------
# Test keys for local/dev
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# For production, replace with LIVE keys
# STRIPE_SECRET_KEY=sk_live_your_live_secret
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable

# ------------------------
# Pusher
# ------------------------
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# ------------------------
# General
# ------------------------
NODE_ENV=development
PORT=3000

# ------------------------
# Company Information
# ------------------------
NEXT_PUBLIC_COMPANY_NAME=Speedy Van
NEXT_PUBLIC_COMPANY_ADDRESS=Your company address
NEXT_PUBLIC_COMPANY_PHONE=07901846297
NEXT_PUBLIC_COMPANY_EMAIL=support@your-domain.com

# ------------------------
# AI / Ollama / RAG
# ------------------------
AI_PROVIDER=ollama
NEXT_PUBLIC_AI_API_URL=/api/ai
AI_BACKEND_URL=http://localhost:3010
AI_SERVICE_KEY=your-ai-service-key

# Local Ollama (optional)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=phi3-mini-uncensored:latest

# Flags
RAG_ENABLED=false
AI_ADMIN_ENABLED=false
NEXT_PUBLIC_AI_PUBLIC_WIDGET_ENABLED=true
----------------------------------

# ======================================================
#  Production Environment Variables — Speedy Van Web App
# ======================================================

# ------------------------
# Public Frontend Config
# ------------------------
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWhtYWRhbHdha2FpIiwiYSI6ImNtZGNsZ3RsZDEzdGsya3F0ODFxeGRzbXoifQ.jfgGW0KNFTwATOShRDtQsg
NEXT_PUBLIC_API_URL=https://api.speedy-van.co.uk
NEXT_PUBLIC_BASE_URL=https://speedy-van.co.uk
CUSTOM_KEY=b2ff6df77f3bea2aedeaa5a1f6bd9907ca68c36e21503ca696a82785f816db0d

# ------------------------
# NextAuth (Authentication)
# ------------------------
NEXTAUTH_SECRET=ZV6xh/oJhYk9wwrjX5RA5JgjC9uCSuWZHpIprjYs2LA=
NEXTAUTH_URL=https://speedy-van.co.uk

# ------------------------
# Database (Neon Postgres)
# ------------------------
DATABASE_URL=postgresql://neondb_owner:password@ep-dry-glitter-aftvvy9d-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ------------------------
# The SMS Works (Production)
# ------------------------
THESMSWORKS_KEY=01c671f7-1bff-49bd-9d80-880a8ccdb154
THESMSWORKS_SECRET=5186ef29585e839522ed9cf3a776b0e10b5a118b2feb6dcc64d01bab2b09ebf0

# ------------------------
# JWT & Logging
# ------------------------
JWT_SECRET=b8a0e10574e514dfa383b30da00de05d
LOG_LEVEL=info

# ------------------------
# Weather API
# ------------------------
NEXT_PUBLIC_WEATHER_API_KEY=711e7ee2cc824e107d9a9a3bec4cfd0a

# ------------------------
# Email & Notifications
# ------------------------
SENDGRID_API_KEY=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
ZEPTO_API_URL=https://api.zeptomail.eu/v1.1/email
ZEPTO_API_KEY=Zoho-enczapikey-CHANGEME
MAIL_FROM=noreply@speedy-van.co.uk
SUPPORT_EMAIL=support@speedy-van.co.uk
SUPPORT_REPLY_TO=support@speedy-van.co.uk

# fallback
ZEPTO_HOST=smtp.zeptomail.eu
ZEPTO_PORT=587
ZEPTO_USER=emailapikey
ZEPTO_PASS=CHANGEME

# ------------------------
# Stripe — LIVE
# ------------------------
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Rp06mBpmFIwZiSMBP8AYxDhTznhg6vBscxblxthVbk52ilyB4zlnKrC2IcnvVyXF2dv0mvOd2whaTXCZIsEonFo00izEP3DhS
STRIPE_WEBHOOK_SECRET=whsec_1fe8d3923c5aad30a4df3fe785c2db5b13c1ccbb4d3c333b311b5b3f5e366b72

# ------------------------
# Pusher
# ------------------------
PUSHER_APP_ID=2034743
PUSHER_KEY=407cb06c423e6c032e9c
PUSHER_SECRET=bf769b4fd7a3cf95a803
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=407cb06c423e6c032e9c
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# ------------------------
# General
# ------------------------
NODE_ENV=production
PORT=3000

# ------------------------
# Company Information
# ------------------------
NEXT_PUBLIC_COMPANY_NAME=Speedy Van
NEXT_PUBLIC_COMPANY_ADDRESS=140 Charles Street, Glasgow City, G21 2QB
NEXT_PUBLIC_COMPANY_PHONE=07901846297
NEXT_PUBLIC_COMPANY_EMAIL=support@speedy-van.co.uk

# ------------------------
# AI / Ollama / RAG
# ------------------------
AI_PROVIDER=ollama
NEXT_PUBLIC_AI_API_URL=/api/ai
AI_BACKEND_URL=CHANGEME
AI_SERVICE_KEY=CHANGEME

# Local Ollama (optional in prod)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=phi3-mini-uncensored:latest

# Flags
RAG_ENABLED=false
AI_ADMIN_ENABLED=false
NEXT_PUBLIC_AI_PUBLIC_WIDGET_ENABLED=true


--------------------------------------------

# ======================================================
#  Local/Test Environment Variables — Speedy Van Web App
# ======================================================

# ------------------------
# Public Frontend Config
# ------------------------
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWhtYWRhbHdha2FpIiwiYSI6ImNtZGNsZ3RsZDEzdGsya3F0ODFxeGRzbXoifQ.jfgGW0KNFTwATOShRDtQsg
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CUSTOM_KEY=b2ff6df77f3bea2aedeaa5a1f6bd9907ca68c36e21503ca696a82785f816db0d

# ------------------------
# NextAuth (Authentication)
# ------------------------
NEXTAUTH_SECRET=ZV6xh/oJhYk9wwrjX5RA5JgjC9uCSuWZHpIprjYs2LA=
NEXTAUTH_URL=http://localhost:3000

# ------------------------
# Database (Local Postgres)
# ------------------------
DATABASE_URL=postgresql://speedyvan:password@localhost:5432/speedyvan

# ------------------------
# The SMS Works (Test)
# ------------------------
THESMSWORKS_KEY=01c671f7-1bff-49bd-9d80-880a8ccdb154
THESMSWORKS_SECRET=5186ef29585e839522ed9cf3a776b0e10b5a118b2feb6dcc64d01bab2b09ebf0

# ------------------------
# JWT & Logging
# ------------------------
JWT_SECRET=b8a0e10574e514dfa383b30da00de05d
LOG_LEVEL=debug

# ------------------------
# Weather API
# ------------------------
NEXT_PUBLIC_WEATHER_API_KEY=711e7ee2cc824e107d9a9a3bec4cfd0a

# ------------------------
# Email & Notifications
# ------------------------
SENDGRID_API_KEY=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
ZEPTO_API_URL=https://api.zeptomail.eu/v1.1/email
ZEPTO_API_KEY=Zoho-enczapikey-CHANGEME
MAIL_FROM=noreply@speedy-van.co.uk
SUPPORT_EMAIL=support@speedy-van.co.uk
SUPPORT_REPLY_TO=support@speedy-van.co.uk

# fallback
ZEPTO_HOST=smtp.zeptomail.eu
ZEPTO_PORT=587
ZEPTO_USER=emailapikey
ZEPTO_PASS=CHANGEME

# ------------------------
# Stripe — TEST
# ------------------------
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Rp06mBpmFIwZiSMkJFmrdfstG4Ans4ZpaPQ4F33mS6WvgLjyc80Yh5tD1XZCLzjmebOGlzy4raq3cPHwF8qHZPn00G9RZnZye
STRIPE_WEBHOOK_SECRET=whsec_1fe8d3923c5aad30a4df3fe785c2db5b13c1ccbb4d3c333b311b5b3f5e366b72

# ------------------------
# Pusher
# ------------------------
PUSHER_APP_ID=2034743
PUSHER_KEY=407cb06c423e6c032e9c
PUSHER_SECRET=bf769b4fd7a3cf95a803
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=407cb06c423e6c032e9c
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# ------------------------
# General
# ------------------------
NODE_ENV=development
PORT=3000

# ------------------------
# Company Information
# ------------------------
NEXT_PUBLIC_COMPANY_NAME=Speedy Van
NEXT_PUBLIC_COMPANY_ADDRESS=140 Charles Street, Glasgow City, G21 2QB
NEXT_PUBLIC_COMPANY_PHONE=07901846297
NEXT_PUBLIC_COMPANY_EMAIL=support@speedy-van.co.uk

# ------------------------
# AI / Ollama / RAG
# ------------------------
AI_PROVIDER=ollama
NEXT_PUBLIC_AI_API_URL=/api/ai
AI_BACKEND_URL=http://localhost:3010
AI_SERVICE_KEY=CHANGEME

# Local Ollama (preferred for dev)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=phi3-mini-uncensored:latest

# Flags
RAG_ENABLED=false
AI_ADMIN_ENABLED=false
NEXT_PUBLIC_AI_PUBLIC_WIDGET_ENABLED=true

# ------------------------
# Not used anymore (safe to remove or comment out)
# ------------------------
# DEEPSEEK_API_KEY=...
# OPENAI_API_KEY=...
# AI_MODEL=...
-----------------------------------------------------------------------
# Speedy Van - Color & Design System Workflow

## Overview
This document outlines the complete color and design workflow for the Speedy Van application, covering the Neon Dark Design Language System, brand identity, component styling, and design implementation processes.

---

## 1. Design System Foundation

### 1.1 Design Philosophy
```
Core Principles:
    ↓
Dark-First Design:
    - Optimized for dark mode
    - Carefully crafted surface hierarchy
    - Premium dark aesthetics
    ↓
Neon Accents:
    - Strategic use of neon blue (#00C2FF)
    - Brand green (#00D18F) highlights
    - Purple gradients for special effects
    ↓
Premium Feel:
    - High-quality shadows and glows
    - Micro-interactions and animations
    - Professional gradients
    ↓
Accessibility Focus:
    - WCAG AA compliance
    - Proper contrast ratios
    - Focus state management
    ↓
Mobile-First Approach:
    - Responsive design system
    - Touch-optimized components
    - Progressive enhancement
```

---

## 2. Color System Workflow

### 2.1 Core Color Palette
```
Primary Colors:
    ↓
Neon Blue Scale:
    - neon.50: #E6F7FF (Lightest tints)
    - neon.100: #B3E5FF
    - neon.200: #80D4FF
    - neon.300: #4DC2FF
    - neon.400: #1AB0FF
    - neon.500: #00C2FF (Primary brand blue)
    - neon.600: #0099CC
    - neon.700: #007099
    - neon.800: #004766
    - neon.900: #001E33 (Darkest shade)
    ↓
Brand Green Scale:
    - brand.50: #E6FFF7
    - brand.100: #B3FFE5
    - brand.200: #80FFD4
    - brand.300: #4DFFC2
    - brand.400: #1AFFB0
    - brand.500: #00D18F (Speedy Van green)
    - brand.600: #00B385
    - brand.700: #009973
    - brand.800: #007F61
    - brand.900: #00654F
    ↓
Dark Surface Scale:
    - dark.50: #F8F9FA (Light mode fallback)
    - dark.100: #E9ECEF
    - dark.200: #DEE2E6
    - dark.300: #CED4DA
    - dark.400: #ADB5BD
    - dark.500: #6C757D
    - dark.600: #495057
    - dark.700: #343A40
    - dark.800: #212529
    - dark.900: #0D0D0D (Primary background)
    - dark.950: #000000 (Pure black)
```

### 2.2 Semantic Color System
```
Status Colors:
    ↓
Success States:
    - success.500: #22C55E (Confirmations)
    - Used for: Completed bookings, successful payments
    ↓
Warning States:
    - warning.500: #F59E0B (Alerts)
    - Used for: Pending actions, cautionary messages
    ↓
Error States:
    - error.500: #EF4444 (Errors)
    - Used for: Failed operations, validation errors
    ↓
Info States:
    - info.500: #3B82F6 (Information)
    - Used for: Neutral notifications, help text
```

### 2.3 Semantic Token System
```
Background Tokens:
    ↓
Surface Hierarchy:
    - bg.canvas: #0D0D0D (Main app background)
    - bg.surface: #1A1A1A (Card/panel surfaces)
    - bg.surface.elevated: #262626 (Modal/elevated surfaces)
    - bg.surface.hover: #333333 (Interactive hover states)
    ↓
Component Backgrounds:
    - bg.header: #0D0D0D (Navigation header)
    - bg.footer: #0D0D0D (Footer section)
    - bg.modal: #1A1A1A (Modal dialogs)
    - bg.card: #1A1A1A (Content cards)
    - bg.input: #262626 (Form inputs)
    ↓
Text Hierarchy:
    - text.primary: #FFFFFF (Main content)
    - text.secondary: #E5E5E5 (Supporting text)
    - text.tertiary: #A3A3A3 (Subtle text)
    - text.disabled: #737373 (Disabled states)
    - text.inverse: #0D0D0D (On colored backgrounds)
    ↓
Border System:
    - border.primary: #404040 (Default borders)
    - border.secondary: #262626 (Subtle borders)
    - border.neon: #00C2FF (Interactive borders)
    - border.brand: #00D18F (Brand borders)
    ↓
Interactive States:
    - interactive.primary: #00C2FF (Primary actions)
    - interactive.secondary: #00D18F (Secondary actions)
    - interactive.hover: #1AB0FF (Hover states)
    - interactive.active: #0099CC (Active states)
    - interactive.disabled: #404040 (Disabled states)
```

---

## 3. Typography System Workflow

### 3.1 Font System
```
Font Family Hierarchy:
    ↓
Primary Font:
    - Family: Inter (Google Fonts)
    - Fallback: system-ui, -apple-system, Segoe UI, Roboto, sans-serif
    - Usage: All text content, UI elements
    ↓
Font Weight Scale:
    - normal: 400 (Body text)
    - medium: 500 (Emphasis)
    - semibold: 600 (Subheadings)
    - bold: 700 (Headings, buttons)
    ↓
Font Size Scale:
    - xs: 0.75rem (12px) - Small labels
    - sm: 0.875rem (14px) - Secondary text
    - base: 1rem (16px) - Body text
    - lg: 1.125rem (18px) - Large body
    - xl: 1.25rem (20px) - Small headings
    - 2xl: 1.5rem (24px) - Medium headings
    - 3xl: 1.875rem (30px) - Large headings
    - 4xl: 2.25rem (36px) - Hero headings
    - 5xl: 3rem (48px) - Display headings
    - 6xl: 3.75rem (60px) - Hero display
```

### 3.2 Typography Usage Patterns
```
Heading Hierarchy:
    ↓
H1 - Page Titles:
    - Size: { base: '3xl', md: '4xl', lg: '5xl' }
    - Weight: bold (700)
    - Color: text.primary
    - Line Height: 1.2
    ↓
H2 - Section Titles:
    - Size: { base: '2xl', md: '3xl', lg: '4xl' }
    - Weight: bold (700)
    - Color: text.primary
    - Line Height: 1.3
    ↓
H3 - Subsection Titles:
    - Size: { base: 'xl', md: '2xl', lg: '3xl' }
    - Weight: semibold (600)
    - Color: text.primary
    - Line Height: 1.4
    ↓
H4 - Component Titles:
    - Size: { base: 'lg', md: 'xl', lg: '2xl' }
    - Weight: semibold (600)
    - Color: text.primary
    - Line Height: 1.4
    ↓
Body Text:
    - Size: base (16px)
    - Weight: normal (400)
    - Color: text.secondary
    - Line Height: 1.6
    ↓
Small Text:
    - Size: sm (14px)
    - Weight: normal (400)
    - Color: text.tertiary
    - Line Height: 1.5
```

---

## 4. Component Design System

### 4.1 Button Design Workflow
```
Button Variants:
    ↓
Primary Button (CTA):
    - Background: neon.500 (#00C2FF)
    - Text Color: dark.900 (#0D0D0D)
    - Border Radius: full (pill shape)
    - Hover: neon.400 + neon.glow shadow + translateY(-2px)
    - Focus: neon.400 + focus shadow (accessibility)
    - Active: neon.600 + translateY(0)
    - Usage: Main actions (Book Now, Continue, Submit)
    ↓
Secondary Button:
    - Background: transparent
    - Border: 2px neon.500
    - Text Color: neon.500
    - Hover: neon.500 background + dark.900 text + glow
    - Usage: Secondary actions (Back, Cancel, Learn More)
    ↓
Outline Button:
    - Background: transparent
    - Border: 2px border.primary
    - Text Color: text.primary
    - Hover: bg.surface.hover + border.neon + neon.500 text
    - Usage: Tertiary actions
    ↓
Ghost Button:
    - Background: transparent
    - Text Color: text.primary
    - Hover: bg.surface.hover + neon.500 text
    - Usage: Subtle actions (menu items, links)
    ↓
Destructive Button:
    - Background: transparent
    - Border: 2px error.500
    - Text Color: error.500
    - Hover: error.500 background + white text + red glow
    - Usage: Delete, cancel, destructive actions
    ↓
Header CTA Button:
    - Background: neon.blue (#00C2FF)
    - Text Color: dark.900
    - Special: Gradient hover (neon.blue → neon.purple)
    - Shadow: Enhanced neon glow
    - Usage: Header booking button
```

### 4.2 Button Size System
```
Size Variants:
    ↓
Small (sm):
    - Height: 36px
    - Padding: 16px horizontal, 8px vertical
    - Font Size: 14px
    - Usage: Compact spaces, secondary actions
    ↓
Medium (md):
    - Height: 48px (mobile optimized)
    - Padding: 24px horizontal, 12px vertical
    - Font Size: 16px
    - Usage: Default mobile size
    ↓
Large (lg):
    - Height: 56px (desktop optimized)
    - Padding: 24px horizontal, 12px vertical
    - Font Size: 16px
    - Usage: Default desktop size, main CTAs
    ↓
Extra Large (xl):
    - Height: 64px
    - Padding: 32px horizontal, 16px vertical
    - Font Size: 18px
    - Usage: Hero buttons, landing page CTAs
```

### 4.3 Form Component Design
```
Input Field Design:
    ↓
Base Styling:
    - Background: bg.input (#262626)
    - Border: 2px border.primary (#404040)
    - Border Radius: lg (12px)
    - Text Color: text.primary
    - Min Height: 44px (touch-friendly)
    - Padding: 16px horizontal, 12px vertical
    ↓
Interactive States:
    - Hover: border.neon (#00C2FF) border
    - Focus: neon.500 border + neon.glow shadow + bg.surface
    - Invalid: error.500 border + red glow shadow
    - Disabled: 50% opacity + not-allowed cursor
    ↓
Placeholder Styling:
    - Color: text.tertiary (#A3A3A3)
    - Style: Italic (optional)
    ↓
Select Dropdown:
    - Same base styling as input
    - Custom dropdown arrow: text.secondary
    - Option styling: bg.surface with hover states
    - Selected option: neon.500 background + dark.900 text
```

### 4.4 Card Component Design
```
Card Variants:
    ↓
Default Card:
    - Background: bg.card (#1A1A1A)
    - Border: 1px border.primary (#404040)
    - Border Radius: xl (16px)
    - Box Shadow: md (medium depth)
    - Neon gradient border effect (pseudo-element)
    ↓
Elevated Card:
    - Background: bg.surface.elevated (#262626)
    - Enhanced neon gradient border
    - Box Shadow: lg (more depth)
    - Usage: Modals, important content
    ↓
Interactive Card:
    - Cursor: pointer
    - Hover: translateY(-4px) + xl shadow + border.neon
    - Transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)
    - Usage: Clickable cards, navigation items
    ↓
Gradient Border Effect:
    - Pseudo-element with linear gradient
    - Colors: neon.500 → brand.500 (rgba with opacity)
    - Mask technique for border-only gradient
    - Enhanced on elevated variant
```

---

## 5. Layout & Spacing System

### 5.1 Breakpoint System
```
Responsive Breakpoints:
    ↓
base: 0px
    - Mobile-first approach
    - Single column layouts
    - Touch-optimized components
    ↓
sm: 420px
    - Large mobile devices
    - Single column with more spacing
    - Larger touch targets
    ↓
md: 700px
    - Tablet devices
    - Form layouts optimized
    - Two-column layouts possible
    ↓
lg: 1024px
    - Desktop devices
    - Multi-column layouts
    - Sidebar navigation
    ↓
xl: 1280px
    - Large desktop
    - Container max-width
    - Optimal reading width
    ↓
2xl: 1536px
    - Extra large screens
    - Extended layouts
    - Wide containers
```

### 5.2 Spacing Scale
```
Spacing System (based on 4px grid):
    ↓
Micro Spacing:
    - 0.5: 2px (1px borders, fine adjustments)
    - 1: 4px (Tight spacing)
    - 1.5: 6px (Small gaps)
    - 2: 8px (Base unit)
    ↓
Component Spacing:
    - 3: 12px (Small component padding)
    - 4: 16px (Standard component padding)
    - 5: 20px (Medium spacing)
    - 6: 24px (Large component padding)
    - 8: 32px (Section spacing)
    ↓
Layout Spacing:
    - 10: 40px (Small section gaps)
    - 12: 48px (Medium section gaps)
    - 16: 64px (Large section gaps)
    - 20: 80px (Page section spacing)
    - 24: 96px (Hero section spacing)
    ↓
Container Spacing:
    - 32: 128px (Large layout spacing)
    - 40: 160px (Extra large spacing)
    - 48: 192px (Maximum spacing)
```

### 5.3 Container System
```
Container Workflow:
    ↓
Max Width System:
    - base: 100% (Full width on mobile)
    - sm: 420px (Small container)
    - md: 700px (Medium container)
    - lg: 1024px (Large container)
    - xl: 1280px (Extra large container)
    ↓
Padding System:
    - base: 16px (Mobile padding)
    - sm: 16px (Small screen padding)
    - md: 24px (Medium screen padding)
    - lg: 32px (Large screen padding)
    ↓
Center Alignment:
    - Margin: auto (Horizontal centering)
    - Max-width constraints per breakpoint
```

---

## 6. Shadow & Effects System

### 6.1 Standard Shadows
```
Shadow Hierarchy:
    ↓
xs: 0 1px 2px rgba(0,0,0,0.3)
    - Usage: Small elements, badges
    ↓
sm: 0 2px 8px rgba(0,0,0,0.4)
    - Usage: Buttons, small cards
    ↓
md: 0 6px 16px rgba(0,0,0,0.5)
    - Usage: Default cards, panels
    ↓
lg: 0 12px 24px rgba(0,0,0,0.6)
    - Usage: Elevated cards, dropdowns
    ↓
xl: 0 24px 48px rgba(0,0,0,0.7)
    - Usage: Modals, large overlays
```

### 6.2 Neon Glow Effects
```
Special Effects:
    ↓
neon: 0 0 20px rgba(0,194,255,0.3)
    - Usage: Subtle neon glow
    - Applied to: Input focus, button hover
    ↓
neon.glow: 0 0 30px rgba(0,194,255,0.4)
    - Usage: Enhanced neon glow
    - Applied to: Primary button hover
    ↓
brand.glow: 0 0 20px rgba(0,209,143,0.3)
    - Usage: Brand color glow
    - Applied to: Secondary elements
    ↓
focus: 0 0 0 3px rgba(0,194,255,0.5)
    - Usage: Accessibility focus indicator
    - Applied to: All focusable elements
```

---

## 7. Animation & Transition System

### 7.1 Timing Functions
```
Transition System:
    ↓
Fast Transitions:
    - Duration: 150ms
    - Easing: cubic-bezier(0.4, 0, 0.2, 1)
    - Usage: Quick feedback, micro-interactions
    ↓
Normal Transitions:
    - Duration: 200ms (default)
    - Easing: cubic-bezier(0.4, 0, 0.2, 1)
    - Usage: Button hover, input focus
    ↓
Slow Transitions:
    - Duration: 300ms
    - Easing: cubic-bezier(0.4, 0, 0.2, 1)
    - Usage: Modal open, page transitions
```

### 7.2 Common Animations
```
Hover Effects:
    ↓
Button Hover:
    - Transform: translateY(-2px)
    - Shadow: Enhanced glow
    - Color: Lighter variant
    - Duration: 200ms
    ↓
Card Hover:
    - Transform: translateY(-4px)
    - Shadow: xl shadow
    - Border: neon.500
    - Duration: 200ms
    ↓
Input Focus:
    - Border Color: neon.500
    - Shadow: neon.glow
    - Background: bg.surface
    - Duration: 200ms
```

### 7.3 Motion Reduction Support
```
Accessibility Considerations:
    ↓
Reduced Motion Query:
    @media (prefers-reduced-motion: reduce)
    ↓
Reduced Animation:
    - Animation Duration: 0.01ms !important
    - Animation Iteration: 1 !important
    - Transition Duration: 0.01ms !important
    ↓
Fallback Behavior:
    - Instant state changes
    - No transform animations
    - Maintained functionality
```

---

## 8. Brand Identity System

### 8.1 Logo System Workflow
```
Logo Variants:
    ↓
Primary Logo:
    - Files: speedy-van-logo-dark.svg, speedy-van-logo-light.svg
    - Size: 400×140px
    - Usage: Headers, marketing materials
    - Auto dark/light switching
    ↓
Wordmark:
    - File: speedy-van-wordmark.svg
    - Usage: Text-only contexts
    - Compact horizontal space
    ↓
App Icon:
    - File: speedy-van-icon.svg
    - Size: 64×64px
    - Usage: App icons, social media
    ↓
Minimal Icon:
    - File: speedy-van-icon-min.svg
    - Size: 48×48px
    - Usage: Very small spaces, favicons
```

### 8.2 Logo Usage Guidelines
```
Implementation Workflow:
    ↓
React Component Usage:
    <LogoChakra variant="logo" mode="auto" width={240} height={80} />
    <LogoChakra variant="wordmark" width={200} />
    <LogoChakra variant="icon" width={64} height={64} />
    ↓
Responsive Sizing:
    - Mobile: Smaller variants, icon-min for tight spaces
    - Tablet: Medium variants, wordmark for headers
    - Desktop: Full logo, optimal sizing
    ↓
Color Mode Switching:
    - Auto: Responds to system preference
    - Dark: Force dark variant
    - Light: Force light variant
```

### 8.3 Brand Color Application
```
Brand Color Usage:
    ↓
Primary Neon Blue (#00C2FF):
    - Usage: Primary buttons, links, focus states
    - Interactive elements, call-to-action
    - Loading indicators, progress bars
    ↓
Brand Green (#00D18F):
    - Usage: Success states, confirmations
    - Secondary actions, highlights
    - Positive feedback, completed states
    ↓
Neon Purple (#B026FF):
    - Usage: Gradient accents, special effects
    - Premium features, highlights
    - Decorative elements, gradients
```

---

## 9. Component Implementation Workflow

### 9.1 New Component Creation
```
Component Design Process:
    ↓
1. Design Token Selection:
    - Choose appropriate semantic tokens
    - Apply consistent spacing scale
    - Use standard shadow/glow effects
    ↓
2. Responsive Design:
    - Mobile-first approach
    - Breakpoint-specific adjustments
    - Touch-friendly sizing (44px minimum)
    ↓
3. Interactive States:
    - Hover: Enhanced styling + glow
    - Focus: Accessibility-compliant focus ring
    - Active: Pressed state feedback
    - Disabled: 50% opacity + cursor change
    ↓
4. Accessibility Implementation:
    - ARIA labels and descriptions
    - Keyboard navigation support
    - Screen reader compatibility
    - High contrast support
    ↓
5. Dark Mode Optimization:
    - Use semantic tokens
    - Test contrast ratios
    - Ensure readability
    - Maintain brand consistency
```

### 9.2 Component Styling Patterns
```
Styling Implementation:
    ↓
Chakra UI Integration:
    - Use theme tokens: bg="bg.surface"
    - Apply semantic colors: color="text.primary"
    - Leverage responsive props: p={{ base: 4, md: 6 }}
    ↓
Custom Styling:
    - CSS-in-JS with theme access
    - Styled-components integration
    - Custom CSS classes when needed
    ↓
Animation Integration:
    - Use theme transition values
    - Apply consistent timing functions
    - Respect motion preferences
```

---

## 10. Design Quality Assurance

### 10.1 Design Review Checklist
```
Quality Assurance Process:
    ↓
Color Compliance:
    ✅ Uses semantic tokens
    ✅ Maintains contrast ratios (WCAG AA)
    ✅ Consistent with brand palette
    ✅ Works in dark mode
    ↓
Typography Check:
    ✅ Uses Inter font family
    ✅ Appropriate font weights
    ✅ Consistent sizing scale
    ✅ Proper line heights
    ↓
Spacing Verification:
    ✅ Follows 4px grid system
    ✅ Consistent component padding
    ✅ Appropriate section spacing
    ✅ Responsive spacing adjustments
    ↓
Interactive States:
    ✅ Hover effects implemented
    ✅ Focus states accessible
    ✅ Active states provide feedback
    ✅ Disabled states clear
    ↓
Responsive Design:
    ✅ Mobile-first approach
    ✅ Touch-friendly targets (44px+)
    ✅ Appropriate breakpoint behavior
    ✅ Content remains readable
```

### 10.2 Accessibility Validation
```
Accessibility Checklist:
    ↓
Color Accessibility:
    ✅ Contrast ratio ≥ 4.5:1 for normal text
    ✅ Contrast ratio ≥ 3:1 for large text
    ✅ Color not sole indicator of meaning
    ✅ Focus indicators visible
    ↓
Keyboard Navigation:
    ✅ All interactive elements focusable
    ✅ Focus order logical
    ✅ Keyboard shortcuts work
    ✅ Focus trapping in modals
    ↓
Screen Reader Support:
    ✅ Semantic HTML structure
    ✅ Appropriate ARIA labels
    ✅ Descriptive alt text
    ✅ Status announcements
```

---

## 11. Design System Maintenance

### 11.1 Token Management
```
Design Token Updates:
    ↓
Color Token Changes:
    1. Update theme.ts file
    2. Update tokens.json
    3. Test across all components
    4. Validate accessibility
    5. Update documentation
    ↓
Component Updates:
    1. Modify component variants
    2. Test responsive behavior
    3. Validate interactive states
    4. Update Storybook examples
    5. Document changes
    ↓
Breaking Changes:
    1. Version bump
    2. Migration guide
    3. Deprecation warnings
    4. Gradual rollout
```

### 11.2 Design System Evolution
```
Continuous Improvement:
    ↓
User Feedback Integration:
    - Collect usability feedback
    - Analyze accessibility reports
    - Monitor performance metrics
    - Implement improvements
    ↓
Technology Updates:
    - Chakra UI version updates
    - New CSS features adoption
    - Performance optimizations
    - Browser compatibility
    ↓
Design Trend Integration:
    - Evaluate new patterns
    - Maintain brand consistency
    - Test with users
    - Gradual implementation
```

---

## 12. Implementation Guidelines

### 12.1 Developer Workflow
```
Component Development:
    ↓
1. Design Review:
    - Check Figma designs
    - Identify required tokens
    - Plan responsive behavior
    ↓
2. Token Implementation:
    - Use semantic tokens
    - Apply consistent patterns
    - Follow naming conventions
    ↓
3. Responsive Implementation:
    - Mobile-first CSS
    - Breakpoint-specific adjustments
    - Touch optimization
    ↓
4. Accessibility Implementation:
    - ARIA attributes
    - Keyboard navigation
    - Focus management
    ↓
5. Testing & Validation:
    - Visual testing
    - Accessibility testing
    - Responsive testing
    - Performance testing
```

### 12.2 Code Standards
```
Code Quality Standards:
    ↓
Styling Conventions:
    - Use Chakra UI props when possible
    - Semantic token usage: bg="bg.surface"
    - Responsive props: p={{ base: 4, md: 6 }}
    - Consistent naming patterns
    ↓
Component Structure:
    - TypeScript interfaces
    - Default props
    - Proper prop forwarding
    - Accessibility attributes
    ↓
Performance Considerations:
    - Minimal re-renders
    - Efficient CSS-in-JS
    - Lazy loading when appropriate
    - Optimized animations
```

---

## 13. Design Tools & Resources

### 13.1 Design Tools Integration
```
Design Workflow Tools:
    ↓
Figma Integration:
    - Design token sync
    - Component library
    - Prototype handoffs
    - Design system documentation
    ↓
Development Tools:
    - Chakra UI DevTools
    - React DevTools
    - Accessibility testing tools
    - Performance monitoring
    ↓
Testing Tools:
    - Storybook for component showcase
    - Chromatic for visual testing
    - axe-core for accessibility
    - Lighthouse for performance
```

### 13.2 Documentation Maintenance
```
Documentation Updates:
    ↓
Design System Docs:
    - Component API documentation
    - Usage examples
    - Best practices
    - Migration guides
    ↓
Code Documentation:
    - TypeScript interfaces
    - JSDoc comments
    - README files
    - Changelog maintenance
```

---

This comprehensive color and design workflow ensures consistent, accessible, and maintainable design implementation across the entire Speedy Van platform. The system provides clear guidelines for designers and developers while maintaining the premium neon aesthetic and professional user experience.


-----------------------------------------------------------
# Speedy Van - Pricing Engine Workflow

## Overview
This document outlines the complete pricing engine workflow for Speedy Van, covering all pricing calculations, dynamic factors, rules engine, and pricing strategies from quote generation to final billing.

---

## 1. Pricing Engine Architecture

### 1.1 Core Components
```
Pricing System Architecture:
    ↓
Main Pricing Engine:
    - PricingCalculator (packages/pricing)
    - PricingEngine (apps/web/src/lib/pricing)
    - FairPricingSystem (fair distribution)
    - PricingRulesEngine (dynamic rules)
    ↓
Supporting Systems:
    - Item Catalog (volume/weight data)
    - Distance Calculator (Mapbox integration)
    - Weather API (pricing adjustments)
    - Traffic API (congestion factors)
    - Demand Analyzer (real-time pricing)
    ↓
Output Systems:
    - Quote Generation
    - Pricing Breakdown
    - Driver Payout Calculation
    - Invoice Generation
```

### 1.2 Pricing Data Flow
```
Quote Request Flow:
    ↓
Input Validation:
    - Location coordinates
    - Item list validation
    - Service type verification
    - Date/time validation
    ↓
Base Calculation:
    - Distance calculation
    - Vehicle type determination
    - Service type selection
    - Base pricing application
    ↓
Dynamic Adjustments:
    - Weather multipliers
    - Traffic conditions
    - Seasonal adjustments
    - Demand-based pricing
    ↓
Rules Engine:
    - Promotional codes
    - Special discounts
    - Minimum order values
    - Maximum price caps
    ↓
Final Processing:
    - VAT calculation
    - Rounding rules
    - Breakdown generation
    - Quote response
```

---

## 2. Base Pricing Calculation

### 2.1 Service Type Pricing
```
Service Categories:
    ↓
Man & Van Service:
    - Base Price: £45.00
    - Price Per Mile: £1.50
    - Price Per Hour: £35.00
    - Crew Size: 2 (driver + helper)
    - Max Volume: 15m³
    - Max Weight: 1000kg
    - Included: Loading/unloading, basic packing materials
    ↓
Van Only Service:
    - Base Price: £35.00
    - Price Per Mile: £1.20
    - Crew Size: 0 (customer drives)
    - Max Volume: 12m³
    - Max Weight: 800kg
    - Included: Van rental, basic insurance, fuel
    ↓
Large Van Service:
    - Base Price: £65.00
    - Price Per Mile: £2.00
    - Price Per Hour: £45.00
    - Crew Size: 2
    - Max Volume: 25m³
    - Max Weight: 1500kg
    - Included: 2-person crew, furniture protection
    ↓
Premium Service:
    - Base Price: £85.00
    - Price Per Mile: £2.50
    - Price Per Hour: £60.00
    - Crew Size: 3
    - Max Volume: 30m³
    - Max Weight: 2000kg
    - Included: Full packing, premium insurance, white-glove
    ↓
Multiple Trips Service:
    - Base Price: £55.00
    - Price Per Mile: £1.75
    - Price Per Hour: £40.00
    - Crew Size: 2
    - Max Volume: 50m³ (across trips)
    - Max Weight: 3000kg
    - Included: Coordination, flexible scheduling
```

### 2.2 Vehicle Capacity Matrix
```
Vehicle Type Specifications:
    ↓
Pickup Truck:
    - Max Weight: 500kg
    - Max Volume: 5m³
    - Max Items: 25
    - Base Price: £30
    - Price Per KM: £2.00
    - Price Per Minute: £0.80
    ↓
Transit Van:
    - Max Weight: 1000kg
    - Max Volume: 10m³
    - Max Items: 50
    - Base Price: £50
    - Price Per KM: £2.50
    - Price Per Minute: £1.00
    ↓
Large Truck:
    - Max Weight: 3000kg
    - Max Volume: 25m³
    - Max Items: 100
    - Base Price: £100
    - Price Per KM: £4.00
    - Price Per Minute: £1.50
```

---

## 3. Distance & Location Pricing

### 3.1 Distance Calculation Workflow
```
Distance Pricing Process:
    ↓
Route Calculation:
    - Mapbox Directions API
    - Real-time traffic data
    - Optimal route selection
    - Alternative route analysis
    ↓
Distance Components:
    - Free Distance: 5 miles (no charge)
    - Standard Rate: £1.50 per mile (5-50 miles)
    - Long Distance Surcharge: +£0.25 per mile (>50 miles)
    - Long Distance Threshold: 50 miles
    ↓
Traffic Adjustments:
    - Low Traffic: 1.00x multiplier
    - Medium Traffic: 1.15x multiplier
    - High Traffic: 1.25x multiplier
    - Very High Traffic: 1.35x multiplier (max 20% cap)
    ↓
ULEZ Zone Pricing:
    - ULEZ Detection: Automatic zone checking
    - ULEZ Fee: £12.50 flat rate
    - Applied: When pickup or dropoff in ULEZ zone
```

### 3.2 Location-Based Factors
```
Location Adjustments:
    ↓
Property Type Multipliers:
    - House: 1.0x (base rate)
    - Flat/Apartment: 1.1x
    - Office: 1.15x
    - Storage Unit: 0.9x
    - Commercial: 1.2x
    ↓
Access Difficulty:
    - Normal Access: £0
    - Narrow Access: +£20
    - Long Carry (>50m): +£25
    - Restricted Parking: +£15
    - Time Restrictions: +£10
    ↓
Floor-Based Pricing:
    - Ground Floor: £0
    - With Lift: +£15 per floor
    - Without Lift: +£35 per floor
    - Basement: +£25 (additional)
    - Top Floor (>5): +£10 extra
```

---

## 4. Item-Based Pricing

### 4.1 Item Category Multipliers
```
Item Pricing Categories:
    ↓
Standard Items:
    - Boxes: 1.0x multiplier
    - Base Price: £5 per item
    - Volume Rate: £8 per m³
    ↓
Furniture Items:
    - Furniture: 1.5x multiplier
    - Special Handling: Required
    - Disassembly: +£15 per item
    - Assembly: +£20 per item
    ↓
Appliances:
    - Appliances: 1.8x multiplier
    - Disconnection: +£25 per item
    - Reconnection: +£35 per item
    - Warranty Protection: +£15
    ↓
Fragile Items:
    - Fragile: 2.0x multiplier
    - Special Packaging: +£15 per item
    - Insurance Premium: +£10
    - Careful Handling: Required
    ↓
Other Items:
    - General: 1.2x multiplier
    - Assessment Required: Manual pricing
```

### 4.2 Special Item Surcharges
```
High-Value Items:
    ↓
Piano Surcharge:
    - Upright Piano: +£50
    - Grand Piano: +£100
    - Special Equipment: Required
    - Extra Crew: +1 person
    ↓
Antique Surcharge:
    - Antique Items: +£25 per item
    - Valuation Required: >£1000
    - Special Insurance: +£20
    - White Glove Service: Recommended
    ↓
Artwork Surcharge:
    - Artwork: +£30 per piece
    - Custom Crating: +£40
    - Climate Control: +£25
    - Insurance: Based on value
    ↓
Heavy Item Surcharge:
    - Items >50kg: +£10 per item
    - Items >100kg: +£25 per item
    - Special Equipment: Required
    - Extra Crew: May be needed
    ↓
Valuable Item Surcharge:
    - High Value (>£500): +£20 per item
    - Security Transport: +£35
    - Chain of Custody: Required
    - Photo Documentation: Included
```

### 4.3 Volume Calculation System
```
Volume-Based Pricing:
    ↓
Volume Calculation Methods:
    - Catalog Lookup: Predefined item volumes
    - Dimension Input: L × W × H calculation
    - Category Estimation: Average volumes
    - Manual Override: Admin adjustment
    ↓
Volume Pricing Tiers:
    - Small Load (0-5m³): Standard rate
    - Medium Load (5-15m³): Standard rate
    - Large Load (15-25m³): 5% discount
    - Bulk Load (>25m³): 10% discount
    ↓
Volume Discount Rules:
    - Threshold: 10m³
    - Discount Rate: 10%
    - Maximum Discount: £100
    - Applied: After base calculations
```

---

## 5. Time-Based Pricing

### 5.1 Duration Calculation
```
Time Pricing Components:
    ↓
Estimated Duration:
    - Base Loading Time: 30 minutes
    - Travel Time: Distance-based calculation
    - Unloading Time: 30 minutes
    - Item Complexity: Additional time per item
    ↓
Minimum Duration:
    - Minimum Booking: 2 hours
    - Minimum Charge: Applied regardless of actual time
    - Short Job Surcharge: For <1 hour jobs
    ↓
Hourly Rates:
    - Standard Rate: £35/hour
    - Overtime Rate: £52.50/hour (1.5x after 8 hours)
    - Weekend Rate: £42/hour (1.2x)
    - Holiday Rate: £70/hour (2.0x)
    ↓
Time Slot Multipliers:
    - Early Morning (6-8 AM): 1.1x
    - Standard Hours (8 AM-6 PM): 1.0x
    - Evening (6-9 PM): 1.15x
    - Late Evening (9 PM-11 PM): 1.3x
    - Night Time (11 PM-6 AM): 1.5x
```

### 5.2 Scheduling Factors
```
Date/Time Adjustments:
    ↓
Day of Week Multipliers:
    - Monday-Thursday: 1.0x
    - Friday: 1.05x
    - Saturday: 1.2x
    - Sunday: 1.3x
    - Bank Holidays: 1.5x
    ↓
Seasonal Multipliers:
    - Winter (Dec-Feb): 1.0x (normal)
    - Spring (Mar-May): 1.1x (high)
    - Summer (Jun-Aug): 1.2x (peak)
    - Autumn (Sep-Nov): 1.1x (high)
    - Christmas Period: 1.5x (premium)
    ↓
Advance Booking Discounts:
    - Same Day: 1.2x surcharge
    - 1-2 Days: 1.1x surcharge
    - 3-7 Days: 1.0x (standard)
    - 1-2 Weeks: 0.95x discount
    - >2 Weeks: 0.9x discount
```

---

## 6. Dynamic Pricing Factors

### 6.1 Weather-Based Pricing
```
Weather Impact Calculation:
    ↓
Weather Conditions:
    - Normal Weather: 0% surcharge
    - Light Rain: +2% surcharge
    - Medium Rain: +5% surcharge
    - Heavy Rain: +10% surcharge
    - Strong Wind: +10% surcharge
    - Snow/Ice: +15% surcharge
    - Storm Warning: +20% surcharge (maximum)
    ↓
Weather Data Sources:
    - Weather API Integration
    - Real-time conditions
    - Forecast-based adjustments
    - Location-specific data
    ↓
Weather Safety Rules:
    - Maximum Weather Surcharge: 20%
    - Severe Weather: Service suspension
    - Safety Priority: Over profit
    - Customer Notification: Weather delays
```

### 6.2 Demand-Based Pricing
```
Demand Multipliers:
    ↓
Demand Levels:
    - Low Demand: 0.95x multiplier
    - Medium Demand: 1.0x multiplier
    - High Demand: 1.15x multiplier
    - Very High Demand: 1.3x multiplier (maximum)
    ↓
Demand Calculation Factors:
    - Driver Availability: Real-time tracking
    - Booking Volume: Historical patterns
    - Seasonal Trends: Predictive analysis
    - Local Events: Manual adjustments
    ↓
Demand Response Rules:
    - Update Frequency: Every 15 minutes
    - Maximum Surge: 30% above base
    - Gradual Increases: 5% increments
    - Customer Notification: Surge pricing alerts
```

### 6.3 Traffic-Based Adjustments
```
Traffic Impact Pricing:
    ↓
Traffic Levels:
    - Free Flow: 1.0x multiplier
    - Light Traffic: 1.05x multiplier
    - Moderate Traffic: 1.15x multiplier
    - Heavy Traffic: 1.25x multiplier
    - Severe Congestion: 1.35x multiplier (max 20% cap)
    ↓
Traffic Data Integration:
    - Real-time Traffic APIs
    - Route optimization
    - Alternative route pricing
    - Historical traffic patterns
    ↓
Traffic Pricing Rules:
    - Maximum Traffic Surcharge: 20%
    - Route Optimization: Automatic
    - Customer Choice: Multiple route options
    - Time Estimates: Updated in real-time
```

---

## 7. Pricing Rules Engine

### 7.1 Rule-Based Pricing System
```
Rules Engine Architecture:
    ↓
Rule Types:
    - Percentage Adjustments: Multiply by percentage
    - Fixed Adjustments: Add/subtract fixed amounts
    - Conditional Rules: If-then logic
    - Time-based Rules: Date/time conditions
    - Volume-based Rules: Quantity thresholds
    ↓
Default Pricing Rules:
    - Weekend Surcharge: +20% on Sat/Sun
    - Bulk Discount: -10% for >20 items
    - Long Distance Surcharge: +£25 for >45 min trips
    - Minimum Order: Ensure £30 minimum
    - Fragile Items: +£15 handling fee
    ↓
Rule Execution Order:
    - Priority-based execution (highest first)
    - Condition evaluation
    - Action application
    - Result validation
    - Next rule processing
```

### 7.2 Promotional Code System
```
Promo Code Types:
    ↓
Percentage Discounts:
    - FIRST20: 20% off first booking (max £50)
    - SAVE15: 15% off orders >£100 (max £75)
    - STUDENT10: 10% student discount (max £30)
    ↓
Fixed Amount Discounts:
    - SAVE25: £25 off orders >£150
    - WELCOME10: £10 off first booking
    ↓
Service-Based Discounts:
    - FREEPACKING: Free packing materials (£25 value)
    - FREEINSURANCE: Free premium insurance
    ↓
Promo Code Validation:
    - Code Existence: Valid code check
    - Usage Limits: Maximum uses per code
    - Expiry Dates: Time-based validity
    - Conditions: Minimum order, first-time customer
    - Service Restrictions: Applicable services only
```

---

## 8. Fair Pricing Distribution

### 8.1 Revenue Sharing Model
```
Fair Pricing Breakdown:
    ↓
Driver Payout (70%):
    - Base service amount
    - Distance charges
    - Time charges
    - Special item handling
    - Access difficulty fees
    ↓
Platform Fee (30%):
    - Technology costs
    - Customer support
    - Insurance coverage
    - Marketing expenses
    - System maintenance
    ↓
Transparent Distribution:
    - Driver sees full breakdown
    - Customer sees total cost
    - Clear percentage splits
    - No hidden fees
```

### 8.2 Driver Earnings Calculation
```
Driver Payout Process:
    ↓
Base Earnings:
    - Service base rate × 70%
    - Distance charges × 70%
    - Time charges × 70%
    ↓
Performance Bonuses:
    - High Rating Bonus: +£5 per job (4.8+ rating)
    - Completion Bonus: +£3 per completed job
    - Peak Time Bonus: +£10 during high demand
    - Weekly Target Bonus: +£50 for 20+ jobs
    ↓
Deductions:
    - Fuel Allowance: Already included
    - Vehicle Maintenance: Driver responsibility
    - Insurance: Platform covers
    - Taxes: Driver responsibility
    ↓
Payment Schedule:
    - Weekly Payments: Every Friday
    - Instant Cashout: Available for fee
    - Payment Methods: Bank transfer, digital wallet
```

---

## 9. Price Calculation Workflow

### 9.1 Step-by-Step Calculation
```
Pricing Calculation Process:
    ↓
Step 1: Input Validation
    - Validate coordinates
    - Check item list
    - Verify service type
    - Validate date/time
    ↓
Step 2: Base Price Calculation
    - Service type base price
    - Vehicle type determination
    - Minimum fare application
    ↓
Step 3: Distance Pricing
    - Calculate route distance
    - Apply distance rates
    - Add long-distance surcharges
    - Factor in traffic conditions
    ↓
Step 4: Item Pricing
    - Calculate total volume
    - Apply category multipliers
    - Add special item surcharges
    - Apply volume discounts
    ↓
Step 5: Time Pricing
    - Calculate estimated duration
    - Apply hourly rates
    - Add time slot multipliers
    - Factor in seasonal adjustments
    ↓
Step 6: Dynamic Adjustments
    - Weather multipliers
    - Demand multipliers
    - Traffic adjustments
    - ULEZ zone fees
    ↓
Step 7: Rules Engine
    - Apply pricing rules
    - Process promotional codes
    - Validate minimum/maximum prices
    ↓
Step 8: Final Calculations
    - Calculate subtotal
    - Apply VAT (if applicable)
    - Round to nearest penny
    - Generate breakdown
```

### 9.2 Price Validation & Limits
```
Price Validation Rules:
    ↓
Minimum Pricing:
    - Absolute Minimum: £25
    - Service Minimums: Vary by type
    - Distance Minimums: Based on mileage
    ↓
Maximum Pricing:
    - Absolute Maximum: £500 per job
    - Surge Pricing Cap: +30% maximum
    - Weather Surcharge Cap: +20% maximum
    - Traffic Surcharge Cap: +20% maximum
    ↓
Reasonableness Checks:
    - Price per mile validation
    - Price per hour validation
    - Total vs. components validation
    - Historical price comparison
    ↓
Error Handling:
    - Invalid inputs: Clear error messages
    - Calculation errors: Fallback pricing
    - API failures: Cached rates
    - Edge cases: Manual review
```

---

## 10. Quote Generation & Management

### 10.1 Quote Creation Process
```
Quote Generation Workflow:
    ↓
Quote Request:
    - Customer input collection
    - Service type selection
    - Item list compilation
    - Location verification
    ↓
Price Calculation:
    - Run pricing engine
    - Apply all factors
    - Generate breakdown
    - Validate results
    ↓
Quote Formatting:
    - Customer-friendly breakdown
    - Terms and conditions
    - Validity period (24 hours)
    - Booking instructions
    ↓
Quote Delivery:
    - Instant web display
    - Email confirmation
    - SMS notification
    - PDF generation
```

### 10.2 Quote Management
```
Quote Lifecycle:
    ↓
Quote States:
    - Generated: Initial creation
    - Viewed: Customer accessed
    - Modified: Customer changes
    - Accepted: Customer books
    - Expired: Past validity period
    - Cancelled: Customer declined
    ↓
Quote Updates:
    - Price changes: New calculation required
    - Service changes: Re-quote needed
    - Item changes: Volume recalculation
    - Date changes: Time-based repricing
    ↓
Quote Tracking:
    - Generation timestamp
    - Customer interactions
    - Modification history
    - Conversion tracking
    - Abandonment analysis
```

---

## 11. Integration Points

### 11.1 External API Integrations
```
Pricing System Integrations:
    ↓
Mapbox Integration:
    - Distance calculation
    - Route optimization
    - Traffic data
    - Geocoding services
    ↓
Weather API:
    - Current conditions
    - Forecast data
    - Severe weather alerts
    - Location-specific data
    ↓
Traffic APIs:
    - Real-time traffic
    - Historical patterns
    - Route alternatives
    - Congestion predictions
    ↓
Payment Integration (Stripe):
    - Price validation
    - Currency handling
    - Tax calculation
    - Payment processing
```

### 11.2 Internal System Integration
```
System Connections:
    ↓
Booking System:
    - Quote to booking conversion
    - Price lock mechanisms
    - Service confirmation
    - Customer notifications
    ↓
Driver System:
    - Earnings calculation
    - Job assignment
    - Performance tracking
    - Payout processing
    ↓
Customer System:
    - Price history
    - Discount eligibility
    - Loyalty programs
    - Billing records
    ↓
Admin System:
    - Price monitoring
    - Rule management
    - Performance analytics
    - Manual overrides
```

---

## 12. Pricing Analytics & Optimization

### 12.1 Performance Monitoring
```
Pricing Analytics:
    ↓
Key Metrics:
    - Average order value
    - Price acceptance rate
    - Quote-to-booking conversion
    - Customer price sensitivity
    - Driver earnings satisfaction
    ↓
Performance Tracking:
    - Calculation speed
    - API response times
    - Error rates
    - Cache hit rates
    - System availability
    ↓
Business Intelligence:
    - Revenue optimization
    - Demand forecasting
    - Competitive analysis
    - Profit margin tracking
    - Market positioning
```

### 12.2 Continuous Optimization
```
Pricing Optimization Process:
    ↓
A/B Testing:
    - Price point testing
    - Discount effectiveness
    - Surge pricing impact
    - Service tier performance
    ↓
Machine Learning:
    - Demand prediction
    - Price optimization
    - Customer behavior analysis
    - Dynamic pricing models
    ↓
Market Analysis:
    - Competitor pricing
    - Market positioning
    - Customer feedback
    - Industry benchmarks
    ↓
Optimization Actions:
    - Rate adjustments
    - Rule modifications
    - Service tier changes
    - Promotional strategies
```

---

## 13. Error Handling & Fallbacks

### 13.1 Error Management
```
Error Handling Strategy:
    ↓
Input Validation Errors:
    - Clear error messages
    - Field-specific validation
    - Helpful suggestions
    - Retry mechanisms
    ↓
Calculation Errors:
    - Fallback pricing models
    - Default rate application
    - Manual review flags
    - Customer notifications
    ↓
API Integration Errors:
    - Cached data usage
    - Estimated calculations
    - Service degradation
    - Error logging
    ↓
System Errors:
    - Graceful degradation
    - Basic pricing mode
    - Admin notifications
    - Recovery procedures
```

### 13.2 Fallback Mechanisms
```
Fallback Pricing:
    ↓
Distance API Failure:
    - Straight-line distance
    - Historical averages
    - Manual input option
    - Conservative estimates
    ↓
Weather API Failure:
    - No weather surcharge
    - Seasonal defaults
    - Historical patterns
    - Manual overrides
    ↓
Traffic API Failure:
    - Time-of-day defaults
    - Historical traffic patterns
    - Conservative estimates
    - Route optimization disabled
    ↓
Complete System Failure:
    - Basic rate card
    - Manual pricing
    - Admin intervention
    - Customer communication
```

---

## 14. Pricing Administration

### 14.1 Admin Controls
```
Admin Pricing Management:
    ↓
Rate Management:
    - Base rate adjustments
    - Service type pricing
    - Multiplier modifications
    - Surcharge updates
    ↓
Rule Management:
    - Add/remove rules
    - Modify conditions
    - Update actions
    - Rule priority changes
    ↓
Promotional Management:
    - Create promo codes
    - Set usage limits
    - Define conditions
    - Track performance
    ↓
Override Capabilities:
    - Manual price adjustments
    - Customer-specific pricing
    - Emergency rate changes
    - Bulk price updates
```

### 14.2 Monitoring & Alerts
```
System Monitoring:
    ↓
Price Monitoring:
    - Unusual price alerts
    - Rate change notifications
    - Competitive price tracking
    - Customer complaints
    ↓
Performance Alerts:
    - High error rates
    - Slow response times
    - API failures
    - System downtime
    ↓
Business Alerts:
    - Low conversion rates
    - High abandonment
    - Driver complaints
    - Revenue anomalies
    ↓
Response Procedures:
    - Alert escalation
    - Issue investigation
    - Resolution tracking
    - Post-incident review
```

---

This comprehensive pricing engine workflow ensures accurate, fair, and competitive pricing while maintaining system reliability and business profitability. The system balances multiple factors to provide transparent pricing for customers and fair compensation for drivers while supporting sustainable business operations.


-----------------------------------------------------------------------------

# Speedy Van - Driver Earnings & Payouts Workflow

## Overview
This document outlines the complete driver earnings and payout system for Speedy Van, covering earning calculations, performance bonuses, payout processing, and financial management from job completion to driver payment.

---

## 1. Driver Earnings System Architecture

### 1.1 Core Components
```
Driver Earnings System:
    ↓
Fair Pricing Distribution:
    - Customer Payment: 100% (total booking cost)
    - Driver Payout: 70% (fair share)
    - Platform Fee: 30% (operational costs)
    ↓
Earnings Calculation Engine:
    - Base earnings calculation
    - Performance bonuses
    - Tips integration
    - Surge pricing
    - Deductions processing
    ↓
Payout Processing System:
    - Earnings aggregation
    - Payout scheduling
    - Payment processing
    - Financial reporting
    ↓
Performance Tracking:
    - Rating system
    - KPI monitoring
    - Bonus eligibility
    - Quality metrics
```

### 1.2 Earnings Data Flow
```
Job Completion to Payout Flow:
    ↓
Job Assignment Completed:
    - Assignment status: "completed"
    - Customer payment processed
    - Service delivery confirmed
    ↓
Earnings Calculation:
    - Fair pricing breakdown
    - Driver share calculation (70%)
    - Tips addition
    - Performance bonuses
    ↓
Earnings Record Creation:
    - Database record created
    - Breakdown stored
    - Status: unpaid
    - Audit trail
    ↓
Payout Processing:
    - Earnings aggregation
    - Minimum threshold check
    - Payout creation
    - Payment execution
    ↓
Driver Payment:
    - Bank transfer/digital wallet
    - Payment confirmation
    - Receipt generation
    - Record update
```

---

## 2. Fair Pricing Distribution Model

### 2.1 Revenue Sharing Structure
```
Fair Distribution System:
    ↓
Customer Payment (100%):
    - Total booking amount
    - Includes VAT (20%)
    - All surcharges included
    - Payment processed via Stripe
    ↓
Driver Payout (70%):
    - Base service amount × 70%
    - Distance charges × 70%
    - Time charges × 70%
    - Special item fees × 70%
    - Access difficulty fees × 70%
    ↓
Platform Fee (30%):
    - Technology infrastructure
    - Customer support
    - Insurance coverage
    - Marketing & acquisition
    - System maintenance
    - Payment processing
```

### 2.2 Transparent Breakdown Example
```
Example Booking: £100 Total
    ↓
Customer Pays: £100.00
    ↓
Distribution:
    - Driver Receives: £70.00 (70%)
    - Platform Keeps: £30.00 (30%)
    ↓
Driver Breakdown:
    - Base Service: £31.50 (45% × 70%)
    - Distance: £21.00 (30% × 70%)
    - Time: £10.50 (15% × 70%)
    - Items: £7.00 (10% × 70%)
    - Total: £70.00
```

---

## 3. Base Earnings Calculation

### 3.1 Service-Based Earnings
```
Service Type Earnings:
    ↓
Man & Van Service:
    - Base Rate: £45 × 70% = £31.50
    - Per Mile: £1.50 × 70% = £1.05
    - Per Hour: £35 × 70% = £24.50
    - Crew: Driver + 1 helper
    ↓
Van Only Service:
    - Base Rate: £35 × 70% = £24.50
    - Per Mile: £1.20 × 70% = £0.84
    - Driver Only: No helpers
    ↓
Large Van Service:
    - Base Rate: £65 × 70% = £45.50
    - Per Mile: £2.00 × 70% = £1.40
    - Per Hour: £45 × 70% = £31.50
    ↓
Premium Service:
    - Base Rate: £85 × 70% = £59.50
    - Per Mile: £2.50 × 70% = £1.75
    - Per Hour: £60 × 70% = £42.00
    - Crew: Driver + 2 helpers
```

### 3.2 Distance & Time Earnings
```
Distance-Based Earnings:
    ↓
Free Distance: 5 miles (no additional charge)
Standard Rate: £1.50/mile × 70% = £1.05/mile
Long Distance (>50 miles): +£0.25/mile × 70% = +£0.175/mile
    ↓
Time-Based Earnings:
    ↓
Minimum Duration: 2 hours guaranteed
Standard Rate: £35/hour × 70% = £24.50/hour
Overtime (>8 hours): £52.50/hour × 70% = £36.75/hour
    ↓
Time Slot Multipliers:
    - Early Morning (6-8 AM): 1.1x
    - Standard Hours (8 AM-6 PM): 1.0x
    - Evening (6-9 PM): 1.15x
    - Late Evening (9 PM-11 PM): 1.3x
    - Night Time (11 PM-6 AM): 1.5x
```

### 3.3 Item & Access Earnings
```
Special Item Earnings (70% share):
    ↓
Piano Handling: £50 × 70% = £35.00
Antique Items: £25 × 70% = £17.50
Artwork: £30 × 70% = £21.00
Fragile Items: £15 × 70% = £10.50
Heavy Items (>50kg): £10 × 70% = £7.00
    ↓
Access Difficulty Earnings:
    ↓
No Lift Surcharge: £15/floor × 70% = £10.50/floor
Narrow Access: £20 × 70% = £14.00
Long Carry (>50m): £25 × 70% = £17.50
Stairs (without lift): £35/floor × 70% = £24.50/floor
```

---

## 4. Performance-Based Bonuses

### 4.1 Rating-Based Bonuses
```
Rating Bonus System:
    ↓
Excellent Performance (4.8+ stars):
    - Bonus: +£5 per completed job
    - Monthly Bonus: +£50 (20+ jobs)
    - Quarterly Bonus: +£150 (top 10%)
    ↓
Good Performance (4.5-4.7 stars):
    - Bonus: +£3 per completed job
    - Monthly Bonus: +£30 (20+ jobs)
    ↓
Standard Performance (4.0-4.4 stars):
    - Bonus: +£1 per completed job
    - No additional bonuses
    ↓
Below Standard (<4.0 stars):
    - No bonuses
    - Performance improvement required
    - Potential training/coaching
```

### 4.2 Completion Rate Bonuses
```
Completion Rate Incentives:
    ↓
Perfect Completion (100%):
    - Weekly Bonus: +£25 (5+ jobs)
    - Monthly Bonus: +£100 (20+ jobs)
    ↓
Excellent Completion (95-99%):
    - Weekly Bonus: +£15 (5+ jobs)
    - Monthly Bonus: +£60 (20+ jobs)
    ↓
Good Completion (90-94%):
    - Weekly Bonus: +£10 (5+ jobs)
    - Monthly Bonus: +£40 (20+ jobs)
    ↓
Below 90% Completion:
    - No completion bonuses
    - Performance review required
```

### 4.3 Punctuality Bonuses
```
On-Time Performance Rewards:
    ↓
Always On Time (95%+ punctuality):
    - Punctuality Bonus: +£3 per job
    - Monthly Bonus: +£75 (25+ jobs)
    ↓
Usually On Time (90-94%):
    - Punctuality Bonus: +£2 per job
    - Monthly Bonus: +£50 (25+ jobs)
    ↓
Often On Time (85-89%):
    - Punctuality Bonus: +£1 per job
    - Monthly Bonus: +£25 (25+ jobs)
    ↓
Below 85% On Time:
    - No punctuality bonuses
    - Time management training
```

### 4.4 Volume-Based Bonuses
```
Job Volume Incentives:
    ↓
High Volume (30+ jobs/month):
    - Volume Bonus: +£150/month
    - Priority job assignments
    - Flexible scheduling
    ↓
Good Volume (20-29 jobs/month):
    - Volume Bonus: +£75/month
    - Regular job flow
    ↓
Standard Volume (10-19 jobs/month):
    - Volume Bonus: +£25/month
    - Standard assignments
    ↓
Low Volume (<10 jobs/month):
    - No volume bonuses
    - Support for job acquisition
```

---

## 5. Tips & Gratuities System

### 5.1 Customer Tips Integration
```
Tips Processing Workflow:
    ↓
Customer Tip Payment:
    - In-app tipping option
    - Cash tips reporting
    - Credit card tips
    - Tip amount validation
    ↓
Tip Recording:
    - Tip amount stored
    - Assignment linkage
    - Driver notification
    - Customer receipt
    ↓
Tip Distribution:
    - 100% to driver
    - No platform commission
    - Added to payout
    - Separate from base earnings
    ↓
Tax Handling:
    - Tips reported for tax
    - Driver responsibility
    - Annual tax documentation
    - HMRC compliance
```

### 5.2 Tip Categories & Amounts
```
Typical Tip Ranges:
    ↓
Excellent Service:
    - 15-20% of job value
    - £10-£50 typical range
    - Exceptional handling
    - Customer delight
    ↓
Good Service:
    - 10-15% of job value
    - £5-£25 typical range
    - Professional service
    - Customer satisfaction
    ↓
Standard Service:
    - 5-10% of job value
    - £2-£15 typical range
    - Job completed well
    - No issues
    ↓
Cash Tips:
    - Driver self-reports
    - Honor system
    - Encouraged honesty
    - Tax implications
```

---

## 6. Surge Pricing & Demand Bonuses

### 6.1 Dynamic Surge Earnings
```
Surge Pricing Benefits:
    ↓
High Demand Periods:
    - Driver gets 70% of surge amount
    - Example: 1.3x surge = +21% driver earnings
    - Real-time surge notifications
    - Opt-in surge participation
    ↓
Weather-Based Surge:
    - Bad weather: +10-20% earnings
    - Storm conditions: +20% maximum
    - Safety priority maintained
    - Voluntary participation
    ↓
Peak Time Surge:
    - Weekend: +20% earnings
    - Holiday: +50% earnings
    - Evening: +15% earnings
    - Night: +50% earnings
    ↓
Event-Based Surge:
    - Local events: +25% earnings
    - Moving season: +15% earnings
    - Emergency situations: +30% earnings
```

### 6.2 Availability Bonuses
```
Availability Incentives:
    ↓
Always Available (24/7):
    - Availability Bonus: +£200/month
    - Priority assignments
    - Flexible scheduling
    ↓
High Availability (12+ hours/day):
    - Availability Bonus: +£100/month
    - Regular assignments
    - Good job flow
    ↓
Standard Availability (8+ hours/day):
    - Availability Bonus: +£50/month
    - Normal job distribution
    ↓
Limited Availability (<8 hours/day):
    - No availability bonuses
    - Lower priority assignments
```

---

## 7. Deductions & Expenses

### 7.1 Platform Deductions
```
Standard Deductions:
    ↓
Platform Fee: 30% of total booking
    - Technology costs
    - Customer support
    - Insurance coverage
    - Payment processing
    - Marketing expenses
    ↓
Payment Processing Fees:
    - Included in platform fee
    - No additional charges
    - Stripe fees covered
    ↓
Insurance Deductions:
    - Covered by platform
    - No driver deductions
    - Comprehensive coverage
    - Liability protection
```

### 7.2 Driver Responsibilities
```
Driver Expenses (Not Deducted):
    ↓
Vehicle Costs:
    - Fuel expenses
    - Vehicle maintenance
    - Insurance (personal)
    - MOT & licensing
    - Parking fees
    ↓
Tax Obligations:
    - Income tax (self-employed)
    - National Insurance
    - VAT (if applicable)
    - Record keeping
    ↓
Equipment:
    - Moving supplies
    - Safety equipment
    - Uniform/branding
    - Mobile phone
```

---

## 8. Earnings Calculation Process

### 8.1 Job Completion to Earnings
```
Earnings Calculation Workflow:
    ↓
Step 1: Job Completion
    - Assignment status: "completed"
    - Customer confirmation
    - Service delivery verified
    - Photos/documentation uploaded
    ↓
Step 2: Base Calculation
    - Retrieve booking details
    - Apply fair pricing (70% share)
    - Calculate service components
    - Apply time/distance factors
    ↓
Step 3: Bonus Application
    - Check performance metrics
    - Apply rating bonuses
    - Add completion bonuses
    - Include punctuality rewards
    ↓
Step 4: Tips Integration
    - Add customer tips (100%)
    - Include cash tips (self-reported)
    - Verify tip amounts
    - Update total earnings
    ↓
Step 5: Surge Adjustments
    - Apply surge multipliers
    - Add demand bonuses
    - Include weather premiums
    - Calculate final amount
    ↓
Step 6: Record Creation
    - Create earnings record
    - Store breakdown details
    - Set payout status: unpaid
    - Generate audit trail
```

### 8.2 Earnings Components Breakdown
```
Earnings Record Structure:
    ↓
Base Components:
    - baseAmountPence: Core service earnings
    - distanceAmountPence: Distance-based earnings
    - timeAmountPence: Time-based earnings
    - itemAmountPence: Item handling earnings
    ↓
Bonus Components:
    - performanceBonusPence: Rating/performance bonuses
    - punctualityBonusPence: On-time bonuses
    - completionBonusPence: Job completion bonuses
    - volumeBonusPence: High volume bonuses
    ↓
Additional Components:
    - surgeAmountPence: Surge pricing earnings
    - tipAmountPence: Customer tips
    - cashTipAmountPence: Self-reported cash tips
    ↓
Final Calculation:
    - netAmountPence: Total driver earnings
    - currency: 'GBP'
    - calculatedAt: Timestamp
    - paidOut: Boolean status
```

---

## 9. Payout Processing System

### 9.1 Payout Scheduling
```
Payout Schedule Options:
    ↓
Weekly Payouts (Standard):
    - Every Friday
    - Minimum: £50 threshold
    - Automatic processing
    - Bank transfer
    - 1-3 business days
    ↓
Instant Cashout (Premium):
    - On-demand payouts
    - Fee: £2.50 per cashout
    - Available 24/7
    - Digital wallet transfer
    - Instant processing
    ↓
Monthly Payouts (Alternative):
    - Last Friday of month
    - No minimum threshold
    - Bulk processing
    - Lower processing costs
    - Preferred by some drivers
```

### 9.2 Payout Eligibility & Thresholds
```
Payout Requirements:
    ↓
Minimum Thresholds:
    - Weekly: £50 minimum
    - Monthly: £20 minimum
    - Instant: £10 minimum
    - Emergency: £5 minimum (special cases)
    ↓
Account Requirements:
    - Verified bank account
    - Valid ID documents
    - Tax information complete
    - No outstanding issues
    ↓
Performance Requirements:
    - Active driver status
    - Completed onboarding
    - No serious violations
    - Current insurance/licensing
```

### 9.3 Payout Processing Workflow
```
Payout Creation Process:
    ↓
Step 1: Earnings Aggregation
    - Collect unpaid earnings
    - Verify amounts
    - Check thresholds
    - Validate eligibility
    ↓
Step 2: Payout Creation
    - Create payout record
    - Link earnings records
    - Set status: pending
    - Generate payout ID
    ↓
Step 3: Payment Processing
    - Initiate bank transfer
    - Process via Stripe Connect
    - Handle payment confirmations
    - Update status: processing
    ↓
Step 4: Completion
    - Confirm payment success
    - Update status: completed
    - Mark earnings as paid
    - Send driver notification
    ↓
Step 5: Failure Handling
    - Detect payment failures
    - Update status: failed
    - Log failure reason
    - Retry mechanism
    - Driver notification
```

---

## 10. Performance Metrics & KPIs

### 10.1 Driver Performance Tracking
```
Key Performance Indicators:
    ↓
Service Quality Metrics:
    - Average Rating: 1-5 stars
    - Total Ratings: Count of reviews
    - Review Comments: Qualitative feedback
    - Customer Complaints: Issue tracking
    ↓
Reliability Metrics:
    - Completion Rate: Completed/Claimed jobs
    - Acceptance Rate: Claimed/Offered jobs
    - Cancellation Rate: Cancelled/Total jobs
    - On-Time Rate: Punctual deliveries
    ↓
Activity Metrics:
    - Total Jobs: Lifetime job count
    - Monthly Jobs: Recent activity
    - Hours Worked: Time tracking
    - Availability Hours: Online time
    ↓
Safety Metrics:
    - Incident Reports: Safety violations
    - Accident Rate: Vehicle incidents
    - Customer Safety: Feedback scores
    - Compliance Rate: Rule adherence
```

### 10.2 Performance Calculation
```
Performance Metrics Calculation:
    ↓
Rating Calculation:
    - Sum of all ratings ÷ Total ratings
    - Weighted by recency
    - Minimum 5 ratings required
    - Updated after each job
    ↓
Completion Rate:
    - (Completed Jobs ÷ Claimed Jobs) × 100
    - Rolling 30-day window
    - Excludes customer cancellations
    - Target: >95%
    ↓
Acceptance Rate:
    - (Claimed Jobs ÷ Offered Jobs) × 100
    - Rolling 7-day window
    - Excludes system errors
    - Target: >80%
    ↓
On-Time Rate:
    - (On-Time Jobs ÷ Completed Jobs) × 100
    - Based on scheduled vs actual times
    - 15-minute tolerance
    - Target: >90%
```

---

## 11. Earnings Reporting & Analytics

### 11.1 Driver Earnings Dashboard
```
Earnings Dashboard Features:
    ↓
Real-Time Earnings:
    - Today's earnings
    - Week-to-date total
    - Month-to-date total
    - Year-to-date total
    ↓
Earnings Breakdown:
    - Base earnings
    - Performance bonuses
    - Tips received
    - Surge premiums
    - Total net earnings
    ↓
Performance Metrics:
    - Current rating
    - Completion rate
    - Jobs completed
    - Average per job
    ↓
Payout Information:
    - Next payout date
    - Pending amount
    - Payout history
    - Payment methods
```

### 11.2 Detailed Analytics
```
Earnings Analytics:
    ↓
Time-Based Analysis:
    - Hourly earnings patterns
    - Daily performance trends
    - Weekly/monthly comparisons
    - Seasonal variations
    ↓
Job-Based Analysis:
    - Earnings per job type
    - Distance vs earnings
    - Time vs earnings
    - Customer rating impact
    ↓
Performance Correlation:
    - Rating vs earnings
    - Speed vs bonuses
    - Availability vs jobs
    - Experience vs rates
    ↓
Market Comparison:
    - Peer benchmarking
    - Market averages
    - Top performer insights
    - Improvement opportunities
```

---

## 12. Tax & Legal Compliance

### 12.1 Tax Documentation
```
Tax Reporting Requirements:
    ↓
Driver Tax Status:
    - Self-employed contractor
    - Responsible for own taxes
    - Business expense deductions
    - VAT registration (if applicable)
    ↓
Platform Responsibilities:
    - Annual earnings statements
    - P60/P45 equivalent documents
    - Tip reporting
    - HMRC compliance
    ↓
Required Documentation:
    - Annual earnings summary
    - Monthly breakdown reports
    - Expense tracking tools
    - Tax calculation assistance
```

### 12.2 Legal Compliance
```
Regulatory Compliance:
    ↓
Employment Law:
    - Contractor classification
    - Minimum wage considerations
    - Working time regulations
    - Holiday pay exclusions
    ↓
Financial Regulations:
    - Payment processing compliance
    - Anti-money laundering
    - Data protection (GDPR)
    - Consumer protection
    ↓
Insurance Requirements:
    - Public liability coverage
    - Goods in transit insurance
    - Vehicle insurance
    - Professional indemnity
```

---

## 13. Dispute Resolution & Support

### 13.1 Earnings Disputes
```
Dispute Resolution Process:
    ↓
Common Dispute Types:
    - Incorrect earnings calculation
    - Missing bonuses
    - Tip discrepancies
    - Payout delays
    - Performance metric disputes
    ↓
Resolution Workflow:
    - Driver submits dispute
    - Automatic investigation
    - Evidence review
    - Decision communication
    - Appeal process
    ↓
Escalation Process:
    - Level 1: Automated review
    - Level 2: Human review
    - Level 3: Management review
    - Level 4: External mediation
```

### 13.2 Driver Support Services
```
Support Services Available:
    ↓
Financial Support:
    - Earnings optimization advice
    - Tax guidance
    - Banking assistance
    - Emergency advance payments
    ↓
Performance Support:
    - Rating improvement coaching
    - Efficiency training
    - Customer service training
    - Technology support
    ↓
Technical Support:
    - App troubleshooting
    - Payment issues
    - Account problems
    - Device support
```

---

## 14. Future Enhancements

### 14.1 Planned Features
```
Upcoming Improvements:
    ↓
Advanced Analytics:
    - Predictive earnings modeling
    - Optimization recommendations
    - Market trend analysis
    - Competitive benchmarking
    ↓
Enhanced Bonuses:
    - Customer loyalty bonuses
    - Referral rewards
    - Training completion bonuses
    - Community participation rewards
    ↓
Payment Innovations:
    - Cryptocurrency options
    - Real-time payments
    - Flexible payout schedules
    - Savings account integration
```

### 14.2 Long-Term Vision
```
Strategic Goals:
    ↓
Driver Success:
    - Maximize earning potential
    - Provide financial stability
    - Support career growth
    - Ensure fair compensation
    ↓
System Excellence:
    - Automated processing
    - Real-time calculations
    - Transparent reporting
    - Reliable payments
    ↓
Market Leadership:
    - Competitive rates
    - Industry-leading benefits
    - Driver satisfaction
    - Sustainable growth
```

---

This comprehensive driver earnings workflow ensures fair, transparent, and competitive compensation while maintaining system reliability and regulatory compliance. The system balances driver earning potential with business sustainability, providing clear pathways for income growth and performance improvement.

-----------------------------------------------------------------------

# Speedy Van - SEO Optimization Workflow

## Overview
This document outlines the comprehensive SEO strategy and workflow for Speedy Van, covering technical SEO, content optimization, local SEO, and performance monitoring to achieve #1 rankings for high-intent removal queries across the UK.

---

## 1. SEO Strategy Foundation

### 1.1 Core SEO Objectives
```
Primary SEO Goals:
    ↓
Organic Traffic Growth:
    - Target: 25% month-over-month increase
    - Focus: High-intent removal queries
    - Geography: UK-wide coverage
    - Conversion: 5%+ quote request rate
    ↓
Keyword Rankings:
    - Target: #1-3 positions for primary keywords
    - Primary Keywords: "man and van [location]"
    - Secondary: "furniture removal [location]"
    - Long-tail: "2 men with van [location]"
    ↓
Technical Performance:
    - Core Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.05, INP ≤ 200ms
    - Page Speed: 90+ PageSpeed Insights score
    - Mobile-first indexing optimization
    - Schema markup coverage: 100%
```

### 1.2 Target Keyword Strategy
```
Priority 1 Keywords:
    ↓
Primary Keywords (High Volume):
    - "man and van [location]"
    - "van and man [location]"
    - "2 men with van [location]"
    - "van with 2 men [location]"
    ↓
Service-Based Keywords:
    - "furniture removal [location]"
    - "house removal [location]"
    - "full house removal [location]"
    - "1 bedroom removal [location]"
    ↓
Commercial Intent Keywords:
    - "removal company [location]"
    - "moving service [location]"
    - "van hire with man [location]"
    - "professional movers [location]"
    ↓
Long-Tail Keywords:
    - "cheap man and van [location]"
    - "same day removal [location]"
    - "student moving service [location]"
    - "office relocation [location]"
```

---

## 2. Technical SEO Implementation

### 2.1 Site Architecture & Structure
```
Technical SEO Foundation:
    ↓
Next.js 14 App Router:
    - Server-side rendering (SSR)
    - Static site generation (SSG)
    - Incremental static regeneration (ISR)
    - Dynamic imports for performance
    ↓
URL Structure:
    - Clean, semantic URLs
    - Hierarchical structure
    - Location-based organization
    - Canonical URL management
    ↓
Site Structure:
    / (Homepage)
    /uk/ (UK index page)
    /uk/[location]/ (Location pages)
    /routes/[from]-to-[to]/ (Route pages)
    /services/ (Service pages)
    /about/ (About page)
    /how-it-works/ (Process page)
```

### 2.2 Meta Tags & Metadata
```
Metadata Implementation:
    ↓
Title Tags:
    - Format: "Service in Location | Speedy Van"
    - Example: "Man and Van in London | Speedy Van"
    - Length: 50-60 characters
    - Location-specific optimization
    ↓
Meta Descriptions:
    - Format: "Service description in Location. Benefits. CTA."
    - Example: "Local and long-distance removals in London. Transparent pricing, real-time tracking, insured movers."
    - Length: 150-160 characters
    - Include primary keywords
    ↓
Open Graph Tags:
    - og:title, og:description, og:image
    - og:type: "website"
    - og:locale: "en_GB"
    - Dynamic OG images per location
    ↓
Twitter Cards:
    - twitter:card: "summary_large_image"
    - twitter:site: "@speedyvan"
    - twitter:creator: "@speedyvan"
```

### 2.3 Structured Data (Schema.org)
```
Schema Markup Implementation:
    ↓
LocalBusiness Schema:
    - Business name: "Speedy Van"
    - Address: "140 Charles Street, Glasgow City, G21 2QB"
    - Phone: "+447901846297"
    - Email: "support@speedy-van.co.uk"
    - Opening hours: "Mo-Su 00:00-23:59"
    - Service area: "United Kingdom"
    - Aggregate rating: 4.8/5 (1250 reviews)
    ↓
Service Schema:
    - Service name: "Man and Van in [Location]"
    - Area served: Location coordinates
    - Provider: Organization details
    - Offers: Price currency GBP
    ↓
BreadcrumbList Schema:
    - Home → UK → Location hierarchy
    - Proper navigation structure
    - JSON-LD implementation
    ↓
FAQ Schema:
    - Location-specific questions
    - Service-related FAQs
    - Rich snippet optimization
    ↓
AggregateRating Schema:
    - Rating value: 4.8
    - Review count: 1250+
    - Best rating: 5
    - Worst rating: 1
```

---

## 3. Local SEO Strategy

### 3.1 Location Page System
```
Location-Based SEO:
    ↓
Programmatic Page Generation:
    - 1000+ UK location pages
    - Cities, towns, villages, boroughs
    - Region-based organization (England/Scotland/Wales)
    - Population-based prioritization
    ↓
Location Page Structure:
    - H1: "Man and Van in [Location]"
    - Unique content per location type
    - Local area information
    - Nearby locations linking
    - Route suggestions
    ↓
Anti-Doorway Page Protection:
    - Population-based canonicals
    - Small places redirect to parent cities
    - Content variation by place type
    - Dynamic sitemap priorities
    ↓
Internal Linking Strategy:
    - Hub and spoke model
    - Location to location linking
    - Service cross-linking
    - Route page connections
```

### 3.2 Local Business Optimization
```
Local SEO Factors:
    ↓
Google My Business:
    - Complete business profile
    - Regular updates and posts
    - Customer review management
    - Local pack optimization
    ↓
NAP Consistency:
    - Name: "Speedy Van"
    - Address: "140 Charles Street, Glasgow City, G21 2QB"
    - Phone: "07901846297"
    - Consistent across all platforms
    ↓
Local Citations:
    - Directory submissions
    - Industry-specific listings
    - Local business directories
    - Review platform presence
    ↓
Local Content:
    - Location-specific information
    - Local landmarks and references
    - Community involvement
    - Local event mentions
```

### 3.3 Route-Based SEO
```
Route Page Optimization:
    ↓
Route Page Structure:
    - URL: /routes/[from]-to-[to]/
    - Title: "[From] to [To] Removals | Speedy Van"
    - Content: Route-specific information
    - Distance and time estimates
    ↓
Popular Routes:
    - London to Manchester
    - Birmingham to Leeds
    - Glasgow to Edinburgh
    - Bristol to Cardiff
    ↓
Route Content Elements:
    - Distance information
    - Estimated travel time
    - Popular moving reasons
    - Pricing estimates
    - Booking CTA
```

---

## 4. Content Strategy & Optimization

### 4.1 Content Creation Framework
```
Content Strategy:
    ↓
Location-Specific Content:
    - Unique content per location
    - Local area insights
    - Moving tips for location
    - Service availability
    ↓
Service-Focused Content:
    - Man and van services
    - Furniture removal guides
    - House moving checklists
    - Packing tips and advice
    ↓
Seasonal Content:
    - Student moving season
    - Summer moving peak
    - Holiday moving guides
    - Weather-related advice
    ↓
FAQ Content:
    - Common customer questions
    - Service-specific FAQs
    - Location-based queries
    - Pricing explanations
```

### 4.2 Content Optimization
```
Content SEO Best Practices:
    ↓
Keyword Integration:
    - Primary keyword in H1
    - Secondary keywords in H2/H3
    - Natural keyword density (1-2%)
    - LSI keyword inclusion
    ↓
Content Structure:
    - Scannable formatting
    - Bullet points and lists
    - Short paragraphs
    - Clear headings hierarchy
    ↓
User Intent Matching:
    - Informational content
    - Commercial intent pages
    - Transactional optimization
    - Local intent targeting
    ↓
Content Quality:
    - Original, unique content
    - Comprehensive coverage
    - Expert authority
    - Regular updates
```

---

## 5. Performance Optimization

### 5.1 Core Web Vitals Optimization
```
Performance Metrics:
    ↓
Largest Contentful Paint (LCP):
    - Target: ≤ 2.5 seconds
    - Image optimization
    - Critical CSS inlining
    - Font preloading
    ↓
Cumulative Layout Shift (CLS):
    - Target: ≤ 0.05
    - Image dimensions specified
    - Font display optimization
    - Skeleton loading screens
    ↓
Interaction to Next Paint (INP):
    - Target: ≤ 200ms
    - JavaScript optimization
    - Event handler efficiency
    - Third-party script management
```

### 5.2 Technical Performance
```
Speed Optimization:
    ↓
Image Optimization:
    - Next.js Image component
    - WebP format usage
    - Responsive images
    - Lazy loading implementation
    ↓
Code Optimization:
    - Bundle size optimization
    - Tree shaking
    - Code splitting
    - Dynamic imports
    ↓
Caching Strategy:
    - Static asset caching
    - API response caching
    - Browser caching headers
    - CDN implementation
    ↓
Mobile Optimization:
    - Mobile-first design
    - Touch-friendly interfaces
    - Fast mobile loading
    - Mobile-specific features
```

---

## 6. Link Building Strategy

### 6.1 Internal Link Architecture
```
Internal Linking Strategy:
    ↓
Hub and Spoke Model:
    - Homepage as central hub
    - Service pages as secondary hubs
    - Location pages interconnected
    - Route pages as connectors
    ↓
Link Distribution:
    - Equal link equity distribution
    - Strategic anchor text usage
    - Contextual link placement
    - Breadcrumb navigation
    ↓
Link Optimization:
    - Descriptive anchor text
    - Follow/nofollow strategy
    - Link depth management
    - Orphaned page prevention
```

### 6.2 External Link Building
```
Backlink Strategy:
    ↓
Target: 10+ high-quality links per month
    ↓
Link Building Tactics:
    - Industry directory submissions
    - Local business listings
    - Guest posting opportunities
    - Partnership link exchanges
    - Resource page inclusions
    ↓
Link Quality Factors:
    - Domain authority
    - Relevance to moving industry
    - Geographic relevance
    - Natural link context
    ↓
Outreach Strategy:
    - Local business partnerships
    - Industry blog contributions
    - Resource page mentions
    - Broken link building
```

---

## 7. Sitemap & Crawlability

### 7.1 XML Sitemap Strategy
```
Sitemap Architecture:
    ↓
Sitemap Index:
    - Main sitemap index
    - Chunked sitemaps for scalability
    - Dynamic priority assignment
    - Regular update frequency
    ↓
Sitemap Categories:
    - Main pages sitemap
    - Location pages sitemap
    - Route pages sitemap
    - Service pages sitemap
    ↓
Sitemap Optimization:
    - Priority based on page importance
    - Change frequency indicators
    - Last modified timestamps
    - Image sitemap inclusion
```

### 7.2 Robots.txt Configuration
```
Robots.txt Rules:
    ↓
Allowed Paths:
    - User-agent: *
    - Allow: /
    - Allow: /uk/
    - Allow: /routes/
    - Allow: /services/
    ↓
Disallowed Paths:
    - Disallow: /admin/
    - Disallow: /api/
    - Disallow: /booking/
    - Disallow: /_next/
    ↓
Sitemap Reference:
    - Sitemap: https://speedy-van.co.uk/sitemap.xml
    - Multiple sitemaps if needed
```

---

## 8. SEO Monitoring & Analytics

### 8.1 Daily Monitoring Procedures
```
Daily SEO Checklist (9:00 AM GMT):
    ↓
Google Search Console Review:
    - Coverage issues check
    - Performance drops >10%
    - Core Web Vitals status
    - Manual actions/security issues
    ↓
Ranking Monitoring:
    - Top 20 target keyword positions
    - Competitor movement tracking
    - Local pack visibility
    - SERP feature presence
    ↓
Technical Health Check:
    - Site accessibility (200 status)
    - Lighthouse CI results
    - Broken link reports
    - Schema markup validation
```

### 8.2 Key Performance Indicators
```
SEO KPIs:
    ↓
Traffic Metrics:
    - Organic traffic growth
    - Click-through rates (CTR)
    - Bounce rate improvement
    - Session duration increase
    ↓
Ranking Metrics:
    - Average keyword positions
    - Ranking distribution
    - Featured snippet captures
    - Local pack appearances
    ↓
Conversion Metrics:
    - Quote form submissions
    - Phone number clicks
    - WhatsApp clicks
    - Multi-page sessions
    ↓
Technical Metrics:
    - Core Web Vitals scores
    - Page load speeds
    - Mobile usability
    - Schema markup coverage
```

---

## 9. Local Search Optimization

### 9.1 Google My Business Strategy
```
GMB Optimization:
    ↓
Profile Completeness:
    - Business name: "Speedy Van"
    - Category: "Moving and Storage Service"
    - Address: Complete and accurate
    - Phone: Local UK number
    - Website: Primary domain
    - Hours: 24/7 availability
    ↓
Content Strategy:
    - Regular business posts
    - Service highlights
    - Customer testimonials
    - Special offers
    - Event announcements
    ↓
Review Management:
    - Encourage customer reviews
    - Respond to all reviews
    - Address negative feedback
    - Showcase positive reviews
```

### 9.2 Local Citations & Directories
```
Citation Building:
    ↓
Primary Directories:
    - Google My Business
    - Bing Places
    - Apple Maps
    - Yell.com
    - Thomson Local
    ↓
Industry Directories:
    - Checkatrade
    - Rated People
    - MyBuilder
    - TrustATrader
    - Which? Trusted Traders
    ↓
Local Directories:
    - Local chamber of commerce
    - City-specific directories
    - Regional business listings
    - Community websites
```

---

## 10. Content Calendar & Planning

### 10.1 Content Planning Schedule
```
Content Calendar:
    ↓
Weekly Content:
    - Monday: Location spotlight
    - Tuesday: Moving tips blog
    - Wednesday: Service highlights
    - Thursday: Customer stories
    - Friday: Industry news
    ↓
Monthly Content:
    - Seasonal moving guides
    - Service area expansions
    - FAQ updates
    - Location page refreshes
    ↓
Quarterly Content:
    - Comprehensive service guides
    - Market analysis reports
    - Customer satisfaction surveys
    - Competitor analysis updates
```

### 10.2 Content Optimization Cycle
```
Content Maintenance:
    ↓
Monthly Reviews:
    - Content performance analysis
    - Keyword ranking updates
    - User engagement metrics
    - Conversion rate tracking
    ↓
Quarterly Audits:
    - Content gap analysis
    - Competitor content review
    - Keyword opportunity identification
    - Technical SEO improvements
    ↓
Annual Overhauls:
    - Complete content refresh
    - Site architecture review
    - Schema markup updates
    - Performance optimization
```

---

## 11. Competitive Analysis

### 11.1 Competitor Monitoring
```
Competitive Intelligence:
    ↓
Primary Competitors:
    - AnyVan
    - Compare the Man and Van
    - Fantastic Removals
    - Local removal companies
    ↓
Monitoring Areas:
    - Keyword rankings
    - Content strategies
    - Backlink profiles
    - Technical implementations
    - Local search presence
    ↓
Analysis Frequency:
    - Weekly: Ranking changes
    - Monthly: Content analysis
    - Quarterly: Strategy review
    - Annually: Comprehensive audit
```

### 11.2 Gap Analysis
```
Opportunity Identification:
    ↓
Keyword Gaps:
    - Competitor ranking keywords
    - Untapped keyword opportunities
    - Long-tail keyword potential
    - Local search gaps
    ↓
Content Gaps:
    - Missing service pages
    - Underserved locations
    - Content format opportunities
    - User intent mismatches
    ↓
Technical Gaps:
    - Performance advantages
    - Schema markup opportunities
    - Mobile optimization
    - User experience improvements
```

---

## 12. SEO Tools & Resources

### 12.1 Essential SEO Tools
```
SEO Tool Stack:
    ↓
Free Tools:
    - Google Search Console
    - Google Analytics 4
    - Google PageSpeed Insights
    - Google My Business
    - Bing Webmaster Tools
    ↓
Paid Tools:
    - SEMrush (keyword tracking)
    - Ahrefs (backlink analysis)
    - Screaming Frog (technical audit)
    - Lighthouse CI (performance)
    ↓
Custom Tools:
    - Internal ranking tracker
    - Schema validator
    - Site speed monitor
    - Content performance dashboard
```

### 12.2 Reporting & Documentation
```
SEO Reporting:
    ↓
Daily Reports:
    - Ranking changes
    - Traffic fluctuations
    - Technical issues
    - Competitor movements
    ↓
Weekly Reports:
    - Performance summary
    - Goal progress
    - Action items
    - Opportunity identification
    ↓
Monthly Reports:
    - Comprehensive analysis
    - ROI calculations
    - Strategy adjustments
    - Future planning
```

---

## 13. Emergency Response Procedures

### 13.1 Traffic Drop Protocol
```
Traffic Drop Response:
    ↓
Immediate Actions (Within 1 Hour):
    - Check Google Search Console
    - Verify site accessibility
    - Review recent changes
    - Check competitor movements
    ↓
Investigation Phase (Within 24 Hours):
    - Analyze affected pages
    - Review technical changes
    - Check for penalties
    - Examine SERP changes
    ↓
Recovery Actions:
    - Fix technical issues
    - Address content problems
    - Submit reconsideration requests
    - Implement corrective measures
```

### 13.2 Penalty Recovery
```
Penalty Response:
    ↓
Manual Penalty:
    - Identify penalty type
    - Fix underlying issues
    - Document corrections
    - Submit reconsideration request
    ↓
Algorithmic Penalty:
    - Analyze algorithm update
    - Adjust content strategy
    - Improve technical factors
    - Monitor recovery progress
```

---

## 14. Future SEO Strategy

### 14.1 Emerging Trends
```
SEO Evolution:
    ↓
AI and Machine Learning:
    - BERT and RankBrain optimization
    - Natural language processing
    - User intent understanding
    - Content quality signals
    ↓
Voice Search Optimization:
    - Conversational keywords
    - Featured snippet optimization
    - Local voice search
    - FAQ content expansion
    ↓
Visual Search:
    - Image optimization
    - Visual content strategy
    - Product image SEO
    - Video content optimization
```

### 14.2 Long-term Goals
```
Strategic Objectives:
    ↓
Market Dominance:
    - #1 rankings for primary keywords
    - 50%+ market share visibility
    - Brand recognition leadership
    - Customer trust building
    ↓
Technical Excellence:
    - Core Web Vitals leadership
    - Mobile-first optimization
    - Progressive web app features
    - Advanced schema implementation
    ↓
Content Authority:
    - Industry thought leadership
    - Comprehensive resource hub
    - Expert content creation
    - Community engagement
```

---

This comprehensive SEO workflow ensures Speedy Van maintains competitive advantage in search rankings while providing exceptional user experience and driving qualified traffic that converts to bookings. The strategy balances technical excellence with content quality and user-focused optimization.

------------------------------------------------------------------

uild & Run Project

Run a full build of the project using pnpm build.

Start the project with pnpm start and ensure no runtime errors.

Verify deployment readiness (production mode).

------------------------------------------------------------------------
Comprehensive Testing for all functions , api end point , booking end to end , order life cercil , admin , driver , pricing , 
----------------------------------------------------------


This unified workflow provides a comprehensive overview of all system processes, user journeys, and operational procedures for the Speedy Van platform. Each section is designed to work cohesively with others, ensuring smooth operations across all user roles and system functions.
