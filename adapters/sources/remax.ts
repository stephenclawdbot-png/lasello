import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const remax: SourceAdapter = {
  key: "remax",
  provenance:
    "RE/MAX Philippines — franchise broker listings; agreed feed only. Set LASELLO_FEED_REMAX to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("remax"),
};
