'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import RoleBasedRedirectWrapper from './RoleBasedRedirectWrapper';

interface ProvidersProps {
  children: ReactNode;
  session: any;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <RoleBasedRedirectWrapper>{children}</RoleBasedRedirectWrapper>
    </SessionProvider>
  );
}
