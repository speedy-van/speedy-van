import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/driver': ['driver'],
  '/customer': ['customer'],
  '/api/admin': ['admin'],
  '/api/driver': ['driver'],
  '/api/customer': ['customer'],
};

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/driver-application',
  '/driver-application/success',
  '/track',
  '/api/track',
  '/api/webhooks',
  '/api/driver/applications', // Allow public driver applications
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const requiredRole = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];

  if (!requiredRole) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      // No token, redirect to signin
      const signinUrl = new URL('/auth/signin', request.url);
      signinUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signinUrl);
    }

    const userRole = token.role as string;
    const isActive = token.isActive as boolean;
    const driverId = token.driverId as string | null;
    const driverStatus = token.driverStatus as string | null;
    const applicationStatus = token.applicationStatus as string | null;

    // Check if user account is active
    if (!isActive) {
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('error', 'AccountInactive');
      return NextResponse.redirect(errorUrl);
    }

    // Role-based access control
    if (requiredRole.includes('admin')) {
      if (userRole !== 'admin') {
        const errorUrl = new URL('/auth/error', request.url);
        errorUrl.searchParams.set('error', 'InsufficientPermissions');
        return NextResponse.redirect(errorUrl);
      }
    } else if (requiredRole.includes('driver')) {
      if (userRole !== 'driver') {
        const errorUrl = new URL('/auth/error', request.url);
        errorUrl.searchParams.set('error', 'DriverAccessRequired');
        return NextResponse.redirect(errorUrl);
      }

      // Check if driver is approved
      if (!driverId || driverStatus !== 'approved') {
        const errorUrl = new URL('/auth/error', request.url);
        errorUrl.searchParams.set('error', 'DriverNotApproved');
        return NextResponse.redirect(errorUrl);
      }

      // Check if driver application is approved
      if (applicationStatus && applicationStatus !== 'approved') {
        const errorUrl = new URL('/auth/error', request.url);
        errorUrl.searchParams.set('error', 'ApplicationNotApproved');
        return NextResponse.redirect(errorUrl);
      }
    } else if (requiredRole.includes('customer')) {
      if (userRole !== 'customer') {
        const errorUrl = new URL('/auth/error', request.url);
        errorUrl.searchParams.set('error', 'CustomerAccessRequired');
        return NextResponse.redirect(errorUrl);
      }

      // Check if customer has pending driver applications
      if (applicationStatus === 'pending') {
        const errorUrl = new URL('/auth/error', request.url);
        errorUrl.searchParams.set('error', 'PendingDriverApplication');
        return NextResponse.redirect(errorUrl);
      }
    }

    // Access granted
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to signin
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};


