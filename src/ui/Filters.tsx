import type { ListingType } from "../data/listings";
import type { SourceKey } from "../data/sources";
import { SOURCE_LIST } from "../data/sources";

export type ColorBy = "price" | "source";

export interface FilterState {
  q: string;
  types: Set<ListingType>;
  sources: Set<SourceKey>;
  tenure: "all" | "sale" | "rent";
  maxPriceM: number; // millions PHP, 999 = no cap
  verifiedOnly: boolean;
  colorBy: ColorBy;
}

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  types: new Set(),
  sources: new Set(),
  tenure: "all",
  maxPriceM: 999,
  verifiedOnly: false,
  colorBy: "price",
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

export default function Filters({
  state,
  setState,
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
}) {
  return (
    <aside className="filters glass">
      <div>
        <p className="filters-label">Search</p>
        <input
          className="search-input"
          placeholder="City, barangay, listing name…"
          value={state.q}
          onChange={(e) => setState({ ...state, q: e.target.value })}
        />
      </div>

      <div>
        <p className="filters-label">Tenure</p>
        <div className="seg">
          {(["all", "sale", "rent"] as const).map((t) => (
            <button
              key={t}
              className={state.tenure === t ? "on" : ""}
              onClick={() => setState({ ...state, tenure: t })}
            >
              {t === "all" ? "All" : t === "sale" ? "For sale" : "For rent"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="filters-label">Type</p>
        <div className="chip-set">
          {TYPES.map((t) => (
            <button
              key={t.key}
              className={`f-chip ${state.types.has(t.key) ? "on" : ""}`}
              onClick={() => setState({ ...state, types: toggleIn(state.types, t.key) })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="filters-label">
          Max price · <span className="price-val">{state.maxPriceM >= 999 ? "any" : `₱${state.maxPriceM}M`}</span>
        </p>
        <input
          type="range"
          className="price-slider"
          min={2}
          max={60}
          step={2}
          value={Math.min(state.maxPriceM, 60)}
          onChange={(e) => setState({ ...state, maxPriceM: Number(e.target.value) })}
        />
      </div>

      <div>
        <p className="filters-label">Sources</p>
        <div className="chip-set">
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
      </div>

      <div className="toggle-row">
        <span>Verified listings only</span>
        <button
          className={`toggle ${state.verifiedOnly ? "on" : ""}`}
          aria-label="Verified listings only"
          onClick={() => setState({ ...state, verifiedOnly: !state.verifiedOnly })}
        />
      </div>

      <div>
        <p className="filters-label">Color pins by</p>
        <div className="seg">
          <button className={state.colorBy === "price" ? "on" : ""} onClick={() => setState({ ...state, colorBy: "price" })}>
            Price heat
          </button>
          <button className={state.colorBy === "source" ? "on" : ""} onClick={() => setState({ ...state, colorBy: "source" })}>
            Source
          </button>
        </div>
      </div>
    </aside>
  );
}