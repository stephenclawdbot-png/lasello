import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const dmci: SourceAdapter = {
  key: "dmci",
  provenance:
    "DMCI Homes — developer inventory via official/partner channel. Set LASELLO_FEED_DMCI to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("dmci"),
};
