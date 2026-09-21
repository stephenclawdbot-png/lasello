import type { Furnished, ListingType, RawListing } from "../contract";
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

function strArr(v: unknown): string[] | undefined {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : undefined;
}

function furnishedOf(v: unknown): Furnished | undefined {
  const f = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!f) return undefined;
  if (f.includes("fully") || f === "furnished") return "fully";
  if (f.includes("semi") || f === "partly") return "semi";
  if (f.includes("un") || f === "bare" || f === "none") return "bare";
  return undefined;
}

function turnoverOf(v: unknown): "rfo" | "preselling" | undefined {
  const t = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!t) return undefined;
  if (t.includes("rfo") || t.includes("ready")) return "rfo";
  if (t.includes("pre") || t.includes("under construction")) return "preselling";
  return undefined;
}

function brokerOf(v: unknown): "owner" | "broker" | "developer" | undefined {
  const b = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!b) return undefined;
  if (b.startsWith("own")) return "owner";
  if (b.startsWith("dev")) return "developer";
  if (b.startsWith("brok") || b.startsWith("agent")) return "broker";
  return undefined;
}

export function defaultMapRow(row: Record<string, unknown>, source: SourceKey): RawListing | null {
  const externalId = str(row.externalId ?? row.id ?? row.listing_id);
  const title = str(row.title ?? row.name ?? row.headline);
  // URL is optional here; normalize() still requires it for portal sources.
  if (!externalId || !title) return null;
  const url = str(row.url ?? row.link ?? row.listing_url);
  const tenureRaw = str(row.tenure ?? row.offer_type)?.toLowerCase();
  const typeRaw = str(row.type ?? row.property_type)?.toLowerCase();
  const type: ListingType | undefined =
    typeRaw === "condo" || typeRaw === "condominium" || typeRaw === "apartment"
      ? "condo"
      : typeRaw === "house" || typeRaw === "townhouse" || typeRaw === "villa"
        ? "house"
        : typeRaw === "lot"
          ? "lot"
          : typeRaw === "land" || typeRaw === "farm"
            ? "land"
            : undefined;
  // Area: portals expose floor area and/or lot area. Structures want floor
  // area when present; lots/land want lot area.
  const floorArea = num(row.sqm ?? row.floor_area);
  const lotArea = num(row.lot_area ?? row.land_area);
  const sqm = type === "lot" || type === "land" ? lotArea ?? floorArea : floorArea ?? lotArea;
  return {
    externalId,
    source,
    url: url ?? "",
    title,
    city: str(row.city),
    region: str(row.region ?? row.province),
    lat: num(row.lat ?? row.latitude),
    lng: num(row.lng ?? row.longitude),
    type,
    tenure: tenureRaw === "rent" || tenureRaw === "for-rent" ? "rent" : tenureRaw ? "sale" : undefined,
    price: num(row.price ?? row.price_php),
    priceMin: num(row.priceMin ?? row.price_min ?? row.price_from),
    priceMax: num(row.priceMax ?? row.price_max ?? row.price_to),
    sqm,
    beds: num(row.beds ?? row.bedrooms),
    baths: num(row.baths ?? row.bathrooms),
    address: str(row.address),
    parking: num(row.parking ?? row.parking_slots ?? row.garage),
    furnished: furnishedOf(row.furnished ?? row.furnishing),
    features: strArr(row.features ?? row.amenities),
    dues: num(row.dues ?? row.association_dues ?? row.hoa_dues ?? row.condo_dues),
    floor: num(row.floor ?? row.floor_number ?? row.unit_floor),
    yearBuilt: num(row.yearBuilt ?? row.year_built),
    turnover: turnoverOf(row.turnover ?? row.availability),
    advanceMonths: num(row.advanceMonths ?? row.advance_months),
    depositMonths: num(row.depositMonths ?? row.deposit_months),
    agent: str(row.agent ?? row.listed_by_name),
    brokerType: brokerOf(row.brokerType ?? row.listed_by),
    listedAt: str(row.listedAt ?? row.published_at ?? row.date_posted),
    description: str(row.description),
    firstSeen: str(row.firstSeen ?? row.created_at ?? row.first_seen),
    verified: row.verified === true,
  };
}
