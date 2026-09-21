# Lasello — Ingestion Layer

The website itself **does not scrape anything**. Every listing on the map comes
from this folder's pipeline, which is the only place real data is allowed in.

```
internet ──> SourceAdapter.fetchListings() ──> normalize() ──> dedupe() ──> public/data/listings.json ──> useFeed() polls
```

One connector per portal lives in `sources/`. Each pulls from a **configured
feed** (partner API, licensed feed, or agreed export) set via env:
`LASELLO_FEED_<SOURCEKEY>` (repo secrets feed the scheduled workflow).
`npm run ingest` runs them all; `.github/workflows/ingest.yml` does it every
6 hours and commits the feed, which the deployed site re-polls every 5 min.

## Rules (non-negotiable)

1. **Deep-link + attribute.** Every listing carries a direct `url` to the source
   portal. We never copy listing bodies/photos; we show metadata + a link.
2. **Respect robots.txt and portal ToS.** If a portal disallows scraping
   (Lamudi currently does), the adapter may only run with a partner API / agreed
   feed / official export. Stubs stay stubs.
3. **Rate-limit and identify.** Any HTTP fetching uses conservative delays and
   a real UA; ingestion runs as a scheduled job, never inside the visitor's browser.
4. **Dedupe by default.** Ghost/duplicate listings (same unit reposted) collapse
   via `dedupe()` — the biggest trust problem in PH property listing aggregators.
5. **Normalize the math.** Price-per-sqm is computed centrally (`perSqm()`) so
   every source is comparable. Never trust the portal's own ₱/m² figures.

## Roadmap

| Phase | Sources | Method |
|-------|---------|--------|
| 0 (done) | 7 seed sources | hand-curated demo rows in `src/data/listings.ts` |
| 1 | ZipMatch, Carousell, FB Marketplace groups | per-source adapters with ToS review; FB via official marketplace search only |
| 2 | Lamudi, Property24 | partner API or data-licensing conversation |
| 3 | Broker/agent submissions | "list your property, get a verified pin" funnel — the honest flywheel |
| 4 | LGHL/registry price checks | public land-registry data to validate asking prices |

The end state: sellers/brokers submit listings directly (verified pin), portals
are linked as receipts, and the map is the cheapest place to sanity-check any
PH property price per square meter.