Got it — let’s switch to **English**. Here’s the full plan again, in English, to unify your **booking and pricing systems** and remove the redundant files.

---

# 🎯 Goal

* Use a **single booking flow**: the advanced 9-step `/booking`.
* Use a **single pricing engine**: `src/lib/pricing.ts` + one API route `/api/pricing/quote`.
* Remove duplicate APIs, pages, and schema leftovers.
* Keep the clean **Prisma schema** you already have.

---

## 1) Single Source of Truth

* **Booking UI:** `/booking` page (9 steps).
* **Pricing Engine:** `apps/web/src/lib/pricing.ts`.
* **Pricing API:** `/api/pricing/quote`.
* **Booking API:** `/api/bookings` + `/api/bookings/[id]`.
* **Payments:** `/api/payment/create-checkout-session` + `/api/payment/webhook`.

👉 Everything else gets deleted or redirected.

---

## 2) Remove Duplicates (Safe Commands)

### A) Duplicate pricing API

* You currently have `/api/quotes/route.ts` and `/api/pricing/quote/route.ts`.
* Keep `/api/pricing/quote`.
* Remove `/api/quotes`:

```bash
git rm apps/web/src/app/api/quotes/route.ts
```

(or replace it with a redirect proxy if you need a migration period).

---

### B) Duplicate pricing files

* Keep only: `apps/web/src/lib/pricing.ts`.
* If there are other variants (`pricing.engine.ts`, `pricing_v2.ts`, etc.), merge any extra logic into feature flags inside the official pricing file.
* Example: zone/ULEZ fees can live as optional config inside `computeQuote`.

---

### C) Multiple booking UIs

* Keep `/booking`.
* Redirect “quick booking” or “simple booking” pages to `/booking`:

```tsx
// apps/web/src/app/quick-book/page.tsx
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/booking");
}
```

---

### D) Prisma schema cleanup

* If you have unused models/enums (`PaymentStatus`, `Timeline`, `RefundStatus`), verify with:

```bash
rg -n "PaymentStatus|Timeline|RefundStatus" apps/web
```

* If not used, delete them from `schema.prisma` and run:

```bash
cd apps/web
npx prisma migrate dev -n cleanup_unused_models
npx prisma generate
```

---

## 3) Standardize Imports

Use one alias for the pricing engine everywhere:

```ts
import { computeQuote } from "@/lib/pricing";
```

Add this to `tsconfig.json`:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Replace all local imports with `@/lib/pricing`:

```bash
rg -l "from ['\"]\\./.+pricing" apps/web/src \
  | xargs sed -i.bak 's#from "\./[^"]*pricing[^"]*"#from "@/lib/pricing"#g'
```

---

## 4) Transitional Deprecation Layer

If external clients hit `/api/quotes`, make it a proxy instead of deleting immediately:

```ts
// apps/web/src/app/api/quotes/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pricing/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
```

---

## 5) Verification After Cleanup

Run quick smoke tests:

```bash
# Pricing
curl -X POST http://localhost:3000/api/pricing/quote \
  -H 'Content-Type: application/json' \
  -d '{ /* payload */ }'

# Booking creation
curl -X POST http://localhost:3000/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{ /* payload */ }'

# Get booking
curl http://localhost:3000/api/bookings/<BOOKING_ID>
```

---

## 6) Prevent Future Duplication

Add an ESLint custom rule:

```js
// .eslintrc.cjs
rules: {
  'no-duplicate-pricing-module': {
    create(context) {
      const filename = context.getFilename();
      if (/pricing\.(ts|tsx)$/.test(filename) &&
          !/apps\/web\/src\/lib\/pricing\.ts$/.test(filename)) {
        context.report({ node: null, message: 'Use "@/lib/pricing" only.' });
      }
      return {};
    }
  }
}
```

Optional CI check:

```bash
test -z "$(rg -l 'pricing\.(ts|tsx)$' apps/web/src | grep -v 'apps/web/src/lib/pricing.ts')" \
  || (echo "Duplicate pricing files detected"; exit 1)
```

---

## 7) Document the Decision (ADR)

Create `docs/adr/0001-unify-booking-and-pricing.md`:

* Decision: unify booking → `/booking`, pricing → `@/lib/pricing` + `/api/pricing/quote`.
* Reason: remove duplication, prevent drift.
* Migration: proxy `/api/quotes` for 1 sprint.
* Removal date: after X weeks.

---

## 8) Work Breakdown (Small PRs)

1. PR-1: Redirect quick booking → `/booking`.
2. PR-2: Remove `/api/quotes` (or make proxy).
3. PR-3: Standardize imports to `@/lib/pricing`.
4. PR-4: Delete extra pricing files + add ESLint rule.
5. PR-5: Update docs/README + ADR.
6. PR-6: Run smoke tests & fix snapshots.

---

✅ After this cleanup, you’ll have:

* **One booking system** (9 steps, robust).
* **One pricing engine** (multi-factor, clean).
* **No duplication** in APIs, files, or schema.
* **Clear guardrails** (ESLint + CI).
* **Documented ADR** so future devs don’t reintroduce drift.


