import type { Furnished, Listing, ListingType, Tenure } from "../src/data/listings";
import type { SourceKey } from "../src/data/sources";
import { validatePrice } from "../src/lib/price";
import { CITY_CENTERS } from "./geo";

/**
 * INGESTION CONTRACT — the boundary between Lasello's UI and the internet.
 *
 * Seed data (src/data/listings.ts) is DEMO ONLY. Every real listing must flow
 * through an adapter implementing SourceAdapter, then normalize() →
 * validatePrice → dedupe() → flagOutliers before it reaches the feed. This
 * keeps the UI honest, prevents cross-portal double counting, and lets
 * multiple agents add portals independently.
 */

export interface RawListing {
  externalId: string;
  source: SourceKey;
  /** Direct URL to the listing on the source portal. Required for portal
   *  sources — we deep-link, never copy. Optional for broker-direct rows
   *  (source "broker"), where the broker member is the provenance. */
  url?: string;
  title: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  type?: ListingType;
  tenure?: Tenure;
  /** Asking range when the portal shows one ("₱8M – 9.5M"). */
  priceMin?: number;
  priceMax?: number;
  price?: number;
  sqm?: number;
  beds?: number;
  baths?: number;
  address?: string;
  parking?: number;
  furnished?: Furnished;
  description?: string;
  features?: string[];
  /** Condo association / subdivision dues, PHP per month. */
  dues?: number;
  floor?: number;
  yearBuilt?: number;
  turnover?: "rfo" | "preselling";
  /** Rent terms. */
  advanceMonths?: number;
  depositMonths?: number;
  agent?: string;
  brokerType?: "owner" | "broker" | "developer";
  /** Portal publish date (ISO). */
  listedAt?: string;
  firstSeen?: string;
  verified?: boolean;
}

export interface SourceAdapter {
  key: SourceKey;
  /** Human-readable provenance: endpoint/robots/ToS notes. */
  provenance: string;
  fetchListings(): Promise<RawListing[]>;
}

/** How a raw row failed normalization — surfaced by ingest for debugging feeds. */
export type DropReason = "missing-url-or-title" | "missing-price" | "missing-sqm" | "invalid-price" | "unmappable-city";

/** Normalize one raw row. Returns null (with reason) only for unusable rows. */
export function normalize(raw: RawListing): { listing: Listing | null; reason?: DropReason } {
  if (!raw.title || (!raw.url && raw.source !== "broker")) return { listing: null, reason: "missing-url-or-title" };
  if (raw.price == null && raw.priceMin == null) return { listing: null, reason: "missing-price" };
  if (!raw.sqm || raw.sqm <= 0) return { listing: null, reason: "missing-sqm" };

  const price =
    raw.price ??
    (raw.priceMin != null && raw.priceMax != null ? Math.round((raw.priceMin + raw.priceMax) / 2) : 0);
  const tenure: Tenure = raw.tenure ?? "sale";
  const type = raw.type ?? "condo";
  const city = raw.city ?? "Unknown";

  const probe: Listing = {
    id: `${raw.source}-${raw.externalId}`,
    name: raw.title.trim(),
    city,
    region: raw.region ?? "",
    address: raw.address ?? "",
    lat: 0,
    lng: 0,
    type,
    tenure,
    price,
    sqm: raw.sqm,
    beds: raw.beds ?? 0,
    baths: raw.baths ?? 0,
    parking: raw.parking ?? 0,
    furnished: raw.furnished ?? "bare",
    description: raw.description ?? "",
    features: raw.features ?? [],
    source: raw.source,
    freshDays: 0,
    verified: raw.verified ?? false,
  };
  if (validatePrice(probe) === "invalid") return { listing: null, reason: "invalid-price" };

  // Geocode: exact when the portal provides coordinates, otherwise fall back
  // to the city centre so rows are never silently lost to a missing pin.
  let lat: number;
  let lng: number;
  let geoPrecision: Listing["geoPrecision"] = "exact";
  if (raw.lat != null && raw.lng != null) {
    lat = raw.lat;
    lng = raw.lng;
  } else {
    const center = CITY_CENTERS[city.toLowerCase()];
    if (!center) return { listing: null, reason: "unmappable-city" };
    lat = center.lat;
    lng = center.lng;
    geoPrecision = "city";
  }

  const seenAt = raw.listedAt ?? raw.firstSeen;
  const listing: Listing = {
    ...probe,
    priceMin: raw.priceMin,
    priceMax: raw.priceMax,
    url: raw.url,
    lat,
    lng,
    geoPrecision,
    dues: raw.dues,
    floor: raw.floor,
    yearBuilt: raw.yearBuilt,
    turnover: raw.turnover,
    advanceMonths: raw.advanceMonths,
    depositMonths: raw.depositMonths,
    agent: raw.agent,
    brokerType: raw.brokerType,
    listedAt: raw.listedAt,
    freshDays: seenAt
      ? Math.max(0, Math.round((Date.now() - new Date(seenAt).getTime()) / 86_400_000))
      : 0,
  };
  return { listing };
}

