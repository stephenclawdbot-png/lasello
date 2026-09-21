import type { ListingType } from "../data/listings";
import type { SourceKey } from "../data/sources";
import { SOURCE_LIST } from "../data/sources";
import { priceBuckets } from "../lib/price";

export type SortKey = "fresh" | "price-asc" | "price-desc" | "psqm-asc" | "complete";

export interface FilterState {
  q: string;
  types: Set<ListingType>;
  sources: Set<SourceKey>;
  tenure: "all" | "sale" | "rent";
  /** Price cap in PHP (Infinity = no cap). Interpreted as ₱/mo for rent. */
  maxPrice: number;
  verifiedOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  types: new Set(),
  sources: new Set(),
  tenure: "all",
  maxPrice: Infinity,
  verifiedOnly: false,
  sort: "fresh",
};

const TYPES: { key: ListingType; label: string }[] = [
  { key: "condo", label: "Condo" },
  { key: "house", label: "House & Lot" },
  { key: "lot", label: "Lot" },
  { key: "land", label: "Land / Farm" },
];

function toggleIn<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

/** Horizontal filter bar — marketplace-style, scrolls on mobile. */
export default function FilterBar({
  state,
  setState,
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
}) {
  return (
    <div className="filterbar">
      <div className="seg">
        {(["all", "sale", "rent"] as const).map((t) => (
          <button
            key={t}
            className={state.tenure === t ? "on" : ""}
            onClick={() => setState({ ...state, tenure: t })}
          >
            {t === "all" ? "Any" : t === "sale" ? "For sale" : "For rent"}
          </button>
        ))}
      </div>

      <div className="filterbar-divider" />

      {TYPES.map((t) => (
        <button
          key={t.key}
          className={`f-chip ${state.types.has(t.key) ? "on" : ""}`}
          onClick={() => setState({ ...state, types: toggleIn(state.types, t.key) })}
        >
          {t.label}
        </button>
      ))}

      <div className="filterbar-divider" />

      <select
        className="f-select"
        value={priceBuckets(state.tenure).some((b) => b.cap === state.maxPrice) ? String(state.maxPrice) : "any"}
        onChange={(e) =>
          setState({ ...state, maxPrice: e.target.value === "any" ? Infinity : Number(e.target.value) })
        }
        aria-label="Max price"
      >
        {priceBuckets(state.tenure).map((b) => (
          <option key={b.cap === Infinity ? "any" : b.cap} value={b.cap === Infinity ? "any" : String(b.cap)}>
            {b.label}
          </option>
        ))}
      </select>

      <button
        className={`f-chip ${state.verifiedOnly ? "on" : ""}`}
        onClick={() => setState({ ...state, verifiedOnly: !state.verifiedOnly })}
      >
        ✓ Verified only
      </button>

      <div className="filterbar-divider" />

      {SOURCE_LIST.map((s) => (
        <button
          key={s.key}
          className={`f-chip ${state.sources.has(s.key) ? "on" : ""}`}
          onClick={() => setState({ ...state, sources: toggleIn(state.sources, s.key) })}
        >
          <span className="dot" style={{ background: s.color }} />
          {s.name}
        </button>
      ))}
    </div>
  );
}
