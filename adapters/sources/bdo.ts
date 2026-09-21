import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const bdo: SourceAdapter = {
  key: "bdo",
  provenance:
    "BDO Properties for Sale — bank foreclosure inventory; use the bank's published list/export. Set LASELLO_FEED_BDO to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("bdo"),
};
