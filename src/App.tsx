import { useEffect, useMemo, useState } from "react";
import Map2D from "./ui/Map2D";
import FilterBar, { DEFAULT_FILTERS, type FilterState, type SortKey } from "./ui/Filters";
import Panel from "./ui/Panel";
import ListingCard from "./ui/ListingCard";
import { Header, Legend, Disclaimer } from "./ui/Overlays";
import { perSqm, type Listing } from "./data/listings";
import { cityMedians } from "./lib/stats";
import { withinCap, completenessOf } from "./lib/price";
import { useFeed } from "./lib/live";
import { loadPhilippines, type Island } from "./lib/geo";

function matches(l: Listing, f: FilterState): boolean {
  if (f.tenure !== "all" && l.tenure !== f.tenure) return false;
  if (f.verifiedOnly && !l.verified) return false;
  if (f.types.size > 0 && !f.types.has(l.type)) return false;
  if (f.sources.size > 0 && !f.sources.has(l.source)) return false;
  if (!withinCap(l, f.maxPrice)) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (!`${l.name} ${l.city} ${l.region}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

function sortListings(list: Listing[], sort: SortKey): Listing[] {
  const s = [...list];
  switch (sort) {
    case "price-asc":
      return s.sort((a, b) => a.price - b.price);
    case "price-desc":
      return s.sort((a, b) => b.price - a.price);
    case "psqm-asc":
      return s.sort((a, b) => perSqm(a) - perSqm(b));
    case "complete":
      return s.sort(
        (a, b) => completenessOf(b).score - completenessOf(a).score || a.freshDays - b.freshDays
      );
    default:
      return s.sort((a, b) => a.freshDays - b.freshDays);
  }
}

export default function App() {
  const [islands, setIslands] = useState<Island[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [everSelected, setEverSelected] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const feed = useFeed();
  const listings = feed.listings;

  useEffect(() => {
    loadPhilippines()
      .then(setIslands)
      .catch((e) => setLoadError(String(e)));
  }, []);

  const visible = useMemo(
    () => sortListings(listings.filter((l) => matches(l, filters)), filters.sort),
    [listings, filters]
  );
  const medians = useMemo(() => cityMedians(listings), [listings]);
  const selected = useMemo(() => listings.find((l) => l.id === selectedId) ?? null, [listings, selectedId]);

  const onSelect = (id: string | null) => {
    setSelectedId(id);
    if (id) setEverSelected(true);
  };

  if (loadError) {
    return (
      <div className="loader">
        <div className="loader-word">
          Lasell<em>o</em>
        </div>
        <div className="loader-sub">map data failed to load — {loadError}</div>
      </div>
    );
  }

  return (
    <div className={`site ${view === "map" ? "view-map" : ""}`}>
      <Header q={filters.q} onSearch={(q) => setFilters({ ...filters, q })} feed={feed} />
      <FilterBar state={filters} setState={setFilters} />

      <div className="content">
        <section className="results">
          <div className="results-head">
            <h1>Properties across the Philippines</h1>
            <span className="results-count">{visible.length.toLocaleString("en-PH")} listings</span>
            <select
              className="f-select results-sort"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
              aria-label="Sort listings"
            >
              <option value="fresh">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="psqm-asc">Best ₱/m² value</option>
              <option value="complete">Most complete data</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="empty-state">
              <b>No listings match your filters</b>
              Try widening the price range or clearing a filter.
            </div>
          ) : (
            <div className="card-grid">
              {visible.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  cityMedian={medians.get(l.city)?.[l.tenure]}
                  selected={l.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}

          <Disclaimer feed={feed} />
        </section>

        <section className="mapwrap">
          {islands ? (
            <Map2D islands={islands} listings={visible} selectedId={selectedId} onSelect={onSelect} />
          ) : (
            <div className="loader" style={{ position: "absolute", background: "transparent" }}>
              <div className="loader-sub">loading the map…</div>
            </div>
          )}
          <Legend />
          <div className={`map-hint ${everSelected ? "hide" : ""}`}>Drag to pan · scroll to zoom · click a price for details</div>
        </section>

        {selected && (
          <Panel
            listing={selected}
            cityMedian={medians.get(selected.city)?.[selected.tenure]}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      <div className="view-toggle">
        <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>
          List
        </button>
        <button className={view === "map" ? "on" : ""} onClick={() => setView("map")}>
          Map
        </button>
      </div>
    </div>
  );
}
