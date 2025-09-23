/**
 * Authentication configuration for Speedy Van
 */

import { NextAuthOptions, getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// Define UserRole locally to avoid circular dependency
export type UserRole = 'customer' | 'driver' | 'admin' | 'superadmin';

// Assertion functions for type safety
export function assertHasRole(
  session: any,
  roles: UserRole[]
): asserts session is { user: { id: string; email: string; name: string; role: UserRole } } {
  if (!session || !session.user || !roles.includes((session.user as any).role)) {
    throw new Error('UNAUTHORIZED');
  }
}

export function assertDriver(
  session: any
): asserts session is { user: { id: string; email: string; name: string; role: 'driver' } } {
  if (!session || (session.user as any)?.role !== 'driver') {
    throw new Error('FORBIDDEN');
  }
}

export function ensureDriver(session: any): Response | null {
  try {
    assertDriver(session);
    return null;
  } catch {
    return new Response('FORBIDDEN', { status: 403 });
  }
}

// Mock PrismaAdapter for now
const PrismaAdapter = () => ({
  createUser: async (user: any) => user,
  getUser: async (id: string) => null,
  getUserByEmail: async (email: string) => null,
  getUserByAccount: async (account: any) => null,
  updateUser: async (user: any) => user,
  deleteUser: async (id: string) => null,
  linkAccount: async (account: any) => account,
  unlinkAccount: async (account: any) => null,
  createSession: async (session: any) => session,
  getSessionAndUser: async (sessionToken: string) => null,
  updateSession: async (session: any) => session,
  deleteSession: async (sessionToken: string) => null,
  createVerificationToken: async (token: any) => token,
  useVerificationToken: async (token: any) => null,
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check role if provided
        if (credentials.role && user.role !== credentials.role) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role as UserRole,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session.user;
}

export async function auth() {
  return await getServerSession(authOptions);
}

export async function requireRole(request: any, roles: string | string[]): Promise<NextResponse | { id: string; email: string; name: string; role: string }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userRole = session.user.role;
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  return session.user;
}

export async function requireDriver(request: any): Promise<NextResponse | { id: string; email: string; name: string; role: string }> {
  return requireRole(request, 'driver');
}

export async function requireAdmin(request: any): Promise<NextResponse | { id: string; email: string; name: string; role: string }> {
  return requireRole(request, 'admin');
}