// ---------- Cross-source dedupe ----------

/** Quantize a value into ±band buckets so near-equal values share a bucket. */
function band(v: number, step: number): number {
  return Math.round(v / step);
}

/**
 * Fingerprint across portals: same city + tenure + type + bedroom class with
 * area within ~12% and price within ~8% is almost always the same unit listed
 * on more than one portal. Per-source ids are intentionally excluded.
 */
function fingerprint(l: Listing): string {
  return [
    l.city.toLowerCase(),
    l.tenure,
    l.type,
    l.beds > 5 ? "6+" : l.beds,
    band(l.sqm, Math.max(4, l.sqm * 0.06)),
    band(l.price, Math.max(50_000, l.price * 0.04)),
  ].join("|");
}

function quality(l: Listing): number {
  let q = 0;
  if (l.verified) q += 4;
  if (l.url) q += 2;
  if (l.address) q += 2;
  if (l.description) q += 1;
  if (l.features.length >= 3) q += 1;
  if (l.dues != null || l.yearBuilt != null) q += 1;
  return q;
}

/** Collapse duplicates across all sources; keep the richest, freshest row. */
export function dedupe(listings: Listing[]): Listing[] {
  const best = new Map<string, Listing>();
  for (const l of listings) {
    const k = fingerprint(l);
    const cur = best.get(k);
    if (!cur) {
      best.set(k, l);
      continue;
    }
    const keep = [cur, l].sort((a, b) => {
      const q = quality(b) - quality(a);
      if (q !== 0) return q;
      return a.freshDays - b.freshDays;
    })[0];
    best.set(k, keep);
  }
  return [...best.values()];
}

export interface IngestResult {
  listings: Listing[];
  dropped: Partial<Record<DropReason, number>>;
  outliers: Set<string>;
}

/** Full pipeline: normalize → validate → cross-source dedupe → outlier flags. */
export function runPipeline(raws: RawListing[]): IngestResult {
  const dropped: Partial<Record<DropReason, number>> = {};
  const clean: Listing[] = [];
  for (const raw of raws) {
    const { listing, reason } = normalize(raw);
    if (listing) clean.push(listing);
    else if (reason) dropped[reason] = (dropped[reason] ?? 0) + 1;
  }
  const deduped = dedupe(clean);
  const outliers = flagOutliers(deduped);
  return { listings: deduped, dropped, outliers };
}

/** IQR/MAD outlier flags per (city × tenure × type) cohort — see src/lib/price.ts. */
export function flagOutliers(listings: Listing[]): Set<string> {
  const flagged = new Set<string>();
  const cohorts = new Map<string, Listing[]>();
  for (const l of listings) {
    if (validatePrice(l) !== "ok") continue;
    const key = `${l.city}|${l.tenure}|${l.type}`;
    const arr = cohorts.get(key) ?? [];
    arr.push(l);
    cohorts.set(key, arr);
  }
  for (const arr of cohorts.values()) {
    if (arr.length < 8) continue;
    const psqm = arr.map((l) => l.price / l.sqm).sort((a, b) => a - b);
    const q = (p: number) => {
      const pos = (psqm.length - 1) * p;
      const lo = Math.floor(pos);
      const hi = Math.ceil(pos);
      return lo === hi ? psqm[lo] : psqm[lo] + (psqm[hi] - psqm[lo]) * (pos - lo);
    };
    const med = q(0.5);
    const p25 = q(0.25);
    const p75 = q(0.75);
    const iqr = p75 - p25;
    let lo: number;
    let hi: number;
    if (iqr > 0) {
      const k = Math.max(iqr, med * 0.25);
      lo = p25 - 1.6 * k;
      hi = p75 + 1.6 * k;
    } else {
      const mad = psqm.map((v) => Math.abs(v - med)).sort((a, b) => a - b)[Math.floor(psqm.length / 2)];
      if (!(mad > 0)) continue;
      lo = med - 4 * mad * 1.4826;
      hi = med + 4 * mad * 1.4826;
    }
    for (const l of arr) {
      const p = l.price / l.sqm;
      if (p < lo || p > hi) flagged.add(l.id);
    }
  }
  return flagged;
}