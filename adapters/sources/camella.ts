import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const camella: SourceAdapter = {
  key: "camella",
  provenance:
    "Camella (Vista Land) — developer inventory via official/partner channel. Set LASELLO_FEED_CAMELLA to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("camella"),
};
