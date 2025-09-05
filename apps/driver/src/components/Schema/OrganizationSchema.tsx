'use client';

import {
  Organization,
  WithContext,
  ImageObject,
  Person,
  Place,
  PostalAddress,
  ContactPoint,
  OpeningHoursSpecification,
  Country,
  City,
  State,
  Service,
  AggregateRating,
  Review,
  Rating,
  Brand,
} from 'schema-dts';

interface OrganizationSchemaProps {
  className?: string;
}

export default function OrganizationSchema({
  className,
}: OrganizationSchemaProps) {
  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://speedy-van.co.uk/#organization',
    name: 'Speedy Van',
    legalName: 'Speedy Van Limited',
    url: 'https://speedy-van.co.uk',
    logo: {
      '@type': 'ImageObject',
      url: 'https://speedy-van.co.uk/logo/speedy-van-logo.png',
      width: '512',
      height: '512',
      caption: 'Speedy Van Logo',
    } as ImageObject,
    image: [
      {
        '@type': 'ImageObject',
        url: 'https://speedy-van.co.uk/images/speedy-van-team.jpg',
        width: '1200',
        height: '630',
        caption: 'Speedy Van Professional Moving Team',
      } as ImageObject,
    ],
    description:
      'Professional moving and delivery services across the UK. Fast, reliable, and affordable man and van services with live tracking and vetted drivers.',
    foundingDate: '2024',
    founder: [
      {
        '@type': 'Person',
        name: 'Ahmad Alwakai',
        jobTitle: 'Founder & CEO',
        url: 'https://speedy-van.co.uk/about#founder',
      } as Person,
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+44 7901846297',
        contactType: 'customer service',
        availableLanguage: ['English'],
        areaServed: 'GB',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '06:00',
          closes: '22:00',
        } satisfies OpeningHoursSpecification,
      } satisfies ContactPoint,
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        availableLanguage: ['English'],
        areaServed: 'GB',
        url: 'https://speedy-van.co.uk/contact',
      } satisfies ContactPoint,
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB',
      addressRegion: 'England',
    } satisfies PostalAddress,
    areaServed: [
      {
        '@type': 'Country',
        name: 'United Kingdom',
      } as Country,
      {
        '@type': 'City',
        name: 'London',
      } as City,
      {
        '@type': 'City',
        name: 'Birmingham',
      } as City,
      {
        '@type': 'City',
        name: 'Manchester',
      } as City,
      {
        '@type': 'City',
        name: 'Leeds',
      } as City,
      {
        '@type': 'City',
        name: 'Glasgow',
      } as City,
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
            name: 'Furniture Removal',
            description: 'Specialized furniture moving and delivery',
          },
        },
      ],
    },
    sameAs: [
      'https://uk.trustpilot.com/review/speedy-van.co.uk',
      'https://www.facebook.com/speedyvanuk',
      'https://www.twitter.com/speedyvanuk',
      'https://www.instagram.com/speedyvanuk',
      'https://www.linkedin.com/company/speedy-van-uk',
      'https://www.youtube.com/@speedyvanuk',
    ],
    knowsAbout: [
      'House Moving',
      'Office Relocation',
      'Furniture Delivery',
      'Man and Van Services',
      'Removal Services',
      'Storage Solutions',
      'Packing Services',
    ],
    slogan: 'Fast, Reliable, Professional Moving Services',
    award: ['Best Moving Company 2024', 'Customer Choice Award 2024'],
    memberOf: [
      {
        '@type': 'Organization',
        name: 'British Association of Removers',
        url: 'https://www.bar.co.uk',
      },
      {
        '@type': 'Organization',
        name: 'Freight Transport Association',
        url: 'https://www.fta.co.uk',
      },
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Professional Certification',
        name: 'Goods Vehicle Operator License',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '247',
      bestRating: '5',
      worstRating: '1',
    } as AggregateRating,
  };

  return (
    <script
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationSchema, null, 2),
      }}
    />
  );
}
