"use client";

/**
 * Global providers wrapper for Speedy Van
 */

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import ChakraProviders from './ChakraProviders';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ChakraProviders>
        {children}
      </ChakraProviders>
    </SessionProvider>
  );
}