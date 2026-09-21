# HANDOFF — Lasello

> **For incoming agents.** Read this top-to-bottom before touching anything.
> Repo: https://github.com/stephenclawdbot-png/lasello · Live: (see Vercel URL in repo README/deploy log)

## 0. Mode: PRIVATE / INTERNAL

Lasello is a **private internal platform**, not a public marketplace. Its
users are the owner's broker network (PH real-estate brokers) centralizing
their own listings in one place to show capability. Consequences:

- **Supply = broker-direct.** The primary source is `broker`
  (`adapters/sources/broker.ts`): CSV/JSON files in `data/imports/` or a
  hosted JSON feed at `LASELLO_FEED_BROKER`. Broker rows may omit `url` —
  the broker member is the provenance. Portal connectors stay as
  configured-feed-only fallbacks; scraping is still off the table.
- Don't add public growth features (SEO, share widgets, signup funnels).
  Broker-submission workflow: drop a file in `data/imports/`, run
  `npm run ingest`, commit. The detail panel shows "Direct from broker" when
  a row has no external URL.

## 1. What Lasello is

A **Philippines-wide real estate aggregator**: a clean, light marketplace UI
(cards + a flat interactive SVG map), one search across every portal,
normalized price-per-square-meter, and **source receipts** — you always
deep-link out to the original listing portal, never copy content.

**Design language (do not drift from this):** the target market is OFWs,
balikbayans and local buyers. The site must read like Lamudi/Zillow/Airbnb —
light background, white cards, big peso prices, trust badges, Inter — NOT
like an intelligence dashboard. Dark/glass/mono/3D aesthetics were tried and
explicitly rejected by the owner ("looks like an OSINT site").

**PMF wedge:**

- Primary user: **OFWs / balikbayans / remote investors** buying property
  sight-unseen. Secondary: local buyers drowning in duplicate/fake listings
  across Lamudi, Property24, DotProperty, Rentpad, ZipMatch, Carousell, FB
  Marketplace.
- The pain: PH portals fragment the market and don't let you compare **₱/m²**
  across them; FB listings are untrustworthy; remote buyers can't sanity-check
  prices.
- The answer: one searchable marketplace + honest per-sqm math + "vs city
  median" chips + verified/source badges + deep links. Monetization later =
  verified seller/broker submissions (see /adapters roadmap Phase 3).

## 2. Stack & quickstart

- **Vite + React 19 + TypeScript.** No 3D deps anymore (three/R3F removed —
  plain `npm install` works now).
- Map: **flat SVG** (`src/ui/Map2D.tsx`) projected from world-atlas
  `countries-50m.json` TopoJSON (bundled via Vite `?url` import), with
  pan/zoom, Airbnb-style price pills and city labels.
- Font: Inter (Google Fonts). No Tailwind — design tokens live in
  `src/styles.css` `:root`. Keep it that way.

```bash
npm install
npm run dev      # local dev
npm run build    # verify before pushing
npm run ingest   # run portal connectors → public/data/listings.json
```

## 3. Architecture map

```
src/
  data/listings.ts   DEMO seed (~61 listings, 30+ cities, complete details:
                     address, description, features, parking, furnishing).
  data/sources.ts    Source registry: name, color, deep-link SEARCH templates.
  lib/geo.ts         topojson → PH island outlines (lat/lng rings).
  lib/stats.ts       percentiles, city medians, ₱/m² tiers, peso formatting.
                     THE math authority — never fork it.
  lib/live.ts        useFeed(): loads /data/listings.json, re-polls every 5
                     min, falls back to the seed (labeled demo). agoLabel().
  ui/Map2D.tsx       SVG map: pan/zoom/fly-to, price pills, city labels.
  ui/ListingCard.tsx marketplace card (price, median chip, specs, source).
  ui/Filters.tsx     horizontal FilterBar; FilterState is the single source
                     of truth (incl. sort).
  ui/Panel.tsx       detail panel: full specs, description, features, CTA.
  ui/Overlays.tsx    Header (search + sync badge), Legend, Disclaimer.
  ui/icons.tsx       inline SVG icons + per-type card art (no hotlinked photos).
  App.tsx            state wiring + filtering/sorting + list⇄map selection.
adapters/            ingestion contract + per-portal connectors + legal rules.
scripts/ingest.ts    aggregation runner (npm run ingest).
public/data/listings.json  the runtime feed the site polls.
.github/workflows/ingest.yml  6-hourly scheduled sync (commits the feed).
```

## 4. Data model & the honesty rules

`Listing` = id, name, city, region, address, lat/lng, type
(condo/house/lot/land), tenure (sale/rent), price (PHP total, or ₱/mo for
rent), sqm, beds, baths, parking, furnished, description, features[], source,
freshDays, verified — plus optional enrichment: `url` (deep link),
`priceMin`/`priceMax` (asking range; `price` = midpoint), `dues`, `floor`,
`yearBuilt`, `turnover` (rfo/preselling), `advanceMonths`/`depositMonths`
(rent), `agent`, `brokerType` (owner/broker/developer), `listedAt`,
`geoPrecision` ("exact" | "city"), `outlier` (price flag).

**Rules baked into the product — keep them:**

1. Every listing names its source and links out (deep link, not copy).
2. ₱/m² is computed centrally in one place (`perSqm()` + `lib/stats.ts`).
3. "vs city median" compares within the same city AND same tenure, and hides
   under ±5% (self-comparison noise in small cities).
