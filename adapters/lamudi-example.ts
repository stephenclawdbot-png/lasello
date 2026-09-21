import type { SourceAdapter, RawListing } from "./contract";

/**
 * EXAMPLE ADAPTER — stub. Real implementation TODO (see /adapters/README.md).
 *
 * Lamudi blocks generic scrapers (403 on non-browser UAs). A compliant path is
 * either (a) their official data/partner API, (b) an agreed feed, or
 * (c) browser-grade ingestion respecting robots.txt + rate limits, run by the
 * operator — NOT from the deployed site.
 */
export const lamudiAdapter: SourceAdapter = {
  key: "lamudi",
  provenance:
    "https://www.lamudi.com.ph/robots.txt — scraping disallowed on listing pages. Use partner API / RSS if available; otherwise this adapter stays a stub.",
  async fetchListings(): Promise<RawListing[]> {
    return [];
  },
};