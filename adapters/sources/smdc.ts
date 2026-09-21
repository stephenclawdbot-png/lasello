import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const smdc: SourceAdapter = {
  key: "smdc",
  provenance:
    "SMDC — developer inventory via official/partner channel. Set LASELLO_FEED_SMDC to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("smdc"),
};
