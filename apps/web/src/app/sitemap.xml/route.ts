export async function GET() {
  const urls = [
    "", "how-it-works", "book", "track", "driver-portal"
  ].map(p => `https://speedy-van.co.uk/${p}`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u=>`<url><loc>${u}</loc></url>`).join("")}
  </urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}


