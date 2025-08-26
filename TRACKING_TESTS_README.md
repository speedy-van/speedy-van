# Speedy Van Tracking System Tests

## Overview

This document provides comprehensive testing documentation for the Speedy Van tracking system. The tracking system includes real-time location tracking, driver management, customer tracking, and admin monitoring capabilities.

## Test Structure

### 1. Unit Tests
- **Location**: `apps/web/src/lib/__tests__/tracking.test.ts`
- **Purpose**: Test individual components and functions
- **Coverage**: Components, hooks, utilities, and API endpoints

### 2. Integration Tests
- **Location**: `scripts/test-tracking-system.ts`
- **Purpose**: Test complete workflows and data flow
- **Coverage**: Database operations, API interactions, and real-time features

### 3. UI Tests
- **Location**: `scripts/test-tracking-ui.ts`
- **Purpose**: Test user interface components and interactions
- **Coverage**: Component rendering, user interactions, and responsive design

### 4. Test Runner
- **Location**: `scripts/run-tracking-tests.ts`
- **Purpose**: Orchestrate and run all test suites
- **Coverage**: Comprehensive test execution with reporting

## Running Tests

### Prerequisites

1. **Database Setup**
   ```bash
   # Ensure database is running and accessible
   pnpm db:push
   ```

2. **Environment Variables**
   ```bash
   # Copy environment variables
   cp env.example .env.local
   
   # Configure required variables
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=eu
   PUSHER_APP_ID=your_app_id
   PUSHER_SECRET=your_secret
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

3. **Dependencies**
   ```bash
   # Install dependencies
   pnpm install
   ```

### Running Individual Test Suites

#### 1. Unit Tests
```bash
# Run unit tests with Vitest
pnpm test tracking

# Run with coverage
pnpm test:coverage tracking
```

#### 2. Integration Tests
```bash
# Run database integration tests
pnpm tsx scripts/test-tracking-system.ts
```

#### 3. UI Tests
```bash
# Run UI component tests
pnpm tsx scripts/test-tracking-ui.ts
```

#### 4. All Tests
```bash
# Run comprehensive test suite
pnpm tsx scripts/run-tracking-tests.ts
```

## Test Categories

### 🔍 Database Tests
- **Connection Testing**: Verify database connectivity
- **Schema Validation**: Test TrackingPing model structure
- **CRUD Operations**: Test create, read, update, delete operations
- **Data Integrity**: Verify foreign key relationships
- **Performance**: Test query optimization

### 🔌 API Tests
- **Driver Tracking API**: `/api/driver/tracking`
  - POST: Location updates with validation
  - GET: Retrieve tracking history
- **Admin Tracking API**: `/api/admin/orders/[code]/tracking`
  - GET: Comprehensive tracking data
- **Public Tracking API**: `/api/track/[code]`
  - GET: Customer-accessible tracking
- **Pusher Authentication**: `/api/pusher/auth`
  - POST: WebSocket authentication

### 🧩 Component Tests
- **JobTracking Component**: Driver location tracking interface
- **LiveMap Component**: Interactive map with real-time markers
- **Admin Dashboard**: Real-time monitoring interface
- **Tracking Hooks**: React hooks for real-time updates

### 🔗 Integration Tests
- **End-to-End Flow**: Complete tracking workflow
- **Real-time Updates**: WebSocket communication
- **Offline Functionality**: Offline tracking capabilities
- **Data Synchronization**: Multi-device data sync

### ⚡ Performance Tests
- **API Response Times**: Measure endpoint performance
- **Database Queries**: Test query optimization
- **Memory Usage**: Monitor memory consumption
- **Concurrent Users**: Load testing

### 🔒 Security Tests
- **Authentication**: Verify user authentication
- **Authorization**: Test role-based access
- **Data Privacy**: Ensure data protection
- **Input Validation**: Prevent malicious input

## Test Data

### Sample Test Data Structure
```typescript
interface TestData {
  driver: {
    id: string;
    userId: string;
    status: 'approved';
    phone: string;
    vehicleType: 'van';
  };
  customer: {
    id: string;
    userId: string;
    phone: string;
  };
  booking: {
    id: string;
    reference: string;
    status: 'IN_PROGRESS';
    pickupAddress: string;
    dropoffAddress: string;
    scheduledAt: Date;
  };
  assignment: {
    id: string;
    bookingId: string;
    driverId: string;
    status: 'accepted';
  };
}
```

### Test Scenarios

#### 1. Driver Tracking Scenario
```typescript
// Test driver location updates
const trackingPing = await prisma.trackingPing.create({
  data: {
    bookingId: testData.booking.id,
    driverId: testData.driver.id,
    lat: 51.5074,
    lng: -0.1278,
  },
});
```

#### 2. Real-time Updates Scenario
```typescript
// Test WebSocket events
const realTimeEvents = {
  locationUpdate: {
    event: 'location-update',
    data: {
      bookingId: 'booking-123',
      driverId: 'driver-123',
      lat: 51.5074,
      lng: -0.1278,
    },
  },
};
```

#### 3. Route Progress Scenario
```typescript
// Test route progress calculation
const jobEvents = [
  'navigate_to_pickup',
  'arrived_at_pickup',
  'loading_started',
  'en_route_to_dropoff',
];
```

## Test Results

### Success Criteria
- ✅ All unit tests pass
- ✅ Integration tests complete successfully
- ✅ UI components render correctly
- ✅ Performance metrics within limits
- ✅ Security tests pass
- ✅ Real-time features work properly

### Performance Benchmarks
- **API Response Time**: < 200ms
- **Database Query Time**: < 100ms
- **Component Render Time**: < 150ms
- **Memory Usage**: < 50MB
- **WebSocket Latency**: < 50ms

### Coverage Requirements
- **Code Coverage**: > 80%
- **API Endpoints**: 100%
- **Components**: > 90%
- **Database Operations**: 100%

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database connection
pnpm db:studio

# Verify environment variables
echo $DATABASE_URL
```

