import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const foreclosureph: SourceAdapter = {
  key: "foreclosureph",
  provenance:
    "ForeclosurePhilippines — aggregated foreclosure lists; agreed feed only. Set LASELLO_FEED_FORECLOSUREPH to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("foreclosureph"),
};
