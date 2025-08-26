# Speedy Van Tracking System Implementation

## Overview

The Speedy Van tracking system provides real-time location tracking for drivers, customers, and administrators. This document outlines the complete implementation including API endpoints, components, and integration points.

## Architecture

### Database Schema

The tracking system uses the existing `TrackingPing` model in the Prisma schema:

```prisma
model TrackingPing {
  id        String   @id
  bookingId String
  driverId  String
  lat       Float
  lng       Float
  createdAt DateTime @default(now())
  Booking   Booking  @relation(fields: [bookingId], references: [id])
  Driver    Driver   @relation(fields: [driverId], references: [id])
}
```

### Key Components

1. **API Endpoints** - RESTful APIs for tracking data
2. **Real-time Updates** - Pusher WebSocket integration
3. **Map Components** - Interactive maps with live markers
4. **Driver Tracking** - Location tracking during active jobs
5. **Admin Dashboard** - Real-time monitoring interface

## API Endpoints

### 1. Driver Tracking API

**POST** `/api/driver/tracking`
- Saves location updates tied to specific bookings
- Validates driver permissions and active assignments
- Updates driver availability with latest location

**GET** `/api/driver/tracking?bookingId=xxx&since=xxx`
- Retrieves tracking history for a specific booking
- Supports filtering by time range

### 2. Admin Tracking API

**GET** `/api/admin/orders/[code]/tracking`
- Comprehensive tracking data for admin dashboard
- Includes route progress, ETA, and location history
- Calculates route progress based on job events

### 3. Public Tracking API

**GET** `/api/track/[code]?tracking=true`
- Public endpoint for customer tracking
- Optional tracking parameter for enhanced data
- Includes ETA and route progress calculations

### 4. Pusher Authentication

**POST** `/api/pusher/auth`
- Secure authentication for real-time channels
- Role-based access control
- Validates channel permissions

## Real-time Integration

### Pusher Channels

1. **`private-tracking-{bookingId}`** - Booking-specific tracking
2. **`private-admin-tracking`** - Admin dashboard updates
3. **`private-tracking-updates`** - General tracking updates

### WebSocket Events

- `location-update` - New driver location
- `status-update` - Booking status changes
- `booking-status-update` - Admin booking updates

## Components

### 1. JobTracking Component

**Location**: `apps/web/src/components/Driver/JobTracking.tsx`

Features:
- Automatic location tracking during active jobs
- Location permission management
- Manual location updates
- Route progress tracking
- Error handling and user feedback

Usage:
```tsx
<JobTracking 
  bookingId="booking-123"
  isActive={true}
  onLocationUpdate={(lat, lng) => console.log(lat, lng)}
/>
```

### 2. Enhanced LiveMap Component

**Location**: `apps/web/src/components/Map/LiveMap.tsx`

Features:
- Multiple driver markers (admin view)
- Booking-specific tracking
- Route visualization
- Tracking path breadcrumbs
- Interactive popups with booking details

Usage:
```tsx
<LiveMap
  driverLocations={driverLocations}
  selectedBooking={selectedBooking}
  showAllDrivers={true}
  showRoutePath={true}
  trackingPings={trackingPings}
/>
```

### 3. Admin Tracking Dashboard

**Location**: `apps/web/src/app/admin/tracking/page.tsx`

Features:
- Real-time map with all active bookings
- Driver location monitoring
- Booking status filtering
- Search functionality
- Detailed booking information
- Auto-refresh every 30 seconds

### 4. Tracking Hooks

**Location**: `apps/web/src/hooks/useTrackingUpdates.ts`

#### useTrackingUpdates
- Real-time tracking for specific bookings
- Automatic reconnection handling
- Error state management

#### useAdminTrackingUpdates
- Admin dashboard real-time updates
- Multiple booking tracking
- Aggregated location data

## Integration Points

### Driver Portal Integration

1. **Active Jobs Page** - Integrate JobTracking component
2. **Location Consent** - Update driver availability settings
3. **Offline Support** - Queue location updates when offline

### Customer Portal Integration

1. **Booking Tracking** - Real-time location updates
2. **ETA Display** - Estimated arrival times
3. **Status Updates** - Booking progress notifications

### Admin Portal Integration

1. **Dispatch Dashboard** - Real-time driver locations
2. **Order Management** - Detailed tracking information
3. **Analytics** - Tracking data for performance analysis

## Security & Privacy

### Location Consent

