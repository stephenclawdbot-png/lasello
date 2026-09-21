import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const ohmyhome: SourceAdapter = {
  key: "ohmyhome",
  provenance:
    "Ohmyhome — partner/agreed feed only; set LASELLO_FEED_OHMYHOME to a compliant export URL.",
  fetchListings: () => loadConfiguredFeed("ohmyhome"),
};
