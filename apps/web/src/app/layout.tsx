import React from "react";
import ChakraProviders from "@/components/ChakraProviders";
import "@/styles/globals.css";
import "@/styles/mobile-enhancements.css";
import "@/styles/mobile-fixes.css";
import "@/styles/booking-fixes.css";
import "@/styles/ios-safari-fixes.css";
import "@/styles/video-background.css";
import { ConsentProvider } from "@/components/Consent/ConsentProvider";
import CookieBanner from "@/components/Consent/CookieBanner";
import CookiePreferencesModal from "@/components/Consent/CookiePreferencesModal";
import { parseConsentCookie } from "@/lib/consent";
import { cookies, headers } from "next/headers";
import AnalyticsScripts from "@/components/Consent/AnalyticsScripts";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Providers from "@/components/Providers";
import { MotionProvider } from "@/components/MotionProvider";

export const metadata = {
  title: "Speedy Van — Premium Moving & Delivery Services",
  description: "Fast, reliable moving and delivery services. Get instant quotes, book online, and experience premium service with our professional team. Available 24/7 across the city.",
  keywords: "moving services, delivery, logistics, premium moving, instant quotes, online booking, professional movers",
  authors: [{ name: "Speedy Van" }],
  creator: "Speedy Van",
  publisher: "Speedy Van",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Speedy Van',
    title: 'Speedy Van — Premium Moving & Delivery Services',
    description: 'Fast, reliable moving and delivery services. Get instant quotes, book online, and experience premium service.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Speedy Van - Premium Moving Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Speedy Van — Premium Moving & Delivery Services',
    description: 'Fast, reliable moving and delivery services. Get instant quotes, book online, and experience premium service.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0D0D0D',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialConsent = parseConsentCookie(cookies().get("sv_consent")?.value);
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="color-scheme" content="dark" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/logo/speedy-van-icon.svg" />
        <link rel="apple-touch-icon" href="/logo/speedy-van-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body>
        <ChakraProviders>
          <Providers session={session}>
            <MotionProvider>
              <ConsentProvider initialConsent={initialConsent}>
                {children}
                <CookieBanner />
                <CookiePreferencesModal />
                <AnalyticsScripts />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      (function() {
                        const bar = document.getElementById('cookie-bar');
                        if (!bar) return;
                        
                        const onResize = () => {
                          const vv = window.visualViewport;
                          if (vv && vv.height < 520) {
                            bar.style.display = 'none';
                          } else {
                            bar.style.display = '';
                          }
                        };
                        
                        if (window.visualViewport) {
                          window.visualViewport.addEventListener('resize', onResize);
                        }
                      })();
                    `
                  }}
                />
              </ConsentProvider>
            </MotionProvider>
          </Providers>
        </ChakraProviders>
      </body>
    </html>
  );
}


