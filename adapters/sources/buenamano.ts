import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const buenamano: SourceAdapter = {
  key: "buenamano",
  provenance:
    "BPI Buena Mano — bank foreclosure inventory; use the bank's published list/export. Set LASELLO_FEED_BUENAMANO to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("buenamano"),
};
