import { Metadata } from 'next';
import HomePageContent from './HomePageContent';

export const metadata: Metadata = {
  title: "Speedy Van | Book, Track, and Move Fast",
  description: "Book a van in minutes. Live tracking, vetted drivers.",
  alternates: { canonical: "https://speedy-van.co.uk/" },
  openGraph: {
    title: "Speedy Van",
    description: "Book a van in minutes. Live tracking, vetted drivers.",
    url: "https://speedy-van.co.uk/",
    siteName: "Speedy Van",
    images: [{ url: "/og/og-home.jpg", width: 1200, height: 630, alt: "Speedy Van" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@speedyvan", creator: "@speedyvan" },
};

export default function HomePage() {
  return <HomePageContent />;
}


