import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const ayalaland: SourceAdapter = {
  key: "ayalaland",
  provenance:
    "Ayala Land — developer inventory via official/partner channel. Set LASELLO_FEED_AYALALAND to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("ayalaland"),
};
