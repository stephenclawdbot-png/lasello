import type { Listing, ListingType, Tenure } from "../data/listings";
import { perSqm } from "../data/listings";

/**
 * Price correctness layer for PH listings.
 *
 * Three jobs:
 *  1. validatePrice  — sanity bounds per tenure × type. Implausible rows are
 *     "invalid" (dropped at ingest); merely abnormal rows are "outlier" (kept
 *     but excluded from medians and flagged in the UI).
 *  2. cityRange      — robust typical range per city × tenure (median + p25/p75)
 *     with outliers excluded, for the "₱X – ₱Y / m²" context chips.
 *  3. priceBuckets   — market-style price filters, separate scales for sale
 *     (₱M) and rent (₱K/month).
 */

type Bounds = { totalMin: number; totalMax: number; psqmMin: number; psqmMax: number };

/** PHP sanity bounds, calibrated for the 2025 PH portal market. */
const PRICE_BOUNDS: Record<Tenure, Record<ListingType, Bounds>> = {
  sale: {
    condo: { totalMin: 1_500_000, totalMax: 600_000_000, psqmMin: 25_000, psqmMax: 450_000 },
    house: { totalMin: 1_500_000, totalMax: 800_000_000, psqmMin: 15_000, psqmMax: 350_000 },
    lot: { totalMin: 300_000, totalMax: 500_000_000, psqmMin: 2_000, psqmMax: 250_000 },
    land: { totalMin: 100_000, totalMax: 1_000_000_000, psqmMin: 30, psqmMax: 300_000 },
  },
  rent: {
    condo: { totalMin: 5_000, totalMax: 1_500_000, psqmMin: 150, psqmMax: 2_500 },
    house: { totalMin: 8_000, totalMax: 2_000_000, psqmMin: 80, psqmMax: 2_500 },
    lot: { totalMin: 1_000, totalMax: 500_000, psqmMin: 5, psqmMax: 1_000 },
    land: { totalMin: 500, totalMax: 300_000, psqmMin: 1, psqmMax: 1_000 },
  },
};

/** Outliers sit this far outside the cohort's price-per-sqm IQR fence. */
const IQR_K = 1.6;
/** MAD-scaled fence for cohorts large enough to be robust. */
const MAD_K = 4;
const MIN_COHORT = 8;

export function priceBounds(tenure: Tenure, type: ListingType): Bounds {
  return PRICE_BOUNDS[tenure][type];
}

export type PriceVerdict = "ok" | "outlier" | "invalid";

/** Sanity-check one listing's price and ₱/m² against hard market bounds. */
export function validatePrice(l: Listing): PriceVerdict {
  if (!(l.price > 0) || !(l.sqm > 0)) return "invalid";
  const b = PRICE_BOUNDS[l.tenure][l.type];
  const psqm = perSqm(l);
  const totalBad = l.price < b.totalMin * 0.5 || l.price > b.totalMax * 2;
  const psqmBad = psqm < b.psqmMin * 0.25 || psqm > b.psqmMax * 3;
  if (totalBad || psqmBad) return "invalid";
  const totalOdd = l.price < b.totalMin || l.price > b.totalMax;
  const psqmOdd = psqm < b.psqmMin || psqm > b.psqmMax;
  return totalOdd || psqmOdd ? "outlier" : "ok";
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function robustFence(values: number[]): { lo: number; hi: number } | null {
  if (values.length < MIN_COHORT) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const p25 = quantile(sorted, 0.25);
  const p75 = quantile(sorted, 0.75);
  const med = quantile(sorted, 0.5);
  const iqr = p75 - p25;
  if (iqr > 0) {
    const k = Math.max(iqr, med * 0.25);
    return { lo: p25 - IQR_K * k, hi: p75 + IQR_K * k };
  }
  const mad = quantile(sorted.map((v) => Math.abs(v - med)).sort((a, b) => a - b), 0.5);
  if (mad > 0) return { lo: med - MAD_K * mad * 1.4826, hi: med + MAD_K * mad * 1.4826 };
  return null;
}

/** Flag per-sqm values far from their (city × tenure × type) cohort norm. */
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
    const fence = robustFence(arr.map((l) => perSqm(l)));
    if (!fence) continue;
    for (const l of arr) {
      const p = perSqm(l);
      if (p < fence.lo || p > fence.hi) flagged.add(l.id);
    }
  }
  return flagged;
}

export interface CityRange {
  n: number;
  median: number;
  p25: number;
  p75: number;
}

