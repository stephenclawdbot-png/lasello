# HANDOFF — Lasello

> **For incoming agents.** Read this top-to-bottom before touching anything.
> Repo: https://github.com/stephenclawdbot-png/lasello · Live: (see Vercel URL in repo README/deploy log)

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
freshDays, verified.

**Rules baked into the product — keep them:**

1. Every listing names its source and links out (deep link, not copy).
2. ₱/m² is computed centrally in one place (`perSqm()` + `lib/stats.ts`).
3. "vs city median" compares within the same city AND same tenure, and hides
   under ±5% (self-comparison noise in small cities).
4. Price heat tiers are percentile ranks within the same tenure cohort.
5. Anything not live-ingested is clearly labeled demo (sync badge + disclaimer).

## 5. Aggregation (the real product) — /adapters + scripts/ingest.ts

```
portal connector → normalize() → dedupe() → public/data/listings.json → useFeed() polls
```

- One connector per portal in `adapters/sources/*.ts`, all implementing
  `SourceAdapter` (`adapters/contract.ts`).
- Connectors run from **configured feeds only** (`LASELLO_FEED_<SOURCE>` env /
  repo secret → partner API, licensed feed, or agreed export). Robots checks
  (2025-09): Lamudi 403s bots at the CDN, Carousell disallows query URLs,
  Rentpad publishes content-signal restrictions — **the deployed site never
  scrapes, and we don't ship ToS-breaking scrapers.** A connector without a
  feed reports `pending`; an erroring one keeps its previous rows (stale-safe).
- `npm run ingest` writes the feed; the GitHub Action runs it every 6 hours
  and commits changes (Vercel redeploys); the client re-polls every 5 minutes.
  Net effect: near-real-time updates end to end once feeds are configured.

Next targets in order of ROI: ZipMatch → Carousell PH property → FB
Marketplace (official surfaces only) → Property24 → Lamudi (partner API).

## 6. Deploy (Vercel)

Already linked: project `lasello`. Framework auto-detected (Vite). `vercel --prod`.
Any push to `master` redeploys if Vercel git integration is on — which is how
the scheduled feed commits become live data.

## 7. Open tasks for agents (grab in order)

- **P0 · Feed deals:** get at least one real feed configured (broker exports
  count — see Phase 3); everything downstream already works.
- **P0 · Real geocoding:** ingest-time geocoder for feeds that lack lat/lng
  (`normalize()` currently hard-requires coords).
- **P1 · Listing photos:** thumbnails via the source's og:image with
  attribution (do not hotlink listing galleries).
- **P1 · Saved searches / alerts:** email or Telegram bot for price drops.
- **P1 · Map clustering:** collapse overlapping Metro Manila pills at low zoom.
- **P2 · Registry price layer:** overlay public assessed land values per
  region — killer differentiator.
- **P2 · Broker submissions:** verified-pin funnel (Phase 3 flywheel).

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
- [ ] Real feeds configured (P0 above) — the site is honest about this in the UI
