import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

/** Carousell robots.txt disallows query/search URLs (verified 2025-09). Feed-only. */
export const carousell: SourceAdapter = {
  key: "carousell",
  provenance:
    "Carousell PH property — robots disallows search/query URLs. Runs with an agreed feed URL in LASELLO_FEED_CAROUSELL.",
  fetchListings: () => loadConfiguredFeed("carousell"),
};
