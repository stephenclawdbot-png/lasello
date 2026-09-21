import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const property24: SourceAdapter = {
  key: "property24",
  provenance:
    "Property24 PH — no public listing API. Runs with an agreed export / partner feed URL in LASELLO_FEED_PROPERTY24.",
  fetchListings: () => loadConfiguredFeed("property24"),
};
