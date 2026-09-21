import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

/** FB Marketplace has no permitted listing API for aggregators; only official Graph-API surfaces with proper permissions. */
export const facebook: SourceAdapter = {
  key: "facebook",
  provenance:
    "FB Marketplace — official Graph API surfaces only (page/catalog with granted permissions). Set LASELLO_FEED_FACEBOOK to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("facebook"),
};
