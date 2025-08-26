import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import ErrorBoundary from "@/components/admin/ErrorBoundary";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Add debugging
  console.log('🔐 Admin Layout - Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: (session?.user as any)?.role,
    adminRole: (session?.user as any)?.adminRole,
    email: session?.user?.email,
    timestamp: new Date().toISOString()
  });
  
  if (!session?.user) {
    console.log('❌ Admin Layout - No session, redirecting to login');
    redirect("/auth/login");
  }
  
  if ((session.user as any).role !== "admin") {
    console.log('❌ Admin Layout - User is not admin, redirecting to login');
    redirect("/auth/login");
  }
  
  console.log('✅ Admin Layout - Access granted for admin user');

  return (
    <div suppressHydrationWarning>
      <AdminShell>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </AdminShell>
    </div>
  );
}


