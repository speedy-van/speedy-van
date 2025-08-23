"use client";

import React, { useEffect, useState } from "react";
import { parseConsentCookie } from "@/lib/consent";
import { useSession } from "next-auth/react";
import Providers from "@/components/Providers";

interface DynamicLayoutProviderProps {
  children: React.ReactNode;
}

export default function DynamicLayoutProvider({ children }: DynamicLayoutProviderProps) {
  const [initialConsent, setInitialConsent] = useState<any>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Parse consent cookie on client side
    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('sv_consent='));
    
    if (consentCookie) {
      const consentValue = consentCookie.split('=')[1];
      try {
        const parsed = parseConsentCookie(consentValue);
        setInitialConsent(parsed);
      } catch (error) {
        console.error('Error parsing consent cookie:', error);
      }
    }
  }, []);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <Providers session={null}>
        {children}
      </Providers>
    );
  }

  return (
    <Providers session={session}>
      {children}
    </Providers>
  );
}
