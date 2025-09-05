'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { useConsent } from './ConsentProvider';
import { toGoogleConsent } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function AnalyticsScripts() {
  const { consent } = useConsent();

  useEffect(() => {
    try {
      const w = window as any;
      if (typeof w.gtag === 'function') {
        w.gtag('consent', 'update', toGoogleConsent(consent));
      }
    } catch {}
  }, [consent]);

  if (!consent.analytics) return null;
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
				gtag('config', '${GA_ID}');
			`}</Script>
    </>
  );
}
