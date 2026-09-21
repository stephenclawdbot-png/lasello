import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

/** Lamudi hard-blocks generic bots (CloudFront 403, verified 2025-09). Partner API / licensed feed only. */
export const lamudi: SourceAdapter = {
  key: "lamudi",
  provenance:
    "Lamudi PH — robots/CDN blocks automated access (403 at edge). Runs only with a partner-API or licensed feed URL in LASELLO_FEED_LAMUDI.",
  fetchListings: () => loadConfiguredFeed("lamudi"),
};
