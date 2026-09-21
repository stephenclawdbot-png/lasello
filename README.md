# Lasello

**Philippine property, all portals in one place. Honest math.**

An aggregator for Philippine real estate — built for OFWs, balikbayans and
remote investors who buy sight-unseen and get burned by fragmented, duplicated,
untrustworthy listings.

- Clean marketplace UI: listing cards + a light interactive map of the archipelago
- One search across **13 PH listing platforms**: Lamudi, Property24,
  DotProperty, Rentpad, ZipMatch, Carousell, FB Marketplace, OnePropertee,
  MyProperty.ph, Hoppler, Filipino Homes, Rent.ph, Ohmyhome
- Listings across 30+ cities — Metro Manila, Cebu, Davao, Palawan, Baguio…
- Normalized ₱/m² with "vs city median" honesty chips
- Source receipts: every listing names its portal and links out to it
- Live aggregation pipeline: per-portal connectors → scheduled ingest →
  auto-refreshing feed (`public/data/listings.json`, polled every 5 min)
- Search, filters (tenure, type, price, source, verified-only) and sorting

## Status

**Demo seed** — ~78 hand-curated listings with complete details and
market-plausible prices, clearly labeled in the UI. The connector pipeline
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
