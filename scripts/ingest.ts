import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dedupe, flagOutliers, normalize } from "../adapters/contract";
import { ADAPTERS } from "../adapters/sources";
import { FeedNotConfiguredError } from "../adapters/sources/feed";
import { LISTINGS, type Listing } from "../src/data/listings";
import type { SourceKey } from "../src/data/sources";

/**
 * Aggregation runner — `npm run ingest`.
 *
 * Runs every portal connector, normalizes + dedupes the results, and writes
 * the runtime feed the site polls (public/data/listings.json). Sources whose
 * connector fails this run keep their rows from the previous feed (marked
 * stale) so one portal outage never blanks the map. With zero live sources
 * configured, the feed ships the demo seed, flagged demo:true — the UI labels
 * it honestly.
 *
 * Scheduled by .github/workflows/ingest.yml every 6 hours; the site re-polls
 * the feed every 5 minutes, so listings stay near-real-time end to end.
 */

interface SourceStatus {
  key: SourceKey;
  status: "live" | "demo" | "error" | "pending";
  count: number;
  note?: string;
}

interface Feed {
  generatedAt: string;
  demo: boolean;
  sources: SourceStatus[];
  listings: Listing[];
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "data", "listings.json");

async function readPrevious(): Promise<Feed | null> {
  try {
    return JSON.parse(await readFile(OUT, "utf8")) as Feed;
  } catch {
    return null;
  }
}

async function main() {
  const prev = await readPrevious();
  const statuses: SourceStatus[] = [];
  const live: Listing[] = [];

  for (const adapter of ADAPTERS) {
    try {
      const raw = await adapter.fetchListings();
      const dropped: Record<string, number> = {};
      const rows: Listing[] = [];
      for (const r of raw) {
        const { listing, reason } = normalize(r);
        if (listing) rows.push(listing);
        else if (reason) dropped[reason] = (dropped[reason] ?? 0) + 1;
      }
      live.push(...rows);
      const dropNote = Object.entries(dropped)
        .filter(([, n]) => n > 0)
        .map(([r, n]) => `${n} ${r}`)
        .join(", ");
      const notes = [dropped ? `dropped: ${dropNote}` : ""].filter(Boolean);
      statuses.push({ key: adapter.key, status: "live", count: rows.length, note: notes.join(" · ") || undefined });
      console.log(`✓ ${adapter.key}: ${rows.length} listings${notes.length ? ` (${notes.join(" · ")})` : ""}`);
    } catch (e) {
      const pending = e instanceof FeedNotConfiguredError;
      // keep the previous run's rows for a source that errored (not pending)
      const kept = !pending && prev && !prev.demo ? prev.listings.filter((l) => l.source === adapter.key) : [];
      live.push(...kept);
      statuses.push({
        key: adapter.key,
        status: pending ? "pending" : "error",
        count: kept.length,
        note: pending ? adapter.provenance : `${String(e)}${kept.length ? ` — kept ${kept.length} rows from previous run` : ""}`,
      });
      console.log(`${pending ? "○" : "✗"} ${adapter.key}: ${pending ? "pending (no feed configured)" : String(e)}`);
    }
  }

  // With zero live rows the feed stays empty: the client rejects an empty
  // feed and falls back to the bundled demo inventory (curated + generated,
  // see src/data/listings.ts), so we never commit megabytes of demo JSON.
  const demo = live.length === 0;
  // Cross-source dedupe + outlier flags over the full merged set.
  let listings: Listing[] = [];
  if (!demo) {
    const merged = dedupe(live);
    const dupesCollapsed = live.length - merged.length;
    const outliers = flagOutliers(merged);
    listings = merged.map((l) => (outliers.has(l.id) ? { ...l, outlier: true } : l));
    console.log(`↷ cross-source dedupe collapsed ${dupesCollapsed} duplicate rows; flagged ${outliers.size} price outliers`);
  }
  const flagged = listings.filter((l) => l.outlier).length;
  const feed: Feed = {
    generatedAt: new Date().toISOString(),
    demo,
    sources: demo ? statuses.map((s) => (s.status === "live" ? s : { ...s, count: 0 })) : statuses,
    listings,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(feed, null, 1));
  console.log(
    `\nwrote ${feed.listings.length} live listings (${demo ? `demo mode — client falls back to the bundled ${LISTINGS.length}-listing demo inventory` : "live"}, ${flagged} flagged as price outliers) → ${OUT}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
