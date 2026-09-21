import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dedupe, normalize } from "../adapters/contract";
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
      const rows = dedupe(raw.map(normalize).filter((l): l is Listing => l !== null));
      live.push(...rows);
      statuses.push({ key: adapter.key, status: "live", count: rows.length });
      console.log(`✓ ${adapter.key}: ${rows.length} listings`);
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

  const demo = live.length === 0;
  const feed: Feed = {
    generatedAt: new Date().toISOString(),
    demo,
    sources: demo ? statuses.map((s) => (s.status === "live" ? s : { ...s, count: 0 })) : statuses,
    listings: demo ? LISTINGS : live,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(feed, null, 1));
  console.log(
    `\nwrote ${feed.listings.length} listings (${demo ? "DEMO seed — no live sources configured" : "live"}) → ${OUT}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
