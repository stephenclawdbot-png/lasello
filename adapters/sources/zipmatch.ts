import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const zipmatch: SourceAdapter = {
  key: "zipmatch",
  provenance: "ZipMatch — broker-fed platform; set LASELLO_FEED_ZIPMATCH to an agreed export URL.",
  fetchListings: () => loadConfiguredFeed("zipmatch"),
};
