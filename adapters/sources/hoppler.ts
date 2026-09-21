import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const hoppler: SourceAdapter = {
  key: "hoppler",
  provenance:
    "Hoppler — partner/agreed feed only; set LASELLO_FEED_HOPPLER to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("hoppler"),
};