- Drivers must explicitly consent to location tracking
- Consent is stored in `DriverAvailability.locationConsent`
- Tracking only works when driver is online and consented

### Data Protection

- Location data is tied to specific bookings
- Automatic cleanup of old tracking data
- Secure WebSocket authentication
- Role-based access control

### Privacy Controls

- Customers can only track their own bookings
- Drivers can only update location for assigned bookings
- Admins have access to all tracking data

## Configuration

### Environment Variables

```env
# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Feature Flags

```env
NEXT_PUBLIC_FEATURE_REAL_TIME_TRACKING=true
NEXT_PUBLIC_FEATURE_REAL_TIME_TRACKING_ROLLOUT=25
```

## Usage Examples

### Driver Tracking

```tsx
// In driver active job page
import JobTracking from '@/components/Driver/JobTracking';

function ActiveJobPage({ bookingId }) {
  return (
    <div>
      <JobTracking 
        bookingId={bookingId}
        isActive={true}
        onLocationUpdate={(lat, lng) => {
          // Handle location updates
        }}
      />
    </div>
  );
}
```

### Customer Tracking

```tsx
// In customer tracking page
import { useTrackingUpdates } from '@/hooks/useTrackingUpdates';

function CustomerTrackingPage({ bookingId }) {
  const { updates, latestUpdate, isConnected } = useTrackingUpdates({
    bookingId,
    enabled: true
  });

  return (
    <div>
      {latestUpdate && (
        <LiveMap
          driverLocation={{
            lat: latestUpdate.lat,
            lng: latestUpdate.lng
          }}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
        />
      )}
    </div>
  );
}
```

### Admin Dashboard

```tsx
// In admin tracking page
import { useAdminTrackingUpdates } from '@/hooks/useTrackingUpdates';

function AdminTrackingPage() {
  const { getAllLatestUpdates, isConnected } = useAdminTrackingUpdates();

  return (
    <div>
      <LiveMap
        driverLocations={driverLocations}
        showAllDrivers={true}
        selectedBooking={selectedBooking}
      />
    </div>
  );
}
```

## Testing

### API Testing

```bash
# Test driver tracking
curl -X POST /api/driver/tracking \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "booking-123", "latitude": 51.5074, "longitude": -0.1278}'

# Test admin tracking
curl -X GET /api/admin/orders/ABC123/tracking

# Test public tracking
curl -X GET /api/track/ABC123?tracking=true
```

### Component Testing

```bash
# Test tracking components
npm run test components/Driver/JobTracking
npm run test components/Map/LiveMap
npm run test hooks/useTrackingUpdates
```

## Performance Considerations

### Optimization

1. **Location Update Frequency** - 30-second intervals for battery optimization
2. **Map Marker Management** - Efficient marker cleanup and updates
3. **WebSocket Reconnection** - Automatic reconnection with exponential backoff
4. **Data Pagination** - Limit tracking history to prevent memory issues

### Monitoring

1. **Location Update Success Rate** - Track failed location updates
2. **WebSocket Connection Health** - Monitor connection stability
3. **Map Performance** - Track map rendering performance
4. **API Response Times** - Monitor tracking API performance

## Future Enhancements

### Planned Features

1. **Advanced ETA Calculation** - Integration with routing services
2. **Geofencing** - Automatic status updates based on location
3. **Route Optimization** - Real-time route suggestions
4. **Analytics Dashboard** - Detailed tracking analytics
5. **Mobile App Integration** - Native mobile tracking

### Technical Improvements

1. **Caching Strategy** - Redis caching for frequently accessed data
2. **Database Optimization** - Indexing for tracking queries
3. **Real-time Analytics** - Live performance metrics
4. **Offline Mode** - Enhanced offline tracking capabilities

## Troubleshooting

### Common Issues

1. **Location Permission Denied**
   - Check browser permissions
   - Verify HTTPS connection
   - Test on mobile device

2. **WebSocket Connection Failed**
   - Check Pusher configuration
   - Verify authentication endpoint
   - Check network connectivity

3. **Map Not Loading**
   - Verify Mapbox token
   - Check internet connection
   - Clear browser cache

### Debug Tools

1. **Browser Developer Tools** - Network and console monitoring
2. **Pusher Debug Console** - Real-time event monitoring
3. **Database Queries** - Direct tracking data inspection
4. **Log Monitoring** - Server-side error tracking

## Support

For technical support or questions about the tracking system:

1. Check the troubleshooting section above
2. Review the API documentation
3. Test with the provided examples
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
