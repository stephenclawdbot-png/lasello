import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const filipinohomes: SourceAdapter = {
  key: "filipinohomes",
  provenance:
    "Filipino Homes — partner/agreed feed only; set LASELLO_FEED_FILIPINOHOMES to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("filipinohomes"),
};
