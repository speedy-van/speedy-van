import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Simple public paths check
  const PUBLIC_PATHS = [
    "/", "/book", "/how-it-works", "/about", "/track",
    "/checkout", "/checkout/success", "/checkout/cancel",
    "/api/health", "/api/webhooks/stripe", "/api/places/suggest",
    "/api/debug/mapbox", "/api/debug/mapbox-test", "/test-mapbox", "/test-autocomplete", "/test-simple-input", "/api/auth", "/favicon.ico", "/robots.txt", "/sitemap.xml",
    "/auth/forgot", "/auth/reset", "/auth/verify"
  ];
  
  // Check if path is public
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const response = NextResponse.next();
    addConsentHeaders(req, response);
    return response;
  }

  // For protected routes, just continue and let client-side handle auth
  const response = NextResponse.next();
  addConsentHeaders(req, response);
  return response;
}

function addConsentHeaders(req: NextRequest, response: NextResponse) {
  const cookie = req.cookies.get("sv_consent")?.value;
  
  if (cookie) {
    try {
      // Simple parsing without complex logic
      const parts = cookie.split("|");
      const consent: Record<string, string> = {};
      
      parts.forEach(part => {
        const [key, value] = part.split("=");
        if (key && value) consent[key] = value;
      });
      
      response.headers.set("x-consent-func", consent.func === "1" ? "1" : "0");
      response.headers.set("x-consent-ana", consent.ana === "1" ? "1" : "0");
      response.headers.set("x-consent-mkt", consent.mkt === "1" ? "1" : "0");
      response.headers.set("x-consent-ver", consent.v || "2");
      response.headers.set("x-consent-ts", consent.ts || "0");
      response.headers.set("x-consent-region", consent.region || "UK");
    } catch {
      // Fallback to default values if parsing fails
      response.headers.set("x-consent-func", "0");
      response.headers.set("x-consent-ana", "0");
      response.headers.set("x-consent-mkt", "0");
      response.headers.set("x-consent-ver", "2");
      response.headers.set("x-consent-ts", "0");
      response.headers.set("x-consent-region", "UK");
    }
  } else {
    // Default values if no consent cookie
    response.headers.set("x-consent-func", "0");
    response.headers.set("x-consent-ana", "0");
    response.headers.set("x-consent-mkt", "0");
    response.headers.set("x-consent-ver", "2");
    response.headers.set("x-consent-ts", "0");
    response.headers.set("x-consent-region", "UK");
  }
  
  // Add Content Security Policy headers to allow Mapbox
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com",
    "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
    "img-src 'self' data: blob: https://*.mapbox.com",
    "connect-src 'self' https://api.mapbox.com https://events.mapbox.com",
    "font-src 'self' https://api.mapbox.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
}

export const config = { 
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ] 
};


