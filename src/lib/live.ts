import { useEffect, useState } from "react";
import { LISTINGS, type Listing } from "../data/listings";
import type { SourceKey } from "../data/sources";

/**
 * Live feed layer. The ingest pipeline (`npm run ingest`, see /adapters and
 * scripts/ingest.ts) writes /public/data/listings.json; the site loads it at
 * runtime and re-polls so a redeployed or re-ingested feed shows up without a
 * hard refresh. When the feed is missing or carries no live rows, the bundled
 * demo seed keeps the UI working — clearly labeled as demo.
 */

export interface SourceStatus {
  key: SourceKey;
  status: "live" | "demo" | "error" | "pending";
  count: number;
  note?: string;
}

export interface Feed {
  generatedAt: string | null;
  demo: boolean;
  sources: SourceStatus[];
  listings: Listing[];
}

const SEED_FEED: Feed = {
  generatedAt: null,
  demo: true,
  sources: [],
  listings: LISTINGS,
};

const FEED_URL = `${import.meta.env.BASE_URL}data/listings.json`;
const POLL_MS = 5 * 60 * 1000;

function isListing(x: unknown): x is Listing {
  if (typeof x !== "object" || x === null) return false;
  const l = x as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.name === "string" &&
    typeof l.lat === "number" &&
    typeof l.lng === "number" &&
    typeof l.price === "number" &&
    typeof l.sqm === "number" &&
    l.sqm > 0
  );
}

async function fetchFeed(): Promise<Feed | null> {
  try {
    const res = await fetch(`${FEED_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<Feed>;
    const listings = Array.isArray(data.listings)
      ? data.listings.filter(isListing).map((l) => ({
          ...l,
          address: l.address ?? "",
          parking: l.parking ?? 0,
          furnished: l.furnished ?? ("bare" as const),
          description: l.description ?? "",
          features: Array.isArray(l.features) ? l.features : [],
        }))
      : [];
    if (listings.length === 0) return null;
    return {
      generatedAt: typeof data.generatedAt === "string" ? data.generatedAt : null,
      demo: data.demo !== false,
      sources: Array.isArray(data.sources) ? (data.sources as SourceStatus[]) : [],
      listings,
    };
  } catch {
    return null;
  }
}

export function useFeed(): Feed {
  const [feed, setFeed] = useState<Feed>(SEED_FEED);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const f = await fetchFeed();
      if (alive && f) setFeed(f);
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return feed;
}

export function agoLabel(iso: string | null): string {
  if (!iso) return "demo data";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `synced ${mins <= 1 ? "just now" : `${mins}m ago`}`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `synced ${hrs}h ago`;
  return `synced ${Math.round(hrs / 24)}d ago`;
}
