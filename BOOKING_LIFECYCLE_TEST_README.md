# Booking Lifecycle Test Suite

This test suite verifies the complete booking lifecycle across the Speedy Van system, ensuring that all components work together seamlessly from customer booking creation to job completion.

## 🎯 Test Objectives

The test suite validates the following critical aspects of the booking system:

### 1. Customer Portal Verification ✅
- **Booking Creation**: Customer can create a new booking with all required details
- **Payment Processing**: After payment, booking is confirmed and visible in customer portal
- **Booking Details**: Correct booking ID, details, and invoice are accessible
- **Tracking Access**: Customer can track booking status using the unified booking ID

### 2. Admin Dashboard Verification ✅
- **Booking Visibility**: Booking appears in admin dashboard with full details
- **Admin Functions**: All admin functions are available:
  - View customer details
  - View payment details
  - View addresses and property details
  - View items and pricing
  - Update booking status
  - Assign drivers
  - Access pricing information

### 3. Driver Portal Verification ✅
- **Booking Access**: Driver can view assigned booking with necessary details
- **Driver Functions**: All driver actions are working:
  - View pickup/dropoff addresses
  - View property details and access information
  - View items to be moved
  - Update job status
  - Share location updates
  - **Security**: Customer email is hidden from driver view

### 4. Real-time Tracking Verification ✅
- **Location Updates**: Driver location is tracked in real-time
- **Status Updates**: Both customer and admin can follow booking progress
- **Booking ID Integration**: Tracking works using the unified booking ID
- **Job Timeline**: Complete job progress is visible

### 5. Invoice Generation Verification ✅
- **Invoice Creation**: Invoice is generated for the paid booking
- **Booking ID Linking**: Invoice is properly linked to the booking ID
- **Access Control**: Both customer and admin can access the invoice
- **Pricing Accuracy**: Invoice reflects correct pricing breakdown

## 🚀 Running the Test

### Prerequisites
- Node.js installed
- Database connection configured
- Prisma client generated
- All dependencies installed

### Quick Start
```bash
# Run the test suite
node test-runner.js
```

### Expected Output
```
🚀 Starting Booking Lifecycle Test Suite
=====================================

📋 Phase 1: Setting up test data...
✅ Test data created:
   Customer: Test Customer (test.customer@speedy-van.co.uk)
   Driver: Test Driver (test.driver@speedy-van.co.uk)
   Admin: Test Admin (test.admin@speedy-van.co.uk)

📝 Phase 2: Creating customer booking...
✅ Customer booking created:
   Booking ID: clx1234567890abcdef
   Reference: SV-TEST-1703123456789
   Status: PENDING_PAYMENT
   Total: £150.00
   Customer: Test Customer
   Scheduled: 12/22/2024

💳 Phase 3: Processing payment...
✅ Payment processed successfully:
   Payment Intent: pi_test_1703123456789_abc123def
   Unified Booking ID: SV20241222000001
   Status: CONFIRMED
   Paid At: 12/22/2024, 10:30:45 AM

👨‍💼 Phase 4: Verifying admin dashboard access...
✅ Admin dashboard access verified:
   Customer Details: ✅
   Payment Details: ✅
   Addresses: ✅
   Items: ✅
   Property Details: ✅
   Status Updates: ✅
   Driver Assignment: ✅
   Pricing Access: ✅

🚗 Phase 5: Assigning driver to booking...
✅ Driver assigned successfully:
   Driver: Test Driver
   Assignment ID: assign_clx1234567890abcdef
   Status: invited
   Job Events: 2 created

👨‍✈️ Phase 6: Verifying driver portal access...
✅ Driver portal access verified:
   Addresses: ✅
   Property Details: ✅
   Items: ✅
   Job Events: ✅
   Customer Email Hidden: ✅
   Status Updates: ✅
   Location Sharing: ✅

📍 Phase 7: Updating tracking information...
✅ Tracking updated successfully:
   Tracking Pings: 3 created
   Current Location: 51.5076, -0.128
   Booking Status: IN_PROGRESS
   Assignment Status: claimed

👤 Phase 8: Verifying customer portal access...
✅ Customer portal access verified:
   Own Details: ✅
   Addresses: ✅
   Items: ✅
   Driver Info: ✅
   Job Progress: ✅
   Location Tracking: ✅
   Unified Booking ID: ✅

🧾 Phase 9: Generating invoice...
✅ Invoice generated successfully:
   Invoice ID: invoice_clx1234567890abcdef
   Booking ID: clx1234567890abcdef
   Subtotal (ex VAT): £125.00
   VAT: £25.00
   Total: £150.00

🎯 Phase 10: Completing job...
✅ Job completed successfully:
   Final Events: 3 created
   Assignment Status: completed
   Booking Status: COMPLETED
   Unified Booking ID: SV20241222000001

✅ ALL TESTS PASSED! Complete booking lifecycle verified.

🧹 Cleaning up test data...
✅ Test data cleaned up successfully
```

