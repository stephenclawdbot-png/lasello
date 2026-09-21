import type { RawListing } from "../contract";
import type { SourceKey } from "../../src/data/sources";

/**
 * Shared connector plumbing. Every portal connector pulls from a configured
 * feed URL (partner API, agreed export, or an official/permitted endpoint) —
 * set via env: LASELLO_FEED_<SOURCEKEY_UPPERCASE>, e.g. LASELLO_FEED_LAMUDI.
 *
 * We do NOT ship ToS-breaking scrapers: robots checks (2025-09) show Lamudi
 * hard-blocks bots at the CDN, Carousell disallows query URLs, Rentpad
 * publishes content-signal restrictions. A connector without a configured,
 * permitted feed reports "pending" and the pipeline carries on.
 */

export class FeedNotConfiguredError extends Error {
  constructor(public envVar: string) {
    super(`feed not configured (set ${envVar})`);
  }
}

export function feedEnvVar(key: SourceKey): string {
  return `LASELLO_FEED_${key.toUpperCase()}`;
}

const UA = "LaselloIngest/0.1 (+https://github.com/stephenclawdbot-png/lasello; aggregator with source attribution)";

/** Minimum politeness delay between any two HTTP calls in a run. */
const DELAY_MS = 1500;
let lastFetch = 0;

export async function politeFetchJson(url: string): Promise<unknown> {
  const wait = lastFetch + DELAY_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetch = Date.now();
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  return res.json();
}

/**
 * Load a configured feed and map its rows to RawListing. Feeds are expected to
 * be JSON: either an array of rows, or { listings: [...] }. `mapRow` adapts a
 * portal-specific row shape; the default expects RawListing-shaped rows.
 */
export async function loadConfiguredFeed(
  source: SourceKey,
  mapRow: (row: Record<string, unknown>, source: SourceKey) => RawListing | null = defaultMapRow
): Promise<RawListing[]> {
  const envVar = feedEnvVar(source);
  const url = process.env[envVar];
  if (!url) throw new FeedNotConfiguredError(envVar);
  const data = await politeFetchJson(url);
  const rows = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null && Array.isArray((data as { listings?: unknown[] }).listings)
      ? ((data as { listings: unknown[] }).listings)
      : [];
  return rows
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .map((r) => mapRow(r, source))
    .filter((r): r is RawListing => r !== null);
}

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v.replace(/[₱,\s]/g, "")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function defaultMapRow(row: Record<string, unknown>, source: SourceKey): RawListing | null {
  const externalId = str(row.externalId ?? row.id ?? row.listing_id);
  const url = str(row.url ?? row.link ?? row.permalink);
  const title = str(row.title ?? row.name ?? row.headline);
  if (!externalId || !url || !title) return null;
  const tenureRaw = str(row.tenure ?? row.offer_type)?.toLowerCase();
  const typeRaw = str(row.type ?? row.property_type)?.toLowerCase();
  return {
    externalId,
    source,
    url,
    title,
    city: str(row.city),
    region: str(row.region ?? row.province),
    lat: num(row.lat ?? row.latitude),
    lng: num(row.lng ?? row.longitude),
    type:
      typeRaw === "condo" || typeRaw === "condominium" || typeRaw === "apartment"
        ? "condo"
        : typeRaw === "house" || typeRaw === "townhouse" || typeRaw === "villa"
          ? "house"
          : typeRaw === "lot"
            ? "lot"
            : typeRaw === "land" || typeRaw === "farm"
              ? "land"
              : undefined,
    tenure: tenureRaw === "rent" || tenureRaw === "for-rent" ? "rent" : tenureRaw ? "sale" : undefined,
    price: num(row.price ?? row.price_php),
    sqm: num(row.sqm ?? row.floor_area ?? row.lot_area),
    beds: num(row.beds ?? row.bedrooms),
    baths: num(row.baths ?? row.bathrooms),
    address: str(row.address),
    description: str(row.description),
    firstSeen: str(row.firstSeen ?? row.created_at ?? row.first_seen),
    verified: row.verified === true,
  };
}
