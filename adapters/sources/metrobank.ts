import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const metrobank: SourceAdapter = {
  key: "metrobank",
  provenance:
    "Metrobank Properties — bank foreclosure inventory; use the bank's published list/export. Set LASELLO_FEED_METROBANK to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("metrobank"),
};
