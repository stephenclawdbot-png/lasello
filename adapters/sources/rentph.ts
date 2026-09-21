import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const rentph: SourceAdapter = {
  key: "rentph",
  provenance:
    "Rent.ph — partner/agreed feed only; set LASELLO_FEED_RENTPH to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("rentph"),
};
