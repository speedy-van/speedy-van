'use client';

import { LocalBusiness, WithContext, PostalAddress, ContactPoint, GeoCoordinates, Place } from 'schema-dts';

interface LocalBusinessSchemaProps {
  className?: string;
}

export default function LocalBusinessSchema({ className }: LocalBusinessSchemaProps) {
  const localBusinessSchema: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://speedy-van.co.uk/#business',
    name: 'Speedy Van',
    description: 'Professional man and van moving services across the UK',
    url: 'https://speedy-van.co.uk',
    telephone: '+44 7901846297',
    email: 'support@speedy-van.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '140 Charles Street',
      addressLocality: 'Glasgow City',
      postalCode: 'G21 2QB',
      addressCountry: 'GB',
    } satisfies PostalAddress,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+44 7901846297',
        contactType: 'customer service',
        availableLanguage: ['English'],
        areaServed: 'GB',
      } satisfies ContactPoint,
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '06:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '07:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 55.8642,
      longitude: -4.2518,
    } satisfies GeoCoordinates,
    areaServed: [
      {
        '@type': 'Place',
        name: 'United Kingdom',
      } satisfies Place,
      {
        '@type': 'Place',
        name: 'Scotland',
      } satisfies Place,
      {
        '@type': 'Place',
        name: 'England',
      } satisfies Place,
      {
        '@type': 'Place',
        name: 'Wales',
      } satisfies Place,
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 54.7023545,
        longitude: -3.2765753,
      },
      geoRadius: '500000',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Moving and Delivery Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Man and Van Service',
            description: 'Professional man and van moving service',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'House Removal Service',
            description: 'Complete house removal and relocation service',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Furniture Delivery Service',
            description: 'Safe and secure furniture delivery service',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Office Relocation Service',
            description: 'Professional office relocation and setup service',
          },
        },
      ],
    },
    priceRange: '££',
    paymentAccepted: ['Cash', 'Credit Card', 'Bank Transfer'],
    currenciesAccepted: 'GBP',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Ahmad Alwakai',
      jobTitle: 'Founder & CEO',
      url: 'https://speedy-van.co.uk/about#founder',
    },
    employee: [
      {
        '@type': 'Person',
        name: 'Ahmad Alwakai',
        jobTitle: 'Founder & CEO',
        url: 'https://speedy-van.co.uk/about#founder',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Sarah Johnson',
        },
        reviewBody: 'Excellent service! Very professional and careful with our furniture.',
        datePublished: '2024-01-15',
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Michael Brown',
        },
        reviewBody: 'Fast, reliable, and affordable. Highly recommended!',
        datePublished: '2024-01-10',
      },
    ],
    sameAs: [
      'https://www.facebook.com/speedyvanuk',
      'https://www.instagram.com/speedyvanuk',
      'https://www.linkedin.com/company/speedy-van',
    ],
  };

  return (
    <script
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema, null, 2),
      }}
    />
  );
}
