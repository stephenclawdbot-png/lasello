import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const myproperty: SourceAdapter = {
  key: "myproperty",
  provenance:
    "MyProperty.ph — partner/agreed feed only; set LASELLO_FEED_MYPROPERTY to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("myproperty"),
};
