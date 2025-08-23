import { getAllPlaces } from "@/lib/places";

// Force Node runtime for SSG/ISR compatibility
export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400;

const BASE = "https://speedy-van.co.uk";
const CHUNK = 45000;

export async function GET(request: Request, { params }: { params: { n: string } }) {
  try {
    const places = await getAllPlaces();
    const idx = Math.max(1, parseInt(params.n, 10)) - 1;
    const start = idx * CHUNK;
    const slice = places.slice(start, start + CHUNK);
    const now = new Date().toISOString();

    const urls = slice.map(p => {
      const priority = p.population ? Math.min(1, 0.3 + Math.log10(Math.max(1, p.population))/10) : 0.3;
      const cfreq = p.population && p.population > 50000 ? "weekly" : "monthly";
      return `<url><loc>${BASE}/uk/${p.slug}</loc><lastmod>${now}</lastmod><changefreq>${cfreq}</changefreq><priority>${priority.toFixed(2)}</priority></url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

    return new Response(xml, { 
      headers: { 
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      } 
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 500,
      headers: { "Content-Type": "application/xml" }
    });
  }
}