## 🔧 Test Configuration

### Test Data
The test creates realistic test data including:
- **Customer**: Test customer with verified email and phone (07901846297)
- **Driver**: Approved driver with active status
- **Admin**: Operations admin with full access
- **Booking**: Complete booking with addresses, property details, and items
- **Payment**: Stripe payment simulation with unified booking ID generation

### Database Models Tested
- `User` (Customer, Driver, Admin)
- `Driver` (Driver profile and status)
- `Booking` (Main booking entity)
- `BookingAddress` (Pickup and dropoff addresses)
- `BookingProperty` (Property access details)
- `BookingItem` (Items to be moved)
- `Payment` (Payment records)
- `Assignment` (Driver assignment)
- `JobEvent` (Job progress tracking)
- `TrackingPing` (Real-time location updates)
- `AuditLog` (System audit trail)
- `QuoteSnapshot` (Invoice generation)

## 🧪 Test Phases Breakdown

### Phase 1: Setup
- Creates test users (customer, driver, admin)
- Sets up database connections
- Prepares test environment

### Phase 2: Customer Booking
- Creates complete booking with all details
- Includes addresses, property details, and items
- Sets status to PENDING_PAYMENT

### Phase 3: Payment Processing
- Simulates Stripe payment success
- Generates unified booking ID (SV format)
- Updates booking status to CONFIRMED
- Creates payment and audit records

### Phase 4: Admin Verification
- Verifies admin can view all booking details
- Confirms all admin functions are accessible
- Validates customer and payment information access

### Phase 5: Driver Assignment
- Assigns driver to the booking
- Creates job events for tracking
- Updates booking with driver information

### Phase 6: Driver Portal Verification
- Confirms driver can view necessary details
- Verifies customer email is hidden
- Tests driver action capabilities

### Phase 7: Tracking Updates
- Creates real-time location pings
- Updates job status to IN_PROGRESS
- Simulates driver movement

### Phase 8: Customer Portal Verification
- Confirms customer can view own booking
- Verifies tracking and driver information access
- Tests unified booking ID functionality

### Phase 9: Invoice Generation
- Creates professional invoice
- Links invoice to booking ID
- Includes pricing breakdown and VAT

### Phase 10: Job Completion
- Creates final job events
- Updates status to COMPLETED
- Finalizes assignment

## 🔍 What Gets Verified

### Data Integrity
- All database relationships are properly maintained
- Foreign key constraints are respected
- Data consistency across all models

### Security
- Customer email is hidden from driver view
- Role-based access control is enforced
- Sensitive information is properly protected

### Business Logic
- Booking status transitions are correct
- Payment processing updates booking state
- Driver assignment workflow functions
- Tracking updates in real-time

### User Experience
- All portals provide necessary information
- Tracking is accessible to relevant parties
- Invoices are properly formatted and linked

## 🚨 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is set correctly
2. **Prisma Client**: Run `npx prisma generate` if needed
3. **Permissions**: Ensure database user has full access
4. **Schema Mismatch**: Verify Prisma schema matches database

### Debug Mode
To see detailed database operations, set:
```bash
DEBUG=prisma:*
node test-runner.js
```

## 📊 Test Results Interpretation

### ✅ Success Indicators
- All phases complete without errors
- All verification checks pass
- Test data is properly cleaned up
- No database constraint violations

### ❌ Failure Indicators
- Any phase throws an error
- Verification checks fail
- Database operations fail
- Constraint violations occur

## 🔄 Continuous Integration

This test suite can be integrated into CI/CD pipelines to:
- Verify system integrity after deployments
- Test database migrations
- Validate API changes
- Ensure business logic consistency

## 📝 Customization

The test can be customized by:
- Modifying test data values
- Adding additional verification steps
- Testing different booking scenarios
- Validating specific business rules

## 🎉 Conclusion

This comprehensive test suite ensures that the Speedy Van booking system maintains data integrity, security, and functionality across all user roles and system components. Running this test regularly helps maintain system reliability and catch issues early in the development cycle.
