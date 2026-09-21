import type { ListingType, RawListing, Tenure } from "../../adapters/contract";

/**
 * Public-sitemap crawl engine.
 *
 * Used for portals that publish an official, open sitemap of listing pages
 * (verified against robots.txt with no matching Disallow for our path).
 * Pages are fetched slowly (politeness delay + per-run cap), extracted from
 * the server-rendered JSON-LD + embedded state blob, and every row keeps a
 * direct deep link + source attribution — we never copy listings onto our
 * own domain.
 *
 * WAF responses (403 / challenge pages) are expected from time to time:
 * blocked pages are simply skipped this run and retried on the next cycle
 * (attempts reset when the cursor wraps). The ingest pipeline is stale-safe,
 * so a fully-blocked run never blanks existing rows.
 */

const CRAWL_UA = "LaselloIngest/0.1 (+https://github.com/stephenclawdbot-png/lasello; public sitemap crawler with deep-link attribution)";
const DELAY_MS = 2600;

export interface CrawlPage {
  url: string;
  status: number;
  html: string;
}

let lastFetch = 0;

async function politeDelay(): Promise<void> {
  const wait = lastFetch + DELAY_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetch = Date.now();
}

/** Fetch a text document (sitemap XML or HTML page). Non-OK → status only. */
async function politeFetchText(url: string): Promise<{ status: number; body: string }> {
  await politeDelay();
  const res = await fetch(url, { headers: { "user-agent": CRAWL_UA, accept: "text/xml,text/html" } });
  const body = res.ok ? await res.text() : "";
  return { status: res.status, body };
}

/** Extract <loc> URLs from a sitemap (index or urlset). */
export function fetchSitemapUrls(xmlUrl: string): Promise<string[]> {
  return (async () => {
    const { status, body } = await politeFetchText(xmlUrl);
    if (status !== 200) throw new Error(`sitemap fetch HTTP ${status} (${new URL(xmlUrl).hostname})`);
    if (body.includes("<sitemapindex")) {
      const indexUrls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      const out: string[] = [];
      for (const u of indexUrls.slice(0, 40)) out.push(...(await fetchSitemapUrls(u)));
      return out;
    }
    return [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith("http"));
  })();
}

// ---------- extraction ----------

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function parseLdProduct(html: string): { name?: string; description?: string; price?: number; image?: string } {
  const m = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return {};
  try {
    const ld = JSON.parse(m[1]) as {
      name?: string;
      description?: string;
      image?: string | string[];
      offers?: { price?: string; priceCurrency?: string };
    };
    const img = Array.isArray(ld.image) ? ld.image[0] : ld.image;
    return {
      name: typeof ld.name === "string" ? ld.name : undefined,
      description: typeof ld.description === "string" ? ld.description : undefined,
      price: ld.offers?.price != null ? num(ld.offers.price) : undefined,
      image: img,
    };
  } catch {
    return {};
  }
}

export interface BlobFields {
  marketplace?: string;
  lat?: number;
  lng?: number;
  region?: string;
  address?: string;
}

/** Embedded state blob: marketplace/city, coordinates, region, address. */
export function parseBlob(html: string): BlobFields {
  const mk = html.match(/"marketplace":\{"id":[^,]+,"name":"([^"]+)","location":\{"latitude":([\d.]+),"longitude":([\d.]+)/);
  const region = html.match(/"region":\{"code":"[^"]*","name":"([^"]+)"\}/);
  const addr = html.match(/"location_address":"([^"]*)"/);
  return {
    marketplace: mk ? mk[1] : undefined,
    lat: mk ? parseFloat(mk[2]) : undefined,
    lng: mk ? parseFloat(mk[3]) : undefined,
    region: region ? region[1] : undefined,
    address: addr ? JSON.parse(`"${addr[1]}"`) as string : undefined,
  };
}

export function bedsOf(text: string): number | undefined {
  return num(text.match(/(\d+)\s*[- ]?\s*(?:br|bdr|bedroom|beds?)\b/i)?.[1]);
}
export function bathsOf(text: string): number | undefined {
  return num(text.match(/(\d+)\s*[- ]?\s*(?:bath|tbr|bathrooms?)\b/i)?.[1]);
}
export function sqmOf(text: string): number | undefined {
  return num(text.match(/([\d,]+(?:\.\d+)?)\s*(?:sqm|m²|m2|sq\.?\s?m|square\s?meters?)\b/i)?.[1]);
}
export function tenureOf(text: string): Tenure {
  return /for[- ]?(?:rent|lease)|rental|\blease\b/i.test(text) ? "rent" : "sale";
}
export function typeOf(text: string): ListingType | undefined {
  if (/condo|condominium|apartment|unit/i.test(text)) return "condo";
  if (/house|townhouse|villa|duplex/i.test(text)) return "house";
  if (/\blot\b|\bland\b|farm/i.test(text)) return "lot";
  return undefined;
}

