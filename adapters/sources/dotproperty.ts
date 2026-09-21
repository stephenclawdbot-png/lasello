import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const dotproperty: SourceAdapter = {
  key: "dotproperty",
  provenance:
    "DotProperty / Thailand Property group — feed or agreed export only; set LASELLO_FEED_DOTPROPERTY.",
  fetchListings: () => loadConfiguredFeed("dotproperty"),
};
