import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const locanto: SourceAdapter = {
  key: "locanto",
  provenance:
    "Locanto PH — classifieds; agreed feed/API only. Set LASELLO_FEED_LOCANTO to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("locanto"),
};
