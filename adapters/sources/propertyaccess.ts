import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const propertyaccess: SourceAdapter = {
  key: "propertyaccess",
  provenance:
    "PropertyAccess — brokerage listings; agreed feed only. Set LASELLO_FEED_PROPERTYACCESS to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("propertyaccess"),
};