#### 2. Test Environment Issues
```bash
# Clear test cache
pnpm test:clear

# Reset test database
pnpm db:reset
```

#### 3. Component Test Failures
```bash
# Check component dependencies
pnpm install

# Verify test environment
pnpm test:env
```

### Debug Commands

#### 1. Run Tests with Debug Output
```bash
# Enable debug logging
DEBUG=* pnpm test tracking

# Run specific test file
pnpm test tracking.test.ts
```

#### 2. Database Debugging
```bash
# Check database schema
pnpm db:generate

# View database logs
pnpm db:logs
```

#### 3. Component Debugging
```bash
# Run component tests in watch mode
pnpm test:watch tracking

# Debug specific component
pnpm test JobTracking.test.tsx
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tracking System Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test tracking
      - run: pnpm tsx scripts/test-tracking-system.ts
      - run: pnpm tsx scripts/test-tracking-ui.ts
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm test tracking",
      "pre-push": "pnpm tsx scripts/run-tracking-tests.ts"
    }
  }
}
```

## Monitoring and Alerts

### Test Metrics
- **Test Execution Time**: Track test suite performance
- **Failure Rate**: Monitor test reliability
- **Coverage Trends**: Track code coverage over time
- **Performance Regression**: Detect performance issues

### Alert Thresholds
- **Test Failure Rate**: > 5%
- **Coverage Decrease**: > 10%
- **Performance Regression**: > 20%
- **Security Test Failures**: > 0%

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Data Management
- Use factory functions for test data
- Clean up test data after tests
- Use unique identifiers to avoid conflicts

### 3. Performance Testing
- Run performance tests in isolation
- Use realistic data volumes
- Monitor resource usage

### 4. Security Testing
- Test all authentication paths
- Verify authorization rules
- Test input validation thoroughly

## Future Enhancements

### Planned Test Improvements
1. **Visual Regression Testing**: Screenshot comparison tests
2. **Load Testing**: High-volume concurrent user testing
3. **Mobile Testing**: Device-specific test scenarios
4. **Accessibility Testing**: WCAG compliance testing
5. **Internationalization Testing**: Multi-language support

### Test Infrastructure
1. **Test Containers**: Isolated test environments
2. **Parallel Execution**: Faster test execution
3. **Test Reporting**: Enhanced test result visualization
4. **Performance Monitoring**: Real-time performance tracking

---

## Support

For questions or issues with the tracking system tests:

1. **Check Documentation**: Review this README and API documentation
2. **Run Debug Commands**: Use the provided debug commands
3. **Review Logs**: Check test output and error logs
4. **Contact Team**: Reach out to the development team

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready
