# Lasello — Ingestion Layer

Lasello is an **internal platform**: supply is **broker-direct first**, portal
connectors are fallbacks. The pipeline in this folder is the only place real
data is allowed in.

```
broker CSV/JSON in data/imports/ ──┐
LASELLO_FEED_BROKER (hosted feed) ─┤─> SourceAdapter.fetchListings() ──> normalize() ──> dedupe() ──> public/data/listings.json ──> useFeed() polls
LASELLO_FEED_<PORTAL> (optional) ──┘
```

## Broker-direct imports (primary supply)

`sources/broker.ts` reads, in order:

1. **Hosted feed** — JSON at `LASELLO_FEED_BROKER` (array or `{listings:[...]}`).
2. **Local imports** — every `data/imports/*.json` / `*.csv` (files starting
   with `_` are ignored, e.g. templates).

Nothing is scraped — these are rows the broker members themselves provide.

**Workflow:** a broker sends their inventory (spreadsheet export is fine) →
save it as `data/imports/<broker-name>.csv` → `npm run ingest` → commit.

**CSV schema** (header row, lowercased, underscores; extras ignored):

| Column | Required | Notes |
|---|---|---|
| `id` | no (auto: `file#row`) | stable external id |
| `title` | **yes** | |
| `city` | yes* | must match a known city or row needs `lat`+`lng` |
| `price` (or `price_min`+`price_max`) | **yes** | PHP total (sale) or ₱/mo (rent) |
| `sqm` | **yes** | floor area; lots may use `lot_area` |
| `region`,`type`,`tenure` | no | type: condo/house/townhouse/lot/land; tenure: sale/rent |
| `beds`,`baths`,`parking`,`furnished`,`features`,`dues`,`floor`,`year_built`,`turnover`,`advance_months`,`deposit_months` | no | `features` = `;`-separated |
| `agent`,`listed_by` | no | `listed_by`: owner/broker/developer |
| `verified` | no | `true`/`1` flags the row |
| `url` | no | optional for broker rows — omit it and the panel shows "Direct from broker" |
| `address`,`lat`,`lng`,`description` | no | exact pin beats city-centre fallback |

`data/imports/sample.csv` is a working example — `npm run ingest` picks it up
until real broker files replace it.

## Portal connectors (fallback)

One connector per portal lives in `sources/`. Each pulls from a **configured
feed** (partner API, licensed feed, or agreed export) set via env:
`LASELLO_FEED_<SOURCEKEY>` (repo secrets feed the scheduled workflow).
Portal rows **must** carry a `url` (deep-link rule); broker rows may not.
`npm run ingest` runs them all; `.github/workflows/ingest.yml` does it every
6 hours and commits the feed, which the deployed site re-polls every 5 min.

## Public-sitemap crawl (carousell)

Carousell PH publishes an official, open sitemap of property listing pages
(`carousell.ph/sitemaps/products/ph-property.xml`, ~21k URLs; robots.txt has
no Disallow for `/p/` pages). `sources/carousell.ts` + `sources/crawl.ts`
crawl it **slowly and incrementally**:

- politeness delay 2.6 s per request, per-run cap `LASELLO_CRAWL_CAP`
  (default 120 pages),
- pages are extracted from the server-rendered JSON-LD Product + embedded
  blob (city, coordinates, address); beds/baths/sqm from title+description
  text,
- every row keeps a direct deep link + source attribution,
- Cloudflare may throttle: blocked pages retry next cycle, tracked in
  `data/crawl/carousell.json` (committed by the workflow so the cursor and
  attempt counts survive across runs),
- an agreed feed URL in `LASELLO_FEED_CAROUSELL` overrides the crawl.

## Rules (non-negotiable)

1. **Attribute.** Portal listings carry a direct `url` to the source portal —
   we never copy listing bodies/photos. Broker-direct rows may omit `url`
   (the broker member is the provenance; the panel says "Direct from broker").
2. **Respect robots.txt and portal ToS.** If a portal disallows scraping
   (Lamudi currently does), the adapter may only run with a partner API / agreed
   feed / official export. Stubs stay stubs.
3. **Rate-limit and identify.** Any HTTP fetching uses conservative delays and
   a real UA; ingestion runs as a scheduled job, never inside the visitor's browser.
4. **Dedupe by default.** Ghost/duplicate listings collapse — same-source
   reposts via source-internal ids, cross-source reposts via the fingerprint in
   `contract.ts` (city|tenure|type|beds|sqm band ±12%|price band ±8%; the
   richer/verified row wins). The biggest trust problem in PH property
   aggregators.
5. **Normalize the math.** Price-per-sqm is computed centrally (`perSqm()`) so
   every source is comparable. Never trust the portal's own ₱/m² figures.

## Pipeline details

- `normalize()` (in `contract.ts`) is the gate: it parses the extended
  `RawListing` (price ranges, dues, floor, year built, turnover, rent advance/
  deposit, agent, listed-at), computes the price midpoint, validates the price
  against tenure×type bounds (`src/lib/price.ts#PRICE_BOUNDS`), geocodes rows
  without lat/lng from `geo.ts` city centres (`geoPrecision: "city"`) and
  **drops** rows with an explicit reason (logged per adapter): missing
  url/title, missing price, missing sqm, invalid price, unmappable city.
- `dedupe()` runs **once on the merged set** (cross-source), keeping the
  highest-quality row (verified > linked > addressed > described).
- `flagOutliers()` marks rows whose price is statistically far from their
  city×tenure×type cohort (IQR fence 1.6, MAD fallback ×4×1.4826, cohorts
  under 8 rows skipped). Flagged rows are **shown** with an amber ⚠ chip and
  excluded from medians — never silently deleted.

## Roadmap

| Phase | Sources | Method |
|-------|---------|--------|
| 0 (done) | 7 seed sources | hand-curated demo rows in `src/data/listings.ts` |
| 1 | ZipMatch, Carousell, FB Marketplace groups | per-source adapters with ToS review; FB via official marketplace search only |
| 2 | Lamudi, Property24 | partner API or data-licensing conversation |
| 3 (current) | Broker/agent submissions | broker-direct CSV/JSON imports in `data/imports/` + hosted `LASELLO_FEED_BROKER` |
| 4 | LGHL/registry price checks | public land-registry data to validate asking prices |

The end state: the broker network centralizes its inventory here (verified
rows, complete data), portals are linked as receipts, and the map is the
cheapest place to sanity-check any PH property price per square meter.