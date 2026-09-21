# HANDOFF — Lasello

> **For incoming agents.** Read this top-to-bottom before touching anything.
> Repo: https://github.com/stephenclawdbot-png/lasello · Live: (see Vercel URL in repo README/deploy log)

## 1. What Lasello is

A **Philippines-wide real estate aggregator** rendered as an interactive 3D
archipelago (Three.js / React Three Fiber). One map, every portal, normalized
price-per-square-meter, and **source receipts** — you always deep-link out to
the original listing portal, never copy content.

**PMF wedge (do not drift from this):**

- Primary user: **OFWs / balikbayans / remote investors** buying property
  sight-unseen. Secondary: local buyers drowning in duplicate/fake listings
  across Lamudi, Property24, DotProperty, Rentpad, ZipMatch, Carousell, FB
  Marketplace.
- The pain: PH portals fragment the market and don't let you compare
  **₱/m²** across them; FB listings are untrustworthy; remote buyers can't
  sanity-check prices.
- The answer: one searchable 3D map + honest per-sqm math + "vs city median"
  chips + verified/source badges + deep links. Monetization later = verified
  seller/broker submissions (see /adapters roadmap Phase 3).

## 2. Stack & quickstart

- **Vite + React 19 + TypeScript**, 3D via **@react-three/fiber + drei** on three.
  - ⚠️ Install with `npm install --legacy-peer-deps` — R3F v9 has an optional
    `expo` peer that breaks plain `npm install` here.
- Landmass: **world-atlas `countries-50m.json`** TopoJSON (bundled via Vite
  `?url` import), carved to the Philippines with **topojson-client**, extruded
  into low-poly islands.
- Fonts: Clash Display (Fontshare) + Space Grotesk / JetBrains Mono (Google).
- No Tailwind — design tokens live in `src/styles.css` `:root`. Keep it that way.

```bash
npm install --legacy-peer-deps
npm run dev      # local dev
npm run build    # verify before pushing
```

## 3. Architecture map

```
src/
  data/listings.ts   DEMO seed (~63 listings, 30+ cities). Every row carries
                     source + price + sqm → perSqm(). REPLACE via adapters.
  data/sources.ts    Source registry: name, color, deep-link SEARCH templates.
  lib/geo.ts         topojson → PH islands; lat/lng → world coords (toWorld).
  lib/stats.ts       percentiles, city medians, ₱/m² tiers (teal/amber/coral),
                     peso formatting. THE math authority — never fork it.
  three/Scene.tsx    Canvas: islands, pins (heat/source colors, hover labels,
                     select pulse, camera fly-to), stars, sea grid.
  ui/Filters.tsx     search, tenure, type, max price, sources, verified-only,
                     color-by toggle. FilterState is the single source of truth.
  ui/Panel.tsx       listing detail: ₱/m² vs city median, specs, trust pills,
                     deep-link CTA.
  ui/Overlays.tsx    TopBar, Legend, DemoPill.
  App.tsx            state wiring + filtering + focus/fly-to logic.
adapters/            ingestion contract + roadmap + legal posture (READ IT).
```

## 4. Data model & the honesty rules

`Listing` = id, name, city, region, lat/lng, type (condo/house/lot/land),
tenure (sale/rent), price (PHP total, or ₱/mo for rent), sqm, beds, baths,
source, freshDays, verified.

**Rules baked into the product — keep them:**

1. Every listing names its source and links out (deep link, not copy).
2. ₱/m² is computed centrally in one place (`perSqm()` + `lib/stats.ts`).
3. "vs city median" compares within the same city AND same tenure.
4. Price heat tiers are percentile ranks within the same tenure cohort —
   so ₱/mo rentals don't skew sale ₱/m² tiers.
5. Anything not yet ingested is clearly labeled DEMO SEED (see DemoPill).

## 5. Ingestion (the real product) — /adapters

`adapters/contract.ts` = `SourceAdapter → normalize() → dedupe()`. Write one
adapter per portal. **The deployed site never scrapes.** Ingestion is a
scheduled operator-side job that writes normalized listings (start: replace the
seed JSON; later: tiny API/DB). Lamudi blocks generic scrapers (403) — use
partner APIs or agreed feeds, and respect robots/ToS. Full rules + phased
roadmap: `adapters/README.md`.

Next ingest targets in order of ROI: ZipMatch → Carousell PH property →
FB Marketplace (official surfaces only) → Property24 → Lamudi (partner API).

## 6. Deploy (Vercel)

Already linked: project `lasello` on the team scope used by the owner account.
Framework auto-detected (Vite). Just:

```bash
vercel --prod
```

Any push to `main` redeploys if Vercel git integration is on.

## 7. Open tasks for agents (grab in order)

- **P0 · Real ingestion:** implement `adapters/` Phase 1 sources; write
  normalized rows to `src/data/listings.ts`-shaped store; keep dedupe on.
- **P0 · Real geocoding:** seed coords are city-center-ish; add geocoder +
  per-listing coords at ingest time (`normalize()` currently hard-requires lat/lng).
- **P1 · Listing photos:** thumbnails in Panel via the source's og:image with
  attribution (do not hotlink listing galleries).
- **P1 · Saved searches / alerts:** email or Telegram bot for price drops.
- **P1 · Mobile UX pass:** filters collapse into a bottom sheet; panel already
  becomes a bottom sheet under 900px.
- **P2 · Registry price layer:** overlay public assessed land values per region
  as a second heatmap mode — killer differentiator.
- **P2 · Broker submissions:** verified-pin funnel (Phase 3 flywheel).

## 8. Conventions & gotchas

- Windows dev box: no `head`; env vars inline (`$env:X="1"; npm run dev`).
- TS is strict-ish (`noUnusedLocals`, `verbatimModuleSyntax`) — use
  `import type` for types. TS ~6.0 + oxlint in devDeps.
- `world-atlas` JSON is imported with `?url` + runtime fetch (keeps TS happy,
  keeps bundle streaming). Don't switch to a CDN — offline builds should work.
- Keep the 3D scene one-file-per-concern; heavy per-frame work only in
  `useFrame` blocks that already exist. Don't add postprocessing without reason.
- Design tokens are law: ink navy `#071019`, paper `#F2EAD9`, coral `#FF6B4A`,
  amber `#FFC15E`, teal `#35C4B5`, glass panels. Display font = Clash Display.
- Commit style: imperative, conventional prefix (`feat:`, `fix:` …).

## 9. Status

- [x] 3D archipelago + pins + heat + sources + filters + panel + fly-to
- [x] Demo seed with source attribution + deep-link templates
- [x] Ingestion contract + legal posture
- [x] Repo + Vercel deploy
- [ ] Real data (P0 above) — the site is honest about this in the UI