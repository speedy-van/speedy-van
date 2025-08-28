# Role-Based Redirect Implementation for Driver Portal

## Overview

This implementation ensures that when a driver successfully logs in, they are automatically redirected to the driver portal/dashboard without needing to refresh the browser. The system implements proper role-based routing so that after authentication, if the user has the role "driver", they are sent directly to the driver portal page.

## Key Components Implemented

### 1. Custom Hook: `useRoleBasedRedirect`

**Location**: `apps/web/src/hooks/useRoleBasedRedirect.ts`

This hook automatically handles role-based redirects after successful authentication:

- **Automatic Detection**: Monitors session changes and user role
- **Smart Redirects**: Only redirects when necessary (not when already on appropriate portal)
- **Role-Based Logic**: 
  - Drivers → `/driver/dashboard`
  - Customers → `/customer-portal`
  - Admins → `/admin`
- **Prevents Infinite Loops**: Checks current path before redirecting

### 2. Wrapper Component: `RoleBasedRedirectWrapper`

**Location**: `apps/web/src/components/RoleBasedRedirectWrapper.tsx`

- Wraps the entire application to ensure role-based redirects are always active
- Integrated into the main `Providers` component
- Provides consistent behavior across all pages

### 3. Enhanced NextAuth Configuration

**Location**: `apps/web/src/lib/auth.ts`

- Updated redirect callback to handle role-specific callback URLs
- Improved session management for role-based information
- Enhanced JWT and session callbacks with driver-specific data

### 4. Updated Authentication Components

**Components Modified**:
- `AuthModal.tsx` - Simplified redirect logic, now uses the hook
- `apps/web/src/app/(driver-portal)/login/page.tsx` - Streamlined authentication flow
- `apps/web/src/app/driver/login/page.tsx` - Consistent with portal login

### 5. Enhanced Type Definitions

**Location**: `apps/web/src/types/next-auth.d.ts`

Added missing fields to NextAuth types:
- `driverId`: Driver record ID
- `driverStatus`: Driver approval status
- `applicationStatus`: Driver application status

## How It Works

### 1. Authentication Flow

```
User Signs In → NextAuth Processes Credentials → Session Established → 
useRoleBasedRedirect Hook Detects Role → Automatic Redirect to Appropriate Portal
```

### 2. Redirect Logic

The `useRoleBasedRedirect` hook:

1. **Monitors Session**: Watches for authentication state changes
2. **Checks User Role**: Determines if user is driver, customer, or admin
3. **Evaluates Current Path**: Prevents unnecessary redirects
4. **Performs Redirect**: Uses Next.js router for smooth navigation
5. **Logs Actions**: Provides debugging information

### 3. Integration Points

- **Global Level**: Wrapped around entire app in `Providers.tsx`
- **Component Level**: Used in authentication components
- **Page Level**: Active on all pages that require authentication

## Benefits

### 1. **Seamless User Experience**
- No browser refresh required
- Instant redirect after authentication
- Smooth navigation between pages

### 2. **Consistent Behavior**
- Same redirect logic across all authentication points
- Centralized role-based routing
- Predictable user flow

### 3. **Maintainable Code**
- Single source of truth for redirect logic
- Easy to modify role-based behavior
- Clear separation of concerns

### 4. **Performance**
- Client-side redirects (no server round-trips)
- Optimized session monitoring
- Minimal re-renders

## Testing

### Playwright Tests

**Location**: `apps/web/e2e/role-based-redirect.spec.ts`

Comprehensive test coverage including:

- ✅ Driver automatic redirect to dashboard
- ✅ Customer automatic redirect to portal
- ✅ Admin automatic redirect to panel
- ✅ Driver login page redirects
- ✅ Portal login page redirects
- ✅ Prevention of infinite redirects
- ✅ Smooth navigation without page refresh

### Test Scenarios

1. **Home Page Authentication**: User signs in from home page
2. **Direct Portal Access**: User goes directly to login pages
3. **Role Verification**: Ensures correct portal for each role
4. **Navigation Smoothness**: Verifies no loading states or flashes
5. **Edge Cases**: Prevents redirect loops and unnecessary redirects

## Configuration

### Environment Variables

No additional environment variables required. The system uses existing NextAuth configuration.

### Dependencies

- `next-auth`: Authentication framework
- `next/navigation`: Next.js routing utilities
- `@chakra-ui/react`: UI components (existing)

## Usage Examples

### 1. Basic Implementation

```tsx
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';

function MyComponent() {
  const { userRole, session } = useRoleBasedRedirect();
  
  // The hook automatically handles redirects
  return <div>Current role: {userRole}</div>;
}
```

### 2. In Authentication Components

```tsx
// The hook is automatically active throughout the app
// No need to manually call it in auth components
function AuthModal() {
  // Authentication logic here
  // Redirects happen automatically via the hook
}
```

### 3. Custom Redirect Logic

```tsx
// If you need custom redirect logic, you can still use the hook
function CustomAuth() {
  const { userRole } = useRoleBasedRedirect();
  
  // Custom logic here
  if (userRole === 'driver' && someCondition) {
    // Custom redirect logic
  }
}
```

## Troubleshooting

### Common Issues

1. **Redirect Not Working**
   - Check if `RoleBasedRedirectWrapper` is properly wrapped in `Providers`
   - Verify session is being established correctly
   - Check browser console for error messages

2. **Infinite Redirects**
   - Ensure the hook is checking current path correctly
   - Verify role detection is working
   - Check for circular dependencies

3. **Session Not Updating**
   - Verify NextAuth configuration
   - Check JWT and session callbacks
   - Ensure proper session strategy

### Debug Information

The hook provides console logging for debugging:

```
🔄 Redirecting driver user from / to /driver/dashboard
✅ Session established, closing modal and letting role-based redirect handle routing
```

## Future Enhancements

### 1. **Advanced Redirect Rules**
- Time-based redirects
- Device-specific redirects
- User preference-based redirects

### 2. **Analytics Integration**
- Track redirect patterns
- Monitor authentication success rates
- User journey analysis

### 3. **Custom Redirect URLs**
- User-configurable default pages
- Role-specific landing pages
- Context-aware redirects

## Conclusion

This implementation provides a robust, maintainable solution for automatic role-based redirects after driver authentication. Drivers now experience seamless navigation to their portal without browser refreshes, while maintaining security and consistency across the application.

The system is designed to be:
- **Reliable**: Handles edge cases and prevents redirect loops
- **Performant**: Minimal overhead and smooth user experience
- **Maintainable**: Centralized logic and clear separation of concerns
- **Testable**: Comprehensive test coverage for all scenarios
