import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

/** Rentpad publishes content-signal restrictions in robots.txt (ai-input/train limits). Feed-only. */
export const rentpad: SourceAdapter = {
  key: "rentpad",
  provenance:
    "Rentpad — robots content-signals restrict automated reuse (verified 2025-09). Runs with an agreed feed URL in LASELLO_FEED_RENTPAD.",
  fetchListings: () => loadConfiguredFeed("rentpad"),
};
