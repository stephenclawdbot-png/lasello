import type { Furnished, Listing, ListingType, Tenure } from "../src/data/listings";
import type { SourceKey } from "../src/data/sources";

/**
 * INGESTION CONTRACT — the boundary between Lasello's UI and the internet.
 *
 * Seed data (src/data/listings.ts) is DEMO ONLY. Every real listing must flow
 * through an adapter implementing SourceAdapter, be normalized by normalize(),
 * and pass dedupe() before it reaches the map. This keeps the UI honest and
 * lets multiple agents add portals independently.
 */

export interface RawListing {
  externalId: string;
  source: SourceKey;
  /** Direct URL to the listing on the source portal. REQUIRED — we deep-link, never copy. */
  url: string;
  title: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  type?: ListingType;
  tenure?: Tenure;
  price?: number;
  sqm?: number;
  beds?: number;
  baths?: number;
  address?: string;
  parking?: number;
  furnished?: Furnished;
  description?: string;
  features?: string[];
  firstSeen?: string;
  verified?: boolean;
}

export interface SourceAdapter {
  key: SourceKey;
  /** Human-readable provenance: endpoint/robots/ToS notes. */
  provenance: string;
  fetchListings(): Promise<RawListing[]>;
}

export function normalize(raw: RawListing): Listing | null {
  if (!raw.url || !raw.title || raw.price == null || !raw.sqm || raw.sqm <= 0) return null;
  if (raw.lat == null || raw.lng == null) return null; // geocode later — v2 concern
  const tenure: Tenure = raw.tenure ?? "sale";
  return {
    id: `${raw.source}-${raw.externalId}`,
    name: raw.title.trim(),
    city: raw.city ?? "Unknown",
    region: raw.region ?? "",
    lat: raw.lat,
    lng: raw.lng,
    type: raw.type ?? "condo",
    tenure,
    price: raw.price,
    sqm: raw.sqm,
    beds: raw.beds ?? 0,
    baths: raw.baths ?? 0,
    address: raw.address ?? "",
    parking: raw.parking ?? 0,
    furnished: raw.furnished ?? "bare",
    description: raw.description ?? "",
    features: raw.features ?? [],
    source: raw.source,
    freshDays: raw.firstSeen
      ? Math.max(0, Math.round((Date.now() - new Date(raw.firstSeen).getTime()) / 86_400_000))
      : 0,
    verified: raw.verified ?? false,
  };
}

/** Duplicate/ghost-listing collapse: same (source, city, price±5%, sqm±10%) → keep freshest. */
export function dedupe(listings: Listing[]): Listing[] {
  const bucket = (l: Listing) =>
    `${l.source}|${l.city.toLowerCase()}|${Math.round(l.price / l.sqm / 0.05)}`;
  const best = new Map<string, Listing>();
  for (const l of listings) {
    const k = bucket(l);
    const cur = best.get(k);
    if (!cur || l.freshDays < cur.freshDays) best.set(k, l);
  }
  return [...best.values()];
}