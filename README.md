# Lasello

**Philippine property, all portals in one place. Honest math.**

An aggregator for Philippine real estate — built for OFWs, balikbayans and
remote investors who buy sight-unseen and get burned by fragmented, duplicated,
untrustworthy listings.

- Clean marketplace UI: listing cards + a light interactive map of the archipelago
- One search across **27 PH listing platforms** in five categories: property
  portals (Lamudi, Property24, DotProperty, Rentpad, ZipMatch, OnePropertee,
  MyProperty.ph, Rent.ph), developer pre-selling (SMDC, DMCI, Camella,
  Megaworld, Ayala Land), banks & foreclosure (Pag-IBIG, BPI Buena Mano, BDO,
  Metrobank, UnionBank, ForeclosurePhilippines), brokerages (Hoppler,
  Filipino Homes, Ohmyhome, RE/MAX PH, PropertyAccess) and classifieds
  (FB Marketplace, Carousell, Locanto)
- Listings across 30+ cities — Metro Manila, Cebu, Davao, Palawan, Baguio…
- Normalized ₱/m² with "vs city median" honesty chips
- Source receipts: every listing names its portal and links out to it
- Live aggregation pipeline: per-portal connectors → scheduled ingest →
  auto-refreshing feed (`public/data/listings.json`, polled every 5 min)
- Search, filters (tenure, type, price, source, verified-only) and sorting

## Status

**Demo inventory** — 6,500+ listings with complete details: 78 hand-curated
anchors plus a deterministic, market-calibrated generator (`src/data/generate.ts`,
city-level ₱/m² bands across 100+ cities, incl. foreclosure discounts and pre-selling premiums), clearly labeled as demo in the UI. The connector pipeline
(`/adapters`, `scripts/ingest.ts`, `.github/workflows/ingest.yml`) is wired
end-to-end; each portal goes live the moment its feed URL
(`LASELLO_FEED_<SOURCE>` secret) is configured. See **HANDOFF.md**.

## Dev

    npm install
    npm run dev

## Ingest (aggregation)

    npm run ingest   # runs all portal connectors, writes public/data/listings.json

Scheduled every 6 hours by GitHub Actions; the site polls the feed every
5 minutes, so new data shows up without a redeploy of code.

## Deploy

Vercel, zero-config Vite. `vercel --prod`.

## Contribute

Agents and humans: start at **HANDOFF.md**, then `adapters/README.md`.