/** Robust ₱/m² range per city × tenure, outliers and invalids excluded. */
export function cityRange(listings: Listing[]): Map<string, CityRange> {
  const map = new Map<string, Listing[]>();
  for (const l of listings) {
    if (l.outlier || validatePrice(l) !== "ok") continue;
    const key = `${l.city}|${l.tenure}`;
    const arr = map.get(key) ?? [];
    arr.push(l);
    map.set(key, arr);
  }
  const out = new Map<string, CityRange>();
  for (const [key, arr] of map) {
    if (arr.length < 2) continue;
    const sorted = arr.map(perSqm).sort((a, b) => a - b);
    out.set(key, {
      n: arr.length,
      median: quantile(sorted, 0.5),
      p25: quantile(sorted, 0.25),
      p75: quantile(sorted, 0.75),
    });
  }
  return out;
}

// ---------- Price filter buckets ----------

const SALE_STOPS = [5, 10, 25, 50, 100, 250]; // ₱M
const RENT_STOPS = [15, 30, 60, 120, 250]; // ₱K / month

/** Market-style price caps: [value in PHP, label]. Value Infinity = no cap. */
export function priceBuckets(tenure: Tenure | "all"): Array<{ cap: number; label: string }> {
  const buckets: Array<{ cap: number; label: string }> = [{ cap: Infinity, label: "Any price" }];
  if (tenure === "rent") {
    for (const k of RENT_STOPS) buckets.push({ cap: k * 1_000, label: `Up to ₱${k}K/mo` });
  } else {
    for (const m of SALE_STOPS) buckets.push({ cap: m * 1_000_000, label: `Up to ₱${m}M` });
  }
  return buckets;
}

export function withinCap(l: Listing, cap: number): boolean {
  return cap === Infinity || l.price <= cap;
}

// ---------- Derived buyer/seller metrics ----------

/** Standard bank-financing monthly amortization estimate (20y @ 6.5%). */
export function estAmortization(price: number, rate = 0.065, years = 20): number {
  const n = years * 12;
  const r = rate / 12;
  return Math.round((price * r) / (1 - Math.pow(1 + r, -n)));
}

/** Gross rental yield, %/yr — rent median vs sale median of the same city. */
export function grossYield(rentPsqmMo: number, salePsqm: number): number | null {
  if (!(rentPsqmMo > 0) || !(salePsqm > 0)) return null;
  return ((rentPsqmMo * 12) / salePsqm) * 100;
}

// ---------- Completeness scoring ----------

const CHECKS: Array<{ weight: number; ok: (l: Listing) => boolean; label: string }> = [
  { weight: 15, ok: (l) => l.price > 0, label: "price" },
  { weight: 10, ok: (l) => l.priceMin != null && l.priceMax != null, label: "price range" },
  { weight: 15, ok: (l) => l.sqm > 0, label: "area" },
  { weight: 10, ok: (l) => !!l.url, label: "direct link" },
  { weight: 10, ok: (l) => l.address.length > 3, label: "address" },
  { weight: 10, ok: (l) => l.beds > 0 || l.type === "lot" || l.type === "land", label: "beds" },
  { weight: 5, ok: (l) => l.baths > 0, label: "baths" },
  { weight: 5, ok: (l) => l.parking > 0, label: "parking" },
  { weight: 5, ok: (l) => l.description.length > 40, label: "description" },
  { weight: 5, ok: (l) => l.features.length >= 3, label: "features" },
  { weight: 10, ok: (l) => l.verified, label: "verified" },
  { weight: 10, ok: (l) => (l.tenure === "rent" ? l.advanceMonths != null : l.turnover != null), label: "listing terms" },
  { weight: 10, ok: (l) => l.dues != null || l.yearBuilt != null, label: "dues / year built" },
];

export interface Completeness {
  score: number; // 0–100
  filled: number;
  fields: string[]; // labels of missing high-value fields
}

/** Data-quality score for one listing, with the human-readable gap list. */
export function completenessOf(l: Listing): Completeness {
  let score = 0;
  const missing: string[] = [];
  for (const c of CHECKS) {
    if (c.ok(l)) score += c.weight;
    else missing.push(c.label);
  }
  return { score: Math.min(100, score), filled: CHECKS.length - missing.length, fields: missing };
}

export function completenessLabel(c: Completeness): string {
  if (c.score >= 85) return "Complete";
  if (c.score >= 60) return "Good";
  if (c.score >= 35) return "Partial";
  return "Sparse";
}