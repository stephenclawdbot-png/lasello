import { useEffect, useMemo, useState } from "react";
import MapCanvas from "./three/Scene";
import Filters, { DEFAULT_FILTERS, type FilterState } from "./ui/Filters";
import Panel from "./ui/Panel";
import { TopBar, Legend, DemoPill } from "./ui/Overlays";
import { LISTINGS, type Listing } from "./data/listings";
import { SOURCE_LIST } from "./data/sources";
import { cityMedians } from "./lib/stats";
import { loadPhilippines, toWorld, type Island } from "./lib/geo";

function matches(l: Listing, f: FilterState): boolean {
  if (f.tenure !== "all" && l.tenure !== f.tenure) return false;
  if (f.verifiedOnly && !l.verified) return false;
  if (f.types.size > 0 && !f.types.has(l.type)) return false;
  if (f.sources.size > 0 && !f.sources.has(l.source)) return false;
  if (f.tenure !== "rent" && l.price > f.maxPriceM * 1_000_000) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (!`${l.name} ${l.city} ${l.region}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

export default function App() {
  const [islands, setIslands] = useState<Island[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<[number, number, number] | null>(null);
  const [everSelected, setEverSelected] = useState(false);

  useEffect(() => {
    loadPhilippines()
      .then(setIslands)
      .catch((e) => setLoadError(String(e)));
  }, []);

  const visible = useMemo(() => LISTINGS.filter((l) => matches(l, filters)), [filters]);
  const medians = useMemo(() => cityMedians(LISTINGS), []);
  const selected = useMemo(() => LISTINGS.find((l) => l.id === selectedId) ?? null, [selectedId]);

  const onSelect = (id: string) => {
    setSelectedId(id);
    setEverSelected(true);
    const l = LISTINGS.find((x) => x.id === id);
    if (l) {
      const [x, z] = toWorld(l.lat, l.lng);
      setFocus([x, 0.05, z]);
    }
  };

  if (loadError) {
    return (
      <div className="loader">
        <div className="loader-word">
          LASELL<em>O</em>
        </div>
        <div className="loader-sub">map data failed to load — {loadError}</div>
      </div>
    );
  }

  if (!islands) {
    return (
      <div className="loader">
        <div className="loader-word">
          LASELL<em>O</em>
        </div>
        <div className="loader-sub">charting the archipelago…</div>
      </div>
    );
  }

  return (
    <div className="app">
      <MapCanvas
        islands={islands}
        listings={visible}
        colorBy={filters.colorBy}
        selectedId={selectedId}
        onSelect={onSelect}
        focus={focus}
        onArrived={() => setFocus(null)}
      />
      <TopBar count={visible.length} sourceCount={SOURCE_LIST.length} />
      <Filters state={filters} setState={setFilters} />
      {selected && (
        <Panel
          listing={selected}
          cityMedian={medians.get(selected.city)?.[selected.tenure]}
          onClose={() => {
            setSelectedId(null);
            setFocus(null);
          }}
        />
      )}
      <Legend colorBy={filters.colorBy} />
      <DemoPill count={visible.length} />
      <div className={`hint glass ${everSelected ? "hide" : ""}`}>Drag to orbit · scroll to zoom · click a pin</div>
    </div>
  );
}