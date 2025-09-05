import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { serializeConsentCookie, parseConsentCookie } from '@/lib/consent';
import { prisma } from '@/lib/prisma';

type Body = {
  functional?: boolean;
  analytics?: boolean;
  marketing?: boolean;
  region?: string | null;
};

function hmacSha256Hex(secret: string, value: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as Body;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const newConsent = {
      version: 2,
      necessary: true,
      functional: !!json.functional,
      analytics: !!json.analytics,
      marketing: !!json.marketing,
      timestamp: nowSeconds,
      region: json.region || 'UK',
    };
    const value = serializeConsentCookie(newConsent);
    const res = NextResponse.json({ ok: true, consent: newConsent });
    // Set cookie attributes
    res.cookies.set({
      name: 'sv_consent',
      value,
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 180, // ~6 months
    });

    // Log change best-effort
    try {
      const secret = process.env.CONSENT_HMAC_SECRET || 'dev-secret';
      const ip =
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        '';
      const userAgent = req.headers.get('user-agent') || '';
      const existing = parseConsentCookie(
        req.headers
          .get('cookie')
          ?.split(';')
          .find(c => c.trim().startsWith('sv_consent='))
          ?.split('=')[1] || null
      );
      const userId = req.headers.get('x-user-id') || null; // optional: set in app if session present
      await prisma.consentLog.create({
        data: {
          userId: userId || undefined,
          country: json.region || 'UK',
          ipHash: ip ? hmacSha256Hex(secret, ip) : null,
          uaHash: userAgent ? hmacSha256Hex(secret, userAgent) : null,
          value,
          prevValue: serializeConsentCookie(existing),
        },
      });
    } catch (e) {
      console.error('consent_log_error', e);
    }

    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
