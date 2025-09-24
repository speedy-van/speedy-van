import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://speedy-van.co.uk';
  const currentDate = new Date().toISOString().split('T')[0];

  // UK regions for location-based SEO
  const ukRegions = [
    'england', 'scotland', 'wales', 'northern-ireland',
    'london', 'birmingham', 'manchester', 'glasgow', 'edinburgh', 
    'liverpool', 'leeds', 'bristol', 'cardiff', 'belfast',
    'newcastle', 'sheffield', 'nottingham', 'leicester', 'coventry',
    'bradford', 'hull', 'plymouth', 'stoke-on-trent', 'wolverhampton',
    'derby', 'swansea', 'southampton', 'salford', 'aberdeen',
    'westminster', 'portsmouth', 'york', 'peterborough', 'dundee'
  ];

  // Blog categories for content SEO
  const blogCategories = [
    'moving-tips', 'student-moving-guide', 'luxury-moving-services',
    'furniture-delivery', 'house-removals', 'van-hire-guide',
    'packing-tips', 'moving-checklist', 'london-moving-guide'
  ];

  const urls = [
    // Main pages
    {
      url: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/uk/london`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/booking-luxury`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/driver/application`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    // UK region pages
    ...ukRegions.map(region => ({
      url: `${baseUrl}/uk/${region}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    })),
    // Blog pages
    {
      url: `${baseUrl}/blog`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    },
    ...blogCategories.map(category => ({
      url: `${baseUrl}/blog/${category}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}