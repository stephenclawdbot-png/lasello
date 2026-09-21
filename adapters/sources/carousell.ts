import type { SourceAdapter } from "../contract";
import { extractListing, runCrawl } from "./crawl";
import { loadConfiguredFeed } from "./feed";

const SITEMAP = "https://www.carousell.ph/sitemaps/products/ph-property.xml";

/**
 * Carousell PH property — official public sitemap crawl (~21k listing URLs,
 * verified 2025-09; robots.txt has no Disallow for /p/ pages).
 * Server-rendered pages expose JSON-LD Product (title/price/image) plus an
 * embedded blob (city, coordinates, address); beds/baths/sqm are extracted
 * from the title+description text.
 *
 * Cloudflare throttles bursts, so the crawl is slow and capped (politeness
 * 2.6s + LASELLO_CRAWL_CAP pages per run, default 120) and incremental via
 * data/crawl/carousell.json — blocked pages retry next cycle. An agreed
 * feed URL in LASELLO_FEED_CAROUSELL overrides the crawl entirely.
 */
export const carousell: SourceAdapter = {
  key: "carousell",
  provenance:
    "Carousell PH — official public sitemap crawl (robots-allowed, deep-link + attribution preserved). Cloudflare may throttle; blocked pages retry next run. Override with LASELLO_FEED_CAROUSELL.",
  fetchListings: async () => {
    if (process.env.LASELLO_FEED_CAROUSELL) return loadConfiguredFeed("carousell");
    const cap = Number(process.env.LASELLO_CRAWL_CAP ?? "120");
    const { listings, blocked, pages } = await runCrawl("carousell", SITEMAP, extractListing, Number.isFinite(cap) ? cap : 120);
    if (pages > 0 && listings.length === 0 && blocked === pages) {
      throw new Error(`crawl blocked by WAF on all ${pages} pages this run (retries next cycle)`);
    }
    console.log(`  ↳ crawl: ${pages} pages fetched, ${blocked} blocked, ${listings.length} listings extracted`);
    return listings;
  },
};