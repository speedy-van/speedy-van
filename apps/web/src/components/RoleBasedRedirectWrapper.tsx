'use client';

import { ReactNode } from 'react';
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';

interface RoleBasedRedirectWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that ensures role-based redirects are active
 * throughout the application after authentication
 */
export default function RoleBasedRedirectWrapper({ children }: RoleBasedRedirectWrapperProps) {
  // This hook will automatically handle role-based redirects
  // after successful authentication
  useRoleBasedRedirect();

  return <>{children}</>;
}
