import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const unionbank: SourceAdapter = {
  key: "unionbank",
  provenance:
    "UnionBank Foreclosed — bank foreclosure inventory; use the bank's published list/export. Set LASELLO_FEED_UNIONBANK to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("unionbank"),
};
