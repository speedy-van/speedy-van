import { AuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

// Add database connection check
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection active');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export const authOptions: AuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - rolling sessions
  },
  jwt: {
    // Ensure JWT tokens are properly generated
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        console.log('🔐 Auth attempt for email:', creds?.email);
        if (!creds?.email || !creds?.password) {
          console.log('❌ Missing credentials');
          return null;
        }
        
        try {
          // Check database connection first
          const dbConnected = await checkDatabaseConnection();
          if (!dbConnected) {
            console.log('❌ Database not connected');
            return null;
          }
          
          const user = await prisma.user.findUnique({ where: { email: creds.email } });
          console.log('👤 User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
          
          if (!user) {
            console.log('❌ User not found');
            return null;
          }
          
          const ok = await bcrypt.compare(creds.password, user.password);
          console.log('🔑 Password comparison result:', ok);
          
          if (!ok) {
            console.log('❌ Password mismatch');
            return null;
          }
          
          console.log('✅ Authentication successful for user:', { id: user.id, email: user.email, role: user.role });
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name ?? "", 
            role: user.role, 
            adminRole: (user as any).adminRole ?? null 
          } as any;
        } catch (error) {
          console.error('❌ Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔐 JWT callback triggered:', { 
        hasUser: !!user, 
        hasToken: !!token, 
        tokenId: token.id,
        tokenRole: token.role 
      });
      
      // Initial sign in
      if (user) {
        console.log('🔐 JWT callback - User data:', {
          id: user.id,
          email: user.email,
          role: (user as any).role,
          adminRole: (user as any).adminRole
        });
        
        token.id = user.id;
        token.role = (user as any).role;
        token.adminRole = (user as any).adminRole ?? null;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Log token data for debugging
      console.log('🔐 JWT callback - Token data:', {
        id: token.id,
        role: token.role,
        adminRole: token.adminRole,
        email: token.email
      });
      
      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback triggered:', { 
        hasSession: !!session, 
        hasToken: !!token,
        sessionUser: !!session?.user 
      });
      
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).adminRole = token.adminRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        
        console.log('🔐 Session callback - Session data:', {
          id: session.user.id,
          email: session.user.email,
          role: (session.user as any).role,
          adminRole: (session.user as any).adminRole
        });
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects
      if (url.startsWith(baseUrl)) {
        // If it's a same-origin URL, check if it's a protected route
        const path = url.replace(baseUrl, '');
        
        // If there's a returnTo parameter, use it
        const urlObj = new URL(url);
        const returnTo = urlObj.searchParams.get('returnTo');
        if (returnTo) {
          // Validate returnTo URL
          try {
            const returnToUrl = new URL(returnTo, baseUrl);
            if (returnToUrl.origin === baseUrl) {
              return returnToUrl.pathname + returnToUrl.search + returnToUrl.hash;
            }
          } catch (error) {
            console.warn('Invalid returnTo URL:', returnTo);
          }
        }
        
        // Default role-based redirects (only if no returnTo)
        if (path === '/' || path === '') {
          // For root path, redirect based on user role
          // This will be handled by the client-side after session is established
          return url;
        }
      }
      
      // Allow external URLs (OAuth providers)
      if (url.startsWith('http')) return url;
      
      // Default fallback
      return baseUrl;
    },
  },
};

export async function requireRole(role: "admin" | "driver" | "customer") {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== role) return null;
  return session;
}

export async function requireDriver() {
  return requireRole("driver");
}

export async function requireAdmin(allowedAdminRoles?: Array<"superadmin" | "ops" | "support" | "reviewer" | "finance" | "read_only">) {
  const session = await getServerSession(authOptions);
  const isAdmin = !!session?.user && (session.user as any).role === "admin";
  if (!isAdmin) return null;
  if (allowedAdminRoles && allowedAdminRoles.length > 0) {
    const ar = (session.user as any).adminRole as string | null | undefined;
    if (!ar || !allowedAdminRoles.includes(ar as any)) return null;
  }
  return session;
}

export async function requireDriverWithData() {
  const session = await requireDriver();
  if (!session) return null;

  // Fetch driver data
  const driver = await prisma.driver.findUnique({
    where: { userId: session.user.id }
  });

  return { session, driver };
}