4. Price heat tiers are percentile ranks within the same tenure cohort.
5. Anything not live-ingested is clearly labeled demo (sync badge + disclaimer).
6. **Price sanity is automatic** (`src/lib/price.ts`): `validatePrice()` gates
   ingest against per-tenure×type bounds (₱total and ₱/m²); statistical
   outliers get IQR/MAD-fenced per city×tenure×type cohort and surface as an
   amber ⚠ chip — we show them, we don't hide them.
7. **Cross-source dedupe**: same unit reposted on two portals collapses
   (fingerprint = city|tenure|type|beds|sqm band ±12%|price band ±8%; the
   richer, verified row wins).
8. **Every row wears its completeness** (`completenessOf()` 0–100 meter in the
   detail panel listing which fields are missing) and a "Most complete data"
   sort exists in the filter bar.

## 5. Aggregation (the real product) — /adapters + scripts/ingest.ts

```
portal connector → normalize() → [per-source] → merge → dedupe(cross-source)
→ flagOutliers() → public/data/listings.json → useFeed() polls
```

- One connector per portal in `adapters/sources/*.ts`, all implementing
  `SourceAdapter` (`adapters/contract.ts`), plus the **broker-direct source**
  (registered first in `adapters/sources/index.ts`).
- **Broker-direct (`broker`)**: reads `data/imports/*.json|*.csv` (files
  starting with `_` ignored, e.g. templates) or a hosted JSON feed at
  `LASELLO_FEED_BROKER`. See `adapters/README.md` for the row schema and the
  broker-submission workflow.
- `normalize()` accepts price ranges (min/max → midpoint), maps furnished /
  parking / features / dues / floor / year-built / turnover / rent terms /
  agent / listed-at, geocodes missing pins from the PH city-centre table
  (`adapters/geo.ts`, sets `geoPrecision: "city"`), and drops rows with a
  logged reason: missing-url-or-title, missing-price, missing-sqm,
  invalid-price, unmappable-city. Portal rows still require a `url`; broker
  rows don't.
- Portal connectors run from **configured feeds only**
  (`LASELLO_FEED_<SOURCE>` env / repo secret → partner API, licensed feed, or
  agreed export). Robots checks (2025-09): Lamudi 403s bots at the CDN,
  Rentpad publishes content-signal restrictions — **we never scrape
  ToS-blocking portals.**
- Exception: **Carousell sitemap crawl** — Carousell publishes an official
  open sitemap of property pages (robots-allowed). `sources/carousell.ts` +
  `sources/crawl.ts` crawl it slowly (2.6 s politeness, 120-page cap, deep
  links preserved) and incrementally (`data/crawl/carousell.json` committed
  by the workflow). Cloudflare occasionally WAF-blocks runs; blocked pages
  retry next cycle and the pipeline stays stale-safe. A configured
  `LASELLO_FEED_CAROUSELL` overrides the crawl.
- `npm run ingest` writes the feed; the GitHub Action runs it every 6 hours
  and commits changes (Vercel redeploys); the client re-polls every 5 minutes.
  Net effect: near-real-time updates end to end once feeds are configured.

Next targets in order of ROI: Carousell sitemap crawl (live — grows the
corpus every run) → ZipMatch → FB Marketplace (official surfaces only) →
Property24 → Lamudi (partner API).

## 6. Deploy (Vercel)

Already linked: project `lasello`. Framework auto-detected (Vite). `vercel --prod`.
Any push to `master` redeploys if Vercel git integration is on — which is how
the scheduled feed commits become live data.

## 7. Open tasks for agents (grab in order)

- **P0 · Broker imports:** collect CSV/JSON exports from the broker network
  and drop them into `data/imports/` (schema in `adapters/README.md`); run
  `npm run ingest` and commit. This is the whole supply side now.
- **P1 · Broker submit form:** `/submit` route that generates a validated
  structured row (JSON) a broker can paste into a CSV/PR.
- **P1 · Listing photos:** thumbnails via the source's og:image with
  attribution (do not hotlink listing galleries).
- **P1 · Saved searches / alerts:** email or Telegram bot for price drops.
- **P1 · Map clustering:** collapse overlapping Metro Manila pills at low zoom.
- **P2 · Registry price layer:** overlay public assessed land values per
  region — killer differentiator.

## 8. Conventions & gotchas

- TS is strict-ish (`noUnusedLocals`, `verbatimModuleSyntax`) — use
  `import type` for types. TS ~6.0 + oxlint in devDeps; `tsx` runs ingest.
- `world-atlas` JSON is imported with `?url` + runtime fetch. Don't switch to
  a CDN — offline builds should work.
- Design tokens are law (`src/styles.css` `:root`): bg `#f6f7f9`, ink
  `#182430`, brand teal `#0f766e`, tier colors in `lib/stats.ts`. Light theme
  only. Font = Inter.
- Commit style: imperative, conventional prefix (`feat:`, `fix:` …).

## 9. Status

- [x] Light marketplace UI: header search, filter bar, cards, detail panel
- [x] Flat SVG map: pan/zoom, price pills, fly-to, city labels
- [x] Demo seed with complete listing details + deep-link templates
- [x] Aggregation pipeline: connectors → ingest → feed → polling client
- [x] Scheduled sync workflow (6-hourly)
- [x] Broker-direct internal supply (`broker` source + `data/imports/` workflow)
- [x] Sample broker import (`data/imports/sample.csv`) proving the pipeline
- [ ] Broker network onboarding: real CSVs from the broker members (P0 above)
- [ ] Portal feeds configured (fallback path only)
