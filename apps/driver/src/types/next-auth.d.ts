import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: 'admin' | 'driver' | 'customer';
      adminRole?:
        | 'superadmin'
        | 'ops'
        | 'support'
        | 'reviewer'
        | 'finance'
        | 'read_only'
        | null;
      driverId?: string | null;
      driverStatus?: string | null;
      applicationStatus?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: 'admin' | 'driver' | 'customer';
    adminRole?:
      | 'superadmin'
      | 'ops'
      | 'support'
      | 'reviewer'
      | 'finance'
      | 'read_only'
      | null;
    driverId?: string | null;
    driverStatus?: string | null;
    applicationStatus?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'driver' | 'customer';
    adminRole?:
      | 'superadmin'
      | 'ops'
      | 'support'
      | 'reviewer'
      | 'finance'
      | 'read_only'
      | null;
    driverId?: string | null;
    driverStatus?: string | null;
    applicationStatus?: string | null;
  }
}
