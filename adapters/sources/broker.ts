import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RawListing, SourceAdapter } from "../contract";
import { FeedNotConfiguredError, feedEnvVar, loadConfiguredFeed, defaultMapRow, politeFetchJson } from "./feed";

/**
 * Broker-direct source — the internal supply line.
 *
 * Listings come from OUR broker members (CSV/JSON exports dropped into
 * data/imports/, or a hosted JSON feed at LASELLO_FEED_BROKER). Nothing is
 * scraped from portals here. Files starting with "_" are ignored (templates,
 * docs). Each row may omit url — the broker member is the provenance; rows
 * with a url get a deep link too.
 */

function parseCsv(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else if (c !== "\r") field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((r) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
}

function toRows(data: unknown): Record<string, unknown>[] {
  const arr = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null && Array.isArray((data as { listings?: unknown[] }).listings)
      ? (data as { listings: unknown[] }).listings
      : [];
  return arr.filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null);
}

function mapBrokerRow(row: Record<string, unknown>, fallbackId: string): RawListing | null {
  const idLike = row.externalId ?? row.id ?? row.listing_id;
  const normalized = { ...row, id: idLike != null && String(idLike).trim() !== "" ? String(idLike).trim() : fallbackId };
  const base = defaultMapRow(normalized, "broker");
  if (!base) return null;

  // CSV booleans arrive as strings; also default broker-direct rows to
  // verified:false but honour explicit true/1.
  const v = row.verified;
  const verified =
    v === true || (typeof v === "string" && (v.trim().toLowerCase() === "true" || v.trim() === "1")) || base.verified === true;

  let features = base.features;
  if (!features && typeof row.features === "string") {
    const parts = row.features.split(/[;|]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) features = parts;
  }

  return { ...base, verified, features };
}

export const broker: SourceAdapter = {
  key: "broker",
  provenance:
    "Broker-direct submissions (internal platform). Reads data/imports/*.json|*.csv (files starting with _ ignored), or a hosted JSON feed at LASELLO_FEED_BROKER. Rows come from our broker members — not scraped from portals.",
  async fetchListings() {
    const envVar = feedEnvVar("broker");
    const url = process.env[envVar];
    if (url) {
      const raws = await loadConfiguredFeed("broker", mapBrokerRow);
      if (raws.length === 0) throw new Error(`${envVar} returned no usable rows`);
      return raws;
    }

    const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "imports");
    const files = (await readdir(dir).catch(() => [] as string[])).filter(
      (f) => /\.(json|csv)$/i.test(f) && !f.startsWith("_")
    );
    if (files.length === 0) throw new FeedNotConfiguredError(`${envVar} or data/imports/*.csv`);

    const raws: RawListing[] = [];
    for (const f of files) {
      const text = await readFile(join(dir, f), "utf8");
      const rows = f.toLowerCase().endsWith(".csv") ? parseCsv(text) : toRows(JSON.parse(text));
      rows.forEach((r, i) => {
        const mapped = mapBrokerRow(r, `${f}#${i + 1}`);
        if (mapped) raws.push(mapped);
      });
    }
    if (raws.length === 0) throw new FeedNotConfiguredError(`${envVar} or data/imports/*.csv`);
    return raws;
  },
};