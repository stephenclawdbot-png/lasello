import type { ListingType } from "../data/listings";
import type { SourceKey } from "../data/sources";
import { SOURCE_LIST } from "../data/sources";

export type SortKey = "fresh" | "price-asc" | "price-desc" | "psqm-asc";

export interface FilterState {
  q: string;
  types: Set<ListingType>;
  sources: Set<SourceKey>;
  tenure: "all" | "sale" | "rent";
  maxPriceM: number; // millions PHP, 999 = no cap
  verifiedOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  types: new Set(),
  sources: new Set(),
  tenure: "all",
  maxPriceM: 999,
  verifiedOnly: false,
  sort: "fresh",
};

const TYPES: { key: ListingType; label: string }[] = [
  { key: "condo", label: "Condo" },
  { key: "house", label: "House & Lot" },
  { key: "lot", label: "Lot" },
  { key: "land", label: "Land / Farm" },
];

const PRICE_STOPS = [3, 5, 8, 12, 20, 30, 50, 80];

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
        value={state.maxPriceM}
        onChange={(e) => setState({ ...state, maxPriceM: Number(e.target.value) })}
        aria-label="Max price"
      >
        <option value={999}>Any price</option>
        {PRICE_STOPS.map((m) => (
          <option key={m} value={m}>
            Up to ₱{m}M
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
