import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const onepropertee: SourceAdapter = {
  key: "onepropertee",
  provenance:
    "OnePropertee — partner/agreed feed only; set LASELLO_FEED_ONEPROPERTEE to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("onepropertee"),
};
