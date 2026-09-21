import type { Listing } from "../data/listings";
import { validatePrice } from "./price";

export function percentileRank(values: number[], v: number): number {
  if (values.length === 0) return 0.5;
  const below = values.filter((x) => x <= v).length;
  return below / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export type Tier = "low" | "mid" | "high";

/** Heat tier: percentile rank of price-per-sqm within the listing's tenure cohort. */
export function tierOfRank(rank: number): Tier {
  if (rank >= 0.72) return "high";
  if (rank >= 0.38) return "mid";
  return "low";
}

export const TIER_COLORS: Record<Tier, string> = {
  low: "#15947c",
  mid: "#e0a13c",
  high: "#e25c4a",
};

export function fmtPeso(n: number, monthly = false): string {
  const suffix = monthly ? "/mo" : "";
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M${suffix}`;
  if (n >= 1_000) return `₱${Math.round(n / 1_000)}K${suffix}`;
  return `₱${n}${suffix}`;
}

export function fmtPsqm(n: number): string {
  return `₱${Math.round(n).toLocaleString("en-PH")}/m²`;
}

/** Median price-per-sqm per city, split by tenure, outliers and invalid prices excluded.
 *  Cities need >=2 clean listings to matter. */
export function cityMedians(listings: Listing[]): Map<string, { sale: number; rent: number }> {
  const map = new Map<string, { sale: number; rent: number }>();
  const byCity = new Map<string, Listing[]>();
  for (const l of listings) {
    if (l.outlier || validatePrice(l) !== "ok") continue;
    const arr = byCity.get(l.city) ?? [];
    arr.push(l);
    byCity.set(l.city, arr);
  }
  for (const [city, arr] of byCity) {
    map.set(city, {
      sale: median(arr.filter((l) => l.tenure === "sale").map((l) => l.price / l.sqm)),
      rent: median(arr.filter((l) => l.tenure === "rent").map((l) => l.price / l.sqm)),
    });
  }
  return map;
}

export function freshnessLabel(days: number): string {
  if (days <= 7) return `${days}d fresh`;
  if (days <= 30) return `${Math.round(days / 7)}w old`;
  return `${Math.round(days / 30)}mo old`;
}