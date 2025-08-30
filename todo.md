# SEO DOMINATION PHASE 2 - TODO

## Phase 0 — CI/CD + Monitoring Baseline ✅
- [x] Integrate Google Analytics 4 with event tracking (phone clicks, form submissions, WhatsApp)
- [x] Add Lighthouse CI workflow (GitHub Actions) with budgets: LCP ≤ 2.5s, CLS ≤ 0.05, INP ≤ 200ms
- [x] Implement Schema Validator: Playwright test suite for JSON-LD Rich Result eligibility
- [x] Add Broken-link checker to pre-commit hooks
- [x] Create `/docs/seo-runbook.md` with KPIs, monitoring procedures, recovery steps

## Phase 1 — Technical SEO Excellence ✅
- [x] Generate complete favicon suite (ICO, PNG, SVG, Apple-touch, manifest, mask-icon)
- [x] Add next-sitemap.js with ISR support for `/services/*` and `/uk/[city]`
- [x] Optimize next/font with preload + `display=swap`
- [x] Enable AVIF/WebP in next/image for production
- [x] Fix hydration errors and nested `<a>` issues
- [x] Add meta theme-color and PWA manifest improvements

## Phase 2 — Schema & Trust Signals ✅
- [x] Expand Organization schema with foundingDate, founders, headquarters, sameAs
- [x] Implement WebSite + SearchAction schema for sitelinks searchbox
- [x] Add Trustpilot aggregateRating schema (ratingValue, ratingCount, bestRating)
- [x] Create `/reviews` page with embedded Trustpilot widget + unique excerpts
- [x] Add ContactPoint schema and NAP consistency checks

## Critical Pages (Priority 1)
- [ ] Create `/services` hub page linking to all service pages
- [ ] Create service pages: man-and-van, van-and-man, 2-men-with-van, van-with-2-men, furniture-removal, house-removal, full-house-removal, 1-bedroom-removal
- [ ] Optimize `/contact` page with full NAP, embedded map, schema, phone/WhatsApp CTAs
- [ ] Add sticky mobile CTA (fixed bottom bar: Book Now, Call, WhatsApp)
- [ ] Add insurance badges, process visualization, comparison tables

## Content Foundation
- [ ] Audit + fix image alt attributes (target keywords)
- [ ] Publish 5 pillar blog posts:
  - [ ] London moving tips
  - [ ] Packing checklist 2024
  - [ ] Moving day timeline
  - [ ] Furniture protection guide
  - [ ] Full house removal cost breakdown
- [ ] Add author bio (Ahmad Alwakai) to all posts (E-E-A-T)
- [ ] Prepare case studies section with Article schema

## Validation & Launch
- [ ] All new pages must pass Lighthouse CI budgets
- [ ] Schema Validator (100% Rich Result eligibility)
- [ ] Broken Link Check
- [ ] Manual UX/quality review
- [ ] Submit all new pages to GSC via API immediately after deployment
- [ ] Monitor daily for 14 days post-launch; rollback plan in place

## Success Criteria
- [ ] LCP ≤ 2.5s, CLS ≤ 0.05, INP ≤ 200ms (mobile)
- [ ] Trustpilot stars visible in Google SERP
- [ ] Sitelinks searchbox active
- [ ] All services + reviews + contact pages indexed in GSC with 0 errors
- [ ] 15%+ CTR uplift on branded and non-branded queries
- [ ] Speedy Van recognized as entity in Knowledge Graph