export function externalIdOf(url: string): string | undefined {
  const m = url.match(/-(\d+)\/?$/);
  return m ? m[1] : undefined;
}

/** One listing page → RawListing (null when the page has no product data). */
export function extractListing(url: string, html: string): RawListing | null {
  const externalId = externalIdOf(url);
  if (!externalId) return null;
  const ld = parseLdProduct(html);
  const blob = parseBlob(html);
  const title = ld.name?.trim();
  if (!title) return null;
  const hay = `${title} . ${(ld.description ?? "").slice(0, 600)}`;
  const sqm = sqmOf(hay);
  const city = blob.marketplace?.replace(/ City$/i, "").trim();
  return {
    externalId,
    source: "carousell",
    url,
    title,
    city: city || undefined,
    region: blob.region,
    lat: blob.lat,
    lng: blob.lng,
    type: typeOf(hay),
    tenure: tenureOf(hay),
    price: ld.price,
    sqm,
    beds: bedsOf(hay),
    baths: bathsOf(hay),
    address: blob.address,
    description: ld.description?.slice(0, 1200),
  };
}

// ---------- crawl state (incremental, committed) ----------

export interface CrawlState {
  cursor: number;
  attempts: Record<string, number>;
  seen: string[];
  stats: { runs: number; pages: number; ok: number; blocked: number };
  updatedAt: string;
}

/** Load per-source crawl state (cursor/attempts/seen), tolerating a fresh repo. */
export async function loadState(key: string): Promise<CrawlState> {
  const { readFile } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  try {
    const raw = await readFile(join(root, "data", "crawl", `${key}.json`), "utf8") as string;
    return JSON.parse(raw) as CrawlState;
  } catch {
    return { cursor: 0, attempts: {}, seen: [], stats: { runs: 0, pages: 0, ok: 0, blocked: 0 }, updatedAt: "" };
  }
}

export async function saveState(key: string, state: CrawlState): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const dir = join(root, "data", "crawl");
  await mkdir(dir, { recursive: true });
  state.updatedAt = new Date().toISOString();
  await writeFile(join(dir, `${key}.json`), JSON.stringify(state, null, 1));
}

/**
 * Incremental crawl: pages already ingested (seen) are skipped; the cursor
 * advances through the sitemap URL list so every run reaches fresh pages even
 * if the head of the list is WAF-blocked. Blocked URLs get up to 3 attempts
 * before being skipped for the cycle; attempts reset when the cursor wraps.
 */
export async function runCrawl(
  key: string,
  sitemapUrl: string,
  extract: (url: string, html: string) => RawListing | null,
  maxPages: number
): Promise<{ listings: RawListing[]; blocked: number; pages: number }> {
  const urls = await fetchSitemapUrls(sitemapUrl);
  if (urls.length === 0) throw new Error(`no URLs in sitemap (${sitemapUrl})`);
  const state = await loadState(key);
  if (state.cursor >= urls.length) {
    state.cursor = 0;
    state.attempts = {};
  }
  const seen = new Set(state.seen);
  const listings: RawListing[] = [];
  let pages = 0;
  let blocked = 0;
  let i = state.cursor;
  let advanced = 0;
  while (advanced < urls.length && pages < maxPages) {
    const url = urls[i];
    i = (i + 1) % urls.length;
    advanced++;
    if (seen.has(url)) continue;
    if ((state.attempts[url] ?? 0) >= 3) continue;
    pages++;
    const { status, body } = await politeFetchText(url);
    if (status !== 200 || body.length < 2048 || body.includes("Just a moment")) {
      blocked++;
      state.attempts[url] = (state.attempts[url] ?? 0) + 1;
      continue;
    }
    delete state.attempts[url];
    const raw = extract(url, body);
    if (raw) {
      listings.push(raw);
      seen.add(url);
    }
  }
  state.cursor = i;
  state.seen = [...seen];
  state.stats = {
    runs: state.stats.runs + 1,
    pages: state.stats.pages + pages,
    ok: state.stats.ok + listings.length,
    blocked: state.stats.blocked + blocked,
  };
  await saveState(key, state);
  return { listings, blocked, pages };
}