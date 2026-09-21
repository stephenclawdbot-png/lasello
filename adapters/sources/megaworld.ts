import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const megaworld: SourceAdapter = {
  key: "megaworld",
  provenance:
    "Megaworld — developer inventory via official/partner channel. Set LASELLO_FEED_MEGAWORLD to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("megaworld"),
};
