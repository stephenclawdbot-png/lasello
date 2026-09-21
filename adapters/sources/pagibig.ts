import type { SourceAdapter } from "../contract";
import { loadConfiguredFeed } from "./feed";

export const pagibig: SourceAdapter = {
  key: "pagibig",
  provenance:
    "Pag-IBIG Acquired Assets — public acquired-assets lists; use official published datasets/exports. Set LASELLO_FEED_PAGIBIG to a compliant feed URL.",
  fetchListings: () => loadConfiguredFeed("pagibig"),
};
