// src/app/api/pricing/quote/route.ts
// -----------------------------------------------------------------------------
// Next.js (App Router) API that computes a quote using the simplified pricing engine.
// Always returns JSON with { totalGBP, breakdown } or a clear { error }.
// Includes timeouts and validation to ensure the client never "spins forever".
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";
import { computeQuote, type PricingInputs } from "@/lib/pricing/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 12s hard timeout for any external work (if you add distance/weather fetches here)
async function withTimeout<T>(p: Promise<T>, ms = 12_000) {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("Upstream timeout")), ms)),
  ]);
}

const ItemSchema = z.object({
  key: z.string(),
  quantity: z.number().int().min(1),
});

const AddressMetaSchema = z.object({
  floors: z.number().int().min(0).optional(),
  hasLift: z.boolean().optional(),
});

const BodySchema = z.object({
  miles: z.number().nonnegative(),
  items: z.array(ItemSchema).default([]),
  workersTotal: z.number().int().min(1),

  pickup: AddressMetaSchema.optional(),
  dropoff: AddressMetaSchema.optional(),

  extras: z
    .object({
      ulezApplicable: z.boolean().optional(),
    })
    .optional(),
  vatRegistered: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // NOTE: If you calculate miles server-side, do it here,
    // wrapped with withTimeout(), and feed the final values into computeQuote().
    // For now, we trust the provided payload (already validated).
    const inputs = parsed.data as PricingInputs;

    const result = await withTimeout(computeQuote(inputs), 12_000);

    return NextResponse.json(
      { totalGBP: result.totalGBP, breakdown: result.breakdown },
      { status: 200 },
    );
  } catch (e: any) {
    console.error("[/api/pricing/quote] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
