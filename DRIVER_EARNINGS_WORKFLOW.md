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
