# Lasello

**Every Philippine listing. One map. Honest math.**

A 3D aggregator for Philippine real estate - built for OFWs, balikbayans and
remote investors who buy sight-unseen and get burned by fragmented, duplicated,
untrustworthy listings.

- Interactive 3D archipelago of the Philippines (React Three Fiber)
- Listings across 30+ cities - Metro Manila, Cebu, Davao, Palawan, Baguio...
- Price-per-m2 heat tiers (percentile-normalized within each tenure)
- Source receipts: every pin links out to the portal it came from
- "vs city median" chips - know instantly if a price is off
- Search + filters: tenure, type, max price, source, verified-only

## Status

**Demo seed** - ~63 hand-curated listings with market-plausible prices and
deep-link search templates. Real ingestion pipeline (`/adapters`) is specced
and waiting for hands. See **HANDOFF.md** for architecture, roadmap and rules.

## Dev

    npm install --legacy-peer-deps
    npm run dev

`--legacy-peer-deps` is required (R3F v9 optional `expo` peer conflict).

## Deploy

Vercel, zero-config Vite. `vercel --prod`.

## Contribute

Agents and humans: start at **HANDOFF.md**, then `adapters/README.md`.
